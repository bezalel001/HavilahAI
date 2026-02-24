from dataclasses import asdict

from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from uuid import UUID
from sqlalchemy.orm import Session
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_active_user, get_file_storage_service, get_mongo_db
from app.core.config import settings
from app.db.session import get_db
from app.models.upload import Upload, UploadStatus
from app.models.user import User
from app.schemas.upload import FileUploadResponse, UploadListResponse, UploadRecord
from app.services.file_storage import FileStorageService, FileValidationError


router = APIRouter()


@router.post("", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED, summary="Upload a file")
async def upload_file(
    file: UploadFile = File(...),
    storage_service: FileStorageService = Depends(get_file_storage_service),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FileUploadResponse:
    try:
        stored_file = storage_service.save(file)
    except FileValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.detail) from exc
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store uploaded file.",
        ) from exc

    upload = Upload(
        id=stored_file.file_id,
        user_id=current_user.id,
        original_filename=stored_file.original_filename,
        stored_filename=stored_file.stored_filename,
        content_type=stored_file.content_type,
        size_bytes=stored_file.size_bytes,
        storage_backend=stored_file.storage_backend,
        storage_path=stored_file.storage_path,
        bucket_name=stored_file.bucket_name,
        status=UploadStatus.uploaded,
    )
    db.add(upload)
    db.commit()

    return FileUploadResponse(**asdict(stored_file))


@router.get("", response_model=UploadListResponse, summary="List uploaded materials")
def list_uploads(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> UploadListResponse:
    uploads = (
        db.query(Upload)
        .filter(Upload.user_id == current_user.id)
        .order_by(Upload.created_at.desc())
        .limit(50)
        .all()
    )
    items = [
        UploadRecord(
            file_id=item.id,
            original_filename=item.original_filename,
            content_type=item.content_type,
            size_bytes=item.size_bytes,
            created_at=item.created_at or datetime.utcnow(),
            status=item.status.value if hasattr(item.status, "value") else str(item.status),
            storage_backend=item.storage_backend,
            storage_path=item.storage_path,
            bucket_name=item.bucket_name,
        )
        for item in uploads
    ]
    return UploadListResponse(items=items)


@router.delete("/{upload_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an upload")
async def delete_upload(
    upload_id: UUID,
    storage_service: FileStorageService = Depends(get_file_storage_service),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> None:
    upload = (
        db.query(Upload)
        .filter(Upload.id == upload_id, Upload.user_id == current_user.id)
        .first()
    )
    if upload is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found.")

    storage_service.delete(upload.storage_path, upload.bucket_name)
    collection = mongo_db[settings.LEARNING_ASSETS_COLLECTION]
    await collection.delete_many(
        {"upload_id": str(upload.id), "user_id": str(current_user.id)}
    )
    db.delete(upload)
    db.commit()
