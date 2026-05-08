"""convert_status_and_level_to_enums

Revision ID: e7f3a2c1b4d5
Revises: c14af86c06ab
Create Date: 2026-04-29 12:00:00.000000

Converts `projects.status` and `skills.level` from `varchar` to native
PostgreSQL enum types so the database itself rejects invalid values.
"""

from typing import Sequence, Union

from alembic import op

revision: str = "e7f3a2c1b4d5"
down_revision: Union[str, Sequence[str], None] = "c14af86c06ab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "CREATE TYPE project_status AS ENUM ('active', 'in_progress', 'archived')"
    )
    op.execute("CREATE TYPE skill_level AS ENUM ('daily', 'learning')")
    op.execute(
        "ALTER TABLE projects "
        "ALTER COLUMN status TYPE project_status USING status::project_status"
    )
    op.execute(
        "ALTER TABLE skills "
        "ALTER COLUMN level TYPE skill_level USING level::skill_level"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE projects ALTER COLUMN status TYPE varchar")
    op.execute("ALTER TABLE skills ALTER COLUMN level TYPE varchar")
    op.execute("DROP TYPE project_status")
    op.execute("DROP TYPE skill_level")
