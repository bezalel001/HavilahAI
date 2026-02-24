from __future__ import annotations

from typing import List
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.topic import ModuleType, TopicDifficulty


class TopicCard(BaseModel):
    id: UUID
    name: str
    icon: str
    category: str
    lessons: int
    color: str


class RecentTopic(BaseModel):
    id: UUID
    name: str
    progress: int
    icon: str


class TopicModule(BaseModel):
    id: UUID
    title: str
    duration: str
    type: str
    completed: bool


class TopicDetail(BaseModel):
    id: UUID
    name: str
    icon: str
    description: str
    hero_color: str
    modules: List[TopicModule]
    eu_connection: str
    difficulty: str
    estimated_time: str
    total_modules: int
    completed_modules: int
    related_topics: List[str]


class TopicListResponse(BaseModel):
    popular: List[TopicCard]
    recent: List[RecentTopic]


class TopicDetailResponse(BaseModel):
    topic: TopicDetail


class TopicModuleCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    type: ModuleType
    duration_minutes: int = Field(..., gt=0, description="Duration in minutes")
    order_index: int = Field(..., ge=0)
    content_url: str | None = None
    eu_context: str | None = None


class TopicCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    category: str = Field(..., min_length=2, max_length=100)
    icon: str = Field(..., min_length=1, max_length=16)
    description: str = Field(..., min_length=10)
    difficulty: TopicDifficulty = TopicDifficulty.intermediate
    estimated_hours: float = Field(..., gt=0)
    gradient_color: str = Field(..., min_length=3, max_length=64)
    is_popular: bool = False
    modules: List[TopicModuleCreate]

    @field_validator("modules")
    @classmethod
    def validate_modules(cls, modules: List[TopicModuleCreate]):
        if not modules:
            raise ValueError("At least one learning module is required.")
        return modules


class TopicGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=200)
    difficulty: TopicDifficulty | None = None
    module_count: int = Field(default=5, ge=3, le=8)
    category_hint: str | None = Field(default=None, max_length=100)
    is_popular: bool = False
