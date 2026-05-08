# Contributing

Thanks for taking the time to look. This is a personal portfolio repository, so external PRs are unlikely to be merged, but the development workflow is documented here so it's reproducible.

## Local setup

Prerequisites: Docker + Docker Compose, Node 20, Python 3.12, [`uv`](https://docs.astral.sh/uv/), and [`pre-commit`](https://pre-commit.com).

```bash
git clone https://github.com/LucasAAvila/portfolio.git
cd portfolio
cp .env.example .env

make install   # backend (uv sync) + frontend (npm ci) + pre-commit install
make up-d      # bring up Postgres + backend + frontend
make migrate
make seed
```

## Branching model

Trunk-based:

- `main` is the only long-lived branch and is protected.
- Feature branches live under `feat/<topic>`, `fix/<topic>`, or `chore/<topic>`.
- PRs squash-merge into `main`. Linear history is enforced.

Direct pushes to `main` and force-pushes to any branch backed by a PR are rejected by branch protection.

## Commit style

Lightweight Conventional Commits: `type(scope): subject` in imperative mood.

```
feat(frontend): add language picker to navbar
fix(backend): reject CRLF in contact name
chore(github-actions): bump actions/checkout to v5
docs(readme): document deployment topology
```

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`.

The format is documented but not enforced by a linter. Dependabot and CI use it consistently.

Commits to `main` should be GPG- or SSH-signed. Configure once with `git config commit.gpgsign true` (and the matching `user.signingkey`).

## Running checks before pushing

`make verify` runs the static checks and frontend tests/build locally — it mirrors what CI runs, except for backend pytest which needs a live Postgres:

```bash
make up-d
make verify        # ruff + mypy + eslint + prettier + tsc + vitest + next build
make test-backend  # pytest against the docker compose Postgres
```

The same logic runs in [`.github/workflows/`](.github/workflows/). Six workflows gate `main`:

| Workflow | What it checks |
|---|---|
| `ci-backend` | ruff (lint + format), mypy, pytest (with a Postgres 16 service container), coverage artifact |
| `ci-frontend` | eslint, prettier, tsc, vitest, `next build` |
| `pre-commit` | runs the same `.pre-commit-config.yaml` hooks as locally |
| `dependency-review` | blocks new GPL/AGPL deps and high-severity CVEs introduced by a PR |
| `codeql` | static security analysis (Python + JS/TS), weekly schedule + on PR |
| `dependabot` (managed) | weekly bumps for npm, uv, github-actions, docker |

## Workflow conventions

- Path filters keep frontend changes from running backend jobs and vice versa.
- Concurrency groups cancel superseded runs on the same PR.
- First-party actions (`actions/*`, `github/codeql-action`, `astral-sh/setup-uv`) use major-version tags. Third-party actions, when introduced, are pinned to a commit SHA.
- Production secrets live in Railway (backend) and Vercel (frontend), not in GitHub Actions. Deploys happen via each platform's git integration; no deploy step is shipped from CI.

## Code style

- **Backend**: `ruff check` + `ruff format`, mypy with `check_untyped_defs`. New code adds full type annotations; existing untyped surface area is being typed gradually.
- **Frontend**: `eslint` (`next/core-web-vitals` + `next/typescript` + prettier) + `tsc --noEmit` strict mode. `console.log` is a warning; `console.error`/`console.warn` are allowed.

## Filing an issue

For bugs or questions, open a GitHub issue with enough context to reproduce. Security issues go through GitHub's private vulnerability reports — see [`SECURITY.md`](SECURITY.md).
