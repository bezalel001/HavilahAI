from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Optional, Sequence

from app.core.config import settings
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
class TopicModuleDraft:
    title: str
    type: str
    duration_minutes: int
    eu_context: Optional[str] = None
    content_url: Optional[str] = None


@dataclass
class TopicDraft:
    name: str
    category: str
    icon_emoji: str
    description: str
    difficulty: str
    estimated_hours: float
    gradient_color: str
    eu_connection: str
    modules: list[TopicModuleDraft]


class TopicGenerationError(AIServiceError):
    """Raised when AI topic generation fails."""


class TopicGeneratorService:
    """Generate topic outlines using OpenAI primary with Anthropic fallback."""

    def __init__(self) -> None:
        self.openai_client = None
        self.anthropic_client = None

        if settings.OPENAI_API_KEY and AsyncOpenAI is not None:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        if settings.ANTHROPIC_API_KEY and AsyncAnthropic is not None:
            self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        if self.openai_client is None and self.anthropic_client is None:
            raise TopicGenerationError("No AI topic generator providers are configured.")

        self.openai_model = settings.OPENAI_MODEL
        self.anthropic_model = settings.ANTHROPIC_MODEL

    async def generate_topic(
        self,
        *,
        prompt: str,
        difficulty: Optional[str],
        module_count: int,
        category_hint: Optional[str],
    ) -> TopicDraft:
        if self.openai_client is not None:
            try:
                return await self._openai_generate(prompt, difficulty, module_count, category_hint)
            except Exception:
                if self.anthropic_client is None:
                    raise TopicGenerationError("OpenAI topic generation failed.")
        if self.anthropic_client is not None:
            try:
                return await self._anthropic_generate(prompt, difficulty, module_count, category_hint)
            except Exception as exc:
                raise TopicGenerationError("Anthropic topic generation failed.") from exc
        raise TopicGenerationError("No AI topic generator providers are configured.")

    async def _openai_generate(
        self,
        prompt: str,
        difficulty: Optional[str],
        module_count: int,
        category_hint: Optional[str],
    ) -> TopicDraft:
        assert self.openai_client is not None
        response = await self.openai_client.chat.completions.create(
            model=self.openai_model,
            temperature=0.4,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert curriculum designer. "
                        "Return strict JSON that matches the requested schema."
                    ),
                },
                {"role": "user", "content": self._build_prompt(prompt, difficulty, module_count, category_hint)},
            ],
        )
        content = response.choices[0].message.content or ""
        return self._parse_payload(content, module_count)

    async def _anthropic_generate(
        self,
        prompt: str,
        difficulty: Optional[str],
        module_count: int,
        category_hint: Optional[str],
    ) -> TopicDraft:
        assert self.anthropic_client is not None
        response = await self.anthropic_client.messages.create(
            model=self.anthropic_model,
            max_tokens=800,
            temperature=0.4,
            system=(
                "You are an expert curriculum designer. "
                "Return strict JSON that matches the requested schema."
            ),
            messages=[{"role": "user", "content": self._build_prompt(prompt, difficulty, module_count, category_hint)}],
        )
        blocks = response.content or []
        text_parts = [getattr(block, "text", "") for block in blocks]
        content = "".join(text_parts)
        return self._parse_payload(content, module_count)

    def _build_prompt(
        self,
        prompt: str,
        difficulty: Optional[str],
        module_count: int,
        category_hint: Optional[str],
    ) -> str:
        return (
            "Create a learning topic outline for EU Gen Z learners.\n"
            f"Topic prompt: {prompt}\n"
            f"Difficulty (optional): {difficulty or 'intermediate'}\n"
            f"Category hint (optional): {category_hint or 'AI & Data'}\n"
            f"Number of modules: {module_count}\n"
            "Return JSON with:\n"
            "{"
            '"name": str, '
            '"category": str, '
            '"icon_emoji": str, '
            '"description": str, '
            '"difficulty": "beginner" | "intermediate" | "advanced", '
            '"estimated_hours": float, '
            '"gradient_color": str, '
            '"eu_connection": str, '
            '"modules": ['
            '{"title": str, "type": "video"|"reading"|"interactive"|"quiz", "duration_minutes": int, '
            '"eu_context": str, "content_url": str?}'
            "]}"
        )

    def _parse_payload(self, payload: str, module_count: int) -> TopicDraft:
        payload = payload.strip()
        if not payload:
            raise TopicGenerationError("AI response was empty.")
        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", payload, flags=re.DOTALL)
            if not match:
                raise TopicGenerationError("Failed to parse AI response as JSON.")
            data = json.loads(match.group(0))

        modules_raw = data.get("modules") or []
        modules: list[TopicModuleDraft] = []
        for entry in modules_raw[:module_count]:
            modules.append(
                TopicModuleDraft(
                    title=str(entry.get("title") or "Module"),
                    type=str(entry.get("type") or "reading"),
                    duration_minutes=int(entry.get("duration_minutes") or 10),
                    eu_context=entry.get("eu_context"),
                    content_url=entry.get("content_url"),
                )
            )

        if not modules:
            raise TopicGenerationError("AI response did not include modules.")

        return TopicDraft(
            name=str(data.get("name") or "New Topic"),
            category=str(data.get("category") or "AI & Data"),
            icon_emoji=str(data.get("icon_emoji") or "✨"),
            description=str(data.get("description") or "AI-generated topic."),
            difficulty=str(data.get("difficulty") or "intermediate"),
            estimated_hours=float(data.get("estimated_hours") or 2.0),
            gradient_color=str(data.get("gradient_color") or "from-purple-500 to-pink-500"),
            eu_connection=str(data.get("eu_connection") or data.get("description") or ""),
            modules=modules,
        )
