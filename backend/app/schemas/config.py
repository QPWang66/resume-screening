from pydantic import BaseModel
from typing import Optional, Literal

class LLMConfig(BaseModel):
    provider: Literal["openai", "anthropic"]
    model: str
    base_url: Optional[str] = None
    api_key: Optional[str] = None
