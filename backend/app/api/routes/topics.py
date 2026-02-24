from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_active_superuser,
    get_current_active_user,
    get_topic_generator_service,
)
from app.db.session import get_db
from app.models.topic import LearningModule, ModuleType, Topic, TopicDifficulty, UserTopicProgress
from app.models.user import User
from app.schemas.topics import (
    TopicCard,
    TopicCreate,
    TopicDetail,
    TopicDetailResponse,
    TopicListResponse,
    TopicModule,
    TopicGenerateRequest,
    RecentTopic,
)
from app.services.ai_client import AIServiceError
from app.services.topic_generator import TopicGeneratorService


router = APIRouter()


def _build_topic_detail(
    db: Session,
    topic: Topic,
    user_id: UUID | None = None,
) -> TopicDetail:
    modules = (
        db.query(LearningModule)
        .filter(LearningModule.topic_id == topic.id)
        .order_by(LearningModule.order_index.asc())
        .all()
    )

    completed_ids: set[str] = set()
    completed_modules_count = 0
    if user_id:
        progress = (
            db.query(UserTopicProgress)
            .filter(UserTopicProgress.topic_id == topic.id, UserTopicProgress.user_id == user_id)
            .first()
        )
        if progress and progress.completed_modules:
            completed_ids = {str(module_id) for module_id in progress.completed_modules}
            completed_modules_count = len(completed_ids)

    module_payload = [
        TopicModule(
            id=module.id,
            title=module.title,
            duration=f"{module.duration_minutes} min",
            type=module.type.value,
            completed=str(module.id) in completed_ids,
        )
        for module in modules
    ]

    eu_context = next((module.eu_context for module in modules if module.eu_context), topic.description)
    related_topics = [
        related.name
        for related in db.query(Topic)
        .filter(Topic.category == topic.category, Topic.id != topic.id)
        .order_by(Topic.name)
        .limit(4)
        .all()
    ]

    return TopicDetail(
        id=topic.id,
        name=topic.name,
        icon=topic.icon_emoji,
        description=topic.description,
        hero_color=topic.gradient_color,
        modules=module_payload,
        eu_connection=eu_context,
        difficulty=topic.difficulty.value.title(),
        estimated_time=f"{topic.estimated_hours:.1f} hours",
        total_modules=len(modules),
        completed_modules=completed_modules_count,
        related_topics=related_topics,
    )


@router.get("", response_model=TopicListResponse, summary="List recommended topics")
def read_topics(
    q: str | None = Query(default=None, description="Optional search term"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> TopicListResponse:
    search_terms: list[str] = []
    if q:
        normalized = q.strip().lower()
        aliases = {
            "ml": ["machine learning"],
            "ai": ["artificial intelligence"],
            "nlp": ["natural language processing"],
        }
        search_terms = [normalized] + aliases.get(normalized, [])

    base_query = (
        db.query(Topic, func.count(LearningModule.id).label("lesson_count"))
        .outerjoin(LearningModule, LearningModule.topic_id == Topic.id)
        .group_by(Topic.id)
    )
    topic_query = base_query
    if search_terms:
        filters = [
            or_(
                Topic.name.ilike(f"%{term}%"),
                Topic.category.ilike(f"%{term}%"),
            )
            for term in search_terms
        ]
        topic_query = topic_query.filter(or_(*filters))
    else:
        topic_query = topic_query.filter(Topic.is_popular.is_(True))

    popular_rows = topic_query.order_by(Topic.name).limit(12).all()
    if not search_terms and not popular_rows:
        popular_rows = base_query.order_by(Topic.name).limit(12).all()
    popular = [
        TopicCard(
            id=topic.id,
            name=topic.name,
            icon=topic.icon_emoji,
            category=topic.category,
            lessons=lesson_count or 0,
            color=topic.gradient_color,
        )
        for topic, lesson_count in popular_rows
    ]

    recent: list[RecentTopic] = []
    progress_rows = (
        db.query(UserTopicProgress, Topic)
        .join(Topic, Topic.id == UserTopicProgress.topic_id)
        .filter(UserTopicProgress.user_id == current_user.id)
        .order_by(UserTopicProgress.last_accessed.desc())
        .limit(6)
        .all()
    )
    recent = [
        RecentTopic(
            id=topic.id,
            name=topic.name,
            progress=progress.progress_percentage,
            icon=topic.icon_emoji,
        )
        for progress, topic in progress_rows
    ]

    return TopicListResponse(popular=popular, recent=recent)


@router.post(
    "/ai-generate",
    response_model=TopicDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a topic with AI",
)
async def generate_topic_with_ai(
    payload: TopicGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    generator: TopicGeneratorService = Depends(get_topic_generator_service),
) -> TopicDetailResponse:
    try:
        draft = await generator.generate_topic(
            prompt=payload.prompt,
            difficulty=payload.difficulty.value if payload.difficulty else None,
            module_count=payload.module_count,
            category_hint=payload.category_hint,
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    try:
        difficulty = TopicDifficulty(draft.difficulty)
    except ValueError:
        difficulty = TopicDifficulty.intermediate

    topic = Topic(
        name=draft.name,
        category=draft.category,
        icon_emoji=draft.icon_emoji,
        description=draft.description,
        difficulty=difficulty,
        estimated_hours=draft.estimated_hours,
        gradient_color=draft.gradient_color,
        is_popular=payload.is_popular,
    )
    db.add(topic)
    db.flush()

    for index, module_data in enumerate(draft.modules, start=1):
        try:
            module_type = ModuleType(module_data.type)
        except ValueError:
            module_type = ModuleType.reading
        module = LearningModule(
            topic_id=topic.id,
            title=module_data.title,
            type=module_type,
            duration_minutes=module_data.duration_minutes,
            order_index=index,
            content_url=module_data.content_url,
            eu_context=module_data.eu_context or (draft.eu_connection if index == 1 else None),
        )
        db.add(module)

    db.commit()
    db.refresh(topic)

    detail = _build_topic_detail(db, topic, current_user.id)
    return TopicDetailResponse(topic=detail)


@router.get("/random", response_model=TopicDetailResponse, summary="Get a random topic")
def get_random_topic(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> TopicDetailResponse:
    topic = db.query(Topic).order_by(func.random()).first()
    if topic is None:
        raise HTTPException(status_code=404, detail="No topics available.")
    detail = _build_topic_detail(db, topic, current_user.id)
    return TopicDetailResponse(topic=detail)


@router.get("/{topic_id}", response_model=TopicDetailResponse, summary="Get detailed topic info")
def read_topic_detail(
    topic_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> TopicDetailResponse:
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found.")

    detail = _build_topic_detail(db, topic, current_user.id)
    return TopicDetailResponse(topic=detail)


@router.post(
    "",
    response_model=TopicDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new topic (admin only)",
)
def create_topic(
    payload: TopicCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_superuser),
) -> TopicDetailResponse:
    topic = Topic(
        name=payload.name,
        category=payload.category,
        icon_emoji=payload.icon,
        description=payload.description,
        difficulty=TopicDifficulty(payload.difficulty),
        estimated_hours=payload.estimated_hours,
        gradient_color=payload.gradient_color,
        is_popular=payload.is_popular,
    )
    db.add(topic)
    db.flush()

    for module_data in payload.modules:
        module = LearningModule(
            topic_id=topic.id,
            title=module_data.title,
            type=ModuleType(module_data.type),
            duration_minutes=module_data.duration_minutes,
            order_index=module_data.order_index,
            content_url=module_data.content_url,
            eu_context=module_data.eu_context,
        )
        db.add(module)

    db.commit()
    db.refresh(topic)

    detail = _build_topic_detail(db, topic, None)
    return TopicDetailResponse(topic=detail)
