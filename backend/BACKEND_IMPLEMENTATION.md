# Backend Implementation Overview

This document summarizes how the FastAPI backend in `backend/` is structured, what each module is responsible for, and which public APIs power the frontend experiences.

## Runtime Architecture

- **FastAPI App (`app/main.py`)** – Instantiates the FastAPI application, applies API v1 router, and registers startup/shutdown handlers. `max_request_body_size` is set based on `UPLOAD_MAX_FILE_SIZE_MB` so uploads can be validated in-process.
- **Startup Events (`app/core/events.py`)** – On boot the service:
  - Creates SQLAlchemy tables via `Base.metadata.create_all`.
  - Opens MongoDB (Motor) connection and stores the database on `app.state`.
  - Configures the file storage backend (local or MinIO) by instantiating `FileStorageService`.
  - Lazily provisions AI integrations (currently `OpenAIContentGenerator`), binding a `ContentPipelineService` if keys are present.
  - Optionally creates an `OcrService` when OCR is enabled.
- **Dependency Injection (`app/api/dependencies.py`)** – Exposes `get_db`, file-storage, Mongo, content-pipeline, and OCR service dependencies so routes can stay declarative.

## Module Layout

| Path | Purpose |
| --- | --- |
| `app/core` | Configuration (`config.py`), security helpers (`security.py`), and lifecycle events (`events.py`). |
| `app/db` | SQLAlchemy base + session factory. `tests/api/conftest.py` overrides `SessionLocal` with an in-memory SQLite DB for deterministic tests. |
| `app/models` | ORM entities (currently `User`). |
| `app/schemas` | Pydantic models that describe inbound/outbound payloads (auth, content pipeline, uploads, OCR, plus frontend-facing DTOs such as dashboard, feed, quiz, flashcards, chat, progress, and topics). |
| `app/services` | Business logic:
  - `content_pipeline.py` orchestrates AI content planning and persists structured insights in MongoDB.
  - `ai_client.py` wraps OpenAI chat completions.
  - `file_storage.py` validates uploads and stores them locally or in MinIO.
  - `ocr.py` integrates with `pytesseract`.
  - `text_simplifier.py` provides a deterministic simplification fallback.
  - `demo_content.py` contains curated data sets for dashboard/feed/quiz/etc., ensuring the frontend has non-static API responses until real persistence is built.

## API Surface

All routers are wired through `app/api/api_v1/router.py` and mounted at `/api/v1`.

| Route | Description | Key Schemas |
| --- | --- | --- |
| `/auth/register`, `/auth/login` | User onboarding and JWT issuance backed by PostgreSQL via SQLAlchemy CRUD helpers. | `UserCreate`, `UserLogin`, `Token`, `UserRead` |
| `/uploads` | Validates multipart uploads against configured MIME types + size limits, then stores them through `FileStorageService`. | `FileUploadResponse` |
| `/content/process` | Runs the AI content pipeline (OpenAI + Mongo document insert) when AI credentials exist. | `ContentProcessRequest`, `ContentProcessResponse` |
| `/content/simplify` | Deterministic text simplification and readability metrics. | `ContentSimplifyRequest`, `ContentSimplifyResponse` |
| `/ocr/extract` | OCR extraction guarded by MIME checks and `OcrService`. | `OcrResponse` |
| `/dashboard/summary` | Returns current learning snapshot powering the dashboard view. | `DashboardSummary` |
| `/feed/videos` | Supplies short-form learning feed data. | `LearningFeedResponse` |
| `/quiz/generate` | Generates quizzes filtered by topic/difficulty, truncating question counts as requested. | `QuizGenerationRequest`, `QuizResponse` |
| `/flashcards` | Provides topic-specific flashcard decks. | `FlashcardDeck` |
| `/chat/message` | Simulates AI tutor replies using keyword matching + suggestion list. | `ChatMessageRequest`, `ChatMessageResponse` |
| `/progress/overview` | Exposes study stats, achievements, and next-level XP info. | `ProgressOverview` |
| `/topics` & `/topics/{id}` | Lists popular/recent topics and returns detailed module breakdowns. | `TopicListResponse`, `TopicDetailResponse` |
| `/debug/mongo` | Writes/reads a document to verify Mongo connectivity. |

These frontend-focused endpoints all source their data from `app/services/demo_content.py`, which centralizes the static datasets so the HTTP APIs mimic realistic responses while the real persistence layer is under construction.

## Persistence & Integrations

- **PostgreSQL** is accessed through SQLAlchemy ORM models (`User`) and sessions provided by `app/db/session.py`.
- **MongoDB** collections (via Motor) store AI-generated content pipeline documents, allowing async writes.
- **MinIO or Local Disk** handle uploaded files depending on `FILE_STORAGE_BACKEND`. Validation logic checks filename, MIME type, and size before writing.
- **OpenAI** integration is encapsulated in `OpenAIContentGenerator`, which constructs prompts, calls the Chat Completions API, and parses JSON replies into `AIContentInsights`.
- **pytesseract** is used when OCR is enabled; dependency injection ensures routes return `503` if the service isn’t configured so the UI can respond gracefully.

## Testing Strategy

Pytest suite under `backend/tests/` mirrors the module structure (`tests/api/...`). Key fixtures:

- `tests/api/conftest.py` swaps the SQLAlchemy engine for in-memory SQLite and yields a `TestClient`.
- Each feature has dedicated tests (auth, content, uploads, OCR) asserting HTTP status codes, validation errors, and side effects.
- `tests/api/test_frontend_endpoints.py` covers all new UI-facing endpoints to ensure the contracts stay stable during future refactors.

Run the suite via:

```bash
cd backend
uv run pytest
```

## Configuration & Environment

All settings live in `app/core/config.py` (powered by `pydantic-settings`). `.env.example` documents the required environment variables for DBs, AI services, file storage, and OCR. Only `app/core/config.py` should read from `.env`; other modules import `settings`.

## Request Flow Summary

1. Requests hit FastAPI routers mounted under `/api/v1`.
2. Dependencies inject DB sessions and services (file storage, OCR, AI pipeline) from `app.state`.
3. Schemas validate incoming JSON/multipart payloads before business logic executes.
4. Services interact with external systems (DBs, AI, MinIO) or deterministic demo content and return Pydantic-based responses.
5. Tests validate both happy-paths and failure cases (auth errors, file validation errors, missing services) to guarantee the frontend’s expectations are met.

This setup allows the frontend/mobile clients to iterate with consistent APIs today while leaving clear seams to plug in live AI outputs, richer persistence, and future services (notifications, multi-tenant access, etc.).
