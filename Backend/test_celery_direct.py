"""
Test Celery Task Dispatching Directly
"""
from app import create_app

# Create Flask app to get celery instance
app = create_app()

# Get celery instance
from app import celery

print("Celery broker:", celery.conf.broker_url)
print("Celery backend:", celery.conf.result_backend)
print("Task routes:", celery.conf.task_routes)

# Try to dispatch task
task = celery.send_task(
    'app.services.tasks.ocr_tasks.process_submission_ocr',
    args=[3],
    queue='ocr_queue'
)

print(f"\nDispatched task: {task.id}")
print(f"Task name: {task.name}")
print(f"Task state: {task.state}")

# Check task status
import time
for i in range(10):
    time.sleep(2)
    print(f"After {(i+1)*2}s - Task state: {task.state}")
    if task.state in ['SUCCESS', 'FAILURE']:
        break

if task.state == 'SUCCESS':
    print(f"\nTask completed successfully!")
    print(f"Result: {task.result}")
elif task.state == 'FAILURE':
    print(f"\nTask failed!")
    print(f"Error: {task.info}")
else:
    print(f"\nTask still {task.state}")
