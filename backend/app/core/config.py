import os
import secrets
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    # General Settings
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Havilah EdTech API")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")

    # Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 8))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "BACKEND_CORS_ORIGINS",
            "http://localhost:3000,http://localhost:8080,http://localhost:5173",
        ).split(",")
        if origin.strip()
    ]

    # Database Settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/havilah"
    )

    # MongoDB Settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "havilah_edtech_content")

    # Redis Settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Email Settings
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() == "true"
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "havilah@rescaf.io")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "Havilah EdTech")

    # AI Service Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    AI_SERVICE: str = os.getenv("AI_SERVICE", "openai")
    CONTENT_PIPELINE_COLLECTION: str = os.getenv("CONTENT_PIPELINE_COLLECTION", "content_pipelines")

    # Storage Settings
    FILE_STORAGE_BACKEND: str = os.getenv("FILE_STORAGE_BACKEND", "local")
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_BUCKET_NAME: str = os.getenv("MINIO_BUCKET_NAME", "havilah-edtech")
    MINIO_SECURE: bool = os.getenv("MINIO_SECURE", "false").lower() == "true"
    UPLOAD_STORAGE_DIR: str = os.getenv("UPLOAD_STORAGE_DIR", str(BASE_DIR / "uploaded_files"))

    # File Upload Settings
    UPLOAD_MAX_FILE_SIZE_MB: int = int(os.getenv("UPLOAD_MAX_FILE_SIZE_MB", 10))
    UPLOAD_ALLOWED_CONTENT_TYPES: List[str] = [
        content_type.strip()
        for content_type in os.getenv(
            "UPLOAD_ALLOWED_CONTENT_TYPES",
            "image/jpeg,image/png,application/pdf",
        ).split(",")
        if content_type.strip()
    ]

    # OCR Settings
    OCR_ENABLED: bool = os.getenv("OCR_ENABLED", "true").lower() == "true"
    OCR_LANGUAGE: str = os.getenv("OCR_LANGUAGE", "eng")

    # GDPR Settings
    GDPR_COMPLIANCE: bool = os.getenv("GDPR_COMPLIANCE", "true").lower() == "true"
    DATA_RETENTION_DAYS: int = int(os.getenv("DATA_RETENTION_DAYS", 365))
    EU_DATA_RESIDENCY: bool = os.getenv("EU_DATA_RESIDENCY", "true").lower() == "true"

    class Config:
        case_sensitive = True
        env_file = BASE_DIR / ".env"
        env_file_encoding = "utf-8"

settings = Settings()
