from datetime import datetime, timezone
import uuid
from io import BytesIO

from bson import ObjectId
from celery.result import AsyncResult
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import (
    get_content_pipeline_service,
    get_current_active_user,
    get_learning_assets_service,
    get_mongo_db,
    get_optional_ocr_service,
    get_file_storage_service,
)
from app.core.config import settings
from app.models.user import User
from app.schemas.content import (
    ContentLearningAssetsDetailResponse,
    ContentLearningAssetsListResponse,
    ContentLearningAssetsSummary,
    ContentLearningAssetsResponse,
    ContentDocumentDetailResponse,
    ContentDocumentListResponse,
    ContentDocumentSummary,
    ContentProcessRequest,
    ContentProcessResponse,
    ContentProcessTaskEnqueueResponse,
    ContentProcessTaskStatusResponse,
    ContentSimplifyRequest,
    ContentSimplifyResponse,
    ContentUploadProcessRequest,
)
from app.services.ai_client import AIServiceError
from app.services.learning_assets import LearningAssetsService
from app.services.ocr import OcrService
from app.services.file_storage import FileStorageService
from app.models.upload import Upload
from app.db.session import get_db
from sqlalchemy.orm import Session
from pathlib import Path
from app.services.content_pipeline import ContentPipelineResult, ContentPipelineService
from app.services.realtime_events import publish_realtime_event
from app.services.text_simplifier import ContentSimplifier
from app.worker.celery_app import celery_app
from app.worker.tasks import process_content_task


router = APIRouter()


@router.post(
    "/process",
    response_model=ContentProcessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Process educator content with AI",
)
async def process_content(
    payload: ContentProcessRequest,
    pipeline_service: ContentPipelineService = Depends(get_content_pipeline_service),
    current_user: User = Depends(get_current_active_user),
) -> ContentProcessResponse:
    try:
        result: ContentPipelineResult = await pipeline_service.process_content(
            payload,
            user_id=str(current_user.id),
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - unexpected errors bubble up as 500
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Pipeline failed.") from exc

    return ContentProcessResponse(
        document_id=result.document_id,
        title=result.title,
        summary=result.summary,
        key_points=result.key_points,
        learning_objectives=result.learning_objectives,
        quiz_questions=result.quiz_questions,
        recommended_media=result.recommended_media,
        estimated_reading_time_minutes=result.estimated_reading_time_minutes,
        created_at=result.created_at,
    )


@router.post(
    "/process/async",
    response_model=ContentProcessTaskEnqueueResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Queue AI content processing as a background task",
)
async def process_content_async(
    payload: ContentProcessRequest,
    current_user: User = Depends(get_current_active_user),
) -> ContentProcessTaskEnqueueResponse:
    task = process_content_task.delay(payload.model_dump(), str(current_user.id))
    publish_realtime_event(
        "content_processing_enqueued",
        {"task_id": task.id, "user_id": str(current_user.id), "status": "PENDING"},
    )
    return ContentProcessTaskEnqueueResponse(task_id=task.id, status="PENDING")


@router.get(
    "/tasks/{task_id}",
    response_model=ContentProcessTaskStatusResponse,
    summary="Check async content processing task status",
)
async def get_content_task_status(
    task_id: str,
    current_user: User = Depends(get_current_active_user),
) -> ContentProcessTaskStatusResponse:
    result = AsyncResult(task_id, app=celery_app)
    state = result.state
    if state == "SUCCESS":
        payload = result.result if isinstance(result.result, dict) else {}
        result_user_id = payload.get("user_id")
        if result_user_id and result_user_id != str(current_user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Task does not belong to user.")
        content_payload = payload.get("content") if isinstance(payload.get("content"), dict) else {}
        if not content_payload:
            return ContentProcessTaskStatusResponse(
                task_id=task_id,
                status="FAILURE",
                error="Task completed without a valid payload.",
            )
        return ContentProcessTaskStatusResponse(
            task_id=task_id,
            status=state,
            result=ContentProcessResponse(**content_payload),
        )

    error = str(result.result) if state == "FAILURE" else None
    return ContentProcessTaskStatusResponse(task_id=task_id, status=state, error=error)


@router.get(
    "",
    response_model=ContentDocumentListResponse,
    summary="List processed content for the current user",
)
async def list_content(
    current_user: User = Depends(get_current_active_user),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> ContentDocumentListResponse:
    collection = mongo_db[settings.CONTENT_PIPELINE_COLLECTION]
    cursor = collection.find({"user_id": str(current_user.id)}).sort("created_at", -1).limit(50)
    documents = await cursor.to_list(length=50)
    items = []
    for doc in documents:
        created_at = doc.get("created_at") or datetime.now(timezone.utc)
        items.append(
            ContentDocumentSummary(
                document_id=str(doc.get("_id")),
                title=doc.get("title") or "Untitled",
                status=doc.get("status") or "unknown",
                created_at=created_at,
            )
        )
    return ContentDocumentListResponse(items=items)




@router.post(
    "/simplify",
    response_model=ContentSimplifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Simplify long-form content without AI calls",
)
def simplify_content(payload: ContentSimplifyRequest) -> ContentSimplifyResponse:
    simplifier = ContentSimplifier(max_sentence_words=payload.max_sentence_words)
    result = simplifier.simplify(payload.text)
    return ContentSimplifyResponse(
        simplified_text=result.simplified_text,
        key_points=result.key_points,
        replaced_words=result.replaced_words,
        original_word_count=result.original_word_count,
        simplified_word_count=result.simplified_word_count,
        readability_score=result.readability_score,
    )


@router.post(
    "/from-upload",
    response_model=ContentLearningAssetsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Extract text from an upload and generate learning assets",
)
async def process_upload(
    payload: ContentUploadProcessRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    storage_service: FileStorageService = Depends(get_file_storage_service),
    ocr_service: OcrService | None = Depends(get_optional_ocr_service),
    assets_service: LearningAssetsService = Depends(get_learning_assets_service),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> ContentLearningAssetsResponse:
    upload = (
        db.query(Upload)
        .filter(Upload.id == payload.upload_id, Upload.user_id == current_user.id)
        .first()
    )
    if upload is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found.")

    text = ""
    if upload.content_type.startswith("image/"):
        if ocr_service is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OCR service is not configured.",
            )
        data = _load_upload_bytes(upload, storage_service)
        result = ocr_service.extract_text(data)
        text = result.text
    elif upload.content_type in {"text/plain"}:
        data = _load_upload_bytes(upload, storage_service)
        text = data.decode("utf-8", errors="ignore")
    elif upload.content_type == "application/pdf":
        data = _load_upload_bytes(upload, storage_service)
        text = _extract_pdf_text(data)
    elif upload.content_type in {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    }:
        data = _load_upload_bytes(upload, storage_service)
        text = _extract_docx_text(data)
    else:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only image, plain text, PDF, and DOCX uploads are supported for extraction.",
        )

    if not text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No text could be extracted.")

    try:
        assets = await assets_service.generate_assets(text)
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    collection = mongo_db[settings.LEARNING_ASSETS_COLLECTION]
    document = {
        "user_id": str(current_user.id),
        "upload_id": str(upload.id),
        "summary": assets.summary,
        "key_points": assets.key_points,
        "simplified_concepts": [concept.model_dump() for concept in assets.simplified_concepts],
        "flashcards": [card.model_dump() for card in assets.flashcards],
        "quiz_questions": [question.model_dump() for question in assets.quiz_questions],
        "created_at": datetime.now(timezone.utc),
        "status": "processed",
    }
    result = await collection.insert_one(document)

    return ContentLearningAssetsResponse(
        document_id=str(result.inserted_id),
        summary=assets.summary,
        key_points=assets.key_points,
        simplified_concepts=assets.simplified_concepts,
        flashcards=assets.flashcards,
        quiz_questions=assets.quiz_questions,
        created_at=document["created_at"],
        upload_id=str(upload.id),
    )


@router.get(
    "/from-upload",
    response_model=ContentLearningAssetsListResponse,
    summary="List upload-derived learning assets for the current user",
)
async def list_upload_assets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> ContentLearningAssetsListResponse:
    collection = mongo_db[settings.LEARNING_ASSETS_COLLECTION]
    cursor = (
        collection.find({"user_id": str(current_user.id)})
        .sort("created_at", -1)
        .limit(50)
    )
    documents = await cursor.to_list(length=50)
    upload_ids = [doc.get("upload_id") for doc in documents if doc.get("upload_id")]
    upload_uuid_ids = []
    for upload_id in upload_ids:
        try:
            upload_uuid_ids.append(uuid.UUID(str(upload_id)))
        except (TypeError, ValueError):
            continue
    uploads = (
        db.query(Upload)
        .filter(Upload.user_id == current_user.id, Upload.id.in_(upload_uuid_ids))
        .all()
        if upload_uuid_ids
        else []
    )
    upload_lookup = {str(upload.id): upload for upload in uploads}
    items = []
    for doc in documents:
        upload_id = doc.get("upload_id")
        upload = upload_lookup.get(upload_id) if upload_id else None
        items.append(
            ContentLearningAssetsSummary(
                document_id=str(doc.get("_id")),
                upload_id=upload_id or "",
                summary=doc.get("summary") or "",
                key_points=doc.get("key_points") or [],
                created_at=doc.get("created_at") or datetime.now(timezone.utc),
                status=doc.get("status") or "unknown",
                flashcards_count=len(doc.get("flashcards") or []),
                quiz_questions_count=len(doc.get("quiz_questions") or []),
                original_filename=upload.original_filename if upload else None,
                content_type=upload.content_type if upload else None,
                size_bytes=upload.size_bytes if upload else None,
                upload_created_at=upload.created_at if upload else None,
            )
        )
    return ContentLearningAssetsListResponse(items=items)


@router.get(
    "/from-upload/{document_id}",
    response_model=ContentLearningAssetsDetailResponse,
    summary="Get upload-derived learning assets",
)
async def get_upload_assets(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> ContentLearningAssetsDetailResponse:
    if not ObjectId.is_valid(document_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload content not found.")
    collection = mongo_db[settings.LEARNING_ASSETS_COLLECTION]
    doc = await collection.find_one({"_id": ObjectId(document_id), "user_id": str(current_user.id)})
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload content not found.")

    upload_id = doc.get("upload_id")
    upload = None
    if upload_id:
        try:
            upload_uuid = uuid.UUID(str(upload_id))
            upload = (
                db.query(Upload)
                .filter(Upload.user_id == current_user.id, Upload.id == upload_uuid)
                .first()
            )
        except (TypeError, ValueError):
            upload = None

    return ContentLearningAssetsDetailResponse(
        document_id=str(doc.get("_id")),
        upload_id=upload_id or "",
        summary=doc.get("summary") or "",
        key_points=doc.get("key_points") or [],
        simplified_concepts=doc.get("simplified_concepts") or [],
        flashcards=doc.get("flashcards") or [],
        quiz_questions=doc.get("quiz_questions") or [],
        created_at=doc.get("created_at") or datetime.now(timezone.utc),
        status=doc.get("status") or "unknown",
        original_filename=upload.original_filename if upload else None,
        content_type=upload.content_type if upload else None,
        size_bytes=upload.size_bytes if upload else None,
        upload_created_at=upload.created_at if upload else None,
    )


@router.get(
    "/{document_id}",
    response_model=ContentDocumentDetailResponse,
    summary="Get a processed content document",
)
async def get_content_detail(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> ContentDocumentDetailResponse:
    if not ObjectId.is_valid(document_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found.")
    collection = mongo_db[settings.CONTENT_PIPELINE_COLLECTION]
    doc = await collection.find_one({"_id": ObjectId(document_id), "user_id": str(current_user.id)})
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found.")
    insights = doc.get("insights") or {}
    return ContentDocumentDetailResponse(
        document_id=str(doc.get("_id")),
        title=doc.get("title") or "Untitled",
        summary=insights.get("summary") or "",
        key_points=insights.get("key_points") or [],
        learning_objectives=insights.get("learning_objectives") or [],
        quiz_questions=insights.get("quiz_questions") or [],
        recommended_media=insights.get("recommended_media") or [],
        estimated_reading_time_minutes=insights.get("estimated_reading_time_minutes") or 0.0,
        created_at=doc.get("created_at") or datetime.now(timezone.utc),
        status=doc.get("status") or "unknown",
        target_audience=doc.get("target_audience") or "",
        learning_objective=doc.get("learning_objective") or "",
        desired_tone=doc.get("desired_tone"),
        additional_context=doc.get("additional_context"),
        raw_content=doc.get("raw_content"),
    )


def _load_upload_bytes(upload: Upload, storage_service: FileStorageService) -> bytes:
    if storage_service.storage_backend == "local":
        path = Path(settings.UPLOAD_STORAGE_DIR) / upload.storage_path
        return path.read_bytes()

    minio_client = getattr(storage_service, "minio_client", None)
    bucket_name = upload.bucket_name
    if minio_client is None or not bucket_name:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MinIO client is not configured.",
        )
    response = minio_client.get_object(bucket_name=bucket_name, object_name=upload.storage_path)
    try:
        return response.read()
    finally:
        response.close()
        response.release_conn()


def _extract_pdf_text(data: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PDF extraction dependency is not available.",
        ) from exc

    reader = PdfReader(BytesIO(data))
    pages = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text:
            pages.append(text)
    return "\n".join(pages).strip()


def _extract_docx_text(data: bytes) -> str:
    try:
        from docx import Document
    except ImportError as exc:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="DOCX extraction dependency is not available.",
        ) from exc

    document = Document(BytesIO(data))
    paragraphs = [para.text for para in document.paragraphs if para.text]
    return "\n".join(paragraphs).strip()
