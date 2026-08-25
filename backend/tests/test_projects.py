from unittest.mock import AsyncMock, patch

import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.limiter import limiter
from app.models.project import Project


@pytest_asyncio.fixture(autouse=True)
async def reset_rate_limiter():
    """Slowapi keeps its counters in process memory; clear them between tests
    so a per-hour limit doesn't leak across cases."""
    limiter.reset()
    yield
    limiter.reset()


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


# -- image upload / delete ----------------------------------------------------


async def test_upload_image_requires_admin_secret(client: AsyncClient):
    response = await client.put(
        "/projects/my-project/image",
        files={"file": ("cover.jpg", b"data", "image/jpeg")},
    )
    assert response.status_code == 401


async def test_upload_image_rejects_wrong_admin_secret(client: AsyncClient):
    response = await client.put(
        "/projects/my-project/image",
        files={"file": ("cover.jpg", b"data", "image/jpeg")},
        headers={"X-Admin-Secret": "not-the-secret"},
    )
    assert response.status_code == 401


async def test_upload_image_not_found(client: AsyncClient):
    with patch(
        "app.routes.project.upload_project_image",
        new=AsyncMock(return_value="https://pub-test.r2.dev/projects/x/1.jpg"),
    ):
        response = await client.put(
            "/projects/nonexistent/image",
            files={"file": ("cover.jpg", b"data", "image/jpeg")},
            headers={"X-Admin-Secret": settings.ADMIN_SECRET},
        )
    assert response.status_code == 404


async def test_upload_image_sets_image_url(
    client: AsyncClient, db_session: AsyncSession
):
    db_session.add(
        Project(
            slug="my-project",
            title_en="A",
            title_pt="A",
            short_description_en="d",
            short_description_pt="d",
        )
    )
    await db_session.flush()

    new_url = "https://pub-test.r2.dev/projects/my-project/new.jpg"
    with patch(
        "app.routes.project.upload_project_image",
        new=AsyncMock(return_value=new_url),
    ) as mock_upload:
        response = await client.put(
            "/projects/my-project/image",
            files={"file": ("cover.jpg", b"data", "image/jpeg")},
            headers={"X-Admin-Secret": settings.ADMIN_SECRET},
        )

    assert response.status_code == 200
    assert response.json()["image_url"] == new_url
    mock_upload.assert_awaited_once()


async def test_upload_image_deletes_previous_image(
    client: AsyncClient, db_session: AsyncSession
):
    old_url = "https://pub-test.r2.dev/projects/my-project/old.jpg"
    db_session.add(
        Project(
            slug="my-project",
            title_en="A",
            title_pt="A",
            short_description_en="d",
            short_description_pt="d",
            image_url=old_url,
        )
    )
    await db_session.flush()

    new_url = "https://pub-test.r2.dev/projects/my-project/new.jpg"
    with (
        patch(
            "app.routes.project.upload_project_image",
            new=AsyncMock(return_value=new_url),
        ),
        patch(
            "app.routes.project.delete_project_image", new=AsyncMock()
        ) as mock_delete,
    ):
        response = await client.put(
            "/projects/my-project/image",
            files={"file": ("cover.jpg", b"data", "image/jpeg")},
            headers={"X-Admin-Secret": settings.ADMIN_SECRET},
        )

    assert response.status_code == 200
    mock_delete.assert_awaited_once_with(old_url)


async def test_delete_image_requires_admin_secret(client: AsyncClient):
    response = await client.delete("/projects/my-project/image")
    assert response.status_code == 401


async def test_delete_image_not_found(client: AsyncClient):
    response = await client.delete(
        "/projects/nonexistent/image",
        headers={"X-Admin-Secret": settings.ADMIN_SECRET},
    )
    assert response.status_code == 404


async def test_delete_image_clears_image_url(
    client: AsyncClient, db_session: AsyncSession
):
    db_session.add(
        Project(
            slug="my-project",
            title_en="A",
            title_pt="A",
            short_description_en="d",
            short_description_pt="d",
            image_url="https://pub-test.r2.dev/projects/my-project/old.jpg",
        )
    )
    await db_session.flush()

    with patch(
        "app.routes.project.delete_project_image", new=AsyncMock()
    ) as mock_delete:
        response = await client.delete(
            "/projects/my-project/image",
            headers={"X-Admin-Secret": settings.ADMIN_SECRET},
        )

    assert response.status_code == 204
    mock_delete.assert_awaited_once()

    get_response = await client.get("/projects/my-project")
    assert get_response.json()["image_url"] is None


async def test_delete_image_noop_when_no_image(
    client: AsyncClient, db_session: AsyncSession
):
    db_session.add(
        Project(
            slug="my-project",
            title_en="A",
            title_pt="A",
            short_description_en="d",
            short_description_pt="d",
        )
    )
    await db_session.flush()

    with patch(
        "app.routes.project.delete_project_image", new=AsyncMock()
    ) as mock_delete:
        response = await client.delete(
            "/projects/my-project/image",
            headers={"X-Admin-Secret": settings.ADMIN_SECRET},
        )

    assert response.status_code == 204
    mock_delete.assert_not_called()
