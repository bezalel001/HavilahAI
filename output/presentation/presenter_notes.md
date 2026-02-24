# Havilah Presentation Notes (5-7 min)

## Opening
- Havilah is an AI-powered learning platform for Gen Z students.
- Core idea: upload once, instantly get simplified learning assets.

## Main value
- Converts dense content into summary + key points + quizzes + flashcards.
- Adds async background processing and realtime status updates.

## Technical highlights
- FastAPI backend + PostgreSQL + MongoDB + Redis.
- Celery worker handles heavy AI tasks.
- Node.js WebSocket server streams task status updates.
- Frontend listens and shows toasts/status banner.

## Demo flow
1. Open Upload page.
2. Use Async AI Content Processing card.
3. Click Queue Async Processing.
4. Show PENDING -> STARTED -> SUCCESS.
5. Show result summary and key points.

## If asked "why async queue?"
- Prevents frontend timeouts.
- Better user experience under heavy processing.
- Scales better as concurrent users increase.

## Close
- Today: working end-to-end MVP with realtime + async pipeline.
- Next: CI/CD, performance testing, mobile polish, richer personalization.
