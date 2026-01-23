from fastapi import APIRouter

from app.schemas.feed import LearningFeedResponse
from app.services.demo_content import get_learning_feed


router = APIRouter()


@router.get("/videos", response_model=LearningFeedResponse, summary="Short-form learning feed")
def list_learning_videos() -> LearningFeedResponse:
    return LearningFeedResponse(**get_learning_feed())
