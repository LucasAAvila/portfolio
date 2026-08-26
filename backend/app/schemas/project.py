from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.enums import ProjectStatus


class ProjectRead(BaseModel):
    id: int
    slug: str
    title_en: str
    title_pt: str
    short_description_en: str
    short_description_pt: str
    long_description_en: str | None
    long_description_pt: str | None
    tech_stack: list[str]
    image_url: str | None
    live_url: str | None
    repo_url: str | None
    status: ProjectStatus
    featured: bool
    order: int
    create_date: datetime
    write_date: datetime

    model_config = ConfigDict(from_attributes=True)
