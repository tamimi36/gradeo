@echo off
echo Starting Celery Worker for OCR Processing...
echo.
echo Make sure Redis is running on port 6379 before starting this!
echo.
celery -A celery_worker.celery worker --loglevel=info --pool=solo -Q ocr_queue,default
