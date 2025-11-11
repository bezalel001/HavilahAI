from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.db import session as db_session
from app.db.base import Base
from app.main import app


TEST_DATABASE_URL = "sqlite+pysqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    future=True,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

db_session.engine = engine
db_session.SessionLocal = TestingSessionLocal


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[db_session.get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture()
def client():
    with TestClient(app) as client:
        yield client


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
