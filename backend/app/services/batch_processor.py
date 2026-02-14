from sqlmodel import Session
from app.database import engine
from app.models.session import ScreeningSession
from app.models.candidate import Candidate
from app.services.llm.scoring import score_resume
import json
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def process_session_background(session_id: str):
    """
    Wrapper to run async processing in a background thread.
    FastAPI's BackgroundTasks runs sync functions in a thread pool.
    """
    asyncio.run(_process_session_async(session_id))


async def _process_session_async(session_id: str):
    """
    Background task to process all resumes in a session.
    Tracks token usage across all LLM calls.
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
        total_input_tokens = session.total_input_tokens or 0
        total_output_tokens = session.total_output_tokens or 0

        async def process_one(candidate) -> tuple[bool, dict]:
            """Returns (success, usage_dict)"""
            if not candidate.original_text:
                return False, {"input_tokens": 0, "output_tokens": 0}

            try:
                result, usage = await score_resume(candidate.original_text, criteria_json)

                candidate.passed_dealbreakers = result.get("passed_dealbreakers")
                candidate.rejection_reason = result.get("rejection_reason")
                candidate.final_score = result.get("final_score")
                candidate.one_liner = result.get("one_liner")
                candidate.category_scores_json = json.dumps(result.get("category_scores"))
                candidate.strengths_json = json.dumps(result.get("strengths"))
                candidate.concerns_json = json.dumps(result.get("concerns"))
                candidate.highlights_json = json.dumps(result.get("highlights"))
                candidate.processed_at = datetime.utcnow()

                return True, usage
            except Exception as e:
                logger.error(f"Failed to score candidate {candidate.id}: {e}")
                return False, {"input_tokens": 0, "output_tokens": 0}

        for candidate in candidates:
            success, usage = await process_one(candidate)
            if success:
                processed += 1
                if candidate.passed_dealbreakers:
                    qualified += 1

            # Accumulate token usage
            total_input_tokens += usage.get("input_tokens", 0)
            total_output_tokens += usage.get("output_tokens", 0)

            # Update progress incrementally
            session.processed_count = processed
            session.qualified_count = qualified
            session.total_input_tokens = total_input_tokens
            session.total_output_tokens = total_output_tokens
            db.add(session)
            db.add(candidate)
            db.commit()  # Commit frequently so frontend sees progress

        session.status = "completed"
        db.add(session)
        db.commit()
        logger.info(f"Completed batch processing for session {session_id}. Tokens used: {total_input_tokens} in, {total_output_tokens} out")
