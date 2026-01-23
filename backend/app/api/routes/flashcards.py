from fastapi import APIRouter, Query

from app.schemas.flashcards import FlashcardDeck
from app.services.demo_content import get_flashcard_deck


router = APIRouter()


@router.get("", response_model=FlashcardDeck, summary="Retrieve a flashcard deck")
def read_flashcards(topic: str | None = Query(default=None, description="Optional topic keyword")) -> FlashcardDeck:
    return FlashcardDeck(**get_flashcard_deck(topic))
