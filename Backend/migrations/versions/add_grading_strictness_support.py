"""Add grading strictness support to answer keys

Revision ID: add_grading_strictness_001
Revises: 88b7fa1db830
Create Date: 2025-12-08 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_grading_strictness_001'
down_revision = '88b7fa1db830'
branch_labels = None
depends_on = None


def upgrade():
    # Add grading enhancement columns to answer_keys table
    with op.batch_alter_table('answer_keys', schema=None) as batch_op:
        # Strictness level: 'lenient', 'normal', 'strict'
        batch_op.add_column(sa.Column('strictness_level', sa.String(length=20), nullable=False, server_default='normal'))
        # Keywords for open-ended grading (JSON array)
        batch_op.add_column(sa.Column('keywords', sa.JSON(), nullable=True))
        # Additional notes/hints from teacher
        batch_op.add_column(sa.Column('additional_notes', sa.Text(), nullable=True))

    # Add grading confidence columns to submission_answers table
    with op.batch_alter_table('submission_answers', schema=None) as batch_op:
        batch_op.add_column(sa.Column('grading_confidence', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('similarity_score', sa.Float(), nullable=True))

    # Add priority column to review_queue table
    with op.batch_alter_table('review_queue', schema=None) as batch_op:
        # Priority: 'high' (must review), 'low' (suggested review)
        batch_op.add_column(sa.Column('priority', sa.String(length=10), nullable=False, server_default='low'))


def downgrade():
    # Remove columns added in upgrade
    with op.batch_alter_table('review_queue', schema=None) as batch_op:
        batch_op.drop_column('priority')

    with op.batch_alter_table('submission_answers', schema=None) as batch_op:
        batch_op.drop_column('similarity_score')
        batch_op.drop_column('grading_confidence')

    with op.batch_alter_table('answer_keys', schema=None) as batch_op:
        batch_op.drop_column('additional_notes')
        batch_op.drop_column('keywords')
        batch_op.drop_column('strictness_level')
