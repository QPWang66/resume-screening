from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlmodel import Session, select
from typing import List
import json
import logging
from app.database import get_session
from app.models.session import ScreeningSession, CriteriaConversation
from app.models.candidate import Candidate
from app.schemas.common import (
    SessionCreate, SessionResponse, CriteriaRefinementRequest, CriteriaRefinementResponse,
    CandidateResponse, CandidateDetailResponse
)
from app.services.llm.criteria import generate_criteria, refine_criteria
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.batch_processor import process_session_background  # We will create this next
import shutil
import os

router = APIRouter(prefix="/screening", tags=["screening"])
logger = logging.getLogger(__name__)

@router.post("/start", response_model=SessionResponse)
async def start_screening(
    request: SessionCreate,
    session: Session = Depends(get_session)
):
    # Create session
    db_session = ScreeningSession(
        job_description=request.job_description,
        keep_count=request.keep_count,
        hr_notes=request.hr_notes
    )

    # Generate initial criteria
    try:
        criteria_output, usage = await generate_criteria(request.job_description, request.hr_notes or "")

        # Validate that we got the expected fields
        human_readable = criteria_output.get("human_readable")
        structured = criteria_output.get("structured")

        if not human_readable:
            logger.error(f"LLM response missing 'human_readable'. Got keys: {list(criteria_output.keys())}")
            raise ValueError("LLM did not return human_readable criteria")

        db_session.criteria_human_readable = human_readable
        db_session.criteria_json = json.dumps(structured) if structured else "{}"
        db_session.status = "draft"
        # Track token usage
        db_session.total_input_tokens = usage.get("input_tokens", 0)
        db_session.total_output_tokens = usage.get("output_tokens", 0)
    except Exception as e:
        logger.error(f"Failed to generate criteria: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Criteria generation failed: {str(e)}")

    session.add(db_session)
    session.commit()
    session.refresh(db_session)

    # Manually construct response to parse JSON string
    return SessionResponse(
        id=str(db_session.id),
        status=db_session.status,
        created_at=db_session.created_at,
        criteria_human_readable=db_session.criteria_human_readable,
        criteria_json=json.loads(db_session.criteria_json) if db_session.criteria_json else None,
        total_resumes=db_session.total_resumes,
        processed_count=db_session.processed_count,
        qualified_count=db_session.qualified_count
    )

@router.post("/{session_id}/upload")
async def upload_resumes(
    session_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_session)
):
    session = db.get(ScreeningSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    upload_dir = f"../data/uploads/{session_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    uploaded_count = 0
    failed_files = []
    warnings = []

    for file in files:
        try:
            file_path = os.path.join(upload_dir, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            candidate = Candidate(
                session_id=session_id,
                filename=file.filename,
            )

            # Extract text from PDF
            with open(file_path, "rb") as f:
                content = f.read()
                text, warning = extract_text_from_pdf(content)
                candidate.original_text = text
                candidate.extraction_warning = warning
                candidate.parsed_at = datetime.utcnow()

                if warning:
                    warnings.append({"filename": file.filename, "warning": warning})

            db.add(candidate)
            uploaded_count += 1
        except Exception as e:
            failed_files.append({"filename": file.filename, "error": str(e)})

    session.total_resumes += uploaded_count
    db.add(session)
    db.commit()

    return {
        "uploaded_count": uploaded_count,
        "failed_files": failed_files,
        "warnings": warnings
    }

from datetime import datetime

@router.post("/{session_id}/criteria/refine", response_model=CriteriaRefinementResponse)
async def refine_session_criteria(
    session_id: str,
    request: CriteriaRefinementRequest,
    db: Session = Depends(get_session)
):
    session = db.get(ScreeningSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    current_json = json.loads(session.criteria_json) if session.criteria_json else {}
    
    # Fetch conversation history
    history_records = db.exec(
        select(CriteriaConversation)
        .where(CriteriaConversation.session_id == session_id)
        .order_by(CriteriaConversation.created_at.asc())
    ).all()
    
    conversation_history = [{"role": h.role, "message": h.message} for h in history_records]

    # Generate refinement
    try:
        new_criteria, usage = await refine_criteria(
            current_human=session.criteria_human_readable,
            current_json=current_json,
            feedback=request.feedback or request.paste_criteria,
            conversation_history=conversation_history
        )

        # update session
        session.criteria_human_readable = new_criteria.get("human_readable")
        session.criteria_json = json.dumps(new_criteria.get("structured"))
        session.criteria_version += 1
        # Accumulate token usage
        session.total_input_tokens = (session.total_input_tokens or 0) + usage.get("input_tokens", 0)
        session.total_output_tokens = (session.total_output_tokens or 0) + usage.get("output_tokens", 0)

        # If criteria changed after processing, mark as needing re-process
        if session.status == "completed":
            session.status = "criteria_updated"

        # Log conversation
        conv = CriteriaConversation(
            session_id=session_id,
            role="user",
            message=request.feedback or "Paste criteria"
        )
        db.add(conv)
        db.add(session)
        db.commit()

        return {
            "criteria_human_readable": session.criteria_human_readable,
            "criteria_json": new_criteria.get("structured"),
            "changes_made": new_criteria.get("changes_made"),
            "needs_reprocess": session.status == "criteria_updated"
        }
    except Exception as e:
        import traceback
        logger.error(f"Criteria refinement failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{session_id}/process")
async def process_resumes(
    session_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session)
):
    session = db.get(ScreeningSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check if this is a re-process (criteria updated after completion)
    is_reprocess = session.status == "criteria_updated"

    if is_reprocess:
        # Reset candidate scores for re-processing
        candidates = db.query(Candidate).filter(Candidate.session_id == session_id).all()
        for c in candidates:
            c.passed_dealbreakers = None
            c.rejection_reason = None
            c.final_score = None
            c.one_liner = None
            c.category_scores_json = None
            c.strengths_json = None
            c.concerns_json = None
            c.highlights_json = None
            c.processed_at = None
            db.add(c)
        # Reset session counters but keep token usage (cumulative)
        session.processed_count = 0
        session.qualified_count = 0

    session.status = "processing"
    session.criteria_locked_at = datetime.utcnow()
    db.add(session)
    db.commit()

    background_tasks.add_task(process_session_background, session_id)

    return {"status": "processing_started", "is_reprocess": is_reprocess}

@router.get("/{session_id}/results", response_model=dict) # Using dict for flexibility with insights
async def get_results(session_id: str, db: Session = Depends(get_session)):
    session = db.get(ScreeningSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get candidates ranked
    # Ranking logic: Passed dealbreakers first, then score
    candidates = db.exec(
        select(Candidate)
        .where(Candidate.session_id == session_id)
        .order_by(Candidate.passed_dealbreakers.desc(), Candidate.final_score.desc())
    ).all()
    
    # Simple transform to response schema - include ALL candidates
    candidate_list = []
    skipped_count = 0
    for c in candidates:
        if c.processed_at is not None:  # Processed candidates
            candidate_list.append({
                "id": c.id,
                "filename": c.filename,
                "final_score": c.final_score or 0,
                "passed_dealbreakers": c.passed_dealbreakers,
                "one_liner": c.one_liner,
                "rejection_reason": c.rejection_reason,
                "extraction_warning": c.extraction_warning
            })
        elif c.extraction_warning:  # Failed to extract - show in results with warning
            skipped_count += 1
            candidate_list.append({
                "id": c.id,
                "filename": c.filename,
                "final_score": None,
                "passed_dealbreakers": None,
                "one_liner": None,
                "rejection_reason": None,
                "extraction_warning": c.extraction_warning,
                "skipped": True
            })
            
    return {
        "session": {
            "total_resumes": session.total_resumes,
            "processed_count": session.processed_count,
            "qualified_count": session.qualified_count,
            "skipped_count": skipped_count,
            "status": session.status,
            "total_input_tokens": session.total_input_tokens or 0,
            "total_output_tokens": session.total_output_tokens or 0
        },
        "candidates": candidate_list,
        "insights": json.loads(session.insights_json) if session.insights_json else {}
    }

@router.get("/{session_id}/candidate/{candidate_id}", response_model=CandidateDetailResponse)
async def get_candidate_detail(
    session_id: str,
    candidate_id: str,
    db: Session = Depends(get_session)
):
    candidate = db.get(Candidate, candidate_id)
    if not candidate or candidate.session_id != session_id:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    return CandidateDetailResponse(
        id=candidate.id,
        filename=candidate.filename,
        final_score=candidate.final_score,
        passed_dealbreakers=candidate.passed_dealbreakers,
        one_liner=candidate.one_liner,
        rejection_reason=candidate.rejection_reason,
        category_scores=json.loads(candidate.category_scores_json) if candidate.category_scores_json else None,
        strengths=json.loads(candidate.strengths_json) if candidate.strengths_json else None,
        concerns=json.loads(candidate.concerns_json) if candidate.concerns_json else None,
        highlights=json.loads(candidate.highlights_json) if candidate.highlights_json else None,
        original_text=candidate.original_text
    )
