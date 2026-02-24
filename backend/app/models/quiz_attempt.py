from __future__ import annotations

from datetime import datetime
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    topic = Column(String(255), nullable=True)
    question_count = Column(Integer, nullable=True)
    answers = Column(JSON, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    score = Column(Integer, nullable=False, default=0)
    correct_count = Column(Integer, nullable=False, default=0)
    total = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
