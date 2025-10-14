from pydantic import BaseSettings
from typing import List
import secrets


class Settings(BaseSettings):
    # General Settings
    PROJECT_NAME: str = " Havilah EdTech API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"


    # Security Settings
    SECRET_KEY: str = secrets.token_urlsafe(size=32)
    ALGORITHM: str = "H256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:5173"
    ]

    # Database Settings

    DATABASE_URL: str = "sqlite+aiosqlite:///./havilah_edtech.db"

    # MongoDB Settings
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "havilah_edtech_content"

    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379/0"

    # Email Settings
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "havilah@rescaf.io"
    EMAILS_FROM_NAME: str = "Havilah EdTech"

    # AI Service Settings
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GROK_API_KEY: str = ""
    AI_SERVICE: str = "openai"  # Options: openai, anthropic, grok


    # Storage Settings
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "havilah-edtech"

    # GDPR Settings
    GDPR_COMPLIANCE: bool = True
    DATA_RETENTION_DAYS: int = 365  # 1 year
    EU_DATA_RESIDENCY: bool = True  # Store data in EU servers

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()