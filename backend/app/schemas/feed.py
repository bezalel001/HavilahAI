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
    summary: str | None = None
    key_points: List[str] = []
    source: str = "upload"
    liked: bool = False
    saved: bool = False


class FeedLikeRequest(BaseModel):
    liked: bool


class FeedLikeResponse(BaseModel):
    video_id: int
    likes: int
    liked: bool


class FeedSaveRequest(BaseModel):
    saved: bool


class FeedSaveResponse(BaseModel):
    video_id: int
    saved: bool


class LearningFeedResponse(BaseModel):
    tags: List[str]
    videos: List[LearningVideo]
