"""
Celery Configuration for Flask App
"""
from celery import Celery, Task
from kombu import Queue


def make_celery(app):
    """
    Create Celery instance integrated with Flask app context

    Args:
        app: Flask application instance

    Returns:
        Configured Celery instance
    """
    celery = Celery(
        app.import_name,
        broker=app.config.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
        backend=app.config.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    )

    # Update celery config from Flask config
    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        task_track_started=True,
        task_time_limit=600,  # 10 minutes max per task
        task_soft_time_limit=540,  # 9 minutes soft limit
        task_acks_late=True,  # Acknowledge task after completion (for reliability)
        worker_prefetch_multiplier=1,  # Don't prefetch multiple tasks
        task_routes={
            'app.services.tasks.ocr_tasks.process_submission_ocr': {'queue': 'ocr_queue'},
            'app.services.tasks.ocr_tasks.process_single_page_ocr': {'queue': 'ocr_queue'},
        },
        task_default_queue='default',
        task_queues=(
            Queue('default', routing_key='default'),
            Queue('ocr_queue', routing_key='ocr'),
        )
    )

    # Configure retry policy
    celery.conf.task_annotations = {
        'app.services.tasks.ocr_tasks.process_submission_ocr': {
            'rate_limit': '10/m',  # Max 10 OCR tasks per minute (API quota)
            'max_retries': 3,
            'default_retry_delay': 60,  # 1 minute between retries
        }
    }

    class ContextTask(Task):
        """Make celery tasks work with Flask app context"""
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


# Global celery instance (will be initialized in create_app)
celery = None
