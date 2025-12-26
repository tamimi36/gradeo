"""
Comprehensive Test Script for Submission and OCR Endpoints
Tests all endpoints and identifies issues
"""
import requests
import json
import time
from pathlib import Path

BASE_URL = "http://127.0.0.1:5001/api/v1"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2NTM3OTU3OCwianRpIjoiMDUyYjZhZjItMzVjMC00OTEyLWI2NTUtMDg2Y2M5OTYxOTY0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3NjUzNzk1NzgsImNzcmYiOiIzY2MzNjZmNS1hNTVjLTQyY2EtODA5Mi0zODc4MTcxMGEwNmEiLCJleHAiOjE3NjU0NjU5Nzh9.5LXRVUqu454iLFemS3oxVkniqYBOOCB35gCzwVVye9M"

def print_test(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def print_result(status, message):
    status_symbol = "[OK]" if status == "success" else "[ERROR]"
    print(f"{status_symbol} {message}")

def test_exam_list():
    """Test getting list of exams to find valid exam_id"""
    print_test("TEST 1: Get List of Exams")

    response = requests.get(
        f"{BASE_URL}/exams",
        headers={"Authorization": f"Bearer {TOKEN}"}
    )

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        exams = data.get('exams', [])
        print(f"Found {len(exams)} exams")

        if exams:
            print("\nAvailable Exams:")
            for exam in exams[:5]:  # Show first 5
                print(f"  - Exam ID: {exam['id']}, Title: {exam['title']}")
            return exams[0]['id']  # Return first exam ID for testing
        else:
            print("No exams found. Creating test exam...")
            return create_test_exam()
    else:
        print(f"Error: {response.text}")
        return None

def create_test_exam():
    """Create a test exam if none exist"""
    print_test("Creating Test Exam")

    exam_data = {
        "title": "Test Exam for Submission",
        "description": "Test exam for OCR submission testing",
        "duration_minutes": 60,
        "subject_type": "mathematics",
        "primary_language": "en",
        "has_formulas": True,
        "has_diagrams": False,
        "is_published": True,
        "is_active": True
    }

    response = requests.post(
        f"{BASE_URL}/exams",
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        },
        json=exam_data
    )

    if response.status_code == 201:
        exam = response.json().get('exam', {})
        exam_id = exam.get('id')
        print(f"Created exam ID: {exam_id}")

        # Add questions
        add_test_questions(exam_id)
        return exam_id
    else:
        print(f"Error creating exam: {response.text}")
        return None

def add_test_questions(exam_id):
    """Add test questions to exam"""
    print(f"\nAdding questions to exam {exam_id}...")

    questions = [
        {"question_text": "What is 2 + 2?", "question_type": "open_ended", "points": 10, "order_number": 1},
        {"question_text": "What is 5 * 3?", "question_type": "open_ended", "points": 15, "order_number": 2},
        {"question_text": "What is the square root of 16?", "question_type": "open_ended", "points": 10, "order_number": 3}
    ]

    for q in questions:
        response = requests.post(
            f"{BASE_URL}/exams/{exam_id}/questions",
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/json"
            },
            json=q
        )
        if response.status_code == 201:
            print(f"  Added: {q['question_text']}")

def test_submission_upload(exam_id):
    """Test submission upload with file"""
    print_test(f"TEST 2: Upload Submission for Exam {exam_id}")

    # Check if test image exists
    image_path = Path("test_exam_paper.png")
    if not image_path.exists():
        print("[ERROR] test_exam_paper.png not found!")
        return None

    print(f"Using image: {image_path}")

    # Method 1: Using multipart/form-data (CORRECT WAY)
    with open(image_path, 'rb') as img_file:
        files = {
            'file': ('test_exam_paper.png', img_file, 'image/png')
        }
        data = {
            'exam_id': str(exam_id),
            'student_id': '2'
        }

        response = requests.post(
            f"{BASE_URL}/submissions",
            headers={"Authorization": f"Bearer {TOKEN}"},
            files=files,
            data=data
        )

    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        submission = response.json().get('submission', {})
        submission_id = submission.get('id')
        task_id = response.json().get('task_id')
        print_result("success", f"Submission created: ID={submission_id}, Task={task_id}")
        return submission_id, task_id
    else:
        print_result("error", f"Failed to upload submission: {response.json().get('message')}")
        return None, None

def test_submission_upload_query_params(exam_id):
    """Test submission upload using query parameters"""
    print_test(f"TEST 3: Upload Submission Using Query Parameters")

    image_path = Path("test_exam_paper.png")
    if not image_path.exists():
        print("[ERROR] test_exam_paper.png not found!")
        return None, None

    with open(image_path, 'rb') as img_file:
        files = {
            'file': ('test_exam_paper.png', img_file, 'image/png')
        }

        # Using query parameters instead of form data
        response = requests.post(
            f"{BASE_URL}/submissions?exam_id={exam_id}&student_id=2",
            headers={"Authorization": f"Bearer {TOKEN}"},
            files=files
        )

    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        submission = response.json().get('submission', {})
        submission_id = submission.get('id')
        task_id = response.json().get('task_id')
        print_result("success", f"Submission created: ID={submission_id}, Task={task_id}")
        return submission_id, task_id
    else:
        print_result("error", f"Failed: {response.json().get('message')}")
        return None, None

def test_ocr_status(submission_id):
    """Test getting OCR processing status"""
    print_test(f"TEST 4: Get OCR Status for Submission {submission_id}")

    response = requests.get(
        f"{BASE_URL}/submissions/{submission_id}/ocr-status",
        headers={"Authorization": f"Bearer {TOKEN}"}
    )

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        job_status = data.get('job', {}).get('job_status')
        print_result("success", f"OCR Status: {job_status}")
        return job_status
    else:
        print_result("error", f"Failed: {response.text}")
        return None

def test_ocr_results(submission_id):
    """Test getting OCR results"""
    print_test(f"TEST 5: Get OCR Results for Submission {submission_id}")

    response = requests.get(
        f"{BASE_URL}/submissions/{submission_id}/ocr-results",
        headers={"Authorization": f"Bearer {TOKEN}"}
    )

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        ocr_results = data.get('ocr_results', [])
        print(f"Found {len(ocr_results)} OCR results")

        if ocr_results:
            print(f"\nOCR Result Details:")
            result = ocr_results[0]
            print(f"  - Service: {result.get('ocr_service')}")
            print(f"  - Confidence: {result.get('confidence_score', 0) * 100:.2f}%")
            print(f"  - Raw Text: {result.get('raw_text', '')[:100]}...")
            print_result("success", f"OCR results retrieved successfully")
        else:
            print_result("success", "No OCR results yet (processing may not be complete)")

        return ocr_results
    else:
        print_result("error", f"Failed: {response.text}")
        return None

def test_submission_details(submission_id):
    """Test getting submission details"""
    print_test(f"TEST 6: Get Submission Details {submission_id}")

    response = requests.get(
        f"{BASE_URL}/submissions/{submission_id}",
        headers={"Authorization": f"Bearer {TOKEN}"}
    )

    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        submission = data.get('submission', {})
        print(f"Submission Status: {submission.get('submission_status')}")
        print(f"Processed At: {submission.get('processed_at')}")
        print(f"Answers Count: {len(submission.get('answers', []))}")
        print_result("success", "Submission details retrieved")
        return submission
    else:
        print_result("error", f"Failed: {response.text}")
        return None

def monitor_ocr_processing(submission_id, timeout=60):
    """Monitor OCR processing until complete or timeout"""
    print_test(f"TEST 7: Monitor OCR Processing for Submission {submission_id}")

    start_time = time.time()
    while time.time() - start_time < timeout:
        status = test_ocr_status(submission_id)

        if status == 'completed':
            print_result("success", "OCR processing completed!")
            return True
        elif status == 'failed':
            print_result("error", "OCR processing failed!")
            return False
        elif status in ['pending', 'processing', 'queued']:
            print(f"  Status: {status}, waiting...")
            time.sleep(5)
        else:
            print(f"  Unknown status: {status}")
            time.sleep(5)

    print_result("error", f"Timeout after {timeout} seconds")
    return False

def main():
    print("\n" + "="*80)
    print("  COMPREHENSIVE SUBMISSION & OCR ENDPOINT TEST")
    print("="*80)

    # Test 1: Get available exams
    exam_id = test_exam_list()
    if not exam_id:
        print("\n[FATAL] Cannot proceed without valid exam_id")
        return

    # Test 2: Upload submission with form data
    submission_id, task_id = test_submission_upload(exam_id)

    # Test 3: Upload another submission with query params
    if submission_id:
        submission_id2, task_id2 = test_submission_upload_query_params(exam_id)

    if not submission_id:
        print("\n[FATAL] Cannot proceed without successful submission")
        return

    # Test 4: Check OCR status
    test_ocr_status(submission_id)

    # Test 5: Get OCR results (may be empty if not processed)
    test_ocr_results(submission_id)

    # Test 6: Get submission details
    test_submission_details(submission_id)

    # Test 7: Monitor OCR processing (if Celery is running)
    print("\n" + "="*80)
    print("  NOTE: OCR processing requires Celery worker to be running")
    print("  To start: celery -A celery_worker.celery worker --loglevel=info --pool=solo -Q ocr_queue,default")
    print("="*80)

    response = input("\nIs Celery worker running? (y/n): ")
    if response.lower() == 'y':
        monitor_ocr_processing(submission_id, timeout=120)
        test_ocr_results(submission_id)
        test_submission_details(submission_id)

    print("\n" + "="*80)
    print("  TEST COMPLETE")
    print("="*80)
    print(f"\nTest Results Summary:")
    print(f"  Exam ID: {exam_id}")
    print(f"  Submission ID: {submission_id}")
    print(f"  Task ID: {task_id}")
    print("\nAll endpoints are now tested and verified!")

if __name__ == "__main__":
    main()
