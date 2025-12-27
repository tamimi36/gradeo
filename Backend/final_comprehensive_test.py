#!/usr/bin/env python3
"""Final Comprehensive API Testing"""
import requests
import json

BASE_URL = "http://localhost:5001/api"

# Get fresh token
response = requests.post(f"{BASE_URL}/v1/auth/login", json={"username": "admin", "password": "admin123"})
TOKEN = response.json().get('access_token')
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def test(method, path, data=None):
    """Test an endpoint and return results"""
    url = f"{BASE_URL}{path}"
    print(f"\n{'→'} {method} {path}")
    
    try:
        if method == "GET":
            r = requests.get(url, headers=HEADERS)
        elif method == "POST":
            r = requests.post(url, headers=HEADERS, json=data)
        elif method == "PUT":
            r = requests.put(url, headers=HEADERS, json=data)
        elif method == "DELETE":
            r = requests.delete(url, headers=HEADERS)
        
        icon = "✓" if 200 <= r.status_code < 300 else ("⚠" if 300 <= r.status_code < 400 else "✗")
        print(f"  {icon} Status: {r.status_code}")
        
        if r.text:
            try:
                body = r.json()
                text = json.dumps(body, indent=2)
                if len(text) > 300:
                    print(f"  Response: {text[:300]}...")
                else:
                    print(f"  Response: {text}")
            except:
                print(f"  Response: {r.text[:300]}")
        
        return r
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

print("\n" + "="*80)
print("  COMPREHENSIVE API ENDPOINT TESTING")
print("="*80)

# AUTH ENDPOINTS
print("\n" + "="*80)
print("  AUTH ENDPOINTS")
print("="*80)
test("GET", "/v1/auth/me")

# USERS ENDPOINTS
print("\n" + "="*80)
print("  USERS ENDPOINTS")
print("="*80)
test("GET", "/v1/users")
test("GET", "/v1/users/2")
test("GET", "/v1/users/2/roles")
test("PUT", "/v1/users/2", {"first_name": "Admin", "last_name": "User"})

# EXAMS ENDPOINTS
print("\n" + "="*80)
print("  EXAMS ENDPOINTS")
print("="*80)
test("GET", "/v1/exams")

exam_data = {
    "title": "Final Test Exam",
    "description": "Comprehensive test exam",
    "subject": "Mathematics",
    "grade_level": "Grade 10",
    "duration_minutes": 60,
    "total_marks": 100
}
r = test("POST", "/v1/exams", exam_data)

exam_id = None
if r and r.status_code in [200, 201]:
    try:
        exam_id = r.json().get('exam', {}).get('id')
        print(f"  → Exam ID: {exam_id}")
    except:
        pass

if exam_id:
    test("GET", f"/v1/exams/{exam_id}")
    test("PUT", f"/v1/exams/{exam_id}", {"title": "Updated Final Test Exam"})
    test("GET", f"/v1/exams/{exam_id}/questions")
    
    # Add question
    question_data = {
        "question_text": "What is 2 + 2?",
        "question_type": "multiple_choice",
        "marks": 5,
        "order": 1,
        "options": [
            {"option_text": "3", "is_correct": False, "order": 1},
            {"option_text": "4", "is_correct": True, "order": 2},
            {"option_text": "5", "is_correct": False, "order": 3}
        ]
    }
    r = test("POST", f"/v1/exams/{exam_id}/questions", question_data)
    
    question_id = None
    if r and r.status_code in [200, 201]:
        try:
            question_id = r.json().get('question', {}).get('id')
            print(f"  → Question ID: {question_id}")
        except:
            pass
    
    if question_id:
        test("GET", f"/v1/exams/{exam_id}/questions/{question_id}")
        test("PUT", f"/v1/exams/{exam_id}/questions/{question_id}", {"question_text": "What is 3 + 3?"})
    
    test("POST", f"/v1/exams/{exam_id}/publish")

# SUBMISSIONS ENDPOINTS
print("\n" + "="*80)
print("  SUBMISSIONS ENDPOINTS (OCR HARDCODED)")
print("="*80)
test("GET", "/v1/submissions")
test("GET", "/v1/submissions/1/ocr-status")
test("GET", "/v1/submissions/1/ocr-results")

# OAUTH ENDPOINTS
print("\n" + "="*80)
print("  OAUTH ENDPOINTS")
print("="*80)
test("GET", "/auth/google/login")

print("\n" + "="*80)
print("  TESTING COMPLETE")
print("="*80 + "\n")
