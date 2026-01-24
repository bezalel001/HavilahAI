from __future__ import annotations

from typing import Optional

from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field, ValidationError

from app.schemas.quiz import QuizQuestion, QuizResponse


class QuizGenerationError(Exception):
    """Raised when the AI quiz generator fails to produce a valid quiz."""


class GeneratedQuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(..., min_items=2)
    correct: int
    explanation: str


class GeneratedQuiz(BaseModel):
    title: str
    subject: str
    difficulty: str
    questions: list[GeneratedQuizQuestion]


STYLE_GUIDE = """{
  "title": "EU Data Protection & GDPR",
  "subject": "Law & Policy",
  "difficulty": "Intermediate",
  "questions": [
    {
      "question": "What does GDPR stand for?",
      "options": [
        "General Data Protection Regulation",
        "Global Data Privacy Rights",
        "General Digital Protection Rules",
        "Government Data Protection Requirements"
      ],
      "correct": 0,
      "explanation": "GDPR is the EU regulation that governs personal data privacy."
    }
  ]
}"""


class QuizGeneratorService:
    """Generate multiple-choice quizzes using LangChain + OpenAI."""

    def __init__(self, *, llm: ChatOpenAI) -> None:
        self.llm = llm
        self.parser = PydanticOutputParser(pydantic_object=GeneratedQuiz)
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are an expert assessment designer. "
                    "Always respond with valid JSON that matches the provided schema.\n"
                    "{format_instructions}",
                ),
                (
                    "user",
                    "Create a multiple-choice quiz.\n"
                    "Topic: {topic}\n"
                    "Difficulty: {difficulty}\n"
                    "Number of Questions: {question_count}\n"
                    "Each question must have exactly four answer options, a zero-indexed "
                    "`correct` field that references the options list, and a concise explanation.\n"
                    "Match the concise tone and structure from this sample:\n{style_example}\n"
                    "Return only JSON in your reply.",
                ),
            ]
        )

    async def generate_quiz(
        self,
        *,
        topic: Optional[str],
        difficulty: Optional[str],
        question_count: Optional[int],
    ) -> QuizResponse:
        topic_value = (topic or "General Knowledge").strip() or "General Knowledge"
        difficulty_value = (difficulty or "Intermediate").strip().title() or "Intermediate"
        question_total = question_count or 5
        question_total = max(1, min(question_total, 10))

        messages = self.prompt.format_messages(
            topic=topic_value,
            difficulty=difficulty_value,
            question_count=question_total,
            format_instructions=self.parser.get_format_instructions(),
            style_example=STYLE_GUIDE,
        )
        response = await self.llm.ainvoke(messages)
        content = getattr(response, "content", None)
        if not content:
            raise QuizGenerationError("AI returned an empty response.")

        try:
            parsed = self.parser.parse(content)
        except ValidationError as exc:
            raise QuizGenerationError("Unable to parse AI quiz response.") from exc

        questions: list[QuizQuestion] = []
        for item in parsed.questions[:question_total]:
            options = [option.strip() for option in item.options if option.strip()][:4]
            if len(options) < 2:
                raise QuizGenerationError("Each question must include at least two options.")
            correct_index = item.correct
            if correct_index < 0 or correct_index >= len(options):
                raise QuizGenerationError("Question `correct` index is out of range.")
            questions.append(
                QuizQuestion(
                    question=item.question.strip(),
                    options=options,
                    correct=correct_index,
                    explanation=item.explanation.strip(),
                )
            )

        if not questions:
            raise QuizGenerationError("AI response did not include any questions.")

        return QuizResponse(
            title=parsed.title.strip() or f"{topic_value} Quiz",
            subject=parsed.subject.strip() or topic_value,
            difficulty=parsed.difficulty.strip() or difficulty_value,
            questions=questions,
        )
