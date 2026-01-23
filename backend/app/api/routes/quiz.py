from fastapi import APIRouter

from app.schemas.quiz import QuizGenerationRequest, QuizResponse
from app.services.demo_content import generate_quiz_plan


router = APIRouter()


@router.post(
    "/generate",
    response_model=QuizResponse,
    summary="Generate a quiz based on topic or difficulty",
)
def generate_quiz(payload: QuizGenerationRequest) -> QuizResponse:
    data = generate_quiz_plan(
        topic=payload.topic,
        difficulty=payload.difficulty,
        question_count=payload.question_count,
    )
    return QuizResponse(**data)
