from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User
from app.services.content_pipeline import ContentPipelineService
from app.services.file_storage import FileStorageService
from app.services.ocr import OcrService
from app.services.chat_tutor import ChatTutorService
from app.services.learning_assets import LearningAssetsService
from app.services.quiz_generator import QuizGeneratorService
from app.services.topic_generator import TopicGeneratorService


auth_scheme = HTTPBearer(auto_error=False)


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


def get_optional_ocr_service(request: Request) -> OcrService | None:
    return getattr(request.app.state, "ocr_service", None)


def get_optional_quiz_generator_service(request: Request) -> QuizGeneratorService | None:
    return getattr(request.app.state, "quiz_generator_service", None)


def get_chat_tutor_service(request: Request) -> ChatTutorService:
    chat_service = getattr(request.app.state, "chat_tutor_service", None)
    if chat_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chat tutor service is not configured.",
        )
    return chat_service


def get_topic_generator_service(request: Request) -> TopicGeneratorService:
    generator = getattr(request.app.state, "topic_generator_service", None)
    if generator is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Topic generator service is not configured.",
        )
    return generator


def get_learning_assets_service(request: Request) -> LearningAssetsService:
    service = getattr(request.app.state, "learning_assets_service", None)
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Learning assets service is not configured.",
        )
    return service


def _require_credentials(
    credentials: HTTPAuthorizationCredentials | None,
) -> HTTPAuthorizationCredentials:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )
    return credentials


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme),
    db: Session = Depends(get_db),
) -> User:
    auth = _require_credentials(credentials)
    subject = decode_token(auth.credentials)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
        )
    try:
        user_id = UUID(subject)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user.",
        )
    return current_user


def get_current_active_superuser(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions.",
        )
    return current_user
