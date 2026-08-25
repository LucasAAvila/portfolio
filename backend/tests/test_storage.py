from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers

from app.services import storage


def _upload_file(
    content_type: str, data: bytes, filename: str = "cover.jpg"
) -> UploadFile:
    from io import BytesIO

    return UploadFile(
        file=BytesIO(data),
        filename=filename,
        headers=Headers({"content-type": content_type}),
    )


@pytest.fixture
def mock_r2_client():
    client = AsyncMock()

    @asynccontextmanager
    async def fake_r2_client():
        yield client

    with patch.object(storage, "_r2_client", fake_r2_client):
        yield client


async def test_upload_rejects_unsupported_content_type(mock_r2_client):
    file = _upload_file("application/pdf", b"not an image")

    with pytest.raises(HTTPException) as exc_info:
        await storage.upload_project_image("my-project", file)

    assert exc_info.value.status_code == 415
    mock_r2_client.put_object.assert_not_called()


async def test_upload_rejects_oversized_file(mock_r2_client):
    oversized = b"0" * (storage._MAX_SIZE_BYTES + 1)
    file = _upload_file("image/png", oversized)

    with pytest.raises(HTTPException) as exc_info:
        await storage.upload_project_image("my-project", file)

    assert exc_info.value.status_code == 413
    mock_r2_client.put_object.assert_not_called()


async def test_upload_returns_public_url_and_writes_object(mock_r2_client):
    file = _upload_file("image/webp", b"fake-image-bytes")

    url = await storage.upload_project_image("my-project", file)

    assert url.startswith("https://pub-test.r2.dev/projects/my-project/")
    assert url.endswith(".webp")
    mock_r2_client.put_object.assert_awaited_once()
    call_kwargs = mock_r2_client.put_object.call_args.kwargs
    assert call_kwargs["Bucket"] == "test-bucket"
    assert call_kwargs["ContentType"] == "image/webp"
    assert call_kwargs["Body"] == b"fake-image-bytes"


async def test_delete_ignores_urls_outside_the_configured_bucket(mock_r2_client):
    await storage.delete_project_image("https://not-our-bucket.example.com/foo.jpg")

    mock_r2_client.delete_object.assert_not_called()


async def test_delete_removes_the_matching_key(mock_r2_client):
    url = "https://pub-test.r2.dev/projects/my-project/abc123.png"

    await storage.delete_project_image(url)

    mock_r2_client.delete_object.assert_awaited_once_with(
        Bucket="test-bucket", Key="projects/my-project/abc123.png"
    )
