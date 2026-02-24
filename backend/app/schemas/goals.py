from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class GoalBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    type: str = Field(..., min_length=3, max_length=50)
    total: float = Field(..., gt=0)
    current: float = Field(default=0.0, ge=0)
    deadline: Optional[date] = None


class GoalCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    type: str = Field(..., min_length=3, max_length=50)
    total: float = Field(..., gt=0)
    deadline: Optional[date] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=200)
    type: Optional[str] = Field(default=None, min_length=3, max_length=50)
    total: Optional[float] = Field(default=None, gt=0)
    current: Optional[float] = Field(default=None, ge=0)
    deadline: Optional[date] = None


class GoalResponse(GoalBase):
    id: str
    progress: int
    created_at: datetime
    updated_at: datetime


class GoalListResponse(BaseModel):
    items: List[GoalResponse]
