import json
from unittest.mock import AsyncMock, MagicMock

import pytest_asyncio
from httpx import AsyncClient, RequestError

from app.core.config import settings
from app.core.limiter import limiter
from app.main import app


@pytest_asyncio.fixture(autouse=True)
async def reset_rate_limiter():
    """Slowapi keeps its counters in process memory; clear them between tests
    so a 5/hour limit doesn't leak across cases."""
    limiter.reset()
    yield
    limiter.reset()


@pytest_asyncio.fixture
async def mock_resend():
    """Replace `app.state.http_client` with a mock that records calls and
    returns a successful Resend response. Tests can override the response
    by mutating `mock_resend.post.return_value`."""
    response = MagicMock()
    response.status_code = 200
    response.text = '{"id":"resend-test-id"}'

    fake_client = MagicMock()
    fake_client.post = AsyncMock(return_value=response)

    original = getattr(app.state, "http_client", None)
    app.state.http_client = fake_client
    yield fake_client
    if original is not None:
        app.state.http_client = original


VALID_PAYLOAD = {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "Hello, this is a sufficiently long message.",
}


# -- validation paths (kept from before) --------------------------------------


async def test_contact_missing_fields(client: AsyncClient):
    response = await client.post("/contact", json={})
    assert response.status_code == 422


async def test_contact_invalid_email(client: AsyncClient):
    response = await client.post(
        "/contact", json={"name": "Test", "email": "invalid", "message": "A" * 20}
    )
    assert response.status_code == 422


async def test_contact_short_name(client: AsyncClient):
    response = await client.post(
        "/contact", json={"name": "A", "email": "test@test.com", "message": "A" * 20}
    )
    assert response.status_code == 422


async def test_contact_short_message(client: AsyncClient):
    response = await client.post(
        "/contact", json={"name": "Test", "email": "test@test.com", "message": "Short"}
    )
    assert response.status_code == 422


# -- CRLF rejection (H4) ------------------------------------------------------


async def test_contact_rejects_lf_in_name(client: AsyncClient):
    payload = {**VALID_PAYLOAD, "name": "Jane\nBcc: attacker@evil.com"}
    response = await client.post("/contact", json=payload)
    assert response.status_code == 422


async def test_contact_rejects_cr_in_name(client: AsyncClient):
    payload = {**VALID_PAYLOAD, "name": "Jane\rDoe"}
    response = await client.post("/contact", json=payload)
    assert response.status_code == 422


async def test_contact_rejects_cr_in_message(client: AsyncClient):
    payload = {**VALID_PAYLOAD, "message": "Hello\rsmuggled header content here."}
    response = await client.post("/contact", json=payload)
    assert response.status_code == 422


async def test_contact_allows_lf_in_message(
    client: AsyncClient, mock_resend: MagicMock
):
    """Multi-paragraph messages must still be accepted."""
    payload = {
        **VALID_PAYLOAD,
        "message": "Paragraph one.\n\nParagraph two with more details.",
    }
    response = await client.post("/contact", json=payload)
    assert response.status_code == 204
    assert mock_resend.post.await_count == 1


# -- success path: payload assertion ------------------------------------------


async def test_contact_success_calls_resend_with_correct_payload(
    client: AsyncClient, mock_resend: MagicMock
):
    response = await client.post("/contact", json=VALID_PAYLOAD)

    assert response.status_code == 204
    assert response.text == ""

    # Resend was called exactly once with the expected URL, auth header, and JSON body.
    assert mock_resend.post.await_count == 1
    call = mock_resend.post.await_args
    args, kwargs = call.args, call.kwargs

    assert args == (settings.RESEND_API_URL,)
    assert kwargs["headers"] == {"Authorization": f"Bearer {settings.RESEND_API_KEY}"}
    sent = kwargs["json"]
    assert sent["from"] == settings.RESEND_FROM_EMAIL
    assert sent["to"] == settings.CONTACT_TO_EMAIL
    assert sent["subject"] == f"Portfolio contact from {VALID_PAYLOAD['name']}"
    assert VALID_PAYLOAD["name"] in sent["text"]
    assert VALID_PAYLOAD["email"] in sent["text"]
    assert VALID_PAYLOAD["message"] in sent["text"]


# -- error paths --------------------------------------------------------------


async def test_contact_returns_502_on_resend_4xx(
    client: AsyncClient, mock_resend: MagicMock
):
    bad = MagicMock()
    bad.status_code = 422
    bad.text = '{"error":"invalid from address"}'
    mock_resend.post.return_value = bad

    response = await client.post("/contact", json=VALID_PAYLOAD)
    assert response.status_code == 502
    assert response.json() == {"detail": "Failed to send email."}


async def test_contact_returns_502_on_network_error(
    client: AsyncClient, mock_resend: MagicMock
):
    mock_resend.post.side_effect = RequestError("connection refused")

    response = await client.post("/contact", json=VALID_PAYLOAD)
    assert response.status_code == 502
    assert response.json() == {"detail": "Failed to send email."}


# -- rate limiting ------------------------------------------------------------


async def test_contact_rate_limit_blocks_sixth_request(
    client: AsyncClient, mock_resend: MagicMock
):
    """The endpoint allows 5 requests per hour per IP; the 6th must 429."""
    for i in range(5):
        response = await client.post("/contact", json=VALID_PAYLOAD)
        assert response.status_code == 204, (
            f"request {i + 1} should succeed, got {response.status_code}: "
            f"{response.text}"
        )

    response = await client.post("/contact", json=VALID_PAYLOAD)
    assert response.status_code == 429
    # Resend was called exactly 5 times — the 6th never reached the handler.
    assert mock_resend.post.await_count == 5

    # The error body should advertise the limit.
    body = response.json() if response.text else {}
    # slowapi's default error shape: {"error": "Rate limit exceeded: 5 per 1 hour"}
    error_text = json.dumps(body)
    assert "5" in error_text and "hour" in error_text.lower()
