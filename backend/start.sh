#!/bin/bash
set -e

echo "Running migrations..."
alembic upgrade head

# Single uvicorn worker is sufficient for the read-heavy public traffic this
# portfolio receives. To scale, set WEB_CONCURRENCY in the platform env (Railway
# / Fly / etc.) and uvicorn will pick it up; or pass --workers explicitly here.
echo "Starting server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers --forwarded-allow-ips="*"
