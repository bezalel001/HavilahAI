from fastapi.testclient import TestClient

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User


def _register(client: TestClient, email: str = "admin@example.com", password: str = "SecurePass123!"):
    payload = {
        "email": email,
        "password": password,
        "full_name": "Admin User",
        "preferred_language": "en",
        "learning_style": "visual",
    }
    response = client.post(f"{settings.API_V1_STR}/auth/register", json=payload)
    assert response.status_code == 201


def _promote_user_to_admin():
    with SessionLocal() as db:
        user = db.query(User).first()
        user.is_superuser = True
        db.commit()


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


def test_admin_can_create_topic(client: TestClient):
    password = "AdminPass123!"
    _register(client, password=password)
    _promote_user_to_admin()
    token_response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": "admin@example.com", "password": password},
    )
    assert token_response.status_code == 200
    token = token_response.json()["access_token"]

    payload = {
        "name": "AI Policy in the EU",
        "category": "Law & Policy",
        "icon": "🇪🇺",
        "description": "Understand the evolving AI regulatory landscape in the European Union.",
        "difficulty": "intermediate",
        "estimated_hours": 2.5,
        "gradient_color": "from-blue-500 to-purple-500",
        "is_popular": True,
        "modules": [
            {"title": "EU AI Act Overview", "type": "reading", "duration_minutes": 20, "order_index": 1},
            {"title": "Risk Classifications", "type": "video", "duration_minutes": 15, "order_index": 2},
        ],
    }

    response = client.post(
        f"{settings.API_V1_STR}/topics",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    body = response.json()["topic"]
    assert body["name"] == payload["name"]
    assert len(body["modules"]) == 2


def test_non_admin_topic_creation_is_forbidden(client: TestClient):
    password = "RegularPass123!"
    _register(client, email="learner@example.com", password=password)
    login = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": "learner@example.com", "password": password},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    payload = {
        "name": "Green Energy Basics",
        "category": "Science",
        "icon": "🌱",
        "description": "Introductory overview of renewable energy sources.",
        "difficulty": "beginner",
        "estimated_hours": 1.5,
        "gradient_color": "from-green-400 to-teal-500",
        "is_popular": False,
        "modules": [
            {"title": "Why Renewables Matter", "type": "reading", "duration_minutes": 10, "order_index": 1},
        ],
    }
    response = client.post(
        f"{settings.API_V1_STR}/topics",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
