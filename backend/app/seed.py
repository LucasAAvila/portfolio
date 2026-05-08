import asyncio

from sqlalchemy import text

from app.core.database import AsyncSessionLocal
from app.core.enums import ProjectStatus, SkillLevel
from app.models.project import Project
from app.models.skill import Skill


async def seed():
    async with AsyncSessionLocal() as db:
        await db.execute(text("TRUNCATE projects, skills RESTART IDENTITY CASCADE"))

        PROJECTS = [
            Project(
                slug="expense-tracker",
                title_en="Expense Tracker",
                title_pt="Controle de Gastos",
                short_description_en="Multi-account personal finance app with JWT auth, MFA/TOTP, and async SQLAlchemy.",
                short_description_pt="App de finanças pessoais com múltiplas contas, autenticação JWT, MFA/TOTP e SQLAlchemy async.",
                long_description_en=(
                    "**Problem:** Needed a personal finance tracker capable of handling multiple accounts and "
                    "concurrent requests without the thread contention issues common in sync ORM setups.\n\n"
                    "**Decision:** Chose async SQLAlchemy 2.0 over the sync ORM — the async engine eliminates "
                    "thread-per-request overhead, which matters for a financial app where multiple sessions may "
                    "write simultaneously. Implemented MFA/TOTP (via pyotp) on top of JWT after identifying that "
                    "token-only auth was insufficient for an app storing financial data. Chose bcrypt for password "
                    "hashing over alternatives for its built-in work factor tuning.\n\n"
                    "**Result:** Full-stack app deployed on Railway (backend) and Vercel (frontend) with sub-100ms "
                    "API response times. Auth flow covers registration, login, JWT refresh, and TOTP enrollment/verification."
                ),
                long_description_pt=(
                    "**Problema:** Precisava de um app de finanças pessoais capaz de lidar com múltiplas contas e "
                    "requisições concorrentes sem os problemas de contenção de threads comuns em ORMs síncronos.\n\n"
                    "**Decisão:** Escolhi SQLAlchemy 2.0 async em vez do ORM síncrono — o engine async elimina o overhead "
                    "de thread-por-request, relevante para um app financeiro onde múltiplas sessões podem escrever "
                    "simultaneamente. Implementei MFA/TOTP (via pyotp) sobre JWT ao identificar que auth só por token "
                    "era insuficiente para um app com dados financeiros. Escolhi bcrypt pelo controle nativo do work factor.\n\n"
                    "**Resultado:** App full-stack em produção no Railway (backend) e Vercel (frontend) com tempos de "
                    "resposta abaixo de 100ms. Fluxo de auth cobre cadastro, login, refresh de JWT e enrollment/verificação TOTP."
                ),
                tech_stack=[
                    "Python",
                    "FastAPI",
                    "SQLAlchemy",
                    "PostgreSQL",
                    "Alembic",
                    "JWT",
                    "TOTP",
                    "Next.js",
                    "TypeScript",
                    "Tailwind CSS",
                    "Docker",
                    "Railway",
                ],
                live_url="https://app.lucasavila.dev",
                repo_url="https://github.com/LucasAAvila/expense-tracker",
                status=ProjectStatus.ACTIVE,
                featured=True,
                order=1,
            ),
            Project(
                slug="portfolio",
                title_en="Portfolio",
                title_pt="Portfólio",
                short_description_en="This portfolio — built with FastAPI, async SQLAlchemy, Next.js 16, and next-intl for en/pt-BR.",
                short_description_pt="Este portfólio — construído com FastAPI, SQLAlchemy async, Next.js 16 e next-intl para en/pt-BR.",
                long_description_en=(
                    "**Problem:** Needed a portfolio that itself serves as a technical signal — not just a list of projects, "
                    "but a live demonstration of the stack I want to be hired to work with.\n\n"
                    "**Decision:** Built a full backend (FastAPI + async SQLAlchemy + PostgreSQL on Neon) instead of a "
                    "static site or headless CMS. This makes the repository itself evaluable code, not just a showcase. "
                    "Chose next-intl for i18n to serve both English-speaking international recruiters (default) and "
                    "Portuguese-speaking Brazilian market without duplicating routes.\n\n"
                    "**Result:** Public repository at github.com/LucasAAvila/portfolio demonstrates async Python backend, "
                    "Pydantic v2 schemas, Alembic migrations, Docker, and Next.js App Router — all in production."
                ),
                long_description_pt=(
                    "**Problema:** Precisava de um portfólio que fosse em si mesmo um sinal técnico — não apenas uma lista "
                    "de projetos, mas uma demonstração em produção do stack que quero usar profissionalmente.\n\n"
                    "**Decisão:** Construí um backend completo (FastAPI + SQLAlchemy async + PostgreSQL no Neon) em vez de "
                    "um site estático ou headless CMS. Isso torna o repositório código avaliável, não apenas vitrine. "
                    "Escolhi next-intl para i18n para atender recrutadores internacionais (inglês como padrão) e o mercado "
                    "brasileiro sem duplicar rotas.\n\n"
                    "**Resultado:** Repositório público em github.com/LucasAAvila/portfolio demonstra backend Python async, "
                    "schemas Pydantic v2, migrations Alembic, Docker e Next.js App Router — tudo em produção."
                ),
                tech_stack=[
                    "Python",
                    "FastAPI",
                    "SQLAlchemy",
                    "PostgreSQL",
                    "Alembic",
                    "Next.js",
                    "TypeScript",
                    "Tailwind CSS",
                    "next-intl",
                    "Docker",
                    "Railway",
                    "Vercel",
                ],
                live_url="https://www.lucasavila.dev",
                repo_url="https://github.com/LucasAAvila/portfolio",
                status=ProjectStatus.ACTIVE,
                featured=True,
                order=2,
            ),
        ]
        db.add_all(PROJECTS)

        SKILLS = [
            # Backend
            Skill(
                name="Python", category="backend", level=SkillLevel.DAILY, visible=True, order=1
            ),
            Skill(
                name="FastAPI", category="backend", level=SkillLevel.DAILY, visible=True, order=2
            ),
            Skill(
                name="SQLAlchemy",
                category="backend",
                level=SkillLevel.DAILY,
                visible=True,
                order=3,
            ),
            Skill(
                name="Pydantic",
                category="backend",
                level=SkillLevel.DAILY,
                visible=True,
                order=4,
            ),
            Skill(
                name="Alembic", category="backend", level=SkillLevel.DAILY, visible=True, order=5
            ),
            Skill(
                name="Odoo", category="backend", level=SkillLevel.DAILY, visible=True, order=6
            ),
            # Frontend
            Skill(
                name="Next.js",
                category="frontend",
                level=SkillLevel.LEARNING,
                visible=True,
                order=1,
            ),
            Skill(
                name="TypeScript",
                category="frontend",
                level=SkillLevel.LEARNING,
                visible=True,
                order=2,
            ),
            Skill(
                name="React",
                category="frontend",
                level=SkillLevel.LEARNING,
                visible=True,
                order=3,
            ),
            Skill(
                name="Tailwind CSS",
                category="frontend",
                level=SkillLevel.LEARNING,
                visible=True,
                order=4,
            ),
            # Databases
            Skill(
                name="PostgreSQL",
                category="databases",
                level=SkillLevel.DAILY,
                visible=True,
                order=1,
            ),
            # Infra
            Skill(
                name="Docker", category="infra", level=SkillLevel.DAILY, visible=True, order=1
            ),
            Skill(name="Git", category="infra", level=SkillLevel.DAILY, visible=True, order=2),
            Skill(name="Linux", category="infra", level=SkillLevel.DAILY, visible=True, order=3),
            Skill(
                name="Railway",
                category="infra",
                level=SkillLevel.LEARNING,
                visible=True,
                order=4,
            ),
            Skill(
                name="Vercel", category="infra", level=SkillLevel.LEARNING, visible=True, order=5
            ),
            Skill(
                name="Cloudflare",
                category="infra",
                level=SkillLevel.LEARNING,
                visible=True,
                order=6,
            ),
            Skill(
                name="GitHub Actions",
                category="infra",
                level=SkillLevel.LEARNING,
                visible=True,
                order=7,
            ),
        ]
        db.add_all(SKILLS)

        await db.commit()
    print("Projects and skills seeded successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
