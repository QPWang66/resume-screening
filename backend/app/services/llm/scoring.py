from app.services.llm.client import llm_client
from app.prompts.resume_score import RESUME_SCORE_SYSTEM_TEMPLATE, RESUME_SCORE_USER_TEMPLATE
import json

async def score_resume(resume_text: str, criteria_json: dict) -> dict:
    system_prompt = RESUME_SCORE_SYSTEM_TEMPLATE.format(
        structured_criteria_json=json.dumps(criteria_json, indent=2)
    )
    user_prompt = RESUME_SCORE_USER_TEMPLATE.format(resume_text=resume_text)
    
    # Using Sonnet or Haiku for faster/cheaper batch processing if possible, 
    # but sticking to Opus default or making it configurable is safer for quality.
    # We will use the default generic generate_json which defaults to Opus for now.
    return await llm_client.generate_json(system=system_prompt, user=user_prompt)
