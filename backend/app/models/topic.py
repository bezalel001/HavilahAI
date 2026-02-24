from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class TopicDifficulty(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class ModuleType(str, enum.Enum):
    video = "video"
    reading = "reading"
    interactive = "interactive"
    quiz = "quiz"


class Topic(Base):
    __tablename__ = "topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    icon_emoji = Column(String(16), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(Enum(TopicDifficulty), nullable=False, default=TopicDifficulty.intermediate)
    estimated_hours = Column(Float, nullable=False, default=1.0)
    gradient_color = Column(String(64), nullable=False, default="from-purple-500 to-pink-500")
    is_popular = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    modules = relationship("LearningModule", back_populates="topic", cascade="all, delete-orphan", order_by="LearningModule.order_index")


class LearningModule(Base):
    __tablename__ = "learning_modules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    type = Column(Enum(ModuleType), nullable=False, default=ModuleType.reading)
    duration_minutes = Column(Integer, nullable=False, default=10)
    order_index = Column(Integer, nullable=False, default=0)
    content_url = Column(String(512), nullable=True)
    eu_context = Column(Text, nullable=True)

    topic = relationship("Topic", back_populates="modules")


class UserTopicProgress(Base):
    __tablename__ = "user_topic_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_accessed = Column(DateTime, default=datetime.utcnow, nullable=False)
    progress_percentage = Column(Integer, nullable=False, default=0)
    completed_modules = Column(ARRAY(UUID(as_uuid=True)), nullable=False, server_default="{}")


class UserModuleCompletion(Base):
    __tablename__ = "user_module_completions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(UUID(as_uuid=True), ForeignKey("learning_modules.id", ondelete="CASCADE"), nullable=False, index=True)
    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    time_spent_seconds = Column(Integer, nullable=False, default=0)
