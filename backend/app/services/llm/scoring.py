from app.services.llm.client import llm_client
from app.prompts.resume_score import RESUME_SCORE_SYSTEM_TEMPLATE, RESUME_SCORE_USER_TEMPLATE
import json

async def score_resume(resume_text: str, criteria_json: dict) -> tuple[dict, dict]:
    """
    Score a resume against the given criteria.

    Returns:
        tuple: (score_result_dict, usage_dict)
    """
    system_prompt = RESUME_SCORE_SYSTEM_TEMPLATE.format(
        structured_criteria_json=json.dumps(criteria_json, indent=2)
    )
    user_prompt = RESUME_SCORE_USER_TEMPLATE.format(resume_text=resume_text)

    return await llm_client.generate_json(system=system_prompt, user=user_prompt)
