from dataclasses import asdict

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.dependencies import get_file_storage_service
from app.schemas.upload import FileUploadResponse
from app.services.file_storage import FileStorageService, FileValidationError


router = APIRouter()


@router.post("", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED, summary="Upload a file")
async def upload_file(
    file: UploadFile = File(...),
    storage_service: FileStorageService = Depends(get_file_storage_service),
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

    return FileUploadResponse(**asdict(stored_file))
