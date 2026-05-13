"""add_image_url_to_projects

Revision ID: a3f9c2e1d7b8
Revises: e7f3a2c1b4d5
Create Date: 2026-05-13 00:00:00.000000

Adds a nullable `image_url` column to the `projects` table to store the
public Cloudflare R2 URL for each project's cover image.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a3f9c2e1d7b8"
down_revision: Union[str, Sequence[str], None] = "e7f3a2c1b4d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("projects", sa.Column("image_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("projects", "image_url")
