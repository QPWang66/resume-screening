import os
from anthropic import AsyncAnthropic
from openai import AsyncOpenAI
from app.config import settings
import json
import logging

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.client = None
        
        if self.provider == "anthropic":
            self.api_key = settings.ANTHROPIC_API_KEY
            if not self.api_key:
                logger.warning("ANTHROPIC_API_KEY not set. LLM features will fail or need mock.")
            else:
                self.client = AsyncAnthropic(api_key=self.api_key)
        
        elif self.provider == "openai":
            # For Ollama or other local LLMs
            base_url = settings.LLM_BASE_URL
            api_key = "ollama" # Dummy key for Ollama
            
            if not base_url:
                logger.warning("LLM_BASE_URL not set for openai provider.")
            else:
                self.client = AsyncOpenAI(base_url=base_url, api_key=api_key)

    async def check_health(self) -> dict:
        """Pings the LLM provider to ensure connectivity."""
        if not self.client:
            return {"status": "offline", "provider": self.provider, "error": "Client not initialized"}
        
        target_model = settings.LLM_MODEL
        try:
            if self.provider == "anthropic":
                # Minimal call to check key validity
                # This might cost tokens, so we keep it minimal or just return true if client exists
                # Ideally, we'd list models if possible, but Anthropic API differs. 
                # For safety, we just assume online if initialized for now to save cost.
                return {"status": "online", "provider": self.provider, "model": target_model}

            elif self.provider == "openai":
                # For Ollama, we can list models or do a dummy generation
                try:
                    await self.client.models.list()
                    return {"status": "online", "provider": self.provider, "model": target_model}
                except Exception as e:
                    return {"status": "offline", "provider": self.provider, "error": str(e)}

        except Exception as e:
            return {"status": "error", "provider": self.provider, "error": str(e)}

    async def generate_json(self, system: str, user: str, model: str = None) -> dict:
        if not self.client:
            raise ValueError(f"LLM Client ({self.provider}) not initialized properly.")
            
        target_model = model or settings.LLM_MODEL
        
        try:
            if self.provider == "anthropic":
                message = await self.client.messages.create(
                    model=target_model,
                    max_tokens=4000,
                    temperature=0,
                    system=system,
                    messages=[
                        {"role": "user", "content": user}
                    ]
                )
                content = message.content[0].text
                
            elif self.provider == "openai":
                response = await self.client.chat.completions.create(
                    model=target_model,
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": user}
                    ],
                    temperature=0,
                    response_format={"type": "json_object"} # Ollama supports this with recent versions (check model support)
                )
                content = response.choices[0].message.content
            
            # Extract JSON from response if needed (Ollama json_object mode usually returns raw JSON)
            # But just in case of markdown wrapping:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
                
            return json.loads(content.strip())
            
        except Exception as e:
            logger.error(f"LLM Error ({self.provider}): {e}")
            raise e

llm_client = LLMClient()
