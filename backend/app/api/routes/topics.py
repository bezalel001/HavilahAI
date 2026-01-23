from fastapi import APIRouter, HTTPException, Query

from app.schemas.topics import TopicDetailResponse, TopicListResponse
from app.services.demo_content import get_topic_detail, list_topics


router = APIRouter()


@router.get("", response_model=TopicListResponse, summary="List recommended topics")
def read_topics(q: str | None = Query(default=None, description="Optional search term")) -> TopicListResponse:
    return TopicListResponse(**list_topics(q))


@router.get("/{topic_id}", response_model=TopicDetailResponse, summary="Get detailed topic info")
def read_topic_detail(topic_id: int) -> TopicDetailResponse:
    try:
        topic = get_topic_detail(topic_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return TopicDetailResponse(topic=topic)
