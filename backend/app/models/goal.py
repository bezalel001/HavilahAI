from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)
    current = Column(Float, nullable=False, default=0.0)
    total = Column(Float, nullable=False)
    deadline = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
