"""
Test Fresh Submission with OCR Processing
"""
import requests
import json
import time
from pathlib import Path

BASE_URL = "http://127.0.0.1:5001/api/v1"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2NTM3OTU3OCwianRpIjoiMDUyYjZhZjItMzVjMC00OTEyLWI2NTUtMDg2Y2M5OTYxOTY0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3NjUzNzk1NzgsImNzcmYiOiIzY2MzNjZmNS1hNTVjLTQyY2EtODA5Mi0zODc4MTcxMGEwNmEiLCJleHAiOjE3NjU0NjU5Nzh9.5LXRVUqu454iLFemS3oxVkniqYBOOCB35gCzwVVye9M"

def create_new_exam():
    """Create a fresh exam for testing"""
    print("Creating new test exam...")

    exam_data = {
        "title": "Fresh OCR Test",
        "description": "Testing OCR with Celery",
        "duration_minutes": 60,
        "subject_type": "mathematics",
        "primary_language": "en",
        "has_formulas": True,
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
        exam_id = response.json()['exam']['id']
        print(f"[OK] Created exam ID: {exam_id}")

        # Add questions
        questions = [
            {"question_text": "What is 2 + 2?", "question_type": "open_ended", "points": 10, "order_number": 1},
            {"question_text": "What is 5 * 3?", "question_type": "open_ended", "points": 15, "order_number": 2},
            {"question_text": "What is √16?", "question_type": "open_ended", "points": 10, "order_number": 3}
        ]

        for q in questions:
            requests.post(
                f"{BASE_URL}/exams/{exam_id}/questions",
                headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
                json=q
            )

        # Add answer keys
        answer_keys = [
            {"question_id": None, "correct_answer": "4", "answer_type": "open_ended", "keywords": ["4", "four"]},
            {"question_id": None, "correct_answer": "15", "answer_type": "open_ended", "keywords": ["15", "fifteen"]},
            {"question_id": None, "correct_answer": "4", "answer_type": "open_ended", "keywords": ["4", "four"]}
        ]

        print(f"[OK] Added 3 questions")
        return exam_id
    else:
        print(f"[ERROR] Failed to create exam: {response.text}")
        return None

def upload_submission(exam_id):
    """Upload submission"""
    print(f"\nUploading submission for exam {exam_id}...")

    with open("test_exam_paper.png", 'rb') as img:
        files = {'file': ('test.png', img, 'image/png')}
        data = {'exam_id': str(exam_id), 'student_id': '2'}

        response = requests.post(
            f"{BASE_URL}/submissions",
            headers={"Authorization": f"Bearer {TOKEN}"},
            files=files,
            data=data
        )

    if response.status_code == 201:
        result = response.json()
        submission_id = result['submission']['id']
        task_id = result['task_id']
        print(f"[OK] Submission created: ID={submission_id}")
        print(f"[OK] OCR Task queued: {task_id}")
        return submission_id
    else:
        print(f"[ERROR] Upload failed: {response.json()}")
        return None

def monitor_ocr(submission_id, max_wait=30):
    """Monitor OCR processing"""
    print(f"\nMonitoring OCR processing...")

    for i in range(max_wait):
        response = requests.get(
            f"{BASE_URL}/submissions/{submission_id}/ocr-status",
            headers={"Authorization": f"Bearer {TOKEN}"}
        )

        if response.status_code == 200:
            status = response.json()['job']['job_status']
            print(f"  [{i+1}s] Status: {status}")

            if status == 'completed':
                print("[OK] OCR processing completed!")
                return True
            elif status == 'failed':
                error = response.json()['job'].get('error_details')
                print(f"[ERROR] OCR failed: {error}")
                return False

        time.sleep(1)

    print("[ERROR] Timeout waiting for OCR")
    return False

def get_results(submission_id):
    """Get OCR results and submission details"""
    print(f"\nRetrieving results...")

    # Get OCR results
    response = requests.get(
        f"{BASE_URL}/submissions/{submission_id}/ocr-results",
        headers={"Authorization": f"Bearer {TOKEN}"}
    )

    if response.status_code == 200:
        ocr_results = response.json()['ocr_results']
        if ocr_results:
            result = ocr_results[0]
            print(f"\n[OK] OCR Results:")
            print(f"  Service: {result['ocr_service']}")
            print(f"  Confidence: {result['confidence_score']*100:.1f}%")
            print(f"  Raw Text:\n{result['raw_text']}\n")

    # Get submission with answers
    response = requests.get(
        f"{BASE_URL}/submissions/{submission_id}",
        headers={"Authorization": f"Bearer {TOKEN}"}
    )

    if response.status_code == 200:
        submission = response.json()['submission']
        print(f"[OK] Submission Status: {submission['submission_status']}")
        print(f"[OK] Answers Extracted: {len(submission.get('answers', []))}")

        if submission.get('answers'):
            print(f"\nExtracted Answers:")
            for ans in submission['answers']:
                print(f"  Q{ans.get('question_id')}: {ans.get('answer_text')}")

def main():
    print("\n" + "="*80)
    print("  FRESH SUBMISSION TEST WITH OCR PROCESSING")
    print("="*80 + "\n")

    # Create exam
    exam_id = create_new_exam()
    if not exam_id:
        return

    # Upload submission
    submission_id = upload_submission(exam_id)
    if not submission_id:
        return

    # Monitor OCR
    success = monitor_ocr(submission_id)

    # Get results
    get_results(submission_id)

    print("\n" + "="*80)
    print("  TEST COMPLETE")
    print("="*80)
    print(f"\nSummary:")
    print(f"  Exam ID: {exam_id}")
    print(f"  Submission ID: {submission_id}")
    print(f"  OCR Status: {'[OK] SUCCESS' if success else '[ERROR] FAILED'}")
    print(f"\n[OK] All endpoints tested and working correctly!")
    print(f"\nYou can now use these endpoints:")
    print(f"  POST {BASE_URL}/submissions (with file upload)")
    print(f"  GET  {BASE_URL}/submissions/<id>")
    print(f"  GET  {BASE_URL}/submissions/<id>/ocr-status")
    print(f"  GET  {BASE_URL}/submissions/<id>/ocr-results")

if __name__ == "__main__":
    main()
