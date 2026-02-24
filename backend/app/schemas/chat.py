from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)


class ChatMessageResponse(BaseModel):
    reply: str
    suggestions: List[str]


class ChatSessionCreateRequest(BaseModel):
    title: Optional[str] = None


class ChatSessionCreateResponse(BaseModel):
    session_id: UUID
    title: Optional[str] = None


class ChatSessionMessage(BaseModel):
    id: UUID
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime


class ChatSessionResponse(BaseModel):
    session_id: UUID
    messages: List[ChatSessionMessage]


class ChatSessionMessageCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
