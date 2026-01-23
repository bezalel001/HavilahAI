from __future__ import annotations

from typing import List

from pydantic import BaseModel


class LearningVideo(BaseModel):
    id: int
    title: str
    subject: str
    duration: str
    likes: int
    comments: int
    thumbnail: str
    color: str


class LearningFeedResponse(BaseModel):
    tags: List[str]
    videos: List[LearningVideo]
