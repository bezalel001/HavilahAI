from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Sequence

from app.core.config import settings
from app.schemas.flashcards import Flashcard
from app.schemas.quiz import QuizQuestion
from app.schemas.content import SimplifiedConcept
from app.services.ai_client import AIServiceError

try:
    from openai import AsyncOpenAI
except ImportError:  # pragma: no cover
    AsyncOpenAI = None  # type: ignore

try:
    from anthropic import AsyncAnthropic
except ImportError:  # pragma: no cover
    AsyncAnthropic = None  # type: ignore


@dataclass
class LearningAssetsResult:
    summary: str
    key_points: list[str]
    simplified_concepts: list[SimplifiedConcept]
    flashcards: list[Flashcard]
    quiz_questions: list[QuizQuestion]


class LearningAssetsService:
    """Generate summaries, flashcards, and quiz questions from text."""

    def __init__(self) -> None:
        self.openai_client = None
        self.anthropic_client = None

        if settings.OPENAI_API_KEY and AsyncOpenAI is not None:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        if settings.ANTHROPIC_API_KEY and AsyncAnthropic is not None:
            self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        if self.openai_client is None and self.anthropic_client is None:
            raise AIServiceError("No AI providers configured for learning assets.")

        self.openai_model = settings.OPENAI_MODEL
        self.anthropic_model = settings.ANTHROPIC_MODEL

    async def generate_assets(self, text: str) -> LearningAssetsResult:
        if self.openai_client is not None:
            try:
                return await self._openai_generate(text)
            except Exception:
                if self.anthropic_client is None:
                    raise AIServiceError("OpenAI learning assets generation failed.")
        if self.anthropic_client is not None:
            try:
                return await self._anthropic_generate(text)
            except Exception as exc:
                raise AIServiceError("Anthropic learning assets generation failed.") from exc
        raise AIServiceError("No AI providers configured for learning assets.")

    async def expand_feed_text(self, text: str, duration_seconds: int) -> str:
        if self.openai_client is not None:
            try:
                return await self._openai_expand_feed_text(text, duration_seconds)
            except Exception:
                if self.anthropic_client is None:
                    raise AIServiceError("OpenAI feed expansion failed.")
        if self.anthropic_client is not None:
            try:
                return await self._anthropic_expand_feed_text(text, duration_seconds)
            except Exception as exc:
                raise AIServiceError("Anthropic feed expansion failed.") from exc
        raise AIServiceError("No AI providers configured for feed expansion.")

    async def _openai_generate(self, text: str) -> LearningAssetsResult:
        assert self.openai_client is not None
        response = await self.openai_client.chat.completions.create(
            model=self.openai_model,
            temperature=0.3,
            messages=[
                {"role": "system", "content": self._system_prompt()},
                {"role": "user", "content": self._user_prompt(text)},
            ],
        )
        content = response.choices[0].message.content or ""
        return self._parse_payload(content)

    async def _anthropic_generate(self, text: str) -> LearningAssetsResult:
        assert self.anthropic_client is not None
        response = await self.anthropic_client.messages.create(
            model=self.anthropic_model,
            max_tokens=900,
            temperature=0.3,
            system=self._system_prompt(),
            messages=[{"role": "user", "content": self._user_prompt(text)}],
        )
        blocks = response.content or []
        content = "".join(getattr(block, "text", "") for block in blocks)
        return self._parse_payload(content)

    def _system_prompt(self) -> str:
        return (
            "You are an expert tutor. Return strict JSON with summary, key points, simplified concepts, "
            "flashcards, and multiple-choice quiz questions."
        )

    def _feed_system_prompt(self) -> str:
        return (
            "You are an expert tutor for Gen Z learners. "
            "Write a clear, engaging, simplified explanation. "
            "Avoid repetition, avoid fluff, and use short sentences. "
            "Ensure each sentence adds a new idea and is not a rephrase."
        )

    def _feed_user_prompt(self, text: str, duration_seconds: int) -> str:
        target_chars = max(180, duration_seconds * 12)
        return (
            "Expand the following content into a single narration script.\n"
            f"Target length: about {target_chars} characters.\n"
            "Constraints:\n"
            "- Do NOT repeat the same sentence or idea.\n"
            "- Do NOT restate the same point with different words.\n"
            "- Use 6-10 distinct sentences that each introduce a new fact or angle.\n"
            "- Keep the tone friendly, simple, and concise.\n"
            "- Use simple words and brief analogies when helpful.\n"
            "- Return plain text only (no bullets, no markdown).\n"
            "Content:\n"
            f"{text}"
        )

    def _user_prompt(self, text: str) -> str:
        return (
            "Create learning assets from the following text.\n"
            "Return JSON with:\n"
            "{"
            '"summary": str, '
            '"key_points": [str], '
            '"simplified_concepts": [{"original": str, "simplified": str}], '
            '"flashcards": [{"front": str, "back": str, "category": str}], '
            '"quiz_questions": [{"question": str, "options": [str], "correct": int, "explanation": str}]'
            "}\n"
            "For simplified_concepts: rewrite key ideas in very simple English for a beginner (around age 12). "
            "Use short sentences, common words, and clear analogies. Avoid jargon; if a technical term is needed, "
            "explain it in one simple sentence. Provide 4-6 items.\n"
            "Text:\n"
            f"{text}"
        )

    async def _openai_expand_feed_text(self, text: str, duration_seconds: int) -> str:
        assert self.openai_client is not None
        response = await self.openai_client.chat.completions.create(
            model=self.openai_model,
            temperature=0.4,
            max_tokens=600,
            messages=[
                {"role": "system", "content": self._feed_system_prompt()},
                {"role": "user", "content": self._feed_user_prompt(text, duration_seconds)},
            ],
        )
        content = response.choices[0].message.content or ""
        if not content.strip():
            raise AIServiceError("OpenAI returned an empty feed expansion.")
        return content.strip()

    async def _anthropic_expand_feed_text(self, text: str, duration_seconds: int) -> str:
        assert self.anthropic_client is not None
        response = await self.anthropic_client.messages.create(
            model=self.anthropic_model,
            max_tokens=600,
            temperature=0.4,
            system=self._feed_system_prompt(),
            messages=[{"role": "user", "content": self._feed_user_prompt(text, duration_seconds)}],
        )
        blocks = response.content or []
        content = "".join(getattr(block, "text", "") for block in blocks).strip()
        if not content:
            raise AIServiceError("Anthropic returned an empty feed expansion.")
        return content

    def _parse_payload(self, payload: str) -> LearningAssetsResult:
        payload = payload.strip()
        if not payload:
            raise AIServiceError("AI response was empty.")
        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", payload, flags=re.DOTALL)
            if not match:
                raise AIServiceError("Failed to parse AI response as JSON.")
            data = json.loads(match.group(0))

        simplified_concepts = []
        for item in data.get("simplified_concepts") or []:
            if not isinstance(item, dict):
                continue
            original = str(item.get("original") or "").strip()
            simplified = str(item.get("simplified") or "").strip()
            if not original or not simplified:
                continue
            simplified_concepts.append(
                SimplifiedConcept(
                    original=original,
                    simplified=simplified,
                )
            )

        flashcards = [
            Flashcard(
                id=index + 1,
                front=str(item.get("front") or ""),
                back=str(item.get("back") or ""),
                category=str(item.get("category") or "General"),
            )
            for index, item in enumerate(data.get("flashcards") or [])
        ]
        quiz_questions = [
            QuizQuestion(
                question=str(item.get("question") or ""),
                options=[str(option) for option in item.get("options") or []],
                correct=int(item.get("correct") or 0),
                explanation=str(item.get("explanation") or ""),
            )
            for item in data.get("quiz_questions") or []
        ]

        return LearningAssetsResult(
            summary=str(data.get("summary") or ""),
            key_points=[str(point) for point in data.get("key_points") or []],
            simplified_concepts=simplified_concepts,
            flashcards=flashcards,
            quiz_questions=quiz_questions,
        )
