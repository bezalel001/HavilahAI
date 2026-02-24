from datetime import datetime
from typing import List, Literal
from uuid import UUID

from pydantic import BaseModel


class FileUploadResponse(BaseModel):
    file_id: UUID
    original_filename: str
    stored_filename: str
    content_type: str
    size_bytes: int
    storage_backend: str
    storage_path: str
    bucket_name: str | None = None


class UploadRecord(BaseModel):
    file_id: UUID
    original_filename: str
    content_type: str
    size_bytes: int
    created_at: datetime
    status: Literal["uploaded", "processing", "processed", "failed"]
    storage_backend: str
    storage_path: str
    bucket_name: str | None = None


class UploadListResponse(BaseModel):
    items: List[UploadRecord]
