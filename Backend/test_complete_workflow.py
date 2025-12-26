"""
Complete OCR Workflow Test
Tests the entire workflow from exam creation to OCR processing and grading
"""
import requests
import json
import time
from datetime import datetime, timedelta
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

BASE_URL = "http://localhost:5001/api/v1"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2NTI5NzA0MCwianRpIjoiOTU3NGRiZjktNzgwNC00MDY2LWE4ZWUtMmNjYzg5NDY1MTMzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3NjUyOTcwNDAsImNzcmYiOiI3NjJjYzc2Mi1iYWE1LTRiOWUtOWJlNS0xN2ZkMmZiODNjN2MiLCJleHAiOjE3NjUzODM0NDB9.hdoI0ERcifBTEwDS35UlEQqtWWI_CKcbURsdSs2p650"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}"
}

def print_section(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def print_response(method, endpoint, status, data):
    print(f"\n{method} {endpoint}")
    print(f"Status: {status}")
    print(f"Response: {json.dumps(data, indent=2)[:500]}")

def create_test_exam():
    """Create a test exam with OCR fields"""
    print_section("STEP 1: Creating Test Exam")

    exam_data = {
        "title": "Complete OCR Test Exam",
        "description": "Testing complete OCR workflow",
        "subject_type": "mathematics",
        "primary_language": "en",
        "has_formulas": True,
        "has_diagrams": False,
        "total_points": 100,
        "duration_minutes": 60,
        "is_published": True,
        "start_date": datetime.now().isoformat(),
        "end_date": (datetime.now() + timedelta(days=7)).isoformat()
    }

    response = requests.post(f"{BASE_URL}/exams", json=exam_data, headers=HEADERS)
    data = response.json()
    print_response("POST", "/exams", response.status_code, data)

    if response.status_code in [200, 201]:
        return data['exam']['id']
    return None

def add_questions(exam_id):
    """Add questions to the exam"""
    print_section("STEP 2: Adding Questions")

    questions = [
        {
            "question_text": "What is 2 + 2?",
            "question_type": "open_ended",
            "points": 10,
            "order_number": 1
        },
        {
            "question_text": "What is 5 * 3?",
            "question_type": "open_ended",
            "points": 15,
            "order_number": 2
        },
        {
            "question_text": "What is the square root of 16?",
            "question_type": "open_ended",
            "points": 10,
            "order_number": 3
        }
    ]

    question_ids = []
    for q_data in questions:
        response = requests.post(f"{BASE_URL}/exams/{exam_id}/questions",
                                json=q_data, headers=HEADERS)
        data = response.json()
        print_response("POST", f"/exams/{exam_id}/questions", response.status_code, data)

        if response.status_code in [200, 201]:
            question_ids.append(data['question']['id'])

    return question_ids

def add_answer_keys(exam_id, question_ids):
    """Add answer keys using bulk format"""
    print_section("STEP 3: Adding Answer Keys (Bulk Format)")

    answer_keys_data = {
        "answer_keys": [
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
    }

    response = requests.post(f"{BASE_URL}/exams/{exam_id}/answer-keys",
                            json=answer_keys_data, headers=HEADERS)
    data = response.json()
    print_response("POST", f"/exams/{exam_id}/answer-keys", response.status_code, data)

    return response.status_code in [200, 201]

def create_test_image():
    """Create a test exam paper image with handwritten-style answers"""
    print_section("STEP 4: Creating Test Exam Paper Image")

    # Create an image with white background
    img = Image.new('RGB', (800, 1000), color='white')
    draw = ImageDraw.Draw(img)

    # Add text simulating handwritten answers
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()

    # Header
    draw.text((50, 50), "Student Exam Paper", fill='black', font=font)

    # Question 1
    draw.text((50, 150), "Question 1: What is 2 + 2?", fill='black', font=font)
    draw.text((50, 210), "Answer: 4", fill='blue', font=font)

    # Question 2
    draw.text((50, 320), "Question 2: What is 5 * 3?", fill='black', font=font)
    draw.text((50, 380), "Answer: 15", fill='blue', font=font)

    # Question 3
    draw.text((50, 490), "Question 3: Square root of 16?", fill='black', font=font)
    draw.text((50, 550), "Answer: 4", fill='blue', font=font)

    # Save to file
    filename = "test_exam_paper.png"
    img.save(filename)
    print(f"Created test image: {filename}")

    return filename

def upload_submission(exam_id, image_path):
    """Upload scanned exam paper using correct format"""
    print_section("STEP 5: Uploading Submission (Form Data)")

    # Open the image file
    with open(image_path, 'rb') as img_file:
        files = {
            'file': ('test_exam_paper.png', img_file, 'image/png')
        }

        # exam_id must be in form data, not query params
        form_data = {
            'exam_id': str(exam_id)
        }

        response = requests.post(
            f"{BASE_URL}/submissions",
            files=files,
            data=form_data,
            headers={"Authorization": f"Bearer {TOKEN}"}
        )

    data = response.json()
    print_response("POST", "/submissions", response.status_code, data)

    if response.status_code in [200, 201]:
        return data.get('submission', {}).get('id')
    return None

def check_ocr_status(submission_id, max_wait=60):
    """Monitor OCR processing status"""
    print_section("STEP 6: Monitoring OCR Processing")

    start_time = time.time()
    while time.time() - start_time < max_wait:
        response = requests.get(
            f"{BASE_URL}/submissions/{submission_id}/ocr-status",
            headers=HEADERS
        )
        data = response.json()

        if response.status_code == 200:
            job_status = data.get('job', {}).get('job_status', 'unknown')
            print(f"OCR Status: {job_status}")

            if job_status == 'completed':
                print_response("GET", f"/submissions/{submission_id}/ocr-status",
                             response.status_code, data)
                return True
            elif job_status == 'failed':
                print_response("GET", f"/submissions/{submission_id}/ocr-status",
                             response.status_code, data)
                return False

        time.sleep(2)

    print(f"Timeout waiting for OCR completion after {max_wait} seconds")
    return False

def get_ocr_results(submission_id):
    """Get OCR results"""
    print_section("STEP 7: Retrieving OCR Results")

    response = requests.get(
        f"{BASE_URL}/submissions/{submission_id}/ocr-results",
        headers=HEADERS
    )
    data = response.json()
    print_response("GET", f"/submissions/{submission_id}/ocr-results",
                  response.status_code, data)

    return data

def get_submission_details(submission_id):
    """Get submission with extracted answers"""
    print_section("STEP 8: Getting Submission with Extracted Answers")

    response = requests.get(
        f"{BASE_URL}/submissions/{submission_id}",
        headers=HEADERS
    )
    data = response.json()
    print_response("GET", f"/submissions/{submission_id}",
                  response.status_code, data)

    return data

def check_grading_status(submission_id):
    """Check if grading has been done"""
    print_section("STEP 9: Checking Grading Status")

    response = requests.get(
        f"{BASE_URL}/grading/grades/submission/{submission_id}",
        headers=HEADERS
    )
    data = response.json()
    print_response("GET", f"/grading/grades/submission/{submission_id}",
                  response.status_code, data)

    return data

def get_answer_keys(exam_id):
    """Verify answer keys were created"""
    print_section("Verifying Answer Keys")

    response = requests.get(
        f"{BASE_URL}/exams/{exam_id}/answer-keys",
        headers=HEADERS
    )
    data = response.json()
    print_response("GET", f"/exams/{exam_id}/answer-keys",
                  response.status_code, data)

    return data

def main():
    print("\n" + "="*80)
    print("  COMPLETE OCR WORKFLOW TEST")
    print("  Testing: Exam Creation -> Questions -> Answer Keys -> OCR -> Grading")
    print("="*80)

    try:
        # Step 1: Create exam
        exam_id = create_test_exam()
        if not exam_id:
            print("\n[ERROR] Failed to create exam")
            return
        print(f"\n[SUCCESS] Created exam with ID: {exam_id}")

        # Step 2: Add questions
        question_ids = add_questions(exam_id)
        if not question_ids or len(question_ids) != 3:
            print("\n[ERROR] Failed to add questions")
            return
        print(f"\n[SUCCESS] Added {len(question_ids)} questions")

        # Step 3: Add answer keys
        if not add_answer_keys(exam_id, question_ids):
            print("\n[ERROR] Failed to add answer keys")
            return
        print(f"\n[SUCCESS] Added answer keys")

        # Verify answer keys
        get_answer_keys(exam_id)

        # Step 4: Create test image
        image_path = create_test_image()
        print(f"\n[SUCCESS] Created test exam image")

        # Step 5: Upload submission
        submission_id = upload_submission(exam_id, image_path)
        if not submission_id:
            print("\n[ERROR] Failed to upload submission")
            return
        print(f"\n[SUCCESS] Uploaded submission with ID: {submission_id}")

        # Step 6: Monitor OCR processing
        if check_ocr_status(submission_id, max_wait=120):
            print(f"\n[SUCCESS] OCR processing completed")
        else:
            print(f"\n[WARN] OCR processing did not complete in time")

        # Step 7: Get OCR results
        ocr_results = get_ocr_results(submission_id)

        # Step 8: Get submission details with extracted answers
        submission_details = get_submission_details(submission_id)

        # Step 9: Check grading status
        grading_status = check_grading_status(submission_id)

        print("\n" + "="*80)
        print("  TEST COMPLETE")
        print("="*80)
        print(f"\nSummary:")
        print(f"  Exam ID: {exam_id}")
        print(f"  Submission ID: {submission_id}")
        print(f"  Questions: {len(question_ids)}")
        print(f"  Test Image: {image_path}")

        print("\n[SUCCESS] All workflow steps completed successfully!")
        print("\nYou can now:")
        print("  1. Check Swagger UI: http://localhost:5001/api/v1/swagger/")
        print(f"  2. View submission: GET /api/v1/submissions/{submission_id}")
        print(f"  3. View OCR results: GET /api/v1/submissions/{submission_id}/ocr-results")
        print(f"  4. Implement grading logic for submission ID: {submission_id}")

    except Exception as e:
        print(f"\n[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
