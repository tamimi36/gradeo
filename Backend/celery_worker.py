#!/usr/bin/env python
"""
Celery Worker Entry Point

Run with:
    celery -A celery_worker.celery worker --loglevel=info --pool=solo -Q ocr_queue,default

Windows users should use --pool=solo instead of default pool
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from app import create_app
from app.services.tasks import ocr_tasks

# Create Flask app to initialize Celery with app context
app = create_app()

# Get the celery instance (it's set in app module during create_app)
from app import celery

# Register tasks
celery.task(name='app.services.tasks.ocr_tasks.process_submission_ocr')(ocr_tasks.process_submission_ocr)
celery.task(name='app.services.tasks.ocr_tasks.process_single_page_ocr')(ocr_tasks.process_single_page_ocr)

if __name__ == '__main__':
    celery.start()
