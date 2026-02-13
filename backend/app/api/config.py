from fastapi import APIRouter, HTTPException, Depends
from app.services.llm.client import llm_client
from app.schemas.config import LLMConfig
from typing import List

router = APIRouter(prefix="/config", tags=["config"])

@router.get("/llm", response_model=dict)
async def get_llm_config():
    """Get current LLM configuration."""
    return llm_client.get_config()

@router.post("/llm", response_model=dict)
async def update_llm_config(config: LLMConfig):
    """Update LLM configuration."""
    try:
        llm_client.configure(config)
        # Verify the new configuration works (optional, but good practice)
        # For now, we just return the new config
        return llm_client.get_config()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/llm/models", response_model=List[str])
async def list_llm_models():
    """List available models from the current provider."""
    return await llm_client.list_models()
