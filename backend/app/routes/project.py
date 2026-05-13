from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectRead
from app.services.storage import delete_project_image, upload_project_image

router = APIRouter(prefix="/projects", tags=["projects"])


def _require_admin(x_admin_secret: str | None = Header(default=None)) -> None:
    if not x_admin_secret or x_admin_secret != settings.ADMIN_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
        )


async def _get_project_or_404(slug: str, db: AsyncSession) -> Project:
    result = await db.execute(select(Project).where(Project.slug == slug))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found."
        )
    return project


@router.get("", response_model=list[ProjectRead])
async def list_projects(
    response: Response,
    featured: bool | None = None,
    db: AsyncSession = Depends(get_db),
):
    response.headers["Cache-Control"] = (
        "public, s-maxage=3600, stale-while-revalidate=86400"
    )
    query = select(Project).order_by(Project.order)
    if featured is not None:
        query = query.where(Project.featured == featured)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{slug}", response_model=ProjectRead)
async def get_project(slug: str, db: AsyncSession = Depends(get_db)):
    return await _get_project_or_404(slug, db)


@router.put(
    "/{slug}/image",
    response_model=ProjectRead,
    dependencies=[Depends(_require_admin)],
)
async def upload_image(
    slug: str,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project_or_404(slug, db)

    old_url = project.image_url
    project.image_url = await upload_project_image(slug, file)
    await db.commit()
    await db.refresh(project)

    if old_url:
        await delete_project_image(old_url)

    return project


@router.delete(
    "/{slug}/image",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(_require_admin)],
)
async def delete_image(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project_or_404(slug, db)

    if project.image_url:
        await delete_project_image(project.image_url)
        project.image_url = None
        await db.commit()
