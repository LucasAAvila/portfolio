import mimetypes
import uuid
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

import aioboto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/avif"}
_MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _r2_endpoint() -> str:
    return f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"


@asynccontextmanager
async def _r2_client() -> AsyncGenerator[Any]:
    session = aioboto3.Session()
    async with session.client(
        "s3",
        endpoint_url=_r2_endpoint(),
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    ) as client:
        yield client


def _validate_upload(file: UploadFile) -> str:
    content_type = file.content_type or ""
    if content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type. Allowed: {
                ', '.join(_ALLOWED_CONTENT_TYPES)
            }",
        )
    return content_type


def _object_key(slug: str, content_type: str) -> str:
    ext = mimetypes.guess_extension(content_type) or ".jpg"
    # .jpe is the stdlib alias for jpeg — normalise it.
    if ext == ".jpe":
        ext = ".jpg"
    return f"projects/{slug}/{uuid.uuid4().hex}{ext}"


async def upload_project_image(slug: str, file: UploadFile) -> str:
    """Upload *file* to R2 and return the public URL."""
    content_type = _validate_upload(file)

    data = await file.read()
    if len(data) > _MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds the 5 MB limit.",
        )

    key = _object_key(slug, content_type)

    async with _r2_client() as client:
        await client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=data,
            ContentType=content_type,
            CacheControl="public, max-age=31536000, immutable",
        )

    return f"{settings.R2_PUBLIC_URL.rstrip('/')}/{key}"


async def delete_project_image(public_url: str) -> None:
    """Delete the object behind *public_url* from R2. Silently ignores missing keys."""
    base = settings.R2_PUBLIC_URL.rstrip("/") + "/"
    if not public_url.startswith(base):
        return
    key = public_url[len(base) :]

    async with _r2_client() as client:
        try:
            await client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)
        except ClientError:
            pass
