from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Optional, Set
from uuid import UUID, uuid4

from fastapi import UploadFile
from minio import Minio
from minio.error import S3Error


class FileValidationError(Exception):
    """Raised when an uploaded file fails validation requirements."""

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


@dataclass
class StoredFile:
    file_id: UUID
    original_filename: str
    stored_filename: str
    content_type: str
    size_bytes: int
    storage_backend: str
    storage_path: str
    bucket_name: Optional[str] = None


class FileStorageService:
    """Persist uploaded files locally or on MinIO with validation rules."""

    def __init__(
        self,
        *,
        storage_backend: str,
        allowed_content_types: Iterable[str],
        max_file_size_bytes: int,
        base_dir: Optional[Path] = None,
        minio_client: Optional[Minio] = None,
        minio_bucket: Optional[str] = None,
    ) -> None:
        storage_backend = storage_backend.lower()
        if storage_backend not in {"local", "minio"}:
            raise ValueError("storage_backend must be 'local' or 'minio'.")

        self.storage_backend = storage_backend
        self.allowed_content_types: Set[str] = {ctype.strip() for ctype in allowed_content_types if ctype.strip()}
        self.max_file_size_bytes = max_file_size_bytes

        if self.storage_backend == "local":
            if base_dir is None:
                raise ValueError("base_dir is required for local storage backend.")
            self.base_dir = Path(base_dir)
            self.base_dir.mkdir(parents=True, exist_ok=True)
            self.minio_client = None
            self.minio_bucket = None
        else:
            if minio_client is None or not minio_bucket:
                raise ValueError("minio_client and minio_bucket are required for MinIO storage backend.")
            self.base_dir = None
            self.minio_client = minio_client
            self.minio_bucket = minio_bucket

    def _determine_size(self, upload_file: UploadFile) -> int:
        upload_file.file.seek(0, os.SEEK_END)
        size = upload_file.file.tell()
        upload_file.file.seek(0)
        return size

    def _validate(self, upload_file: UploadFile, size_bytes: int) -> None:
        filename = (upload_file.filename or "").strip()
        if not filename:
            raise FileValidationError("Uploaded file must include a filename.")

        if not upload_file.content_type:
            raise FileValidationError("Missing content type header.")

        if self.allowed_content_types and upload_file.content_type not in self.allowed_content_types:
            allowed = ", ".join(sorted(self.allowed_content_types))
            raise FileValidationError(
                f"Unsupported media type '{upload_file.content_type}'. Allowed types: {allowed}"
            )

        if size_bytes == 0:
            raise FileValidationError("Uploaded file is empty.")

        if size_bytes > self.max_file_size_bytes:
            max_mb = self.max_file_size_bytes / (1024 * 1024)
            raise FileValidationError(f"File is too large. Limit is {max_mb:.1f} MB.")

    def save(self, upload_file: UploadFile) -> StoredFile:
        size_bytes = self._determine_size(upload_file)
        self._validate(upload_file, size_bytes)

        file_uuid = uuid4()
        suffix = Path(upload_file.filename).suffix if upload_file.filename else ""
        stored_filename = f"{file_uuid}{suffix}"

        if self.storage_backend == "local":
            destination = Path(self.base_dir) / stored_filename  # type: ignore[arg-type]
            upload_file.file.seek(0)
            with destination.open("wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
            storage_path = str(destination.relative_to(self.base_dir))  # type: ignore[arg-type]
            bucket = None
        else:
            assert self.minio_client is not None
            assert self.minio_bucket is not None
            upload_file.file.seek(0)
            try:
                self.minio_client.put_object(
                    bucket_name=self.minio_bucket,
                    object_name=stored_filename,
                    data=upload_file.file,
                    length=size_bytes,
                    content_type=upload_file.content_type or "application/octet-stream",
                )
            except S3Error as exc:  # pragma: no cover - MinIO errors exercised via integration tests
                raise OSError(f"Failed to upload to MinIO: {exc.message}") from exc
            storage_path = stored_filename
            bucket = self.minio_bucket

        return StoredFile(
            file_id=file_uuid,
            original_filename=upload_file.filename or stored_filename,
            stored_filename=stored_filename,
            content_type=upload_file.content_type or "application/octet-stream",
            size_bytes=size_bytes,
            storage_backend=self.storage_backend,
            storage_path=storage_path,
            bucket_name=bucket,
        )
