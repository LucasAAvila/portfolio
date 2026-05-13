import json
import os
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def _parse_string_list(value: str | list[str]) -> list[str]:
    """Accept either a JSON array or a comma-separated string.

    Examples:
        '["a","b"]'  -> ["a", "b"]
        'a,b'        -> ["a", "b"]
        ['a','b']    -> ['a', 'b']  (already parsed)
    """
    if isinstance(value, list):
        return value
    stripped = value.strip()
    if not stripped:
        return []
    if stripped.startswith("["):
        parsed: list[str] = json.loads(stripped)
        return parsed
    return [item.strip() for item in stripped.split(",") if item.strip()]


# In production (ENV=production) Railway injects all variables directly; reading
# a .env file from disk would silently override platform config if one were ever
# dropped into the image by mistake. Restrict .env loading to non-production envs.
_ENV = os.getenv("ENV", "development")
_env_file = None if _ENV == "production" else ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_env_file)

    # Non-empty string enforced at parse time so misconfiguration fails at
    # startup rather than at the first request that needs the value.
    DATABASE_URL: str = Field(min_length=1)
    RESEND_API_KEY: str = Field(min_length=1)
    RESEND_API_URL: str = Field(min_length=1)
    RESEND_FROM_EMAIL: str = Field(min_length=1)
    CONTACT_TO_EMAIL: Annotated[list[str], NoDecode]
    CORS_ORIGINS: Annotated[list[str], NoDecode]

    # Cloudflare R2 — S3-compatible object storage for project images.
    R2_ACCOUNT_ID: str = Field(min_length=1)
    R2_ACCESS_KEY_ID: str = Field(min_length=1)
    R2_SECRET_ACCESS_KEY: str = Field(min_length=1)
    R2_BUCKET_NAME: str = Field(min_length=1)
    # Public base URL for the R2 bucket (custom domain or r2.dev subdomain).
    R2_PUBLIC_URL: str = Field(min_length=1)

    # Shared secret for write-access admin endpoints (image upload/delete).
    # Generate with: openssl rand -hex 32
    ADMIN_SECRET: str = Field(min_length=1)

    @field_validator("CONTACT_TO_EMAIL", "CORS_ORIGINS", mode="before")
    @classmethod
    def parse_list(cls, value: str | list[str]) -> list[str]:
        return _parse_string_list(value)

    @field_validator("CORS_ORIGINS")
    @classmethod
    def cors_origins_not_empty(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("CORS_ORIGINS must contain at least one origin")
        return v


settings = Settings()
