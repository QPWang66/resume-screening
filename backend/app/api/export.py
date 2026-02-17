from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from sqlmodel import Session, select
import csv
import io
import os

from app.database import get_session
from app.models.session import ScreeningSession
from app.models.candidate import Candidate

router = APIRouter(prefix="/screening", tags=["export"])

@router.get("/{session_id}/export")
async def export_results(session_id: str, db: Session = Depends(get_session)):
    """Export screening results as CSV with real data"""
    session = db.get(ScreeningSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get candidates ranked by passed_dealbreakers and score
    candidates = db.exec(
        select(Candidate)
        .where(Candidate.session_id == session_id)
        .order_by(Candidate.passed_dealbreakers.desc(), Candidate.final_score.desc())
    ).all()

    csv_stream = io.StringIO()
    writer = csv.writer(csv_stream)

    # Header row
    writer.writerow(["Rank", "Filename", "Score", "Status", "One Liner", "Rejection Reason"])

    rank = 1
    for candidate in candidates:
        # Determine status
        if candidate.extraction_warning and not candidate.original_text:
            status = "Skipped"
        elif candidate.passed_dealbreakers:
            status = "Qualified"
        elif candidate.passed_dealbreakers is False:
            status = "Rejected"
        else:
            status = "Pending"

        writer.writerow([
            rank if status != "Skipped" else "-",
            candidate.filename,
            candidate.final_score if candidate.final_score is not None else "-",
            status,
            candidate.one_liner or "",
            candidate.rejection_reason or ""
        ])

        if status != "Skipped":
            rank += 1

    response = StreamingResponse(
        iter([csv_stream.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=screening_results_{session_id[:8]}.csv"
    return response


@router.get("/{session_id}/resume/{candidate_id}")
async def get_resume_pdf(
    session_id: str,
    candidate_id: str,
    db: Session = Depends(get_session)
):
    """Serve the original PDF file for a candidate"""
    candidate = db.get(Candidate, candidate_id)
    if not candidate or candidate.session_id != session_id:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Get the file path
    upload_dir = f"../data/uploads/{session_id}"
    file_path = os.path.join(upload_dir, candidate.filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=candidate.filename
    )
