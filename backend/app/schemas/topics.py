from __future__ import annotations

from typing import List

from pydantic import BaseModel


class TopicCard(BaseModel):
    id: int
    name: str
    icon: str
    category: str
    lessons: int
    color: str


class RecentTopic(BaseModel):
    name: str
    progress: int
    icon: str


class TopicModule(BaseModel):
    title: str
    duration: str
    type: str
    completed: bool


class TopicDetail(BaseModel):
    id: int
    name: str
    icon: str
    description: str
    hero_color: str
    modules: List[TopicModule]
    eu_connection: str
    difficulty: str
    estimated_time: str
    total_modules: int
    completed_modules: int
    related_topics: List[str]


class TopicListResponse(BaseModel):
    popular: List[TopicCard]
    recent: List[RecentTopic]


class TopicDetailResponse(BaseModel):
    topic: TopicDetail
