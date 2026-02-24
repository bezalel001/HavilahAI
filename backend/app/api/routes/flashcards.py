from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.flashcard_attempt import FlashcardAttempt
from app.models.user import User
from app.schemas.flashcards import (
    FlashcardAttemptRequest,
    FlashcardAttemptResponse,
    FlashcardDeck,
    FlashcardGenerateRequest,
)
from app.services.demo_content import get_flashcard_deck
from app.services.learning_assets import LearningAssetsService
from app.api.dependencies import get_learning_assets_service
from app.services.ai_client import AIServiceError


router = APIRouter()


@router.get("", response_model=FlashcardDeck, summary="Retrieve a flashcard deck")
def read_flashcards(topic: str | None = Query(default=None, description="Optional topic keyword")) -> FlashcardDeck:
    return FlashcardDeck(**get_flashcard_deck(topic))


@router.post(
    "/generate",
    response_model=FlashcardDeck,
    summary="Generate flashcards from a topic prompt",
    status_code=status.HTTP_200_OK,
)
async def generate_flashcards(
    payload: FlashcardGenerateRequest,
    assets_service: LearningAssetsService = Depends(get_learning_assets_service),
) -> FlashcardDeck:
    topic = payload.topic.strip()
    if not topic:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Topic is required.")
    prompt = (
        "Create a concise study brief about this topic for learners.\n"
        f"Topic: {topic}\n"
        "Include definitions, key facts, and examples."
    )
    try:
        assets = await assets_service.generate_assets(prompt)
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return FlashcardDeck(topic=topic, cards=assets.flashcards)


@router.post("/attempts", response_model=FlashcardAttemptResponse, summary="Record flashcard practice results")
def record_flashcard_attempt(
    payload: FlashcardAttemptRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FlashcardAttemptResponse:
    known_count = len(payload.known)
    unknown_count = len(payload.unknown)
    total = known_count + unknown_count
    progress = 0 if total == 0 else int(round((known_count / total) * 100))
    attempt = FlashcardAttempt(
        user_id=current_user.id,
        topic=payload.topic,
        known_ids=payload.known,
        unknown_ids=payload.unknown,
        known_count=known_count,
        unknown_count=unknown_count,
        progress_percent=progress,
    )
    db.add(attempt)
    db.commit()
    return FlashcardAttemptResponse(
        topic=payload.topic,
        known_count=known_count,
        unknown_count=unknown_count,
        progress_percent=progress,
    )
