from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field
from app.schemas.flashcards import Flashcard
from app.schemas.quiz import QuizQuestion


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


class ContentProcessTaskEnqueueResponse(BaseModel):
    task_id: str
    status: str


class ContentProcessTaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[ContentProcessResponse] = None
    error: Optional[str] = None


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


class ContentUploadProcessRequest(BaseModel):
    upload_id: str = Field(..., min_length=1)


class SimplifiedConcept(BaseModel):
    original: str
    simplified: str


class ContentLearningAssetsResponse(BaseModel):
    document_id: str
    summary: str
    key_points: List[str]
    simplified_concepts: List[SimplifiedConcept]
    flashcards: List[Flashcard]
    quiz_questions: List[QuizQuestion]
    created_at: datetime
    upload_id: str


class ContentLearningAssetsSummary(BaseModel):
    document_id: str
    upload_id: str
    summary: str
    key_points: List[str]
    created_at: datetime
    status: str
    flashcards_count: int
    quiz_questions_count: int
    original_filename: Optional[str] = None
    content_type: Optional[str] = None
    size_bytes: Optional[int] = None
    upload_created_at: Optional[datetime] = None


class ContentLearningAssetsListResponse(BaseModel):
    items: List[ContentLearningAssetsSummary]


class ContentLearningAssetsDetailResponse(BaseModel):
    document_id: str
    upload_id: str
    summary: str
    key_points: List[str]
    simplified_concepts: List[SimplifiedConcept]
    flashcards: List[Flashcard]
    quiz_questions: List[QuizQuestion]
    created_at: datetime
    status: str
    original_filename: Optional[str] = None
    content_type: Optional[str] = None
    size_bytes: Optional[int] = None
    upload_created_at: Optional[datetime] = None


class ContentDocumentSummary(BaseModel):
    document_id: str
    title: str
    status: str
    created_at: datetime


class ContentDocumentListResponse(BaseModel):
    items: List[ContentDocumentSummary]


class ContentDocumentDetailResponse(BaseModel):
    document_id: str
    title: str
    summary: str
    key_points: List[str]
    learning_objectives: List[str]
    quiz_questions: List[str]
    recommended_media: List[str]
    estimated_reading_time_minutes: float
    created_at: datetime
    status: str
    target_audience: str
    learning_objective: str
    desired_tone: Optional[str] = None
    additional_context: Optional[str] = None
    raw_content: Optional[str] = None
