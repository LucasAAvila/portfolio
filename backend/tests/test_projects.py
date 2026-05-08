from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project


async def test_list_projects_empty(client: AsyncClient):
    response = await client.get("/projects")
    assert response.status_code == 200
    assert response.json() == []


async def test_get_project_not_found(client: AsyncClient):
    response = await client.get("/projects/nonexistent")
    assert response.status_code == 404


async def test_list_projects_with_data(client: AsyncClient, db_session: AsyncSession):
    db_session.add_all(
        [
            Project(
                slug="second",
                title_en="B",
                title_pt="B",
                short_description_en="d",
                short_description_pt="d",
                order=2,
            ),
            Project(
                slug="first",
                title_en="A",
                title_pt="A",
                short_description_en="d",
                short_description_pt="d",
                order=1,
            ),
        ]
    )
    await db_session.flush()

    response = await client.get("/projects")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 2
    assert data[0]["slug"] == "first"
    assert data[1]["slug"] == "second"


async def test_list_projects_featured_filter(
    client: AsyncClient, db_session: AsyncSession
):
    db_session.add_all(
        [
            Project(
                slug="feat",
                title_en="F",
                title_pt="F",
                short_description_en="d",
                short_description_pt="d",
                featured=True,
            ),
            Project(
                slug="normal",
                title_en="N",
                title_pt="N",
                short_description_en="d",
                short_description_pt="d",
                featured=False,
            ),
        ]
    )
    await db_session.flush()

    response = await client.get("/projects?featured=true")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]["slug"] == "feat"

    response = await client.get("/projects?featured=false")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]["slug"] == "normal"


async def test_get_project_by_slug(client: AsyncClient, db_session: AsyncSession):
    db_session.add(
        Project(
            slug="my-project",
            title_en="My Project",
            title_pt="Meu Projeto",
            short_description_en="desc",
            short_description_pt="desc",
            tech_stack=["Python", "FastAPI"],
        )
    )
    await db_session.flush()

    response = await client.get("/projects/my-project")
    assert response.status_code == 200

    data = response.json()
    assert data["slug"] == "my-project"
    assert data["tech_stack"] == ["Python", "FastAPI"]
