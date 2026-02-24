from __future__ import annotations

import asyncio
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.schemas.content import ContentProcessRequest
from app.services.ai_client import OpenAIContentGenerator
from app.services.content_pipeline import ContentPipelineService
from app.services.realtime_events import publish_realtime_event
from app.worker.celery_app import celery_app


async def _process_content(payload: dict[str, Any], user_id: str) -> dict[str, Any]:
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    try:
        mongo_db = client[settings.MONGODB_DB_NAME]
        collection = mongo_db[settings.CONTENT_PIPELINE_COLLECTION]
        request = ContentProcessRequest.model_validate(payload)
        ai_generator = OpenAIContentGenerator(
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL,
        )
        pipeline = ContentPipelineService(collection=collection, ai_generator=ai_generator)
        result = await pipeline.process_content(request, user_id=user_id)
        return {
            "document_id": result.document_id,
            "title": result.title,
            "summary": result.summary,
            "key_points": result.key_points,
            "learning_objectives": result.learning_objectives,
            "quiz_questions": result.quiz_questions,
            "recommended_media": result.recommended_media,
            "estimated_reading_time_minutes": result.estimated_reading_time_minutes,
            "created_at": result.created_at.isoformat(),
        }
    finally:
        client.close()


@celery_app.task(bind=True, name="content.process_async")
def process_content_task(self, payload: dict[str, Any], user_id: str) -> dict[str, Any]:
    task_id = self.request.id
    publish_realtime_event(
        "content_processing_started",
        {"task_id": task_id, "user_id": user_id, "status": "STARTED"},
    )
    try:
        result = asyncio.run(_process_content(payload, user_id))
    except Exception as exc:
        publish_realtime_event(
            "content_processing_failed",
            {"task_id": task_id, "user_id": user_id, "status": "FAILURE", "error": str(exc)},
        )
        raise

    publish_realtime_event(
        "content_processing_completed",
        {
            "task_id": task_id,
            "user_id": user_id,
            "status": "SUCCESS",
            "document_id": result["document_id"],
            "title": result["title"],
        },
    )
    return {"user_id": user_id, "content": result}
