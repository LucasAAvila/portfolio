from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.skill import Skill


async def test_list_skills_empty(client: AsyncClient):
    response = await client.get("/skills")
    assert response.status_code == 200
    assert response.json() == {}


async def test_list_skills_grouped_by_category(
    client: AsyncClient, db_session: AsyncSession
):
    db_session.add_all(
        [
            Skill(name="Python", category="backend", level="daily", order=1),
            Skill(name="FastAPI", category="backend", level="daily", order=20),
            Skill(name="React", category="frontend", level="learning", order=1),
            Skill(name="TypeScript", category="frontend", level="learning", order=10),
        ]
    )
    await db_session.flush()

    response = await client.get("/skills")
    assert response.status_code == 200

    data = response.json()
    assert len(data["backend"]) == 2
    assert len(data["frontend"]) == 2

    assert data["backend"][0]["name"] == "Python"
    assert data["backend"][1]["name"] == "FastAPI"

    assert data["frontend"][0]["name"] == "React"
    assert data["frontend"][1]["name"] == "TypeScript"


async def test_list_skills_hides_invisible(
    client: AsyncClient, db_session: AsyncSession
):
    db_session.add_all(
        [
            Skill(name="Visible", category="backend", level="daily", visible=True),
            Skill(name="Hidden", category="backend", level="daily", visible=False),
        ]
    )
    await db_session.flush()

    response = await client.get("/skills")
    assert response.status_code == 200

    data = response.json()
    names = [s["name"] for s in data.get("backend", [])]
    assert "Visible" in names
    assert "Hidden" not in names
