import asyncpg
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app

TEST_DB = "portfolio_test"
TEST_DATABASE_URL = settings.DATABASE_URL.rsplit("/", 1)[0] + f"/{TEST_DB}"


@pytest.fixture(scope="session")
def event_loop_policy():
    import asyncio

    return asyncio.DefaultEventLoopPolicy()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    admin_url = settings.DATABASE_URL.rsplit("/", 1)[0] + "/postgres"
    conn = await asyncpg.connect(admin_url.replace("+asyncpg", ""))
    try:
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", TEST_DB
        )
        if not exists:
            await conn.execute(f'CREATE DATABASE "{TEST_DB}"')
    finally:
        await conn.close()

    engine = create_async_engine(url=TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def clean_tables():
    yield
    raw_url = TEST_DATABASE_URL.replace("+asyncpg", "")
    conn = await asyncpg.connect(raw_url)
    try:
        await conn.execute("TRUNCATE TABLE projects, skills CASCADE")
    finally:
        await conn.close()


@pytest_asyncio.fixture()
async def db_session(test_engine):
    session_factory = async_sessionmaker(
        bind=test_engine, expire_on_commit=False, class_=AsyncSession
    )
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture()
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()
