from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.user import LearningStyle


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    preferred_language: Optional[str] = "en"
    learning_style: Optional[LearningStyle] = LearningStyle.NOT_SET


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(UserBase):
    id: UUID
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
