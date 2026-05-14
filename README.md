# Havilah

Havilah is a mobile-first EdTech experience for Gen Z learners in the EU. The stack pairs a FastAPI backend (AI content, auth, storage orchestration) with a Flutter client tuned for multimodal study sessions.

## Project Layout
- `backend/` – FastAPI service, SQLAlchemy models, async integrations (PostgreSQL, MongoDB, MinIO, AI providers). Uses [uv](https://github.com/astral-sh/uv) for dependency management.
- `mobile/` – Flutter shell app with bottom navigation, ready for feature modules (smart uploads, Q&A tutor, goals).
- `realtime/` – Node.js WebSocket bridge that streams Redis pub/sub events to clients.
- `docker-compose.yml` – Brings up API, Celery worker, realtime server, PostgreSQL, MongoDB, and Redis.

## Getting Started
```bash
# Backend
cd backend
cp .env.example .env
uv sync
uv run fastapi dev app/main.py

# Docker (API + databases)
docker compose up --build

# Celery worker (without Docker)
cd backend
uv run celery -A app.worker.celery_app:celery_app worker --loglevel=info

# Realtime server (without Docker)
cd realtime
npm install
npm run dev
```

Once Docker is running, the API is available at `http://localhost:8000/docs` with live registration/login flows and database persistence.

Frontend realtime events connect to `ws://localhost:8081` by default.
Override with `VITE_WS_BASE_URL` if needed.
