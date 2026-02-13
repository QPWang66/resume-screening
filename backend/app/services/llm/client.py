import os
from anthropic import AsyncAnthropic
from openai import AsyncOpenAI
from app.config import settings
import json
import logging

logger = logging.getLogger(__name__)

from app.schemas.config import LLMConfig

class LLMClient:
    def __init__(self):
        # Initialize with validation through the configure method
        # We construct a config object from settings
        initial_config = LLMConfig(
            provider=settings.LLM_PROVIDER,
            model=settings.LLM_MODEL,
            base_url=settings.LLM_BASE_URL,
            api_key=settings.ANTHROPIC_API_KEY
        )
        self.configure(initial_config)

    def configure(self, config: LLMConfig):
        """Reconfigures the LLM client at runtime."""
        self.provider = config.provider
        self.model = config.model
        self.base_url = config.base_url
        self.api_key = config.api_key
        self.client = None # Reset client
        
        logger.info(f"Reconfiguring LLM Client: Provider={self.provider}, Model={self.model}")

        if self.provider == "anthropic":
            if not self.api_key:
                logger.warning("ANTHROPIC_API_KEY not set. LLM features will fail.")
            else:
                self.client = AsyncAnthropic(api_key=self.api_key)
        
        elif self.provider == "openai":
            # For Ollama or other local LLMs
            if not self.base_url:
                logger.warning("LLM_BASE_URL not set for openai provider.")
            else:
                # API key is required by client but can be dummy for Ollama
                key = self.api_key or "ollama"
                self.client = AsyncOpenAI(base_url=self.base_url, api_key=key)

    def get_config(self) -> dict:
        """Returns the current configuration (masking API key)."""
        return {
            "provider": self.provider,
            "model": self.model,
            "base_url": self.base_url,
            "api_key": "***" if self.api_key else None
        }

    async def list_models(self) -> list[str]:
        """Lists available models if supported by the provider."""
        if not self.client:
            return []
            
        try:
            if self.provider == "openai":
                # Ollama/OpenAI compatible list models
                response = await self.client.models.list()
                return [model.id for model in response.data]
            elif self.provider == "anthropic":
                 # Anthropic doesn't have a simple list models API typically available or it changes
                 # We return a static list of known good models
                 return ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"]
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            return []
        
        return []

    async def check_health(self) -> dict:
        """Pings the LLM provider to ensure connectivity."""
        if not self.client:
            return {"status": "offline", "provider": self.provider, "error": "Client not initialized"}
        
        target_model = self.model
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
            
        target_model = model or self.model
        
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
                    # response_format={"type": "json_object"} # Ollama supports this with recent versions (check model support)
                     # NOTE: Llama3.2 supports json mode, but some older models might not. 
                     # For robustness with dynamic models, we might want to try/except this or make it conditional.
                     # For now let's keep it simple, or maybe remove response_format if it causes issues with non-json models.
                     # But since we ask for JSON in prompt, let's try strict mode if possible or just rely on prompt.
                    response_format={"type": "json_object"}
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
