from __future__ import annotations

import io
from dataclasses import dataclass

from PIL import Image, UnidentifiedImageError

try:
    import pytesseract
except ImportError:  # pragma: no cover - optional dependency resolved in production
    pytesseract = None  # type: ignore


class OcrServiceError(Exception):
    """Raised when OCR extraction fails."""


@dataclass
class OcrResult:
    text: str
    language: str


class OcrService:
    def __init__(self, *, language: str = "eng"):
        if pytesseract is None:
            raise OcrServiceError("pytesseract is not installed or configured.")
        self.language = language

    def extract_text(self, image_bytes: bytes) -> OcrResult:
        if not image_bytes:
            raise OcrServiceError("Image payload is empty.")
        try:
            image = Image.open(io.BytesIO(image_bytes))
        except UnidentifiedImageError as exc:
            raise OcrServiceError("Uploaded file is not a valid image.") from exc

        try:
            text = pytesseract.image_to_string(image, lang=self.language)
        except Exception as exc:  # pragma: no cover - depends on pytesseract internals
            raise OcrServiceError("Failed to extract text from image.") from exc

        return OcrResult(text=text.strip(), language=self.language)
