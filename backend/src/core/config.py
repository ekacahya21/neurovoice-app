import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "NeuroVoice"
    API_V1_STR: str = "/api/v1"
    
    # Audio Settings
    # Input format: PCM 16-bit 16kHz Mono
    INPUT_CHANNELS: int = 1
    INPUT_RATE: int = 16000
    INPUT_WIDTH: int = 2  # 16-bit
    
    # Output format (TTS Standard)
    OUTPUT_RATE: int = 24000
    
    # Model Settings
    WHISPER_MODEL_NAME: str = "base"  # "base" for dev, "large-v3" for accuracy
    GEMINI_MODEL_ID: str = "gemini-2.0-flash-001"
    
    # API Keys & Auth (Should be set in .env)
    GOOGLE_PROJECT_ID: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
