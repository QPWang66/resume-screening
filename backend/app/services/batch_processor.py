from sqlmodel import Session
from app.database import engine
from app.models.session import ScreeningSession
from app.models.candidate import Candidate
from app.services.llm.scoring import score_resume
import json
import asyncio
import logging

logger = logging.getLogger(__name__)

async def process_session_background(session_id: str):
    """
    Background task to process all resumes in a session.
    """
    logger.info(f"Starting batch processing for session {session_id}")
    
    with Session(engine) as db:
        session = db.get(ScreeningSession, session_id)
        if not session:
            return

        candidates = db.query(Candidate).filter(Candidate.session_id == session_id).all()
        criteria_json = json.loads(session.criteria_json) if session.criteria_json else {}
        
        processed = 0
        qualified = 0
        
        # Parallel processing ideally, but loop for now or simple asyncio.gather
        # Since score_resume is async, we can gather.
        
        async def process_one(candidate):
            if not candidate.original_text:
                return False
            
            try:
                result = await score_resume(candidate.original_text, criteria_json)
                
                candidate.passed_dealbreakers = result.get("passed_dealbreakers")
                candidate.rejection_reason = result.get("rejection_reason")
                candidate.final_score = result.get("final_score")
                candidate.one_liner = result.get("one_liner")
                candidate.category_scores_json = json.dumps(result.get("category_scores"))
                candidate.strengths_json = json.dumps(result.get("strengths"))
                candidate.concerns_json = json.dumps(result.get("concerns"))
                candidate.highlights_json = json.dumps(result.get("highlights"))
                candidate.processed_at = datetime.utcnow()
                
                return True
            except Exception as e:
                logger.error(f"Failed to score candidate {candidate.id}: {e}")
                return False

        from datetime import datetime
        
        # Process in chunks or all? Let's do 5 at a time to be safe?
        # For MVP, just loop or gather all if small.
        # User might upload 150... gather might hit rate limits.
        # Let's do serial for safety/simplicity or small semaphore.
        
        for candidate in candidates:
            success = await process_one(candidate)
            if success:
                processed += 1
                if candidate.passed_dealbreakers:
                    qualified += 1
            
            # Update progress incrementally
            session.processed_count = processed
            session.qualified_count = qualified
            db.add(session)
            db.add(candidate)
            db.commit() # Commit frequently so frontend sees progress
            
        session.status = "completed"
        db.add(session)
        db.commit()
        logger.info(f"Completed batch processing for session {session_id}")
