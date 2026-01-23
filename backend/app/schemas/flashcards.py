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
