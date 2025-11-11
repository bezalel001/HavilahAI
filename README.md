# Practical_Work_In_AI-havilah

Havilah is a mobile-first EdTech experience for Gen Z learners in the EU. The stack pairs a FastAPI backend (AI content, auth, storage orchestration) with a Flutter client tuned for multimodal study sessions.

## Project Layout
- `backend/` – FastAPI service, SQLAlchemy models, async integrations (PostgreSQL, MongoDB, MinIO, AI providers). Uses [uv](https://github.com/astral-sh/uv) for dependency management.
- `mobile/` – Flutter shell app with bottom navigation, ready for feature modules (smart uploads, Q&A tutor, goals).
- `docker-compose.yml` – Brings up the API, PostgreSQL, and MongoDB for local development.

## Getting Started
```bash
# Backend
cd backend
cp .env.example .env
uv sync
uv run fastapi dev app/main.py

# Docker (API + databases)
docker compose up --build

# Flutter client
cd mobile
flutter pub get
flutter run
```

Once Docker is running, the API is available at `http://localhost:8000/docs` with live registration/login flows and database persistence.
