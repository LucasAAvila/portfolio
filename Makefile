.PHONY: help install install-backend install-frontend verify \
        up up-d down build logs logs-backend \
        shell migrate migration seed \
        lint-backend type-backend test-backend \
        dev-frontend lint-frontend format-frontend typecheck-frontend test-frontend build-frontend \
        lint clean

BACKEND = portfolio-backend-1
FRONTEND = portfolio-frontend-1

help: ## Show this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} \
	  /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2 } \
	  /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' $(MAKEFILE_LIST)

##@ Setup
install: install-backend install-frontend ## Install all deps and pre-commit hooks
	pre-commit install

install-backend: ## Install backend deps via uv
	cd backend && uv sync

install-frontend: ## Install frontend deps via npm
	cd frontend && npm ci

verify: lint-backend type-backend lint-frontend typecheck-frontend test-frontend build-frontend ## Run static checks + frontend tests + frontend build (no docker required)
	@echo
	@echo "Static checks done. Run 'make test-backend' separately (needs 'make up-d')."

##@ Docker
up: ## Start all services
	docker compose up

up-d: ## Start all services in background
	docker compose up -d

down: ## Stop all services
	docker compose down

build: ## Rebuild images from scratch
	docker compose build --no-cache

logs: ## Tail logs for all services
	docker compose logs -f

logs-backend: ## Tail backend logs only
	docker compose logs -f backend

##@ Backend
shell: ## Open a shell in the backend container
	docker compose exec backend bash

migrate: ## Apply pending Alembic migrations
	docker compose exec backend alembic upgrade head

migration: ## Generate a new migration (usage: make migration name="description")
	docker compose exec backend alembic revision --autogenerate -m "$(name)"

seed: ## Seed the database with sample data
	docker compose exec backend python -m app.seed

lint-backend: ## Lint and format-check the backend with ruff
	cd backend && uv run ruff check . && uv run ruff format --check .

type-backend: ## Type-check the backend with mypy
	cd backend && uv run mypy app

test-backend: ## Run the backend test suite
	docker compose exec backend pytest

##@ Frontend
dev-frontend: ## Run the frontend outside Docker (local dev)
	cd frontend && npm run dev

lint-frontend: ## Lint the frontend
	cd frontend && npm run lint

format-frontend: ## Format the frontend with Prettier
	cd frontend && npm run format

typecheck-frontend: ## Typecheck the frontend
	cd frontend && npm run typecheck

test-frontend: ## Run frontend tests (Vitest)
	cd frontend && npm test

build-frontend: ## Build the frontend
	cd frontend && npm run build

##@ Quality
lint: lint-backend lint-frontend ## Lint both backend and frontend

##@ Utilities
clean: ## Remove containers, volumes, and orphan images
	docker compose down -v --remove-orphans
