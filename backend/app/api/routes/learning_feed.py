from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.schemas.feed import (
    FeedLikeRequest,
    FeedLikeResponse,
    FeedSaveRequest,
    FeedSaveResponse,
    LearningFeedResponse,
)
from app.api.dependencies import (
    get_current_active_user,
    get_learning_assets_service,
    get_mongo_db,
)
from app.db.session import get_db
from app.models.feed_interaction import FeedVideoInteraction
from app.models.user import User
from app.services.learning_feed import build_learning_feed
from app.services.learning_assets import LearningAssetsService
from motor.motor_asyncio import AsyncIOMotorDatabase


router = APIRouter()


@router.get("/videos", response_model=LearningFeedResponse, summary="Short-form learning feed")
async def list_learning_videos(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
    assets_service: LearningAssetsService = Depends(get_learning_assets_service),
) -> LearningFeedResponse:
    payload = await build_learning_feed(
        user_id=current_user.id,
        db=db,
        mongo_db=mongo_db,
        assets_service=assets_service,
    )
    videos = payload.get("videos", [])
    video_ids = [str(item.get("id")) for item in videos if "id" in item]
    interactions = (
        db.query(FeedVideoInteraction)
        .filter(
            and_(
                FeedVideoInteraction.user_id == current_user.id,
                FeedVideoInteraction.video_id.in_(video_ids),
            )
        )
        .all()
    )
    interaction_map = {item.video_id: item for item in interactions}
    for item in videos:
        interaction = interaction_map.get(str(item.get("id")))
        if interaction:
            item["liked"] = bool(interaction.liked)
            item["saved"] = bool(interaction.saved)
    return LearningFeedResponse(**payload)


@router.post(
    "/videos/{video_id}/like",
    response_model=FeedLikeResponse,
    summary="Like or unlike a learning video",
)
async def like_learning_video(
    video_id: int,
    payload: FeedLikeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
    assets_service: LearningAssetsService = Depends(get_learning_assets_service),
) -> FeedLikeResponse:
    feed = await build_learning_feed(
        user_id=current_user.id,
        db=db,
        mongo_db=mongo_db,
        assets_service=assets_service,
    )
    video = next((item for item in feed["videos"] if int(item["id"]) == video_id), None)
    if video is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found.")
    interaction = (
        db.query(FeedVideoInteraction)
        .filter(
            and_(
                FeedVideoInteraction.user_id == current_user.id,
                FeedVideoInteraction.video_id == str(video_id),
            )
        )
        .first()
    )
    if interaction is None:
        interaction = FeedVideoInteraction(
            user_id=current_user.id,
            video_id=str(video_id),
            liked=payload.liked,
            saved=False,
        )
        db.add(interaction)
    else:
        interaction.liked = payload.liked
    db.commit()

    base_likes = int(video.get("likes", 0))
    likes = base_likes + (1 if payload.liked else 0)
    return FeedLikeResponse(video_id=video_id, likes=likes, liked=payload.liked)


@router.post(
    "/videos/{video_id}/save",
    response_model=FeedSaveResponse,
    summary="Save or unsave a learning video",
)
async def save_learning_video(
    video_id: int,
    payload: FeedSaveRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    mongo_db: AsyncIOMotorDatabase = Depends(get_mongo_db),
    assets_service: LearningAssetsService = Depends(get_learning_assets_service),
) -> FeedSaveResponse:
    feed = await build_learning_feed(
        user_id=current_user.id,
        db=db,
        mongo_db=mongo_db,
        assets_service=assets_service,
    )
    video = next((item for item in feed["videos"] if int(item["id"]) == video_id), None)
    if video is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found.")
    interaction = (
        db.query(FeedVideoInteraction)
        .filter(
            and_(
                FeedVideoInteraction.user_id == current_user.id,
                FeedVideoInteraction.video_id == str(video_id),
            )
        )
        .first()
    )
    if interaction is None:
        interaction = FeedVideoInteraction(
            user_id=current_user.id,
            video_id=str(video_id),
            liked=False,
            saved=payload.saved,
        )
        db.add(interaction)
    else:
        interaction.saved = payload.saved
    db.commit()

    return FeedSaveResponse(video_id=video_id, saved=payload.saved)
