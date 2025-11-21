from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_content_pipeline_service
from app.main import app
from app.schemas.content import ContentProcessRequest
from app.services.ai_client import AIServiceError
from app.services.content_pipeline import ContentPipelineResult


class _FakePipelineService:
    def __init__(self):
        self.calls = []

    async def process_content(self, payload: ContentProcessRequest) -> ContentPipelineResult:  # type: ignore[override]
        self.calls.append(payload)
        return ContentPipelineResult(
            document_id="pip_123",
            title=payload.title,
            summary="Short summary",
            key_points=["Point A", "Point B"],
            learning_objectives=["Objective"],
            quiz_questions=["Q1"],
            recommended_media=["infographic"],
            estimated_reading_time_minutes=3.5,
            created_at=datetime(2024, 1, 1, tzinfo=timezone.utc),
        )


class _FailingPipelineService:
    async def process_content(self, payload: ContentProcessRequest):  # type: ignore[override]
        raise AIServiceError("upstream model unavailable")


@pytest.fixture()
def pipeline_override():
    service = _FakePipelineService()
    app.dependency_overrides[get_content_pipeline_service] = lambda: service
    yield service
    app.dependency_overrides.pop(get_content_pipeline_service, None)


def test_content_pipeline_returns_ai_output(client: TestClient, pipeline_override: _FakePipelineService):
    payload = {
        "title": "Photosynthesis Lesson",
        "raw_content": "A" * 80,
        "target_audience": "Middle school students",
        "learning_objective": "Explain how plants convert light into energy.",
        "desired_tone": "inspiring",
        "additional_context": "Focus on hands-on experiments.",
    }

    response = client.post("/api/v1/content/process", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["document_id"] == "pip_123"
    assert body["summary"] == "Short summary"
    assert body["key_points"] == ["Point A", "Point B"]
    assert pipeline_override.calls  # request forwarded to service


def test_content_pipeline_maps_ai_errors_to_502(client: TestClient):
    app.dependency_overrides[get_content_pipeline_service] = lambda: _FailingPipelineService()
    payload = {
        "title": "Solar System Overview",
        "raw_content": "B" * 80,
        "target_audience": "High school students",
        "learning_objective": "Describe the order of the planets.",
    }

    response = client.post("/api/v1/content/process", json=payload)

    assert response.status_code == 502
    assert response.json()["detail"] == "upstream model unavailable"
    app.dependency_overrides.pop(get_content_pipeline_service, None)


def test_content_pipeline_validates_input(client: TestClient, pipeline_override: _FakePipelineService):  # noqa: ARG001
    payload = {
        "title": "Hi",
        "raw_content": "short",
        "target_audience": "K",
        "learning_objective": "Explain.",
    }

    response = client.post("/api/v1/content/process", json=payload)

    assert response.status_code == 422


def test_content_simplify_returns_shorter_text(client: TestClient):
    payload = {
        "text": (
            "We aim to utilize engaging activities to commence the lesson and demonstrate the "
            "core ideas approximately five times to ensure retention."
        ),
        "max_sentence_words": 10,
    }

    response = client.post("/api/v1/content/simplify", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert "use engaging activities" in body["simplified_text"]
    assert "utilize" in body["replaced_words"]
    assert len(body["key_points"]) >= 1
    assert body["simplified_word_count"] <= body["original_word_count"]


def test_content_simplify_validates_request(client: TestClient):
    response = client.post(
        "/api/v1/content/simplify",
        json={"text": "Too short"},
    )
    assert response.status_code == 422
