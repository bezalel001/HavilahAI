from fastapi import HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.services.content_pipeline import ContentPipelineService
from app.services.file_storage import FileStorageService
from app.services.ocr import OcrService
from app.services.quiz_generator import QuizGeneratorService


def get_file_storage_service(request: Request) -> FileStorageService:
    storage_service = getattr(request.app.state, "file_storage_service", None)
    if storage_service is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File storage service is not initialized.",
        )
    return storage_service


def get_mongo_db(request: Request) -> AsyncIOMotorDatabase:
    mongo_db = getattr(request.app.state, "mongo_db", None)
    if mongo_db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MongoDB client is not initialized.",
        )
    return mongo_db


def get_content_pipeline_service(request: Request) -> ContentPipelineService:
    pipeline_service = getattr(request.app.state, "content_pipeline_service", None)
    if pipeline_service is None:
        ai_generator = getattr(request.app.state, "ai_content_generator", None)
        if ai_generator is None:
            detail = "AI content generator is not configured. Set OPENAI_API_KEY."
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        else:
            detail = "Content pipeline service is not initialized."
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        raise HTTPException(status_code=status_code, detail=detail)
    return pipeline_service


def get_ocr_service(request: Request) -> OcrService:
    ocr_service = getattr(request.app.state, "ocr_service", None)
    if ocr_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OCR service is not configured.",
        )
    return ocr_service


def get_optional_quiz_generator_service(request: Request) -> QuizGeneratorService | None:
    return getattr(request.app.state, "quiz_generator_service", None)
