import logging
from fastapi import APIRouter, Depends

from app.api.dependencies import get_optional_quiz_generator_service
from app.schemas.quiz import QuizGenerationRequest, QuizResponse
from app.services.demo_content import generate_quiz_plan
from app.services.quiz_generator import QuizGenerationError, QuizGeneratorService


router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=QuizResponse, summary="Generate a quiz based on topic or difficulty")
async def generate_quiz(
    payload: QuizGenerationRequest,
    quiz_service: QuizGeneratorService | None = Depends(get_optional_quiz_generator_service),
) -> QuizResponse:
    if quiz_service is not None:
        try:
            return await quiz_service.generate_quiz(
                topic=payload.topic,
                difficulty=payload.difficulty,
                question_count=payload.question_count,
            )
        except QuizGenerationError as exc:
            logger.warning("Falling back to demo quiz generator: %s", exc)

    data = generate_quiz_plan(
        topic=payload.topic,
        difficulty=payload.difficulty,
        question_count=payload.question_count,
    )
    return QuizResponse(**data)
