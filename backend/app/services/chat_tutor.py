from __future__ import annotations

from typing import Iterable, Sequence

from app.core.config import settings
from app.services.ai_client import AIServiceError

try:
    from openai import AsyncOpenAI
except ImportError:  # pragma: no cover - dependency missing in some envs
    AsyncOpenAI = None  # type: ignore

try:
    from anthropic import AsyncAnthropic
except ImportError:  # pragma: no cover - dependency missing in some envs
    AsyncAnthropic = None  # type: ignore


class ChatTutorService:
    """Generate tutoring responses with OpenAI primary and Anthropic fallback."""

    def __init__(self) -> None:
        self.openai_client = None
        self.anthropic_client = None

        if settings.OPENAI_API_KEY and AsyncOpenAI is not None:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        if settings.ANTHROPIC_API_KEY and AsyncAnthropic is not None:
            self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        if self.openai_client is None and self.anthropic_client is None:
            raise AIServiceError("No AI chat providers are configured.")

        self.openai_model = settings.OPENAI_MODEL
        self.anthropic_model = settings.ANTHROPIC_MODEL
        self.system_prompt = (
            "You are a friendly AI tutor for EU-focused students. "
            "Provide clear, concise explanations with a helpful tone. "
            "Use Markdown formatting. "
            "Render math with LaTeX using $...$ for inline and $$...$$ for block equations. "
            "Avoid using \\( \\) or \\[ \\] for math. "
            "Never present math in plain parentheses; use $...$ instead, "
            "for example write $f(x)=3x^4$ not ( f(x) = 3x^4 ). "
            "Ask a short follow-up question when appropriate."
        )

    async def generate_reply(self, messages: Sequence[dict[str, str]]) -> str:
        if self.openai_client is not None:
            try:
                return await self._openai_reply(messages)
            except Exception:
                if self.anthropic_client is None:
                    raise AIServiceError("OpenAI chat generation failed.")
        if self.anthropic_client is not None:
            try:
                return await self._anthropic_reply(messages)
            except Exception as exc:
                raise AIServiceError("Anthropic chat generation failed.") from exc
        raise AIServiceError("No AI chat providers are configured.")

    async def _openai_reply(self, messages: Sequence[dict[str, str]]) -> str:
        assert self.openai_client is not None
        response = await self.openai_client.chat.completions.create(
            model=self.openai_model,
            temperature=0.4,
            messages=[
                {"role": "system", "content": self.system_prompt},
                *messages,
            ],
        )
        content = response.choices[0].message.content or ""
        if not content.strip():
            raise AIServiceError("OpenAI returned an empty response.")
        return content.strip()

    async def _anthropic_reply(self, messages: Sequence[dict[str, str]]) -> str:
        assert self.anthropic_client is not None
        response = await self.anthropic_client.messages.create(
            model=self.anthropic_model,
            max_tokens=400,
            temperature=0.4,
            system=self.system_prompt,
            messages=list(messages),
        )
        blocks: Iterable[object] = response.content or []
        text_parts = [getattr(block, "text", "") for block in blocks]
        content = "".join(text_parts).strip()
        if not content:
            raise AIServiceError("Anthropic returned an empty response.")
        return content
