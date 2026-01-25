import os
from anthropic import AsyncAnthropic
from app.config import settings
import json
import logging

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        if not self.api_key:
            logger.warning("ANTHROPIC_API_KEY not set. LLM features will fail or need mock.")
            self.client = None
        else:
            self.client = AsyncAnthropic(api_key=self.api_key)

    async def generate_json(self, system: str, user: str, model: str = "claude-3-opus-20240229") -> dict:
        if not self.client:
            raise ValueError("LLM Client not initialized. Missing API Key.")
            
        try:
            message = await self.client.messages.create(
                model=model,
                max_tokens=4000,
                temperature=0,
                system=system,
                messages=[
                    {"role": "user", "content": user}
                ]
            )
            
            # Extract JSON from response
            # We assume the model follows instructions to return JSON.
            # In production, use tool_use or more robust parsing.
            content = message.content[0].text
            # Basic cleanup if markdown backticks are used
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
                
            return json.loads(content.strip())
            
        except Exception as e:
            logger.error(f"LLM Error: {e}")
            raise e

llm_client = LLMClient()
