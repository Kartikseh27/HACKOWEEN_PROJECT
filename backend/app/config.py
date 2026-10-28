"""
Configuration module for KISAN CULTURE Backend.
Loads environment variables safely using Pydantic Settings.
"""

import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_FILE = BACKEND_DIR / "kisan_culture.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(ENV_PATH), ".env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "KISAN CULTURE Backend"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_FILE}"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
    
    # External APIs
    GEMINI_API_KEY: str = ""
    WEATHER_API_BASE_URL: str = "https://api.open-meteo.com/v1"
    
    # n8n Automation Engine
    N8N_WEBHOOK_URL: str = ""
    N8N_TIMEOUT_SECONDS: float = 20.0
    
    # Limits
    MAX_UPLOAD_SIZE_MB: int = 25

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()

