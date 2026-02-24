from __future__ import annotations

from datetime import datetime
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class FlashcardAttempt(Base):
    __tablename__ = "flashcard_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    topic = Column(String(255), nullable=False)
    known_ids = Column(JSON, nullable=True)
    unknown_ids = Column(JSON, nullable=True)
    known_count = Column(Integer, nullable=False, default=0)
    unknown_count = Column(Integer, nullable=False, default=0)
    progress_percent = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
