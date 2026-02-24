from __future__ import annotations

from typing import List

from pydantic import BaseModel


class Flashcard(BaseModel):
    id: int
    front: str
    back: str
    category: str


class FlashcardDeck(BaseModel):
    topic: str
    cards: List[Flashcard]


class FlashcardAttemptRequest(BaseModel):
    topic: str
    known: List[int]
    unknown: List[int]


class FlashcardAttemptResponse(BaseModel):
    topic: str
    known_count: int
    unknown_count: int
    progress_percent: int


class FlashcardGenerateRequest(BaseModel):
    topic: str
