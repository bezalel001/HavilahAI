import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_ocr_service
from app.main import app
from app.services.ocr import OcrResult


class _FakeOcrService:
    def __init__(self):
        self.calls = 0

    def extract_text(self, image_bytes: bytes) -> OcrResult:
        self.calls += 1
        assert image_bytes  # ensure data passed through
        return OcrResult(text="Recognized text", language="eng")


@pytest.fixture()
def ocr_override():
    service = _FakeOcrService()
    app.dependency_overrides[get_ocr_service] = lambda: service
    yield service
    app.dependency_overrides.pop(get_ocr_service, None)


def test_ocr_extracts_text(client: TestClient, ocr_override: _FakeOcrService):
    response = client.post(
        "/api/v1/ocr/extract",
        files={"file": ("note.png", b"fake-image-data", "image/png")},
    )

    assert response.status_code == 200
    assert response.json() == {"text": "Recognized text", "language": "eng"}
    assert ocr_override.calls == 1


def test_ocr_rejects_non_image(client: TestClient, ocr_override: _FakeOcrService):
    response = client.post(
        "/api/v1/ocr/extract",
        files={"file": ("note.txt", b"not-image", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only image uploads are supported."


def test_ocr_returns_503_when_service_missing(client: TestClient):
    if hasattr(app.state, "ocr_service"):
        app.state.ocr_service = None
    response = client.post(
        "/api/v1/ocr/extract",
        files={"file": ("note.png", b"fake-image-data", "image/png")},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "OCR service is not configured."
