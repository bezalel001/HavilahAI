from __future__ import annotations

import enum
from datetime import datetime
import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class UploadStatus(str, enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    processed = "processed"
    failed = "failed"


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    content_type = Column(String(255), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    storage_backend = Column(String(32), nullable=False)
    storage_path = Column(String(512), nullable=False)
    bucket_name = Column(String(255), nullable=True)
    status = Column(Enum(UploadStatus), nullable=False, default=UploadStatus.uploaded)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
