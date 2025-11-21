from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List


@dataclass
class SimplifyResult:
    simplified_text: str
    key_points: List[str]
    replaced_words: List[str]
    original_word_count: int
    simplified_word_count: int
    readability_score: float


class ContentSimplifier:
    """Perform lightweight, rule-based text simplification without external AI calls."""

    SIMPLE_WORDS = {
        "approximately": "about",
        "commence": "start",
        "utilize": "use",
        "demonstrate": "show",
        "assistance": "help",
        "modify": "change",
        "terminate": "end",
        "endeavor": "try",
        "subsequent": "next",
        "prior": "before",
    }

    def __init__(self, max_sentence_words: int = 20):
        self.max_sentence_words = max_sentence_words

    def simplify(self, text: str) -> SimplifyResult:
        text = text.strip()
        original_words = self._count_words(text)
        simplified_text, replaced = self._replace_complex_words(text)
        sentences = self._split_sentences(simplified_text)
        normalized_sentences = self._normalize_sentences(sentences)

        simplified_text = " ".join(normalized_sentences).strip()
        simplified_words = self._count_words(simplified_text)
        readability = self._readability_score(normalized_sentences, simplified_words)
        key_points = normalized_sentences[:3]

        return SimplifyResult(
            simplified_text=simplified_text,
            key_points=key_points,
            replaced_words=replaced,
            original_word_count=original_words,
            simplified_word_count=simplified_words,
            readability_score=readability,
        )

    def _replace_complex_words(self, text: str) -> tuple[str, List[str]]:
        replaced: List[str] = []
        simplified = text
        for complex_word, simple_word in self.SIMPLE_WORDS.items():
            pattern = re.compile(rf"\b{complex_word}\b", flags=re.IGNORECASE)

            def _sub(match: re.Match) -> str:
                replaced.append(match.group(0))
                return simple_word

            simplified = pattern.sub(_sub, simplified)
        return simplified, replaced

    def _split_sentences(self, text: str) -> List[str]:
        raw_sentences = re.split(r"(?<=[.!?])\s+", text)
        return [sentence.strip() for sentence in raw_sentences if sentence.strip()]

    def _normalize_sentences(self, sentences: List[str]) -> List[str]:
        normalized: List[str] = []
        for sentence in sentences:
            words = sentence.split()
            if len(words) <= self.max_sentence_words:
                normalized.append(self._ensure_period(sentence))
            else:
                normalized.extend(
                    self._chunk_sentence(words, self.max_sentence_words),
                )
        return normalized

    def _chunk_sentence(self, words: List[str], chunk_size: int) -> List[str]:
        chunks: List[str] = []
        for idx in range(0, len(words), chunk_size):
            chunk = " ".join(words[idx : idx + chunk_size])
            chunks.append(self._ensure_period(chunk))
        return chunks

    def _ensure_period(self, sentence: str) -> str:
        stripped = sentence.strip()
        if not stripped.endswith((".", "!", "?")):
            return f"{stripped}."
        return stripped

    def _count_words(self, text: str) -> int:
        return len([word for word in re.split(r"\s+", text) if word])

    def _readability_score(self, sentences: List[str], word_count: int) -> float:
        if not sentences:
            return 0.0
        return round(word_count / len(sentences), 2)
