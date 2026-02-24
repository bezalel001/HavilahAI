from fastapi import FastAPI
from langchain_openai import ChatOpenAI
from minio import Minio
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.services.ai_client import AIServiceError, OpenAIContentGenerator
from app.services.chat_tutor import ChatTutorService
from app.services.topic_generator import TopicGeneratorService
from app.services.learning_assets import LearningAssetsService
from app.services.content_pipeline import ContentPipelineService
from app.services.file_storage import FileStorageService
from app.services.ocr import OcrService, OcrServiceError
from app.services.quiz_generator import QuizGeneratorService


def create_start_app_handler(app: FastAPI):
    async def start_app() -> None:
        Base.metadata.create_all(bind=engine)
        app.state.mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
        app.state.mongo_db = app.state.mongo_client[settings.MONGODB_DB_NAME]

        if settings.FILE_STORAGE_BACKEND.lower() == "minio":
            minio_client = Minio(
                endpoint=settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_SECURE,
            )
            if not minio_client.bucket_exists(settings.MINIO_BUCKET_NAME):
                minio_client.make_bucket(settings.MINIO_BUCKET_NAME)

            app.state.file_storage_service = FileStorageService(
                storage_backend="minio",
                allowed_content_types=settings.UPLOAD_ALLOWED_CONTENT_TYPES,
                max_file_size_bytes=settings.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
                minio_client=minio_client,
                minio_bucket=settings.MINIO_BUCKET_NAME,
            )
            app.state.minio_client = minio_client
        else:
            app.state.file_storage_service = FileStorageService(
                storage_backend="local",
                base_dir=settings.UPLOAD_STORAGE_DIR,
                allowed_content_types=settings.UPLOAD_ALLOWED_CONTENT_TYPES,
                max_file_size_bytes=settings.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
            )

        ai_generator = None
        if settings.AI_SERVICE.lower() == "openai" and settings.OPENAI_API_KEY:
            try:
                ai_generator = OpenAIContentGenerator(
                    api_key=settings.OPENAI_API_KEY,
                    model=settings.OPENAI_MODEL,
                )
            except AIServiceError:
                ai_generator = None
        app.state.ai_content_generator = ai_generator

        if ai_generator is not None:
            collection = app.state.mongo_db[settings.CONTENT_PIPELINE_COLLECTION]
            app.state.content_pipeline_service = ContentPipelineService(
                collection=collection,
                ai_generator=ai_generator,
            )
        else:
            app.state.content_pipeline_service = None

        if settings.OCR_ENABLED:
            try:
                app.state.ocr_service = OcrService(language=settings.OCR_LANGUAGE)
            except OcrServiceError:
                app.state.ocr_service = None
        else:
            app.state.ocr_service = None

        quiz_generator_service = None
        if settings.OPENAI_API_KEY:
            try:
                quiz_llm = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    temperature=0.3,
                    api_key=settings.OPENAI_API_KEY,
                )
                quiz_generator_service = QuizGeneratorService(llm=quiz_llm)
            except Exception:
                quiz_generator_service = None
        app.state.quiz_generator_service = quiz_generator_service

        chat_tutor_service = None
        try:
            chat_tutor_service = ChatTutorService()
        except AIServiceError:
            chat_tutor_service = None
        app.state.chat_tutor_service = chat_tutor_service

        topic_generator_service = None
        try:
            topic_generator_service = TopicGeneratorService()
        except AIServiceError:
            topic_generator_service = None
        app.state.topic_generator_service = topic_generator_service

        learning_assets_service = None
        try:
            learning_assets_service = LearningAssetsService()
        except AIServiceError:
            learning_assets_service = None
        app.state.learning_assets_service = learning_assets_service

    return start_app


def create_stop_app_handler(app: FastAPI):
    async def stop_app() -> None:
        mongo_client = getattr(app.state, "mongo_client", None)
        if mongo_client:
            mongo_client.close()

    return stop_app
