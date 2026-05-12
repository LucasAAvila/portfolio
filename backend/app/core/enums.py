from enum import StrEnum


class ProjectStatus(StrEnum):
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    ARCHIVED = "archived"


class SkillLevel(StrEnum):
    DAILY = "daily"
    LEARNING = "learning"
