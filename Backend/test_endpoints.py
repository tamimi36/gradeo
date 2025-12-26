"""
Endpoint Testing Script
Tests all endpoints from exam creation through OCR and grading
"""
import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5001/api/v1"

# Admin token from user
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2NTI3MzU2NywianRpIjoiNmM3MDMyODAtZTgxYy00YTBhLTg5MDktYzNkMmNlMGM3MDNiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3NjUyNzM1NjcsImNzcmYiOiI5MjA3OTc4OS00NzNiLTRmZGItOTY4Yy1jZmVjMDkyMWU1NzEiLCJleHAiOjE3NjUzNTk5Njd9.PnWQY7__bpOS4CsaHG3u8lFbuSyKYc7Pu2DAnB2a9T8"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def print_section(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def print_result(endpoint, method, status_code, response_data):
    print(f"\n{method} {endpoint}")
    print(f"Status: {status_code}")
    print(f"Response: {json.dumps(response_data, indent=2)}")

def test_create_exam(subject_type, language):
    """Create an exam with specific subject type and language"""
    print_section(f"Creating {subject_type.upper()} Exam ({language})")

    exam_data = {
        "title": f"{subject_type.capitalize()} Exam - {language.upper()}",
        "description": f"Test exam for {subject_type} in {language}",
        "subject_type": subject_type,
        "primary_language": language,
        "has_formulas": subject_type == "mathematics",
        "has_diagrams": subject_type in ["mathematics", "science"],
        "total_points": 100,
        "duration_minutes": 90,
        "is_published": True,
        "start_date": datetime.now().isoformat(),
        "end_date": (datetime.now() + timedelta(days=7)).isoformat()
    }

    response = requests.post(f"{BASE_URL}/exams", json=exam_data, headers=HEADERS)
    data = response.json()
    print_result("/exams", "POST", response.status_code, data)

    if response.status_code in [200, 201]:
        return data.get('exam', {}).get('id')
    return None

def test_add_questions(exam_id, question_type="open_ended"):
    """Add questions to an exam"""
    print_section(f"Adding Questions to Exam {exam_id}")

    questions = [
        {
            "question_text": "What is 2 + 2?",
            "question_type": question_type,
            "points": 10,
            "order_number": 1
        },
        {
            "question_text": "What is 5 * 3?",
            "question_type": question_type,
            "points": 15,
            "order_number": 2
        },
        {
            "question_text": "What is the square root of 16?",
            "question_type": question_type,
            "points": 10,
            "order_number": 3
        }
    ]

    question_ids = []
    for q_data in questions:
        response = requests.post(f"{BASE_URL}/exams/{exam_id}/questions", json=q_data, headers=HEADERS)
        data = response.json()
        print_result(f"/exams/{exam_id}/questions", "POST", response.status_code, data)

        if response.status_code in [200, 201]:
            question_ids.append(data.get('question', {}).get('id'))

    return question_ids

def test_add_answer_keys(exam_id, question_ids):
    """Add answer keys for exam questions"""
    print_section(f"Adding Answer Keys for Exam {exam_id}")

    answers = [
        {
            "question_id": question_ids[0],
            "correct_answer": "4",
            "answer_type": "open_ended",
            "points": 10,
            "strictness_level": "normal",
            "keywords": ["4", "four"],
            "additional_notes": "Accept '4' or 'four'"
        },
        {
            "question_id": question_ids[1],
            "correct_answer": "15",
            "answer_type": "open_ended",
            "points": 15,
            "strictness_level": "normal",
            "keywords": ["15", "fifteen"],
            "additional_notes": "Accept '15' or 'fifteen'"
        },
        {
            "question_id": question_ids[2],
            "correct_answer": "4",
            "answer_type": "open_ended",
            "points": 10,
            "strictness_level": "strict",
            "keywords": ["4"],
            "additional_notes": "Must be exactly '4'"
        }
    ]

    for ans_data in answers:
        response = requests.post(f"{BASE_URL}/exams/{exam_id}/answer-keys", json=ans_data, headers=HEADERS)
        data = response.json()
        print_result(f"/exams/{exam_id}/answer-keys", "POST", response.status_code, data)

def test_get_exam(exam_id):
    """Get exam details"""
    print_section(f"Getting Exam {exam_id} Details")

    response = requests.get(f"{BASE_URL}/exams/{exam_id}", headers=HEADERS)
    data = response.json()
    print_result(f"/exams/{exam_id}", "GET", response.status_code, data)

    return data

def test_list_exams():
    """List all exams"""
    print_section("Listing All Exams")

    response = requests.get(f"{BASE_URL}/exams", headers=HEADERS)
    data = response.json()
    print_result("/exams", "GET", response.status_code, data)

    return data

def test_get_answer_keys(exam_id):
    """Get answer keys for an exam"""
    print_section(f"Getting Answer Keys for Exam {exam_id}")

    response = requests.get(f"{BASE_URL}/exams/{exam_id}/answer-keys", headers=HEADERS)
    data = response.json()
    print_result(f"/exams/{exam_id}/answer-keys", "GET", response.status_code, data)

    return data

def test_ocr_stats():
    """Get OCR statistics"""
    print_section("Getting OCR Statistics")

    response = requests.get(f"{BASE_URL}/ocr/stats", headers=HEADERS)
    data = response.json()
    print_result("/ocr/stats", "GET", response.status_code, data)

    return data

def test_ocr_strategies():
    """Get OCR strategies"""
    print_section("Getting OCR Strategies")

    response = requests.get(f"{BASE_URL}/ocr/strategies", headers=HEADERS)
    data = response.json()
    print_result("/ocr/strategies", "GET", response.status_code, data)

    return data

def test_ocr_jobs():
    """Get OCR jobs"""
    print_section("Getting OCR Jobs")

    response = requests.get(f"{BASE_URL}/ocr/jobs", headers=HEADERS)
    data = response.json()
    print_result("/ocr/jobs", "GET", response.status_code, data)

    return data

def main():
    print("\n" + "="*80)
    print("  GRADEO EXAM SCANNER - API ENDPOINT TESTING")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Token: {TOKEN[:50]}...")

    try:
        # Test 1: Create Mathematics Exam (English)
        math_exam_id = test_create_exam("mathematics", "en")
        if math_exam_id:
            math_question_ids = test_add_questions(math_exam_id, "open_ended")
            if math_question_ids:
                test_add_answer_keys(math_exam_id, math_question_ids)
            test_get_exam(math_exam_id)
            test_get_answer_keys(math_exam_id)

        # Test 2: Create Arabic Language Exam
        arabic_exam_id = test_create_exam("arabic", "ar")
        if arabic_exam_id:
            arabic_question_ids = test_add_questions(arabic_exam_id, "open_ended")
            if arabic_question_ids:
                test_add_answer_keys(arabic_exam_id, arabic_question_ids)
            test_get_exam(arabic_exam_id)

        # Test 3: Create Science Exam (Mixed language)
        science_exam_id = test_create_exam("science", "mixed")
        if science_exam_id:
            science_question_ids = test_add_questions(science_exam_id, "open_ended")
            if science_question_ids:
                test_add_answer_keys(science_exam_id, science_question_ids)
            test_get_exam(science_exam_id)

        # Test 4: List all exams
        test_list_exams()

        # Test 5: OCR Management Endpoints
        test_ocr_stats()
        test_ocr_strategies()
        test_ocr_jobs()

        print_section("TESTING COMPLETE")
        print("\nAll endpoint tests completed successfully!")
        print("\nNote: OCR submission testing requires Redis and Celery to be running.")
        print("Install Redis and start Celery worker to test OCR functionality.")

    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to Flask backend!")
        print("Make sure Flask is running on http://localhost:5001")
        print("Run: python run.py")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
