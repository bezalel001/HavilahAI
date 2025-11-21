import io
import os

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_file_storage_service
from app.core.config import settings
from app.main import app
from app.services.file_storage import FileStorageService


class _FakeMinioClient:
    def __init__(self):
        self.objects: dict[str, bytes] = {}

    def put_object(self, bucket_name: str, object_name: str, data, length: int, content_type: str | None = None):
        self.objects[object_name] = data.read()


@pytest.fixture(autouse=True)
def file_storage_override(tmp_path):
    service = FileStorageService(
        storage_backend="local",
        base_dir=tmp_path / "uploads",
        allowed_content_types=settings.UPLOAD_ALLOWED_CONTENT_TYPES,
        max_file_size_bytes=settings.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
    )
    app.dependency_overrides[get_file_storage_service] = lambda: service
    yield service
    app.dependency_overrides.pop(get_file_storage_service, None)


def test_uploads_accepts_allowed_file(client: TestClient, file_storage_override: FileStorageService):
    response = client.post(
        f"{settings.API_V1_STR}/uploads",
        files={"file": ("avatar.png", b"test-image-bytes", "image/png")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["original_filename"] == "avatar.png"
    assert body["content_type"] == "image/png"
    assert body["storage_backend"] == "local"
    stored_path = file_storage_override.base_dir / body["storage_path"]
    assert stored_path.exists()
    assert body["size_bytes"] == os.path.getsize(stored_path)


def test_uploads_rejects_disallowed_media_type(client: TestClient):
    response = client.post(
        f"{settings.API_V1_STR}/uploads",
        files={"file": ("script.sh", b"echo malicious", "text/plain")},
    )

    assert response.status_code == 400
    assert "Unsupported media type" in response.json()["detail"]


def test_uploads_enforces_file_size_limit(client: TestClient):
    limit_bytes = settings.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024
    payload = b"x" * (limit_bytes + 1)
    response = client.post(
        f"{settings.API_V1_STR}/uploads",
        files={"file": ("big.pdf", payload, "application/pdf")},
    )

    assert response.status_code == 400
    assert response.json()["detail"].startswith("File is too large.")


def test_uploads_can_use_minio_backend(client: TestClient, file_storage_override: FileStorageService):
    fake_client = _FakeMinioClient()
    service = FileStorageService(
        storage_backend="minio",
        minio_client=fake_client,  # type: ignore[arg-type]
        minio_bucket="tests",
        allowed_content_types=settings.UPLOAD_ALLOWED_CONTENT_TYPES,
        max_file_size_bytes=settings.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
    )
    app.dependency_overrides[get_file_storage_service] = lambda: service

    response = client.post(
        f"{settings.API_V1_STR}/uploads",
        files={"file": ("notes.pdf", io.BytesIO(b"pdf-bytes"), "application/pdf")},
    )
    app.dependency_overrides[get_file_storage_service] = lambda: file_storage_override

    assert response.status_code == 201
    body = response.json()
    assert body["storage_backend"] == "minio"
    assert body["bucket_name"] == "tests"
    assert body["stored_filename"] in fake_client.objects
