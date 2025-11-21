from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import List, Optional

try:
    from openai import AsyncOpenAI
except ImportError:  # pragma: no cover - the package is part of prod deps
    AsyncOpenAI = None  # type: ignore


class AIServiceError(Exception):
    """Raised when an AI provider fails to generate insights."""


@dataclass
class AIContentRequest:
    title: str
    raw_content: str
    learning_objective: str
    target_audience: str
    tone: Optional[str] = None
    additional_context: Optional[str] = None


@dataclass
class AIContentInsights:
    summary: str
    key_points: List[str]
    learning_objectives: List[str]
    quiz_questions: List[str]
    recommended_media: List[str]
    estimated_reading_time_minutes: float


class OpenAIContentGenerator:
    """Interact with OpenAI's chat completions API to analyze learning content."""

    def __init__(self, *, api_key: str, model: str) -> None:
        if not api_key:
            raise AIServiceError("OPENAI_API_KEY is not configured.")
        if AsyncOpenAI is None:
            raise AIServiceError("openai package is not available in the environment.")
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model

    async def generate_content_plan(self, request: AIContentRequest) -> AIContentInsights:
        prompt = self._build_prompt(request)
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                temperature=0.2,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an EdTech curriculum designer. "
                            "Summarize the provided material and return strict JSON."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
            )
        except Exception as exc:  # pragma: no cover - network/SDK errors
            raise AIServiceError("Unable to reach OpenAI.") from exc

        message = response.choices[0].message.content or ""
        payload = self._decode_json(message)
        try:
            return AIContentInsights(
                summary=payload["summary"],
                key_points=list(payload.get("key_points", [])),
                learning_objectives=list(payload.get("learning_objectives", [])),
                quiz_questions=list(payload.get("quiz_questions", [])),
                recommended_media=list(payload.get("recommended_media", [])),
                estimated_reading_time_minutes=float(payload.get("estimated_reading_time_minutes", 5.0)),
            )
        except (KeyError, ValueError, TypeError) as exc:
            raise AIServiceError("AI response was missing required fields.") from exc

    def _build_prompt(self, request: AIContentRequest) -> str:
        parts = [
            f"Title: {request.title}",
            f"Target Audience: {request.target_audience}",
            f"Learning Objective: {request.learning_objective}",
        ]
        if request.tone:
            parts.append(f"Desired Tone: {request.tone}")
        if request.additional_context:
            parts.append(f"Additional Context: {request.additional_context}")
        parts.append("Content:")
        parts.append(request.raw_content)
        parts.append(
            "Respond with JSON: {"
            '"summary": str, '
            '"key_points": [str], '
            '"learning_objectives": [str], '
            '"quiz_questions": [str], '
            '"recommended_media": [str], '
            '"estimated_reading_time_minutes": float}'
        )
        return "\n".join(parts)

    def _decode_json(self, payload: str) -> dict:
        payload = payload.strip()
        if not payload:
            raise AIServiceError("AI response was empty.")

        try:
            return json.loads(payload)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", payload, flags=re.DOTALL)
            if not match:
                raise AIServiceError("Failed to parse AI response as JSON.")
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError as exc:
                raise AIServiceError("Failed to parse AI response as JSON.") from exc
