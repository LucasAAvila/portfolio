# Lucas Avila — Portfolio

Personal portfolio site built with Next.js and FastAPI, available at **[lucasavila.dev](https://www.lucasavila.dev)**.

→ **Live:** [lucasavila.dev](https://www.lucasavila.dev) · **CV:** [English](frontend/public/CV_Lucas_Avila_Backend_en.pdf) · [Português](frontend/public/CV_Lucas_Avila_Backend_pt-BR.pdf)

[![ci-backend](https://github.com/LucasAAvila/portfolio/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/LucasAAvila/portfolio/actions/workflows/ci-backend.yml)
[![ci-frontend](https://github.com/LucasAAvila/portfolio/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/LucasAAvila/portfolio/actions/workflows/ci-frontend.yml)
[![codeql](https://github.com/LucasAAvila/portfolio/actions/workflows/codeql.yml/badge.svg)](https://github.com/LucasAAvila/portfolio/actions/workflows/codeql.yml)
[![pre-commit](https://github.com/LucasAAvila/portfolio/actions/workflows/pre-commit.yml/badge.svg)](https://github.com/LucasAAvila/portfolio/actions/workflows/pre-commit.yml)
[![License: MIT](https://img.shields.io/github/license/LucasAAvila/portfolio)](LICENSE)

---

## Why this repository exists

A static portfolio is easy to build and easy to dismiss. This repository is itself the technical demonstration: it shows the stack I want to be hired to work with — async Python backend, modern Next.js, real database, Docker, migrations, tests — running in production at lucasavila.dev. The code, not just the screenshots, is the artifact a recruiter or engineer can review.

## Architecture Decisions

- **FastAPI + async SQLAlchemy 2.0.** Async-first eliminates thread-per-request overhead and matches the I/O-bound workload (DB reads, Resend HTTP calls). Pydantic v2 enforces request/response contracts at the boundary; route handlers stay thin.
- **PostgreSQL with native enum types.** `Project.status` and `Skill.level` are PG enums, so invalid values are rejected by the database — not just the application layer. Schema changes go through Alembic.
- **Next.js 16 App Router, server-first.** Pages are server components by default; only the navbar and contact form are client-side. ISR (`revalidate: 3600`, cache tags) plus an on-demand `POST /api/revalidate` webhook keeps content fresh without rebuilds.
- **next-intl for `en` + `pt-BR`.** Prefix-based routing, `hreflang` alternates, dynamic OG images per locale. One codebase, two markets.
- **Zod at the frontend boundary.** Backend responses are parsed with `z.infer`-derived schemas in `frontend/lib/api.ts`. A backend rename surfaces as a typed error in the build, not at runtime in production.
- **Observability built in.** Each backend request gets a 12-char ID propagated via `x-request-id`, surfaced in every log line via a ContextVar. Healthcheck noise is filtered out of access logs.
- **Docker Compose for everything.** One command (`docker compose up`) brings up Postgres + backend + frontend with the same environment locally and in CI.

For per-service architecture, see [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).

---

## Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, next-intl (`en` / `pt-BR`) |
| Backend | FastAPI, Python 3.12, SQLAlchemy 2.0 async, Alembic, Pydantic v2 |
| Database | PostgreSQL 16 |
| Infrastructure | Docker Compose, uv (Python), Node 20 |

---

## Getting Started

**Prerequisites:** Docker and Docker Compose installed.

```bash
# 1. Clone the repo
git clone https://github.com/LucasAAvila/portfolio.git
cd portfolio

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 3. Start all services
docker compose up

# 4. Run migrations
docker compose exec backend alembic upgrade head

# 5. Seed the database
docker compose exec backend python -m app.seed
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

---

## Project Structure

```
portfolio/
├── backend/                  # FastAPI application — see backend/README.md
│   ├── app/
│   │   ├── core/             # Config, database, enums, logging, middleware, rate limiter
│   │   ├── models/           # SQLAlchemy ORM models (Project, Skill)
│   │   ├── schemas/          # Pydantic v2 schemas
│   │   ├── routes/           # API routers
│   │   ├── main.py           # FastAPI app entry point
│   │   └── seed.py           # Database seed script
│   ├── alembic/              # Database migrations
│   └── tests/                # pytest integration tests
├── frontend/                 # Next.js application — see frontend/README.md
│   ├── app/                  # App Router (Next.js 16) + manifest, icons, sitemap, robots
│   ├── components/           # Shared UI components
│   ├── lib/                  # API client (Zod-validated), shared config, utilities
│   ├── messages/             # i18n translations (en.json, pt-BR.json)
│   └── i18n/                 # next-intl routing config
├── .github/                  # Dependabot, CODEOWNERS, PR template
├── docker-compose.yml
└── .env.example
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check → `{"status": "ok"}` |
| GET | `/projects` | List all projects (optional `?featured=true`) |
| GET | `/projects/{slug}` | Single project by slug |
| GET | `/skills` | Skills grouped by category |
| POST | `/contact` | Send contact email (rate-limited: 5/hour) |

---

## Tests

```bash
# Backend (pytest, hits a real Postgres test database)
docker compose exec backend pytest

# Frontend (Vitest + React Testing Library)
cd frontend && npm test

# Frontend type check
cd frontend && npm run typecheck
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql+asyncpg://...`) |
| `RESEND_API_KEY` | API key from [Resend](https://resend.com) |
| `RESEND_FROM_EMAIL` | Sender email address |
| `CONTACT_TO_EMAIL` | Recipient email(s). JSON array (`["a@b.com"]`) or comma-separated (`a@b.com,c@d.com`) |
| `CORS_ORIGINS` | Allowed origins. JSON array or comma-separated |
| `NEXT_PUBLIC_API_URL` | Backend base URL the frontend calls at runtime |
| `REVALIDATION_SECRET` | Shared secret for `POST /api/revalidate` (sent as `x-revalidate-secret` header) |

---

## CI/CD

Every PR runs five GitHub Actions workflows in parallel — see [`.github/workflows/`](.github/workflows/):

| Workflow | What it gates |
|---|---|
| [`ci-backend`](.github/workflows/ci-backend.yml) | ruff (lint + format), mypy, pytest with a Postgres 16 service container, coverage artifact |
| [`ci-frontend`](.github/workflows/ci-frontend.yml) | eslint, prettier, `tsc --noEmit`, vitest, `next build` |
| [`pre-commit`](.github/workflows/pre-commit.yml) | runs the same hooks as locally so config can't drift |
| [`dependency-review`](.github/workflows/dependency-review.yml) | blocks new GPL/AGPL deps and high-severity CVEs |
| [`codeql`](.github/workflows/codeql.yml) | static security analysis for Python + JS/TS, weekly + on PR |

Path filters scope frontend PRs to frontend jobs and vice versa. Concurrency groups cancel superseded runs on the same PR. Dependabot covers npm, uv, github-actions, and Docker base images. Local development mirrors CI via `make verify` — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Deployment & operations

- **Frontend** ships to **Vercel** via its native git integration: every PR gets a preview URL, `main` auto-deploys to production. The frontend Dockerfile (`output: standalone`) exists for portability and parity testing, not as the production runtime.
- **Backend** ships to **Railway** from `main`, also via git integration. Migrations run at container start (`backend/start.sh`); the multi-stage Dockerfile runs as a non-root user with a `/health` healthcheck.
- **Database**: Railway-managed Postgres 16. Schema changes go through Alembic.
- **No staging environment.** With one author and a low-stakes site, a permanently-empty staging URL would be theatre. Vercel preview deploys cover the only PR-time signal that actually matters; the `ci-backend` Postgres-service test job covers the rest.
- **Secrets** live in Railway and Vercel project settings — never in GitHub Actions. CI does not deploy.

## License

[MIT](LICENSE)
