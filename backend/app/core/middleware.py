"""HTTP middleware: request-id propagation, access logging, security headers."""

import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import request_id_var

logger = logging.getLogger("app.access")

_SECURITY_HEADERS: dict[str, str] = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

# Endpoints that should not produce an access log line. Health checks fire
# every few seconds in production and would drown out useful entries.
SKIP_PATHS: frozenset[str] = frozenset({"/health"})


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        incoming = request.headers.get("x-request-id")
        request_id = incoming if incoming else uuid.uuid4().hex[:12]
        token = request_id_var.set(request_id)
        start = time.perf_counter()

        try:
            response: Response = await call_next(request)
        except Exception:
            duration_ms = (time.perf_counter() - start) * 1000
            logger.exception(
                "%s %s -> 500 (%.1fms)",
                request.method,
                request.url.path,
                duration_ms,
            )
            request_id_var.reset(token)
            raise

        duration_ms = (time.perf_counter() - start) * 1000
        response.headers["x-request-id"] = request_id
        for header, value in _SECURITY_HEADERS.items():
            response.headers[header] = value

        if request.url.path not in SKIP_PATHS:
            level = logging.WARNING if response.status_code >= 400 else logging.INFO
            logger.log(
                level,
                "%s %s -> %s (%.1fms)",
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
            )

        request_id_var.reset(token)
        return response
