"""
Initialize Analytics Database Tables
Run this once to create new analytics tables
"""

from app import create_app, db
from config import config
import os

# Create app
env = os.getenv('FLASK_ENV', 'development')
app = create_app(config.get(env, config['default']))

with app.app_context():
    # Import all models to ensure they're registered
    from app.models.analytics import (
        QuestionTopic, QuestionDifficulty, Cohort, CohortMember,
        StudentProgress, Misconception, AIAnalysisCache
    )

    # Create all new tables
    print("Creating analytics tables...")
    db.create_all()
    print("✓ Analytics tables created successfully!")

    # Verify tables were created
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()

    analytics_tables = [
        'question_topics',
        'question_difficulties',
        'cohorts',
        'cohort_members',
        'student_progress',
        'misconceptions',
        'ai_analysis_cache'
    ]

    print("\nVerifying tables:")
    for table in analytics_tables:
        if table in tables:
            print(f"✓ {table}")
        else:
            print(f"✗ {table} - NOT FOUND")

    print("\nDone!")
