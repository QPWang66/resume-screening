from app.services.llm.client import llm_client
from app.prompts.criteria_gen import CRITERIA_GEN_SYSTEM, CRITERIA_GEN_USER_TEMPLATE
from app.prompts.criteria_refine import CRITERIA_REFINE_SYSTEM, CRITERIA_REFINE_USER_TEMPLATE
import json

async def generate_criteria(job_description: str, notes: str = "") -> dict:
    user_prompt = CRITERIA_GEN_USER_TEMPLATE.format(jd_text=job_description, notes=notes)
    return await llm_client.generate_json(system=CRITERIA_GEN_SYSTEM, user=user_prompt)

async def refine_criteria(current_human: str, current_json: dict, feedback: str) -> dict:
    user_prompt = CRITERIA_REFINE_USER_TEMPLATE.format(
        current_human_readable=current_human,
        current_json=json.dumps(current_json, indent=2),
        hr_message=feedback
    )
    return await llm_client.generate_json(system=CRITERIA_REFINE_SYSTEM, user=user_prompt)
