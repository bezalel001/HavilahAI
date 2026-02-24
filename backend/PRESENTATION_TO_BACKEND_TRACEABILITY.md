# Presentation to Backend Traceability

This file maps what is described in `frontend/src/components/Presentation.tsx` to where it is implemented in code.

Legend:
- `Implemented` = concrete backend/service code exists.
- `Demo-backed` = endpoint exists but returns curated/demo data.
- `Not in backend` = no backend implementation in this repo for the item.

## 1) System wiring and architecture

- Presentation reference: `Presentation.tsx` slide **"2. How the System Works (Main Blocks)"** (line 177), **"3. System Data Flow"** (line 249).
- Backend implementation:
  - FastAPI app creation + CORS + router mount: `backend/app/main.py:9-26`
  - API router wiring for all modules: `backend/app/api/api_v1/router.py:20-33`
  - Startup DI/service initialization (Mongo, storage, OCR, AI services): `backend/app/core/events.py:19-113`
  - Dependency accessors (pipeline, OCR, assets, auth user): `backend/app/api/dependencies.py:23-160`
- Status: `Implemented`

## 2) Upload ingestion and storage

- Presentation reference: slide **"5. Upload-to-Content Flow"** (line 397).
- Backend implementation:
  - Upload endpoint (create/list/delete): `backend/app/api/routes/uploads.py:22-108`
  - File validation (MIME/size/filename) + local/MinIO save/delete: `backend/app/services/file_storage.py:35-154`
  - Upload model/table: `backend/app/models/upload.py:20-33`
- Status: `Implemented`

## 3) OCR image extraction

- Presentation reference: slide **"6. OCR and AI Understanding"** (line 482).
- Backend implementation:
  - OCR endpoint `/ocr/extract`: `backend/app/api/routes/ocr.py:11-33`
  - OCR service (`pytesseract` extraction): `backend/app/services/ocr.py:24-43`
  - Upload-to-assets image OCR branch: `backend/app/api/routes/content.py:210-218`
- Status: `Implemented`
- Example (your wording): **Image extraction OCR is implemented in `backend/app/services/ocr.py:24-43`**.

## 4) PDF/DOCX/text extraction from uploads

- Presentation reference: slide **"5. Upload-to-Content Flow"** (line 397).
- Backend implementation:
  - Content-from-upload route and file-type branching: `backend/app/api/routes/content.py:186-235`
  - PDF extraction helper (`pypdf`): `backend/app/api/routes/content.py:430-445`
  - DOCX extraction helper (`python-docx`): `backend/app/api/routes/content.py:448-459`
- Status: `Implemented`

## 5) AI content processing pipeline (OpenAI)

- Presentation reference: slides **"3. System Data Flow"** (line 249), **"4. AI Model Strategy"** (line 322).
- Backend implementation:
  - Sync content processing endpoint: `backend/app/api/routes/content.py:54-85`
  - Pipeline orchestration + Mongo insert: `backend/app/services/content_pipeline.py:30-68`
  - OpenAI content generator + JSON parsing: `backend/app/services/ai_client.py:38-120`
- Status: `Implemented`

## 6) Learning assets generation (summary, key points, simplified concepts, flashcards, quiz)

- Presentation reference: slide **"7. How We Generate Learning Assets"** (line 550).
- Backend implementation:
  - Upload-to-learning-assets endpoint: `backend/app/api/routes/content.py:186-268`
  - Learning assets service (OpenAI primary, Anthropic fallback): `backend/app/services/learning_assets.py:34-79`
  - Prompt + strict JSON schema intent: `backend/app/services/learning_assets.py:106-152`
  - JSON payload parse/normalize to schema objects: `backend/app/services/learning_assets.py:185-237`
- Status: `Implemented`

## 7) Async queue processing (Celery + Redis)

- Presentation reference: slide **"8. Why We Added Async Queueing"** (line 618).
- Backend implementation:
  - Async enqueue endpoint `/content/process/async`: `backend/app/api/routes/content.py:88-104`
  - Task status endpoint `/content/tasks/{task_id}`: `backend/app/api/routes/content.py:106-136`
  - Celery app config (broker/backend Redis): `backend/app/worker/celery_app.py:6-21`
  - Worker task execution + events: `backend/app/worker/tasks.py:43-69`
  - Async pipeline execution inside worker: `backend/app/worker/tasks.py:16-40`
- Status: `Implemented`

## 8) Real-time task events (Redis Pub/Sub + WebSocket relay)

- Presentation reference: slide **"9. Real-Time Update Model"** (line 696).
- Backend implementation:
  - Backend Redis publish helper: `backend/app/services/realtime_events.py:11-20`
  - Event publish points:
    - enqueue: `backend/app/api/routes/content.py:98-103`
    - started/failed/completed: `backend/app/worker/tasks.py:46-69`
- WebSocket relay implementation (Node service in repo):
  - Redis subscribe + WS broadcast + user filtering: `realtime/server.js:31-54`
- Status: `Implemented` (cross-service: Python backend + Node WS relay)

## 9) Authentication and authorization

- Presentation reference: slide **"10. Product Functionality Walkthrough"** (line 776), **"13. Security and Compliance"** (line 966).
- Backend implementation:
  - Register/login/me routes: `backend/app/api/routes/auth.py:19-41`
  - Password hash/verify + JWT create/decode: `backend/app/core/security.py:10-32`
  - Auth dependency guards (`get_current_user`, active/superuser): `backend/app/api/dependencies.py:116-160`
  - User CRUD auth methods: `backend/app/crud/user.py:8-30`
- Status: `Implemented`

## 10) Goals and progress

- Presentation reference: slide **"10. Product Functionality Walkthrough"** (line 776).
- Backend implementation:
  - Goals CRUD endpoints: `backend/app/api/routes/goals.py:39-113`
  - Goal model: `backend/app/models/goal.py:12-23`
  - Progress overview endpoint: `backend/app/api/routes/progress.py:12-14`
  - Progress data source: `backend/app/services/demo_content.py:605-606`
- Status: `Goals = Implemented`, `Progress overview = Demo-backed`

## 11) Feed functionality

- Presentation reference: slide **"10. Product Functionality Walkthrough"** (line 776).
- Backend implementation:
  - Feed list/like/save endpoints: `backend/app/api/routes/learning_feed.py:28-155`
  - Feed build from recent generated assets + topic progress: `backend/app/services/learning_feed.py:174-302`
  - Feed interaction persistence model: `backend/app/models/feed_interaction.py:12-21`
  - Fallback static feed when no videos: `backend/app/services/learning_feed.py:298-300` and `backend/app/services/demo_content.py:554-555`
- Status: `Implemented` (with demo fallback path)

## 12) Quiz and flashcards

- Presentation reference: slide **"10. Product Functionality Walkthrough"** (line 776), slide **"7. How We Generate Learning Assets"** (line 550).
- Backend implementation:
  - Quiz generate + attempt endpoints: `backend/app/api/routes/quiz.py:20-73`
  - AI quiz generator (LangChain/OpenAI): `backend/app/services/quiz_generator.py:51-133`
  - Quiz fallback demo generator: `backend/app/api/routes/quiz.py:35-40`, `backend/app/services/demo_content.py:558-584`
  - Flashcards read/generate/attempt endpoints: `backend/app/api/routes/flashcards.py:23-79`
  - Flashcard fallback deck: `backend/app/services/demo_content.py:587-594`
  - Attempt models: `backend/app/models/quiz_attempt.py:12-24`, `backend/app/models/flashcard_attempt.py:12-23`
- Status: `Implemented` (some flows include demo fallback)

## 13) Chat tutor and topic exploration

- Presentation reference: slide **"10. Product Functionality Walkthrough"** (line 776).
- Backend implementation:
  - Chat endpoints (direct message + session history): `backend/app/api/routes/chat.py:28-165`
  - Chat tutor service (OpenAI primary, Anthropic fallback): `backend/app/services/chat_tutor.py:19-90`
  - Chat session/message models: `backend/app/models/chat.py:18-39`
  - Topics list/detail/admin create + AI generation endpoint: `backend/app/api/routes/topics.py:93-293`
  - Topic generator service (OpenAI/Anthropic): `backend/app/services/topic_generator.py:48-202`
  - Topic/module/progress models: `backend/app/models/topic.py:27-79`
- Status: `Implemented`

## 14) Data modeling choices (PostgreSQL + MongoDB)

- Presentation reference: slide **"11. Database Design Choices"** (line 835).
- Backend implementation:
  - SQLAlchemy session/engine: `backend/app/db/session.py:15-24`
  - SQL models loaded for metadata: `backend/app/db/base.py:5-6`
  - MongoDB connection in app state: `backend/app/core/events.py:22-24`
  - Mongo collection usage in content pipeline/assets/feed:
    - content pipeline collection: `backend/app/services/content_pipeline.py:33-68`
    - learning assets collection reads/writes: `backend/app/api/routes/content.py:245-323`
    - feed clip caching in Mongo: `backend/app/services/learning_feed.py:182-266`
- Status: `Implemented`

## 15) Reliability and error handling

- Presentation reference: slide **"12. Reliability and Error Handling"** (line 901).
- Backend implementation examples:
  - Upload validation errors: `backend/app/services/file_storage.py:76-96`
  - OCR error handling: `backend/app/api/routes/ocr.py:21-31`, `backend/app/services/ocr.py:31-41`
  - AI errors mapped to HTTP 502: `backend/app/api/routes/content.py:70-73`, `backend/app/api/routes/content.py:240-243`, `backend/app/api/routes/chat.py:43-45`
  - Task ownership/invalid payload handling: `backend/app/api/routes/content.py:117-136`
  - WS event publish is best-effort (non-blocking): `backend/app/services/realtime_events.py:18-20`
- Status: `Implemented`

## 16) Security and compliance flags

- Presentation reference: slide **"13. Security and Compliance"** (line 966).
- Backend implementation:
  - JWT/credential pipeline: `backend/app/core/security.py:13-32`
  - Auth-required dependencies: `backend/app/api/dependencies.py:116-160`
  - Input validation via Pydantic schemas at route boundaries (example imports): `backend/app/api/routes/content.py:20-35`
  - GDPR/data-residency config flags: `backend/app/core/config.py:91-95`
- Status: `Implemented (configuration + auth)`
- Note: this is not a full legal compliance program by itself.

## 17) Testing coverage

- Presentation reference: slide **"14. Testing and Evaluation"** (line 1039).
- Backend implementation:
  - Auth tests: `backend/tests/api/test_auth.py:16-58`
  - Content pipeline + simplify tests: `backend/tests/api/test_content_pipeline.py:45-118`
  - Upload tests: `backend/tests/api/test_uploads.py:34-93`
  - OCR tests: `backend/tests/api/test_ocr.py:27-57`
  - Frontend-facing endpoint contract tests: `backend/tests/api/test_frontend_endpoints.py:27-171`
- Status: `Implemented` (with room for broader load/e2e/security testing)

## 18) Items in presentation that are not backend-implemented yet

From `Presentation.tsx` slide **"15. Requirement Check (Transparent View)"** (line 1108), these are intentionally marked partial/planned and are not implemented in backend code here:
- Flutter production client (mobile app)
- Social groups / leaderboards / offline mode / push notifications
- Kubernetes manifests and full CI/CD
- Full GDPR + EU data residency operations beyond config flags

These either live outside backend scope or currently have no concrete implementation files in this repository.

## 19) Product framing slides with no backend code mapping

The following are presentation narrative slides and do not map to backend implementation lines directly:
- Session framing and talk goals: `Presentation.tsx:52-111`
- Problem statement/hypothesis language: `Presentation.tsx:118-170`
- Demo script and speaking flow: `Presentation.tsx:1144-1228`
- Closing/thank-you content: `Presentation.tsx:1232-1312`
