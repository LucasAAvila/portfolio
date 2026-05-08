from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectRead

router = APIRouter(prefix="/projects", tags=["projects"])


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
    result = await db.execute(select(Project).where(Project.slug == slug))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found."
        )
    return project
