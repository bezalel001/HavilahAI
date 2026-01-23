from fastapi import APIRouter

from app.schemas.dashboard import DashboardSummary
from app.services.demo_content import get_dashboard_summary


router = APIRouter()


@router.get("/summary", response_model=DashboardSummary, summary="Learning dashboard snapshot")
def read_dashboard_summary() -> DashboardSummary:
    return DashboardSummary(**get_dashboard_summary())
