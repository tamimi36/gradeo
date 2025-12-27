#!/usr/bin/env python3
"""Comprehensive API endpoint testing"""
import requests
import json

BASE_URL = "http://localhost:5001/api"
TOKEN = None
HEADERS = {"Content-Type": "application/json"}

def update_headers():
    global HEADERS
    if TOKEN:
        HEADERS = {
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        }

def login():
    """Login and get token"""
    global TOKEN
    print("\n" + "="*80)
    print("  AUTHENTICATION")
    print("="*80)
    
    response = requests.post(
        f"{BASE_URL}/v1/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    
    print(f"\n→ POST /v1/auth/login")
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        TOKEN = data.get('access_token')
        print(f"  ✓ Login successful!")
        print(f"  Token: {TOKEN[:50] if TOKEN else 'None'}...")
        update_headers()
        return True
    else:
        print(f"  ✗ Login failed: {response.text[:200]}")
        return False

def test_endpoint(method, path, data=None, show_response=True):
    """Test an endpoint"""
    url = f"{BASE_URL}{path}"
    print(f"\n→ {method} {path}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=HEADERS)
        elif method == "POST":
            response = requests.post(url, headers=HEADERS, json=data)
        elif method == "PUT":
            response = requests.put(url, headers=HEADERS, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=HEADERS)
        else:
            print(f"  ✗ Unknown method: {method}")
            return None
        
        icon = "✓" if 200 <= response.status_code < 300 else "✗"
        print(f"  {icon} Status: {response.status_code}")
        
        if show_response and response.text:
            try:
                body = response.json()
                text = json.dumps(body, indent=2)
                print(f"  Response: {text[:400] + '...' if len(text) > 400 else text}")
            except:
                print(f"  Response: {response.text[:400]}")
        
        return response
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        return None

print("#" * 80)
print("  COMPREHENSIVE API ENDPOINT TESTING")
print("#" * 80)

# Login first
if not login():
    print("\n✗ Cannot proceed without authentication")
    exit(1)

# Test Auth Endpoints
print("\n" + "="*80)
print("  AUTH ENDPOINTS")
print("="*80)
test_endpoint("GET", "/v1/auth/me")
test_endpoint("POST", "/v1/auth/logout")

# Test Users Endpoints  
print("\n" + "="*80)
print("  USERS ENDPOINTS")
print("="*80)
test_endpoint("GET", "/v1/users")
test_endpoint("GET", "/v1/users/1")
test_endpoint("GET", "/v1/users/1/roles")

# Test Exams Endpoints
print("\n" + "="*80)
print("  EXAMS ENDPOINTS")
print("="*80)
test_endpoint("GET", "/v1/exams")

# Create an exam
exam_data = {
    "title": "Comprehensive Test Exam",
    "description": "Test exam created by automated testing",
    "subject": "Mathematics",
    "grade_level": "Grade 10",
    "duration_minutes": 60,
    "total_marks": 100,
    "is_published": False
}
response = test_endpoint("POST", "/v1/exams", exam_data)

exam_id = None
if response and response.status_code in [200, 201]:
    try:
        exam_id = response.json().get('exam', {}).get('id')
        print(f"  → Created exam ID: {exam_id}")
    except:
        pass

if exam_id:
    test_endpoint("GET", f"/v1/exams/{exam_id}")
    test_endpoint("PUT", f"/v1/exams/{exam_id}", {"title": "Updated Test Exam"})
    test_endpoint("GET", f"/v1/exams/{exam_id}/questions")
    test_endpoint("POST", f"/v1/exams/{exam_id}/publish")

# Test Submissions Endpoints
print("\n" + "="*80)
print("  SUBMISSIONS ENDPOINTS")
print("="*80)
test_endpoint("GET", "/v1/submissions")
test_endpoint("GET", "/v1/submissions/1/ocr-status", show_response=True)
test_endpoint("GET", "/v1/submissions/1/ocr-results", show_response=True)

print("\n" + "#"*80)
print("  TESTING COMPLETE")
print("#"*80 + "\n")
