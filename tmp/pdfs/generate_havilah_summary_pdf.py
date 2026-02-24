from __future__ import annotations

from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import Color
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth


PAGE_W, PAGE_H = letter
MARGIN_X = 44
TOP = PAGE_H - 42
CONTENT_W = PAGE_W - (MARGIN_X * 2)

TITLE_COLOR = Color(0.07, 0.16, 0.32)
SECTION_COLOR = Color(0.11, 0.24, 0.42)
TEXT_COLOR = Color(0.1, 0.1, 0.12)
MUTED_COLOR = Color(0.30, 0.33, 0.38)
ACCENT = Color(0.85, 0.9, 0.97)


def wrap_text(text: str, font: str, size: int, max_width: float) -> list[str]:
    words = text.split()
    if not words:
        return [""]
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def draw_heading(c: canvas.Canvas, y: float, title: str) -> float:
    c.setFillColor(SECTION_COLOR)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN_X, y, title)
    c.setStrokeColor(ACCENT)
    c.setLineWidth(1)
    c.line(MARGIN_X, y - 3, PAGE_W - MARGIN_X, y - 3)
    return y - 16


def draw_paragraph(c: canvas.Canvas, y: float, text: str, size: int = 9, lead: int = 12) -> float:
    c.setFillColor(TEXT_COLOR)
    c.setFont("Helvetica", size)
    for line in wrap_text(text, "Helvetica", size, CONTENT_W):
        c.drawString(MARGIN_X, y, line)
        y -= lead
    return y


def draw_bullets(c: canvas.Canvas, y: float, bullets: list[str], size: int = 9, lead: int = 11) -> float:
    c.setFont("Helvetica", size)
    c.setFillColor(TEXT_COLOR)
    bullet_indent = MARGIN_X + 10
    text_x = MARGIN_X + 22
    width = PAGE_W - text_x - MARGIN_X
    for bullet in bullets:
        lines = wrap_text(bullet, "Helvetica", size, width)
        c.drawString(bullet_indent, y, "-")
        c.drawString(text_x, y, lines[0])
        y -= lead
        for line in lines[1:]:
            c.drawString(text_x, y, line)
            y -= lead
    return y


def draw_pdf(output_path: Path) -> None:
    c = canvas.Canvas(str(output_path), pagesize=letter)
    y = TOP

    c.setFillColor(TITLE_COLOR)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(MARGIN_X, y, "Havilah App - One-Page Summary")
    y -= 15
    c.setFillColor(MUTED_COLOR)
    c.setFont("Helvetica", 8)
    c.drawString(MARGIN_X, y, "Evidence source: repository code and README files only")
    y -= 20

    y = draw_heading(c, y, "What It Is")
    y = draw_paragraph(
        c,
        y,
        "Havilah is a full-stack EdTech app with a FastAPI backend and a React web client, plus a Flutter shell app in the repo. It focuses on AI-assisted study workflows such as content processing, quiz practice, flashcards, and tutor chat.",
    )
    y -= 3

    y = draw_heading(c, y, "Who It Is For")
    y = draw_paragraph(
        c,
        y,
        "Primary persona: Gen Z learners in the EU (stated in root README).",
    )
    y -= 3

    y = draw_heading(c, y, "What It Does")
    y = draw_bullets(
        c,
        y,
        [
            "User authentication with register, login, and current-user profile endpoints.",
            "Upload and manage study files (JPEG, PNG, PDF), persisted with local storage or MinIO.",
            "Extract text from uploads (image OCR, PDF, DOCX, TXT) and produce learning assets.",
            "Generate summaries, key points, simplified concepts, flashcards, and quiz questions from content.",
            "Provide quiz generation plus quiz-attempt recording for learner progress data.",
            "Provide flashcard retrieval/generation and flashcard-attempt tracking.",
            "Support AI tutor chat sessions, topic exploration, learning feed, dashboard, and progress views.",
        ],
    )
    y -= 2

    y = draw_heading(c, y, "How It Works (Architecture)")
    y = draw_bullets(
        c,
        y,
        [
            "Frontend (Vite + React): components call frontend/src/lib/api.ts, which adds bearer token auth from localStorage and sends requests to /api/v1.",
            "API layer (FastAPI): backend/app/main.py mounts api_v1 router and CORS, with route modules for auth, uploads, content, quiz, flashcards, chat, topics, feed, dashboard, and progress.",
            "Services: startup event wiring initializes file storage, Mongo client, AI services, OCR, and feature services used by dependencies and routes.",
            "Data flow: User action -> frontend API client -> FastAPI route -> service logic -> persistence in PostgreSQL (users, attempts, chat, topics), MongoDB (content pipelines and learning assets), and file storage (local/MinIO).",
            "Not found in repo: active Redis-backed runtime behavior, although REDIS_URL exists in configuration.",
        ],
    )
    y -= 2

    y = draw_heading(c, y, "How To Run (Minimal)")
    y = draw_bullets(
        c,
        y,
        [
            "Backend: cd backend, copy .env.example to .env, run uv sync, then uv run fastapi dev app/main.py.",
            "Frontend: cd frontend, run npm i, then npm run dev (optional VITE_API_BASE_URL override).",
            "Open API docs at http://localhost:8000/docs and the web UI at http://localhost:5173.",
        ],
    )

    c.showPage()
    c.save()


if __name__ == "__main__":
    out = Path("output/pdf/havilah_app_summary.pdf")
    out.parent.mkdir(parents=True, exist_ok=True)
    draw_pdf(out)
    print(out)
