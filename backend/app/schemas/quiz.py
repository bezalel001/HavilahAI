from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct: int = Field(ge=0)
    explanation: str


class QuizGenerationRequest(BaseModel):
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    question_count: Optional[int] = Field(default=None, ge=1, le=10)


class QuizResponse(BaseModel):
    title: str
    subject: str
    difficulty: str
    questions: List[QuizQuestion]


class QuizAttemptRequest(BaseModel):
    topic: Optional[str] = None
    question_count: Optional[int] = Field(default=None, ge=1, le=50)
    answers: List[int]
    duration_seconds: Optional[int] = Field(default=None, ge=0)


class QuizAttemptResponse(BaseModel):
    attempt_id: UUID
    score: int
    correct_count: int
    total: int
    created_at: datetime
