from __future__ import annotations

from typing import List

from pydantic import BaseModel


class DashboardStat(BaseModel):
    label: str
    value: str
    icon: str
    color: str


class DashboardQuickAction(BaseModel):
    label: str
    view: str
    icon: str
    color: str


class DashboardGoal(BaseModel):
    title: str
    progress: int
    current: float
    total: float


class DashboardActivity(BaseModel):
    title: str
    type: str
    score: int
    date: str
    icon: str


class DashboardSummary(BaseModel):
    greeting: str
    subtitle: str
    stats: List[DashboardStat]
    quick_actions: List[DashboardQuickAction]
    goals: List[DashboardGoal]
    recent_activity: List[DashboardActivity]
