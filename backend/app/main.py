import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import limiter
from app.core.logging import configure_logging
from app.core.middleware import RequestLoggingMiddleware
from app.routes import contact, health, project, skill

configure_logging()
logger = logging.getLogger(__name__)


def _assert_config() -> None:
    """Fail fast on obvious misconfiguration before the first request is served."""
    if not settings.RESEND_API_KEY.startswith("re_"):
        raise RuntimeError(
            "RESEND_API_KEY does not look like a valid Resend key (expected 're_…')"
        )
    if not settings.CORS_ORIGINS:
        raise RuntimeError("CORS_ORIGINS is empty — the frontend will be blocked")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _assert_config()
    logger.info("Starting up: opening Resend HTTP client")
    app.state.http_client = httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=3.0))
    yield
    await app.state.http_client.aclose()
    logger.info("Shutting down: Resend HTTP client closed")


app = FastAPI(title="Portfolio API", version="1.0.0", lifespan=lifespan)

# RequestLoggingMiddleware must be added BEFORE CORSMiddleware so that even
# preflight (OPTIONS) requests handled by CORSMiddleware are logged with a
# request id.
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    logger.warning(
        "Rate limit exceeded on %s %s by %s",
        request.method,
        request.url.path,
        request.client.host if request.client else "unknown",
    )
    return _rate_limit_exceeded_handler(request, exc)


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

app.include_router(health.router)
app.include_router(project.router)
app.include_router(skill.router)
app.include_router(contact.router)
