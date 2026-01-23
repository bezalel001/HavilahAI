from fastapi import APIRouter

from app.schemas.progress import ProgressOverview
from app.services.demo_content import get_progress_overview


router = APIRouter()


@router.get("/overview", response_model=ProgressOverview, summary="Learner progress overview")
def read_progress_overview() -> ProgressOverview:
    return ProgressOverview(**get_progress_overview())
