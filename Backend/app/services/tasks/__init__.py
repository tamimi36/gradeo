"""
Celery Tasks Package
"""
from .celery_config import make_celery, celery

__all__ = ['make_celery', 'celery']
