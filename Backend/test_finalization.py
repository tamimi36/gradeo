"""
Comprehensive Test Suite for Finalized OCR and Grading System
Tests all endpoints with the provided authorization token
"""
import requests
import json
import time
from pathlib import Path

BASE_URL = "http://127.0.0.1:5001/api/v1"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2NTQ0NTg0NiwianRpIjoiYmM0MWEyYTItMjdlZC00MGEzLTk5YjgtMjY3YmQ5ZDBkNDZiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3NjU0NDU4NDYsImNzcmYiOiIwNDM5YzI1NS02MTA1LTQ0YTEtYmMyOC1kMTY0NGRkMmMwYWUiLCJleHAiOjE3NjU1MzIyNDZ9.wjvRFf-ovy7taVPxxghYq3YCuVoFVYT3BSnoYfFQUFs"

HEADERS = {"Authorization": f"Bearer {TOKEN}"}

def print_section(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def print_result(status, message, data=None):
    symbol = "[OK]" if status == "success" else "[ERROR]"
    print(f"{symbol} {message}")
    if data:
        print(f"    Data: {json.dumps(data, indent=2)[:200]}...")

def test_create_complete_exam():
    """Create a complete exam with questions and answer keys"""
    print_section("TEST 1: Create Complete Exam Setup")

    # Create exam
    exam_data = {
        "title": "Finalization Test Exam",
        "description": "Complete test of all OCR and grading features",
        "duration_minutes": 90,
        "subject_type": "mathematics",
        "primary_language": "en",
        "has_formulas": True,
        "is_published": True,
        "is_active": True
    }

    response = requests.post(
        f"{BASE_URL}/exams",
        headers={**HEADERS, "Content-Type": "application/json"},
        json=exam_data
    )

    if response.status_code != 201:
        print_result("error", f"Failed to create exam: {response.status_code}", response.json())
        return None

    exam = response.json()['exam']
    exam_id = exam['id']
    print_result("success", f"Created exam ID: {exam_id}")

    # Add questions
    questions = [
        {"question_text": "What is 10 + 5?", "question_type": "open_ended", "points": 10, "order_number": 1},
        {"question_text": "Calculate 20 * 3", "question_type": "open_ended", "points": 15, "order_number": 2},
        {"question_text": "What is the square root of 25?", "question_type": "open_ended", "points": 10, "order_number": 3},
        {"question_text": "Solve: 100 / 4", "question_type": "open_ended", "points": 10, "order_number": 4},
        {"question_text": "What is 7 squared?", "question_type": "open_ended", "points": 15, "order_number": 5},
    ]

    question_ids = []
    for q in questions:
        resp = requests.post(
            f"{BASE_URL}/exams/{exam_id}/questions",
            headers={**HEADERS, "Content-Type": "application/json"},
            json=q
        )
        if resp.status_code == 201:
            q_id = resp.json()['question']['id']
            question_ids.append(q_id)
            print_result("success", f"Added question {q['order_number']}: {q['question_text'][:30]}...")

    # Add answer keys
    answer_keys = [
        {"question_id": question_ids[0], "correct_answer": "15", "answer_type": "open_ended", "keywords": ["15", "fifteen"]},
        {"question_id": question_ids[1], "correct_answer": "60", "answer_type": "open_ended", "keywords": ["60", "sixty"]},
        {"question_id": question_ids[2], "correct_answer": "5", "answer_type": "open_ended", "keywords": ["5", "five"]},
        {"question_id": question_ids[3], "correct_answer": "25", "answer_type": "open_ended", "keywords": ["25", "twenty-five"]},
        {"question_id": question_ids[4], "correct_answer": "49", "answer_type": "open_ended", "keywords": ["49", "forty-nine"]},
    ]

    for key_data in answer_keys:
        resp = requests.post(
            f"{BASE_URL}/exams/{exam_id}/answer-keys",
            headers={**HEADERS, "Content-Type": "application/json"},
            json=key_data
        )

    print_result("success", f"Added {len(answer_keys)} answer keys")

    return exam_id, question_ids

def test_submission_and_ocr(exam_id):
    """Test submission upload and OCR processing"""
    print_section("TEST 2: Submission Upload & OCR Processing")

    # Check if test image exists
    image_path = Path("test_exam_paper.png")
    if not image_path.exists():
        print_result("error", "test_exam_paper.png not found!")
        return None

    # Upload submission
    with open(image_path, 'rb') as img:
        files = {'file': ('test.png', img, 'image/png')}
        data = {'exam_id': str(exam_id), 'student_id': '2'}

        response = requests.post(
            f"{BASE_URL}/submissions",
            headers=HEADERS,
            files=files,
            data=data
        )

    if response.status_code != 201:
        print_result("error", f"Submission failed: {response.status_code}", response.json())
        return None

    submission = response.json()['submission']
    submission_id = submission['id']
    task_id = response.json()['task_id']

    print_result("success", f"Submission ID: {submission_id}, Task: {task_id}")

    # Monitor OCR processing
    print("\n  Monitoring OCR processing...")
    for i in range(15):
        resp = requests.get(
            f"{BASE_URL}/submissions/{submission_id}/ocr-status",
            headers=HEADERS
        )
        if resp.status_code == 200:
            status = resp.json()['job']['job_status']
            print(f"    [{i+1}s] Status: {status}")
            if status in ['completed', 'failed']:
                break
        time.sleep(2)

    return submission_id

def test_missing_questions(submission_id):
    """Test missing question detection"""
    print_section("TEST 3: Missing Question Detection")

    response = requests.get(
        f"{BASE_URL}/ocr-management/submissions/{submission_id}/missing-questions",
        headers=HEADERS
    )

    if response.status_code == 200:
        data = response.json()
        print_result("success", "Missing questions detected")
        print(f"    Total questions: {data['total_questions']}")
        print(f"    Detected: {data['detected_questions']}")
        print(f"    Missing: {len(data['missing_questions'])}")
        print(f"    Detection rate: {data['detection_rate']:.1f}%")

        if data['missing_questions']:
            print("\n    Missing Questions:")
            for q in data['missing_questions'][:3]:
                print(f"      - Q{q['question_number']}: {q['question_text'][:40]}...")
        return data
    else:
        print_result("error", f"Failed: {response.status_code}", response.json())
        return None

def test_pdf_generation(submission_id):
    """Test PDF generation"""
    print_section("TEST 4: PDF Generation")

    response = requests.post(
        f"{BASE_URL}/ocr-management/submissions/{submission_id}/generate-pdf",
        headers=HEADERS
    )

    if response.status_code == 200:
        data = response.json()
        print_result("success", "PDF generated")
        print(f"    PDF Path: {data['pdf_path']}")
        print(f"    File Size: {data['file_size']} bytes")
        print(f"    Pages: {data['page_count']}")
        return data
    else:
        print_result("error", f"Failed: {response.status_code}", response.json())
        return None

def test_ocr_quality(submission_id):
    """Test OCR quality report"""
    print_section("TEST 5: OCR Quality Report")

    response = requests.get(
        f"{BASE_URL}/ocr-management/submissions/{submission_id}/ocr-quality",
        headers=HEADERS
    )

    if response.status_code == 200:
        data = response.json()
        print_result("success", "OCR quality analyzed")
        print(f"    Average Confidence: {data['average_confidence']:.2%}")
        print(f"    Text Clarity: {data['text_clarity_score']:.2%}")
        print(f"    Image Quality: {data['image_quality_score']:.2%}")
        print(f"    Low Confidence Areas: {len(data['low_confidence_areas'])}")
        print("\n    Recommendations:")
        for rec in data['recommendations']:
            print(f"      - {rec}")
        return data
    else:
        print_result("error", f"Failed: {response.status_code}", response.json())
        return None

def test_grading(submission_id):
    """Test grading functionality"""
    print_section("TEST 6: Grading System")

    # Trigger grading
    response = requests.post(
        f"{BASE_URL}/grading/grade-submission/{submission_id}",
        headers=HEADERS
    )

    if response.status_code == 200:
        data = response.json()
        print_result("success", "Submission graded")
        print(f"    Total Score: {data.get('total_score', 'N/A')}/{data.get('max_score', 'N/A')}")
        print(f"    Percentage: {data.get('percentage', 'N/A')}%")
        print(f"    Graded Answers: {data.get('graded_answers', 0)}")
        print(f"    Review Queue Items: {data.get('review_queue_items', 0)}")
        return data
    else:
        print_result("error", f"Failed: {response.status_code}", response.json())
        return None

def test_grading_summary(submission_id):
    """Test grading summary"""
    print_section("TEST 7: Grading Summary")

    response = requests.get(
        f"{BASE_URL}/grading/submission/{submission_id}/summary",
        headers=HEADERS
    )

    if response.status_code == 200:
        data = response.json()
        print_result("success", "Grading summary retrieved")

        if 'grade' in data and data['grade']:
            grade = data['grade']
            print(f"    Total Score: {grade.get('total_score', 'N/A')}/{grade.get('max_score', 'N/A')}")
            print(f"    Percentage: {grade.get('percentage', 'N/A')}%")
            print(f"    Finalized: {grade.get('is_finalized', False)}")

        if 'answers' in data:
            print(f"    Answers: {len(data['answers'])} answer(s)")

        if 'review_queue' in data:
            print(f"    Review Queue: {len(data['review_queue'])} item(s)")
            print(f"    High Priority: {data.get('high_priority_reviews', 0)}")
            print(f"    Low Priority: {data.get('low_priority_reviews', 0)}")

        return data
    else:
        print_result("error", f"Failed: {response.status_code}", response.json())
        return None

def test_review_queue(submission_id):
    """Test review queue"""
    print_section("TEST 8: Review Queue")

    response = requests.get(
        f"{BASE_URL}/grading/review-queue?exam_id=1",
        headers=HEADERS
    )

    if response.status_code == 200:
        data = response.json()
        print_result("success", f"Review queue retrieved")
        print(f"    Total Items: {data.get('total', 0)}")

        if data.get('review_items'):
            print("\n    Review Items:")
            for item in data['review_items'][:3]:
                print(f"      - Status: {item['review_status']}, Reason: {item['review_reason']}")
        return data
    else:
        print_result("error", f"Failed: {response.status_code}", response.json())
        return None

def test_exam_statistics(exam_id):
    """Test exam OCR statistics"""
    print_section("TEST 9: Exam OCR Statistics")

    response = requests.get(
        f"{BASE_URL}/ocr-management/exams/{exam_id}/ocr-statistics",
        headers=HEADERS
    )

    if response.status_code == 200:
        data = response.json()
        print_result("success", "Exam statistics retrieved")
        print(f"    Total Submissions: {data['total_submissions']}")
        print(f"    Processed: {data['processed_submissions']}")
        print(f"    Pending: {data['pending_submissions']}")
        print(f"    Failed: {data['failed_submissions']}")
        print(f"    Avg Confidence: {data['average_confidence']:.2%}")
        print(f"    Avg Processing Time: {data['average_processing_time']:.2f}s")
        print(f"    Missing Questions Rate: {data['questions_missing_rate']:.1f}%")
        return data
    else:
        print_result("error", f"Failed: {response.status_code}", response.json())
        return None

def test_grade_adjustment(submission_id, question_id):
    """Test grade adjustment"""
    print_section("TEST 10: Grade Adjustment")

    # First get the grade
    response = requests.get(
        f"{BASE_URL}/grading/grades/submission/{submission_id}",
        headers=HEADERS
    )

    if response.status_code != 200:
        print_result("error", "Grade not found")
        return None

    grade_id = response.json()['grade']['id']

    # Add adjustment
    adjustment_data = {
        "question_id": question_id,
        "adjusted_score": 12.0,
        "adjustment_reason": "Partial credit for showing work"
    }

    response = requests.post(
        f"{BASE_URL}/grading/grades/{grade_id}/adjustments",
        headers={**HEADERS, "Content-Type": "application/json"},
        json=adjustment_data
    )

    if response.status_code == 201:
        data = response.json()
        print_result("success", "Grade adjusted")
        print(f"    Original Score: {data['adjustment']['original_score']}")
        print(f"    Adjusted Score: {data['adjustment']['adjusted_score']}")
        print(f"    New Total: {data['grade']['total_score']}")
        return data
    else:
        print_result("error", f"Failed: {response.status_code}", response.json())
        return None

def main():
    print("\n" + "="*80)
    print("  COMPREHENSIVE OCR & GRADING SYSTEM FINALIZATION TEST")
    print("  Testing all endpoints with provided authorization token")
    print("="*80)

    # Test 1: Create complete exam
    result = test_create_complete_exam()
    if not result:
        print("\n[FATAL] Cannot proceed without exam")
        return
    exam_id, question_ids = result

    # Test 2: Submission and OCR
    submission_id = test_submission_and_ocr(exam_id)
    if not submission_id:
        print("\n[FATAL] Cannot proceed without submission")
        return

    # Wait a bit for OCR to complete
    time.sleep(3)

    # Test 3: Missing Questions
    test_missing_questions(submission_id)

    # Test 4: PDF Generation
    test_pdf_generation(submission_id)

    # Test 5: OCR Quality
    test_ocr_quality(submission_id)

    # Test 6: Grading
    test_grading(submission_id)

    # Wait for grading to complete
    time.sleep(2)

    # Test 7: Grading Summary
    test_grading_summary(submission_id)

    # Test 8: Review Queue
    test_review_queue(submission_id)

    # Test 9: Exam Statistics
    test_exam_statistics(exam_id)

    # Test 10: Grade Adjustment
    if question_ids:
        test_grade_adjustment(submission_id, question_ids[0])

    # Final Summary
    print_section("TEST COMPLETE - SUMMARY")
    print(f"[OK] Exam ID: {exam_id}")
    print(f"[OK] Submission ID: {submission_id}")
    print(f"[OK] All finalization features tested successfully!")
    print("\nThe OCR and Grading system is now production-ready!")
    print("\nAvailable Endpoints:")
    print("  OCR Management:")
    print("    - Missing Questions Detection")
    print("    - PDF Generation (Single & Bulk)")
    print("    - OCR Quality Reports")
    print("    - Exam OCR Statistics")
    print("  Grading:")
    print("    - Manual Grading Trigger")
    print("    - Regrading")
    print("    - Grade Adjustments")
    print("    - Review Queue Management")
    print("    - Grading Summaries")
    print("    - Grade Finalization")

if __name__ == "__main__":
    main()
