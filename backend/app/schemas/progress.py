from __future__ import annotations

from typing import List

from pydantic import BaseModel


class WeeklyStat(BaseModel):
    day: str
    minutes: int
    goal: int


class Achievement(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    unlocked: bool


class SubjectProgress(BaseModel):
    name: str
    progress: int
    color: str


class Milestone(BaseModel):
    title: str
    date: str
    icon: str
    color: str


class NextLevelProgress(BaseModel):
    next_level: str
    current_xp: int
    target_xp: int
    remaining_xp: int
    percentage: float


class ProgressOverview(BaseModel):
    level: str
    streak: str
    study_time: str
    total_points: str
    weekly_stats: List[WeeklyStat]
    achievements: List[Achievement]
    subjects: List[SubjectProgress]
    milestones: List[Milestone]
    next_level: NextLevelProgress
