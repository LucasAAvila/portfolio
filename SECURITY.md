# Security Policy

## Supported Versions

Only the current `main` branch is actively maintained. No legacy versions are supported.

| Version | Supported |
|---|---|
| `main` (latest) | ✅ |
| Any previous commit | ❌ |

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.2.2, React 19.2.4, next-intl 4.x, Tailwind CSS 4, TypeScript 5 |
| Backend | FastAPI 0.135+, SQLAlchemy 2.0+, Pydantic 2.12+, Uvicorn 0.42+ |
| Database | PostgreSQL 16 |

## Scope

**In scope:**
- The application itself (frontend pages, API endpoints)
- Data exposure or injection via the `/contact` endpoint
- CORS or header misconfiguration
- Logic flaws in the API (`/projects`, `/skills`, `/contact`)

**Out of scope:**
- Vulnerabilities in third-party dependencies — these are handled automatically by [Dependabot](.github/dependabot.yml)
- Issues requiring physical access to the server
- Social engineering attacks

## Reporting a Vulnerability

**Do not open a public GitHub issue** for security vulnerabilities.

Use GitHub's private vulnerability reporting instead:
👉 [Report a vulnerability](../../security/advisories/new)

This keeps the report confidential until a fix is available.

## Response Timeline

| Stage | Target |
|---|---|
| Acknowledgement | Within 48 hours |
| Status update | Within 5 days |
| Fix for critical issues | Within 7 days |
| Fix for non-critical issues | Best effort |

Thank you for helping keep this project secure.
