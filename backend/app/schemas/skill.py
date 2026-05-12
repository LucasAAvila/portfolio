from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.enums import SkillLevel


class SkillRead(BaseModel):
    id: int
    name: str
    category: str
    level: SkillLevel
    visible: bool
    order: int
    create_date: datetime
    write_date: datetime

    model_config = ConfigDict(from_attributes=True)
