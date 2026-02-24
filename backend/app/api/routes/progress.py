from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.progress import ProgressOverview
from app.services.demo_content import get_progress_overview


router = APIRouter()


@router.get("/overview", response_model=ProgressOverview, summary="Learner progress overview")
def read_progress_overview(current_user: User = Depends(get_current_active_user)) -> ProgressOverview:
    return ProgressOverview(**get_progress_overview())
