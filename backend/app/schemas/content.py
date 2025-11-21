from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ContentProcessRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    raw_content: str = Field(..., min_length=50)
    target_audience: str = Field(..., min_length=3, max_length=120)
    learning_objective: str = Field(..., min_length=10, max_length=300)
    desired_tone: Optional[str] = Field(default="engaging", max_length=60)
    additional_context: Optional[str] = Field(default=None, max_length=500)


class ContentProcessResponse(BaseModel):
    document_id: str
    title: str
    summary: str
    key_points: List[str]
    learning_objectives: List[str]
    quiz_questions: List[str]
    recommended_media: List[str]
    estimated_reading_time_minutes: float
    created_at: datetime


class ContentSimplifyRequest(BaseModel):
    text: str = Field(..., min_length=40)
    max_sentence_words: int = Field(default=20, ge=5, le=60)


class ContentSimplifyResponse(BaseModel):
    simplified_text: str
    key_points: List[str]
    replaced_words: List[str]
    original_word_count: int
    simplified_word_count: int
    readability_score: float
