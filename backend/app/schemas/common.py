from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

# --- Criteria ---
class CriteriaItem(BaseModel):
    text: str
    key: Optional[str] = None

class CriteriaCategory(BaseModel):
    id: str
    display_name: str
    emoji: str
    weight: Optional[float] = None
    is_dealbreaker: bool
    items: List[CriteriaItem]

class CriteriaSchema(BaseModel):
    version: int
    categories: List[CriteriaCategory]

# --- Session ---
class SessionCreate(BaseModel):
    job_description: str
    keep_count: int
    hr_notes: Optional[str] = None

class SessionResponse(BaseModel):
    id: str
    status: str
    created_at: datetime
    # We might return criteria as object if parsed, but for now string is fine or we parse it
    criteria_human_readable: Optional[str] = None
    criteria_json: Optional[Dict[str, Any]] = None # Transformed from string in logic
    
    total_resumes: int
    processed_count: int
    qualified_count: int

class SessionUpdate(BaseModel):
    # For updating criteria via chat implicitly
    pass

class CriteriaRefinementRequest(BaseModel):
    feedback: Optional[str] = None
    paste_criteria: Optional[str] = None

class CriteriaRefinementResponse(BaseModel):
    criteria_human_readable: str
    criteria_json: Dict[str, Any]
    changes_made: Optional[str] = None

# --- Candidate ---

class CandidateResponse(BaseModel):
    id: str
    filename: str
    final_score: Optional[int] = None
    passed_dealbreakers: Optional[bool] = None
    one_liner: Optional[str] = None
    # Add other fields as needed for list view
    
class CandidateDetailResponse(CandidateResponse):
    rejection_reason: Optional[str] = None
    category_scores: Optional[Dict[str, Any]] = None # Parsed from json
    strengths: Optional[List[str]] = None
    concerns: Optional[List[str]] = None
    highlights: Optional[List[str]] = None
    original_text: Optional[str] = None
