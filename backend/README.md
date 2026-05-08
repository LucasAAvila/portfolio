# Backend — Portfolio API

FastAPI service that backs [lucasavila.dev](https://www.lucasavila.dev). Serves bilingual project and skill data, and a rate-limited contact endpoint that delivers messages via Resend.

## Stack

- Python 3.12, FastAPI, Uvicorn
- SQLAlchemy 2.0 (async) + asyncpg
- PostgreSQL 16
- Alembic for schema migrations
- Pydantic v2 (`model_config = ConfigDict(from_attributes=True)`)
- slowapi for rate limiting
- httpx (async) as the Resend client
- uv for dependency management

## Setup

The service is designed to run inside Docker Compose from the repo root. See [../README.md](../README.md) for the top-level setup.

```bash
# from the repo root
docker compose up

# in another shell
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seed
```

Swagger UI is served at http://localhost:8000/docs.

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{"status": "ok"}` |
| `GET` | `/projects` | Lists projects. Optional `?featured=true` |
| `GET` | `/projects/{slug}` | Single project by slug (404 if missing) |
| `GET` | `/skills` | Skills grouped by category |
| `POST` | `/contact` | Sends a contact email via Resend (5 req/hour/IP) |

`GET /projects*` and `GET /skills` set `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` so the frontend's ISR layer can cache at the edge.

`POST /contact` accepts:

```json
{ "name": "Jane Doe", "email": "jane@example.com", "message": "Hello…" }
```

and returns `204 No Content` on success, `429 Too Many Requests` when the rate limit is exceeded, or `502 Bad Gateway` if Resend itself fails.

## Project layout

```
backend/
├── app/
│   ├── core/          # config, database, rate limiter
│   ├── models/        # SQLAlchemy ORM models (Project, Skill)
│   ├── schemas/       # Pydantic v2 request/response schemas
│   ├── routes/        # FastAPI routers (health, project, skill, contact)
│   ├── main.py        # FastAPI app + CORS + lifespan-managed httpx client
│   └── seed.py        # idempotent seed script
├── alembic/           # migrations (async-compatible env.py)
└── tests/             # pytest integration tests (real Postgres test DB)
```

## Migrations

```bash
# apply pending migrations
docker compose exec backend alembic upgrade head

# generate a new revision from model changes
docker compose exec backend alembic revision --autogenerate -m "describe change"
```

## Tests

```bash
docker compose exec backend pytest
```

Tests use a dedicated `portfolio_test` database created in `tests/conftest.py`, with a session-scoped fixture that truncates `projects` and `skills` between tests.

## Environment

See [../.env.example](../.env.example). The backend reads:

- `DATABASE_URL` — `postgresql+asyncpg://…`
- `RESEND_API_KEY`, `RESEND_API_URL`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL` — outbound email for `POST /contact`
- `CORS_ORIGINS` — JSON array of allowed origins

## Conventions

- Async SQLAlchemy 2.0 style (`Mapped[...]`, `mapped_column(...)`, `await session.execute(...)`).
- Pydantic v2 response models on every route (`response_model=...`).
- Validation at the boundary — business logic does not live in route handlers.
- The `httpx.AsyncClient` is created in the FastAPI `lifespan` and reused across requests with a 10-second default timeout.
