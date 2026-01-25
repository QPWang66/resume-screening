from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, Dict
from datetime import datetime
import uuid
import json

class ScreeningSessionBase(SQLModel):
    job_description: str
    keep_count: int
    hr_notes: Optional[str] = None
    
    # Criteria
    criteria_human_readable: Optional[str] = None
    criteria_json: Optional[str] = None # Stored as JSON string
    criteria_version: int = 1
    
    # Stats (Denormalized)
    total_resumes: int = 0
    processed_count: int = 0
    qualified_count: int = 0
    
    status: str = "draft" # draft, criteria_locked, processing, completed
    insights_json: Optional[str] = None

class ScreeningSession(ScreeningSessionBase, table=True):
    __tablename__ = "screening_sessions"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    criteria_locked_at: Optional[datetime] = None
    
    candidates: List["Candidate"] = Relationship(back_populates="session")
    conversations: List["CriteriaConversation"] = Relationship(back_populates="session")

class CriteriaConversation(SQLModel, table=True):
    __tablename__ = "criteria_conversations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(foreign_key="screening_sessions.id")
    role: str # user or assistant
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    session: ScreeningSession = Relationship(back_populates="conversations")
