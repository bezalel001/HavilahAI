import logging
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user, get_optional_quiz_generator_service
from app.db.session import get_db
from app.models.quiz_attempt import QuizAttempt
from app.models.user import User
from app.schemas.quiz import QuizAttemptRequest, QuizAttemptResponse, QuizGenerationRequest, QuizResponse
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


@router.post("/attempts", response_model=QuizAttemptResponse, summary="Submit a quiz attempt")
def submit_quiz_attempt(
    payload: QuizAttemptRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> QuizAttemptResponse:
    total = payload.question_count or len(payload.answers)
    if total <= 0:
        total = len(payload.answers)
    correct_count = total
    score = 0 if total == 0 else int(round((correct_count / total) * 100))
    attempt = QuizAttempt(
        user_id=current_user.id,
        topic=payload.topic,
        question_count=payload.question_count,
        answers=payload.answers,
        duration_seconds=payload.duration_seconds,
        score=score,
        correct_count=correct_count,
        total=total,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return QuizAttemptResponse(
        attempt_id=attempt.id,
        score=attempt.score,
        correct_count=attempt.correct_count,
        total=attempt.total,
        created_at=attempt.created_at or datetime.utcnow(),
    )
