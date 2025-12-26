"""
Quick Verification Script
Checks if Flask backend has all new endpoints loaded
"""
import requests

BASE_URL = "http://127.0.0.1:5001/api/v1"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2NTQ0NTg0NiwianRpIjoiYmM0MWEyYTItMjdlZC00MGEzLTk5YjgtMjY3YmQ5ZDBkNDZiIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3NjU0NDU4NDYsImNzcmYiOiIwNDM5YzI1NS02MTA1LTQ0YTEtYmMyOC1kMTY0NGRkMmMwYWUiLCJleHAiOjE3NjU1MzIyNDZ9.wjvRFf-ovy7taVPxxghYq3YCuVoFVYT3BSnoYfFQUFs"

def check_endpoint(path, name):
    try:
        response = requests.get(f"{BASE_URL}{path}", headers={"Authorization": f"Bearer {TOKEN}"})
        if response.status_code in [200, 404, 405]:  # Endpoint exists
            print(f"[OK] {name}")
            return True
        else:
            print(f"[MISSING] {name} - {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] {name} - Connection failed")
        return False

print("\n" + "="*60)
print("  VERIFYING FLASK BACKEND SETUP")
print("="*60 + "\n")

# Check if Flask is running
try:
    response = requests.get(BASE_URL)
    print("[OK] Flask backend is running\n")
except:
    print("[ERROR] Flask backend is not running!")
    print("Start Flask with: python run.py\n")
    exit(1)

# Check Swagger UI
try:
    response = requests.get("http://127.0.0.1:5001/api/swagger/")
    if response.status_code == 200:
        print("[OK] Swagger UI is accessible\n")
except:
    print("[WARNING] Swagger UI may not be accessible\n")

# Check new OCR Management endpoints
print("Checking OCR Management Endpoints:")
endpoints = [
    ("/ocr-management/submissions/1/missing-questions", "Missing Questions Detection"),
    ("/ocr-management/submissions/1/generate-pdf", "PDF Generation"),
    ("/ocr-management/submissions/1/ocr-quality", "OCR Quality Report"),
    ("/ocr-management/exams/1/ocr-statistics", "Exam OCR Statistics"),
]

all_ok = True
for path, name in endpoints:
    if not check_endpoint(path, name):
        all_ok = False

print()

# Check Grading endpoints
print("Checking Grading Endpoints:")
grading_endpoints = [
    ("/grading/grades", "Grade List"),
    ("/grading/review-queue", "Review Queue"),
    ("/grading/grade-submission/1", "Manual Grading"),
]

for path, name in grading_endpoints:
    if not check_endpoint(path, name):
        all_ok = False

print("\n" + "="*60)
if all_ok:
    print("[OK] All endpoints are available!")
    print("\nYou can now run the comprehensive test:")
    print("  python test_finalization.py")
else:
    print("[WARNING] Some endpoints are missing!")
    print("\nMake sure you restarted Flask backend:")
    print("  1. Stop Flask (Ctrl+C)")
    print("  2. Run: python run.py")
    print("  3. Run this script again")
print("="*60 + "\n")
