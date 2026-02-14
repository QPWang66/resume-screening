from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, Any
from datetime import datetime
import uuid

class CandidateBase(SQLModel):
    filename: str
    original_text: Optional[str] = None
    extraction_warning: Optional[str] = None  # Warning from PDF extraction (OCR used, failed, etc.)

    # Evaluation
    passed_dealbreakers: Optional[bool] = None
    rejection_reason: Optional[str] = None
    final_score: Optional[int] = None
    one_liner: Optional[str] = None

    # Stored as JSON strings
    category_scores_json: Optional[str] = None
    strengths_json: Optional[str] = None
    concerns_json: Optional[str] = None
    highlights_json: Optional[str] = None

class Candidate(CandidateBase, table=True):
    __tablename__ = "candidates"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="screening_sessions.id")
    parsed_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None
    
    session: "ScreeningSession" = Relationship(back_populates="candidates")
