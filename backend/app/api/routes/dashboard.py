from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.demo_content import get_dashboard_summary


router = APIRouter()


@router.get("/summary", response_model=DashboardSummary, summary="Learning dashboard snapshot")
def read_dashboard_summary(current_user: User = Depends(get_current_active_user)) -> DashboardSummary:
    payload = get_dashboard_summary()
    name = (current_user.full_name or current_user.email or "Learner").split(" ")[0]
    payload["greeting"] = f"Welcome back, {name}! 👋"
    return DashboardSummary(**payload)
