from fastapi.testclient import TestClient

from app.core.config import settings


def _register(client: TestClient, email: str = "learner@example.com", password: str = "SecurePass123!"):
    payload = {
        "email": email,
        "password": password,
        "full_name": "Initial Learner",
        "preferred_language": "en",
    }
    return client.post(f"{settings.API_V1_STR}/auth/register", json=payload)


def test_register_user_creates_account(client: TestClient):
    response = _register(client)
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "learner@example.com"
    assert body["is_active"] is True
    assert body["is_verified"] is False
    assert "id" in body


def test_register_user_rejects_duplicate_email(client: TestClient):
    first = _register(client)
    assert first.status_code == 201

    duplicate = _register(client)
    assert duplicate.status_code == 400
    assert duplicate.json()["detail"] == "Email already registered."


def test_login_returns_jwt_token(client: TestClient):
    _register(client)

    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": "learner@example.com", "password": "SecurePass123!"},
    )

    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_with_incorrect_password_is_rejected(client: TestClient):
    _register(client)

    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": "learner@example.com", "password": "WrongPass999!"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password."
