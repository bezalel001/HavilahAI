from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Iterable, List, Tuple
from uuid import UUID
import uuid

from motor.motor_asyncio import AsyncIOMotorDatabase
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.upload import Upload
from app.models.topic import Topic, UserTopicProgress
from app.services.learning_assets import LearningAssetsService
from app.services.ai_client import AIServiceError
from app.services.demo_content import get_learning_feed


SUBJECT_CONFIG: Dict[str, Dict[str, Any]] = {
    "Physics": {
        "emoji": "⚛️",
        "color": "from-purple-500 to-pink-500",
        "keywords": ["physics", "quantum", "entanglement", "particle", "wave", "relativity"],
    },
    "Mathematics": {
        "emoji": "📊",
        "color": "from-green-500 to-teal-500",
        "keywords": ["math", "mathematics", "calculus", "derivative", "integral", "equation", "matrix", "algebra"],
    },
    "Law & Policy": {
        "emoji": "⚖️",
        "color": "from-blue-500 to-purple-500",
        "keywords": ["gdpr", "law", "policy", "regulation", "directive", "compliance", "privacy", "data protection"],
    },
    "Biology": {
        "emoji": "🧬",
        "color": "from-pink-500 to-red-500",
        "keywords": ["biology", "dna", "cell", "genetics", "enzyme", "protein", "replication"],
    },
    "Economics": {
        "emoji": "💰",
        "color": "from-yellow-500 to-orange-500",
        "keywords": ["economics", "trade", "market", "inflation", "gdp", "brexit", "finance", "monetary"],
    },
    "Chemistry": {
        "emoji": "🧪",
        "color": "from-cyan-500 to-blue-500",
        "keywords": ["chemistry", "reaction", "molecule", "acid", "base", "organic", "stoichiometry"],
    },
    "Computer Science": {
        "emoji": "💻",
        "color": "from-indigo-500 to-blue-600",
        "keywords": ["computer science", "programming", "algorithm", "data structure", "software", "python", "java"],
    },
    "AI": {
        "emoji": "🤖",
        "color": "from-violet-500 to-purple-600",
        "keywords": ["ai", "artificial intelligence", "machine learning", "neural", "llm", "deep learning", "model"],
    },
    "Programming": {
        "emoji": "🧑‍💻",
        "color": "from-sky-500 to-blue-600",
        "keywords": ["programming", "coding", "software", "debug", "python", "javascript", "java", "c++"],
    },
    "Entrepreneurship": {
        "emoji": "🚀",
        "color": "from-orange-500 to-amber-500",
        "keywords": ["startup", "entrepreneur", "business model", "venture", "pitch", "market fit", "founder"],
    },
    "History": {
        "emoji": "🏛️",
        "color": "from-amber-500 to-orange-600",
        "keywords": ["history", "renaissance", "revolution", "empire", "ww2", "ancient", "medieval"],
    },
    "Psychology": {
        "emoji": "🧠",
        "color": "from-fuchsia-500 to-pink-600",
        "keywords": ["psychology", "behavior", "cognition", "mind", "memory", "learning", "therapy"],
    },
    "Engineering": {
        "emoji": "🛠️",
        "color": "from-slate-500 to-gray-700",
        "keywords": ["engineering", "mechanical", "electrical", "civil", "design", "systems"],
    },
    "Medicine": {
        "emoji": "🩺",
        "color": "from-red-500 to-rose-600",
        "keywords": ["medicine", "clinical", "anatomy", "diagnosis", "pathology", "health"],
    },
    "Literature": {
        "emoji": "📚",
        "color": "from-purple-500 to-indigo-600",
        "keywords": ["literature", "novel", "poetry", "author", "narrative", "drama"],
    },
}

FEED_CLIP_VERSION = 2


def _infer_subject(text: str) -> str:
    lower_text = text.lower()
    for subject, config in SUBJECT_CONFIG.items():
        if any(keyword in lower_text for keyword in config["keywords"]):
            return subject
    if "eu" in lower_text:
        return "Law & Policy"
    return "All"


def _slug_seed(text: str) -> int:
    return sum(ord(char) for char in text)


def _duration_seconds(text: str) -> int:
    if not text:
        return 60
    seconds = 58 + min(62, max(0, len(text) // 4))
    return max(58, min(120, seconds))


def _combine_text(summary: str, key_points: list[str]) -> str:
    base_chunks = [chunk.strip() for chunk in ([summary] + key_points) if chunk and chunk.strip()]
    return " ".join(base_chunks)


def _format_duration(seconds: int) -> str:
    minutes = seconds // 60
    remainder = seconds % 60
    return f"{minutes}:{remainder:02d}"


def _title_from_text(text: str, fallback: str) -> str:
    if not text:
        return fallback
    cleaned = text.strip().rstrip(".")
    words = cleaned.split()
    if len(words) > 8:
        cleaned = " ".join(words[:8])
    return cleaned


def _build_video(
    *,
    base_id: int,
    index: int,
    title_text: str,
    summary_text: str,
    subject: str,
    created_at: datetime,
    key_points: list[str],
    source: str,
) -> Dict[str, Any]:
    config = SUBJECT_CONFIG.get(subject, {"emoji": "🎓", "color": "from-gray-400 to-gray-600"})
    duration_seconds = _duration_seconds(f"{title_text} {summary_text}")
    likes_seed = _slug_seed(f"{base_id}-{index}-{summary_text}")
    likes = 200 + (likes_seed % 2200)
    comments = 12 + (likes_seed % 220)
    return {
        "id": base_id + index + 1,
        "title": f"{title_text} in {duration_seconds} Seconds",
        "subject": subject,
        "duration": _format_duration(duration_seconds),
        "likes": likes,
        "comments": comments,
        "thumbnail": config["emoji"],
        "color": config["color"],
        "summary": summary_text,
        "key_points": key_points,
        "source": source,
        "created_at": created_at,
    }


async def build_learning_feed(
    *,
    user_id: UUID,
    db: Session,
    mongo_db: AsyncIOMotorDatabase,
    assets_service: LearningAssetsService,
) -> Dict[str, Any]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    collection = mongo_db[settings.LEARNING_ASSETS_COLLECTION]
    cursor = (
        collection.find({"user_id": str(user_id), "created_at": {"$gte": cutoff}})
        .sort("created_at", -1)
        .limit(30)
    )
    documents = await cursor.to_list(length=30)

    upload_ids = [doc.get("upload_id") for doc in documents if doc.get("upload_id")]
    upload_uuid_ids = []
    for upload_id in upload_ids:
        try:
            upload_uuid_ids.append(uuid.UUID(str(upload_id)))
        except (TypeError, ValueError):
            continue
    uploads = (
        db.query(Upload)
        .filter(Upload.user_id == user_id, Upload.id.in_(upload_uuid_ids))
        .all()
        if upload_uuid_ids
        else []
    )
    upload_lookup = {str(upload.id): upload for upload in uploads}

    videos: List[Dict[str, Any]] = []
    subjects: List[str] = []
    for doc in documents:
        cached_clips = doc.get("feed_clips") or []
        cached_version = doc.get("feed_clips_version") or 0
        if cached_clips and cached_version == FEED_CLIP_VERSION:
            for clip in cached_clips:
                clip_subject = clip.get("subject") or "All"
                if clip_subject != "All":
                    subjects.append(clip_subject)
                videos.append(clip)
            continue
        key_points = doc.get("key_points") or []
        summary = doc.get("summary") or ""
        base_text = " ".join(key_points) + " " + summary
        subject = _infer_subject(base_text)
        if subject != "All":
            subjects.append(subject)
        upload = upload_lookup.get(str(doc.get("upload_id")))
        fallback_title = upload.original_filename if upload else "Upload Summary"
        base_title = _title_from_text(key_points[0] if key_points else summary, fallback_title)
        created_at = doc.get("created_at") or datetime.now(timezone.utc)
        base_id = _slug_seed(str(doc.get("_id"))) % 100000
        title_candidates = [base_title] + [
            _title_from_text(point, fallback_title) for point in key_points[1:3]
        ]
        feed_clips = []
        for index, title_text in enumerate(title_candidates):
            clip_summary = key_points[index] if index < len(key_points) else summary
            clip_key_points = (
                [key_points[index]]
                if index < len(key_points)
                else key_points[:3]
            )
            duration_seconds = _duration_seconds(f"{title_text} {clip_summary}")
            combined_text = _combine_text(clip_summary, clip_key_points)
            try:
                expanded_text = await assets_service.expand_feed_text(
                    combined_text,
                    duration_seconds,
                )
            except AIServiceError:
                expanded_text = combined_text or clip_summary
            clip = _build_video(
                base_id=base_id,
                index=index,
                title_text=title_text,
                summary_text=expanded_text,
                subject=subject,
                created_at=created_at,
                key_points=clip_key_points,
                source="upload",
            )
            feed_clips.append(clip)
            videos.append(clip)

        if feed_clips:
            await collection.update_one(
                {"_id": doc.get("_id")},
                {"$set": {"feed_clips": feed_clips, "feed_clips_version": FEED_CLIP_VERSION}},
            )

    progress_rows = (
        db.query(UserTopicProgress, Topic)
        .join(Topic, Topic.id == UserTopicProgress.topic_id)
        .filter(UserTopicProgress.user_id == user_id)
        .filter(UserTopicProgress.last_accessed >= cutoff)
        .order_by(UserTopicProgress.last_accessed.desc())
        .limit(6)
        .all()
    )
    topic_videos = []
    for progress, topic in progress_rows:
        subject = topic.category or "All"
        if subject != "All":
            subjects.append(subject)
        summary = topic.description
        base_id = _slug_seed(str(topic.id)) % 100000 + 50000
        topic_videos.append(
            _build_video(
                base_id=base_id,
                index=0,
                title_text=_title_from_text(topic.name, topic.name),
                summary_text=summary,
                subject=subject,
                created_at=topic.updated_at or datetime.now(timezone.utc),
                key_points=[],
                source="topic",
            )
        )
    videos.extend(topic_videos)

    if not videos:
        return get_learning_feed()

    tags = ["All"] + sorted({subject for subject in subjects})
    return {"tags": tags, "videos": videos}
