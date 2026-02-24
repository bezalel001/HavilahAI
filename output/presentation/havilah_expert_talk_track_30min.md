# Havilah Expert Talk Track (20-30 Minutes)

## 0-2 min: Opening
- Problem: dense academic inputs do not match short attention study behavior.
- Goal: convert uploads into reusable learning assets with low latency UX.

## 2-5 min: Architecture overview
- Explain control plane vs data plane.
- Why dual DBs: relational correctness + document flexibility.
- Why Redis: queue backend + pub/sub.

## 5-9 min: AI pipeline
- Ingestion routing by MIME.
- OCR branch for images.
- LLM branch for summarization, simplification, quiz/flashcards.
- OpenAI primary, Anthropic support in selected services.

## 9-12 min: Async runtime
- Problem with synchronous AI calls.
- Queue design: task_id immediate return, worker execution, status endpoint.
- Failure handling and user feedback loop.

## 12-15 min: Realtime UX
- Event publication to Redis channel.
- Node WebSocket relay and user-filtered events.
- Frontend status banner + toast pattern.

## 15-20 min: Feature walkthrough
- Auth, upload, content processing, feed, quiz, flashcards, goals, progress, chat, topics.
- Position each feature in the learning loop.

## 20-24 min: Evaluation and engineering quality
- Existing API tests.
- Proposed quality metrics: response latency, failure rate, generation quality.
- Explain what is measured now vs planned.

## 24-27 min: Requirement comparison (honest scope)
- Implemented vs partial/planned (Flutter, social, offline, CI/CD, K8s).

## 27-30 min: Q&A themes to prepare for
- Why specific LLM/provider strategy?
- What are hallucination controls and output validation limits?
- Why this architecture over end-to-end serverless?
- How to scale workers and control cost?

## Concise answers for likely questions
- **Why queue?** Better UX and resiliency for heavy AI tasks.
- **Why Node WS + FastAPI?** Simple dedicated relay role; keeps API runtime focused.
- **Why Mongo + Postgres?** Different data shapes and evolution rates.
- **What next for AI quality?** Add eval harness, prompt versioning, offline review loop.
