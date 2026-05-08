from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Skill
from app.schemas.skill import SkillRead

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=dict[str, list[SkillRead]])
async def list_skills(response: Response, db: AsyncSession = Depends(get_db)):
    response.headers["Cache-Control"] = (
        "public, s-maxage=3600, stale-while-revalidate=86400"
    )
    result = await db.execute(select(Skill).where(Skill.visible).order_by(Skill.order))
    skills = result.scalars().all()

    grouped: dict[str, list[SkillRead]] = {}
    for skill in skills:
        grouped.setdefault(skill.category, []).append(SkillRead.model_validate(skill))
    return grouped
