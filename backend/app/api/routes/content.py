from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_content_pipeline_service
from app.schemas.content import (
    ContentProcessRequest,
    ContentProcessResponse,
    ContentSimplifyRequest,
    ContentSimplifyResponse,
)
from app.services.ai_client import AIServiceError
from app.services.content_pipeline import ContentPipelineResult, ContentPipelineService
from app.services.text_simplifier import ContentSimplifier


router = APIRouter()


@router.post(
    "/process",
    response_model=ContentProcessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Process educator content with AI",
)
async def process_content(
    payload: ContentProcessRequest,
    pipeline_service: ContentPipelineService = Depends(get_content_pipeline_service),
) -> ContentProcessResponse:
    try:
        result: ContentPipelineResult = await pipeline_service.process_content(payload)
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - unexpected errors bubble up as 500
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Pipeline failed.") from exc

    return ContentProcessResponse(
        document_id=result.document_id,
        title=result.title,
        summary=result.summary,
        key_points=result.key_points,
        learning_objectives=result.learning_objectives,
        quiz_questions=result.quiz_questions,
        recommended_media=result.recommended_media,
        estimated_reading_time_minutes=result.estimated_reading_time_minutes,
        created_at=result.created_at,
    )


@router.post(
    "/simplify",
    response_model=ContentSimplifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Simplify long-form content without AI calls",
)
def simplify_content(payload: ContentSimplifyRequest) -> ContentSimplifyResponse:
    simplifier = ContentSimplifier(max_sentence_words=payload.max_sentence_words)
    result = simplifier.simplify(payload.text)
    return ContentSimplifyResponse(
        simplified_text=result.simplified_text,
        key_points=result.key_points,
        replaced_words=result.replaced_words,
        original_word_count=result.original_word_count,
        simplified_word_count=result.simplified_word_count,
        readability_score=result.readability_score,
    )
