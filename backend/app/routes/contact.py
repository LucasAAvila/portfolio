import logging

import httpx
from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import settings
from app.core.limiter import limiter
from app.schemas.contact import ContactRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("5/hour")
async def send_contact(request: Request, body: ContactRequest):
    client: httpx.AsyncClient = request.app.state.http_client
    try:
        response = await client.post(
            settings.RESEND_API_URL,
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.RESEND_FROM_EMAIL,
                "to": settings.CONTACT_TO_EMAIL,
                "subject": "Portfolio contact form submission",
                "text": f"From: {body.name} <{body.email}>\n\n{body.message}",
                "reply_to": [body.email],
            },
        )
    except httpx.RequestError as exc:
        logger.exception("Resend request failed (network/transport error)")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send email.",
        ) from exc
    if response.status_code >= 400:
        logger.error(
            "Resend returned %s: %s",
            response.status_code,
            response.text[:500],
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send email.",
        )
    logger.info("Contact email delivered")
