from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.goal import Goal
from app.models.user import User
from app.schemas.goals import GoalCreate, GoalListResponse, GoalResponse, GoalUpdate


router = APIRouter()


def _progress(current: float, total: float) -> int:
    if total <= 0:
        return 0
    return min(100, int(round((current / total) * 100)))


def _to_response(goal: Goal) -> GoalResponse:
    return GoalResponse(
        id=str(goal.id),
        title=goal.title,
        type=goal.type,
        current=goal.current,
        total=goal.total,
        deadline=goal.deadline,
        progress=_progress(goal.current, goal.total),
        created_at=goal.created_at,
        updated_at=goal.updated_at,
    )


@router.get("", response_model=GoalListResponse, summary="List goals for the current user")
def list_goals(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> GoalListResponse:
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .order_by(Goal.created_at.desc())
        .all()
    )
    return GoalListResponse(items=[_to_response(goal) for goal in goals])


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED, summary="Create a goal")
def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> GoalResponse:
    goal = Goal(
        user_id=current_user.id,
        title=payload.title,
        type=payload.type,
        total=payload.total,
        current=0.0,
        deadline=payload.deadline,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _to_response(goal)


@router.patch("/{goal_id}", response_model=GoalResponse, summary="Update a goal")
def update_goal(
    goal_id: UUID,
    payload: GoalUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> GoalResponse:
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found.")

    fields = payload.model_fields_set
    if "title" in fields:
        goal.title = payload.title  # type: ignore[assignment]
    if "type" in fields:
        goal.type = payload.type  # type: ignore[assignment]
    if "total" in fields:
        goal.total = payload.total  # type: ignore[assignment]
    if "current" in fields:
        goal.current = payload.current  # type: ignore[assignment]
    if "deadline" in fields:
        goal.deadline = payload.deadline

    goal.updated_at = datetime.now(timezone.utc)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _to_response(goal)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a goal")
def delete_goal(
    goal_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found.")
    db.delete(goal)
    db.commit()
