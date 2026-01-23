from fastapi.testclient import TestClient

from app.core.config import settings


def test_dashboard_summary_returns_stats(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/dashboard/summary")
    assert response.status_code == 200
    body = response.json()
    assert body["greeting"].startswith("Welcome back")
    assert len(body["stats"]) == 4


def test_learning_feed_lists_videos(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/feed/videos")
    assert response.status_code == 200
    body = response.json()
    assert "tags" in body
    assert len(body["videos"]) >= 3
    assert body["videos"][0]["title"]


def test_generate_quiz_with_topic_and_count(client: TestClient):
    payload = {"topic": "gdpr", "question_count": 3}
    response = client.post(f"{settings.API_V1_STR}/quiz/generate", json=payload)
    assert response.status_code == 200
    quiz = response.json()
    assert quiz["title"].startswith("EU Data Protection")
    assert len(quiz["questions"]) == 3


def test_generate_quiz_defaults_when_topic_missing(client: TestClient):
    response = client.post(f"{settings.API_V1_STR}/quiz/generate", json={"topic": "unknown"})
    assert response.status_code == 200
    quiz = response.json()
    assert quiz["questions"]


def test_flashcards_endpoint_returns_deck(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/flashcards", params={"topic": "biology"})
    assert response.status_code == 200
    deck = response.json()
    assert deck["topic"] == "Biology Basics"
    assert len(deck["cards"]) >= 2


def test_chat_endpoint_returns_contextual_answer(client: TestClient):
    response = client.post(
        f"{settings.API_V1_STR}/chat/message",
        json={"message": "Explain GDPR like I'm 12"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "GDPR" in body["reply"]
    assert body["suggestions"]


def test_progress_overview_includes_next_level_data(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/progress/overview")
    assert response.status_code == 200
    overview = response.json()
    assert overview["next_level"]["next_level"] == "Level 6"
    assert overview["next_level"]["percentage"] == 90.0


def test_topics_search_and_details(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/topics", params={"q": "quantum"})
    assert response.status_code == 200
    listing = response.json()
    assert listing["popular"]
    topic_id = listing["popular"][0]["id"]

    detail = client.get(f"{settings.API_V1_STR}/topics/{topic_id}")
    assert detail.status_code == 200
    payload = detail.json()
    assert payload["topic"]["id"] == topic_id
    assert payload["topic"]["total_modules"] >= payload["topic"]["completed_modules"]


def test_topics_missing_detail_returns_404(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/topics/9999")
    assert response.status_code == 404
