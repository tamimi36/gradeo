#!/usr/bin/env python3
"""
Comprehensive endpoint testing script
Tests all endpoints in: auth, oauth, users, exams, submissions
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5001/api"

def print_section(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}")

def print_test(endpoint, method="GET"):
    print(f"\n→ Testing: {method} {endpoint}")

def print_result(response, show_body=True):
    status = response.status_code
    status_icon = "✓" if 200 <= status < 300 else "✗" if status >= 400 else "⚠"
    
    print(f"  {status_icon} Status: {status}")
    
    if show_body and response.text:
        try:
            body = response.json()
            json_str = json.dumps(body, indent=2)
            if len(json_str) > 300:
                print(f"  Response: {json_str[:300]}...")
            else:
                print(f"  Response: {json_str}")
        except:
            text = response.text
            if len(text) > 300:
                print(f"  Response: {text[:300]}...")
            else:
                print(f"  Response: {text}")

# Global token variable
TOKEN = None
HEADERS = {"Content-Type": "application/json"}

def update_headers():
    global HEADERS
    if TOKEN:
        HEADERS = {
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        }

def get_auth_token():
    """Get a fresh auth token by registering and logging in"""
    global TOKEN
    print_section("GETTING AUTH TOKEN")
    
    # Try to login with a test user
    print_test("/v1/auth/login", "POST")
    response = requests.post(
        f"{BASE_URL}/v1/auth/login",
        json={"username_or_email": "admin", "password": "admin123"}
    )
    
    if response.status_code == 200:
        try:
            TOKEN = response.json().get('access_token')
            if TOKEN:
                print(f"  ✓ Got access token!")
                update_headers()
                return True
        except:
            pass
    
    print(f"  ⚠ Login failed, will test endpoints without authentication")
    return False

def test_auth_endpoints():
    """Test all auth endpoints"""
    print_section("AUTH ENDPOINTS")
    
    # Test current user
    print_test("/v1/auth/me", "GET")
    response = requests.get(f"{BASE_URL}/v1/auth/me", headers=HEADERS)
    print_result(response)
    
    # Test logout
    print_test("/v1/auth/logout", "POST")
    response = requests.post(f"{BASE_URL}/v1/auth/logout", headers=HEADERS)
    print_result(response)

def test_users_endpoints():
    """Test all user management endpoints"""
    print_section("USER ENDPOINTS")
    
    # List users
    print_test("/v1/users", "GET")
    response = requests.get(f"{BASE_URL}/v1/users", headers=HEADERS)
    print_result(response)
    
    # Get specific user
    print_test("/v1/users/1", "GET")
    response = requests.get(f"{BASE_URL}/v1/users/1", headers=HEADERS)
    print_result(response)

def test_exams_endpoints():
    """Test all exam endpoints"""
    print_section("EXAM ENDPOINTS")
    
    # List exams
    print_test("/v1/exams", "GET")
    response = requests.get(f"{BASE_URL}/v1/exams", headers=HEADERS)
    print_result(response)
    
    # Create exam
    print_test("/v1/exams", "POST")
    exam_data = {
        "title": "Test Exam " + datetime.now().strftime("%H:%M:%S"),
        "description": "Automated test exam",
        "subject": "Mathematics",
        "grade_level": "Grade 10",
        "duration_minutes": 60,
        "total_marks": 100
    }
    response = requests.post(f"{BASE_URL}/v1/exams", headers=HEADERS, json=exam_data)
    print_result(response)
    
    exam_id = None
    if response.status_code in [200, 201]:
        try:
            exam_id = response.json().get('exam', {}).get('id')
            print(f"  → Created exam ID: {exam_id}")
        except:
            pass
    
    if exam_id:
        # Get exam details
        print_test(f"/v1/exams/{exam_id}", "GET")
        response = requests.get(f"{BASE_URL}/v1/exams/{exam_id}", headers=HEADERS)
        print_result(response)
        
        # Update exam
        print_test(f"/v1/exams/{exam_id}", "PUT")
        response = requests.put(
            f"{BASE_URL}/v1/exams/{exam_id}",
            headers=HEADERS,
            json={"title": "Updated Test Exam"}
        )
        print_result(response)
        
        # Get questions
        print_test(f"/v1/exams/{exam_id}/questions", "GET")
        response = requests.get(f"{BASE_URL}/v1/exams/{exam_id}/questions", headers=HEADERS)
        print_result(response)

def test_submissions_endpoints():
    """Test all submission endpoints"""
    print_section("SUBMISSION ENDPOINTS")
    
    # List submissions
    print_test("/v1/submissions", "GET")
    response = requests.get(f"{BASE_URL}/v1/submissions", headers=HEADERS)
    print_result(response)
    
    # Test OCR status (hardcoded response)
    print_test("/v1/submissions/999/ocr-status", "GET")
    response = requests.get(f"{BASE_URL}/v1/submissions/999/ocr-status", headers=HEADERS)
    print_result(response)
    
    # Test OCR results (hardcoded response)
    print_test("/v1/submissions/999/ocr-results", "GET")
    response = requests.get(f"{BASE_URL}/v1/submissions/999/ocr-results", headers=HEADERS)
    print_result(response)

def main():
    print(f"\n{'#'*80}")
    print(f"  COMPREHENSIVE ENDPOINT TESTING")
    print(f"  Base URL: {BASE_URL}")
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*80}")
    
    # Get auth token first
    get_auth_token()
    
    # Run tests
    test_auth_endpoints()
    test_users_endpoints()
    test_exams_endpoints()
    test_submissions_endpoints()
    
    print(f"\n{'#'*80}")
    print(f"  TESTING COMPLETE")
    print(f"  Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'#'*80}\n")

if __name__ == "__main__":
    main()
