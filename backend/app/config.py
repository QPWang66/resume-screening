from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResumeRank AI"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = "sqlite:///../data/resume_screener.db"
    
    # LLM
    ANTHROPIC_API_KEY: Optional[str] = None
    LLM_PROVIDER: str = "openai" 
    LLM_BASE_URL: Optional[str] = "http://localhost:11434/v1"
    LLM_MODEL: str = "llama3.2"

    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
