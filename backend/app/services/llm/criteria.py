from app.services.llm.client import llm_client
from app.prompts.criteria_gen import CRITERIA_GEN_SYSTEM, CRITERIA_GEN_USER_TEMPLATE
from app.prompts.criteria_refine import CRITERIA_REFINE_SYSTEM, CRITERIA_REFINE_USER_TEMPLATE
import json

async def generate_criteria(job_description: str, notes: str = "") -> tuple[dict, dict]:
    """
    Generate screening criteria from job description.

    Returns:
        tuple: (criteria_dict, usage_dict)
    """
    user_prompt = CRITERIA_GEN_USER_TEMPLATE.format(jd_text=job_description, notes=notes)
    return await llm_client.generate_json(system=CRITERIA_GEN_SYSTEM, user=user_prompt)

async def refine_criteria(current_human: str, current_json: dict, feedback: str, conversation_history: list = None) -> tuple[dict, dict]:
    """
    Refine existing criteria based on HR feedback.

    Returns:
        tuple: (refined_criteria_dict, usage_dict)
    """
    history_text = ""
    if conversation_history:
        history_text = "\n\nPAST CONVERSATION:\n" + "\n".join([f"{msg['role'].upper()}: {msg['message']}" for msg in conversation_history])

    user_prompt = CRITERIA_REFINE_USER_TEMPLATE.format(
        current_human_readable=current_human,
        current_json=json.dumps(current_json, indent=2),
        hr_message=history_text + "\n\nCURRENT REQUEST: " + feedback
    )
    return await llm_client.generate_json(system=CRITERIA_REFINE_SYSTEM, user=user_prompt)
