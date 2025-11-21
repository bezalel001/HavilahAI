from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Protocol

from motor.motor_asyncio import AsyncIOMotorCollection

from app.schemas.content import ContentProcessRequest
from app.services.ai_client import AIContentInsights, AIContentRequest, AIServiceError


class AIContentGenerator(Protocol):
    async def generate_content_plan(self, request: AIContentRequest) -> AIContentInsights: ...


@dataclass
class ContentPipelineResult:
    document_id: str
    title: str
    summary: str
    key_points: list[str]
    learning_objectives: list[str]
    quiz_questions: list[str]
    recommended_media: list[str]
    estimated_reading_time_minutes: float
    created_at: datetime


class ContentPipelineService:
    """Transform educator uploads into structured insights and persist them in MongoDB."""

    def __init__(self, *, collection: AsyncIOMotorCollection, ai_generator: AIContentGenerator) -> None:
        self.collection = collection
        self.ai_generator = ai_generator

    async def process_content(self, request: ContentProcessRequest) -> ContentPipelineResult:
        ai_request = AIContentRequest(
            title=request.title,
            raw_content=request.raw_content,
            learning_objective=request.learning_objective,
            target_audience=request.target_audience,
            tone=request.desired_tone,
            additional_context=request.additional_context,
        )
        insights = await self.ai_generator.generate_content_plan(ai_request)
        document = {
            "title": request.title,
            "target_audience": request.target_audience,
            "learning_objective": request.learning_objective,
            "desired_tone": request.desired_tone,
            "additional_context": request.additional_context,
            "raw_content": request.raw_content,
            "insights": insights.__dict__,
            "status": "processed",
            "created_at": datetime.now(timezone.utc),
        }
        result = await self.collection.insert_one(document)
        return ContentPipelineResult(
            document_id=str(result.inserted_id),
            title=request.title,
            summary=insights.summary,
            key_points=insights.key_points,
            learning_objectives=insights.learning_objectives,
            quiz_questions=insights.quiz_questions,
            recommended_media=insights.recommended_media,
            estimated_reading_time_minutes=insights.estimated_reading_time_minutes,
            created_at=document["created_at"],
        )
