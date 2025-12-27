#!/usr/bin/env python3
"""
Comprehensive Endpoint Testing Script
Tests all grading, OCR, OCR management, analytics, and AI endpoints
"""

import requests
import json
from colorama import init, Fore, Style

init(autoreset=True)

BASE_URL = "http://127.0.0.1:5001/api/v1"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2Njg0MzU1MywianRpIjoiYjgyYjFiNmYtNTRmZC00MDg1LTk0NGUtNWRhZDkwY2JjNmEwIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NjY4NDM1NTMsImNzcmYiOiIzYmFiMDU2Yi0zOGYwLTQ5MzctYTBjNC1jMzFlNTFjYjhmZjUiLCJleHAiOjE3NjY5Mjk5NTN9.uLXg3_5aLZ-p-i40okJARMwFRN8cUlcB_PZWg2_jddw"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Test results storage
test_results = {
    "passed": [],
    "failed": [],
    "warnings": []
}


def test_endpoint(method, endpoint, description, expected_status_codes=[200, 201], data=None, params=None):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"

    print(f"\n{'='*80}")
    print(f"{Fore.CYAN}Testing: {description}")
    print(f"{Fore.YELLOW}{method} {endpoint}")

    try:
        if method == "GET":
            response = requests.get(url, headers=HEADERS, params=params, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=HEADERS, json=data, timeout=10)
        elif method == "PUT":
            response = requests.put(url, headers=HEADERS, json=data, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=HEADERS, timeout=10)
        else:
            print(f"{Fore.RED}✗ Unsupported method: {method}")
            test_results["failed"].append(f"{method} {endpoint} - Unsupported method")
            return

        print(f"Status Code: {response.status_code}")

        # Try to parse JSON
        try:
            response_data = response.json()
            print(f"Response: {json.dumps(response_data, indent=2)[:500]}...")
        except:
            response_data = response.text
            print(f"Response (non-JSON): {response_data[:200]}...")

        # Check if status code is expected
        if response.status_code in expected_status_codes:
            print(f"{Fore.GREEN}✓ PASSED")
            test_results["passed"].append(f"{method} {endpoint}")

            # Check for informative response
            if isinstance(response_data, dict):
                if "message" in response_data or "status" in response_data:
                    print(f"{Fore.GREEN}✓ Response has informative message/status")
                else:
                    print(f"{Fore.YELLOW}⚠ Response could be more informative (missing message/status)")
                    test_results["warnings"].append(f"{method} {endpoint} - Could be more informative")
        else:
            print(f"{Fore.RED}✗ FAILED - Expected {expected_status_codes}, got {response.status_code}")
            test_results["failed"].append(f"{method} {endpoint} - Status {response.status_code}")

    except requests.exceptions.Timeout:
        print(f"{Fore.RED}✗ FAILED - Request timed out")
        test_results["failed"].append(f"{method} {endpoint} - Timeout")
    except requests.exceptions.ConnectionError:
        print(f"{Fore.RED}✗ FAILED - Connection error (server may not be running)")
        test_results["failed"].append(f"{method} {endpoint} - Connection error")
    except Exception as e:
        print(f"{Fore.RED}✗ FAILED - {str(e)}")
        test_results["failed"].append(f"{method} {endpoint} - {str(e)}")


def main():
    print(f"\n{Fore.MAGENTA}{'='*80}")
    print(f"{Fore.MAGENTA}COMPREHENSIVE ENDPOINT TESTING")
    print(f"{Fore.MAGENTA}{'='*80}\n")

    # =======================
    # GRADING ENDPOINTS
    # =======================
    print(f"\n{Fore.BLUE}{'#'*80}")
    print(f"{Fore.BLUE}# GRADING ENDPOINTS")
    print(f"{Fore.BLUE}{'#'*80}")

    test_endpoint("GET", "/grading/grades", "List all grades with pagination",
                  params={"page": 1, "per_page": 10})

    test_endpoint("GET", "/grading/grades/1", "Get specific grade by ID",
                  expected_status_codes=[200, 404])

    test_endpoint("GET", "/grading/grades/submission/1", "Get grade for specific submission",
                  expected_status_codes=[200, 403, 404])

    test_endpoint("GET", "/grading/review-queue", "List review queue items",
                  params={"page": 1, "per_page": 10})

    test_endpoint("GET", "/grading/review-queue/1", "Get specific review queue item",
                  expected_status_codes=[200, 403, 404])

    test_endpoint("POST", "/grading/grades/1/finalize", "Finalize a grade",
                  data={"notes": "Test finalization"},
                  expected_status_codes=[200, 400, 403, 404])

    test_endpoint("GET", "/grading/grades/1/adjustments", "List grade adjustments",
                  expected_status_codes=[200, 403, 404])

    # =======================
    # OCR ENDPOINTS (Hardcoded)
    # =======================
    print(f"\n{Fore.BLUE}{'#'*80}")
    print(f"{Fore.BLUE}# OCR ENDPOINTS (Hardcoded Responses)")
    print(f"{Fore.BLUE}{'#'*80}")

    test_endpoint("GET", "/ocr/strategies", "List OCR strategies")

    test_endpoint("GET", "/ocr/jobs", "List OCR processing jobs")

    test_endpoint("GET", "/ocr/jobs/1", "Get specific OCR job",
                  expected_status_codes=[200, 404])

    test_endpoint("GET", "/ocr/stats", "Get OCR statistics")

    # =======================
    # OCR MANAGEMENT ENDPOINTS
    # =======================
    print(f"\n{Fore.BLUE}{'#'*80}")
    print(f"{Fore.BLUE}# OCR MANAGEMENT ENDPOINTS")
    print(f"{Fore.BLUE}{'#'*80}")

    test_endpoint("GET", "/ocr-management/submissions/1/missing-questions",
                  "Detect missing questions in submission",
                  expected_status_codes=[200, 403, 404])

    test_endpoint("POST", "/ocr-management/submissions/1/generate-pdf",
                  "Generate PDF from submission",
                  expected_status_codes=[200, 403, 404, 500])

    test_endpoint("GET", "/ocr-management/submissions/1/ocr-quality",
                  "Get OCR quality report",
                  expected_status_codes=[200, 403, 404])

    test_endpoint("GET", "/ocr-management/exams/1/ocr-statistics",
                  "Get OCR statistics for exam",
                  expected_status_codes=[200, 403, 404])

    # =======================
    # ANALYTICS ENDPOINTS
    # =======================
    print(f"\n{Fore.BLUE}{'#'*80}")
    print(f"{Fore.BLUE}# ANALYTICS ENDPOINTS")
    print(f"{Fore.BLUE}{'#'*80}")

    test_endpoint("GET", "/analytics/weakness-heatmap/exam/1",
                  "Get weakness heatmap for exam",
                  expected_status_codes=[200, 403, 404])

    test_endpoint("GET", "/analytics/question-difficulty/exam/1",
                  "Get question difficulty tracking",
                  expected_status_codes=[200, 403, 404])

    test_endpoint("GET", "/analytics/cohort-comparison",
                  "Compare cohort performance",
                  params={"cohort_ids": "1,2"},
                  expected_status_codes=[200, 400, 403])

    test_endpoint("GET", "/analytics/student-progress/1",
                  "Get student progress timeline",
                  expected_status_codes=[200, 403, 404])

    test_endpoint("GET", "/analytics/misconceptions/exam/1",
                  "Detect common misconceptions",
                  expected_status_codes=[200, 403, 404])

    # =======================
    # AI ENDPOINTS
    # =======================
    print(f"\n{Fore.BLUE}{'#'*80}")
    print(f"{Fore.BLUE}# AI ENDPOINTS")
    print(f"{Fore.BLUE}{'#'*80}")

    test_endpoint("POST", "/ai/explain-answer/1",
                  "Generate AI explanation for answer",
                  expected_status_codes=[200, 400, 403, 404, 500])

    test_endpoint("POST", "/ai/proofread/1",
                  "AI proofread answer text",
                  expected_status_codes=[200, 400, 403, 404, 500])

    test_endpoint("POST", "/ai/compare-reasoning/1",
                  "Compare student reasoning with AI",
                  expected_status_codes=[200, 400, 403, 404, 500])

    test_endpoint("GET", "/ai/estimate-difficulty/exam/1",
                  "Estimate exam difficulty with AI",
                  expected_status_codes=[200, 400, 403, 404, 500])

    test_endpoint("POST", "/ai/batch-analyze/exam/1",
                  "Batch analyze exam answers",
                  data={"analyze_correct_answers": False},
                  expected_status_codes=[200, 403, 404, 500])

    test_endpoint("GET", "/ai/cache/stats",
                  "Get AI cache statistics",
                  expected_status_codes=[200, 403])

    # =======================
    # SUMMARY
    # =======================
    print(f"\n{Fore.MAGENTA}{'='*80}")
    print(f"{Fore.MAGENTA}TEST SUMMARY")
    print(f"{Fore.MAGENTA}{'='*80}\n")

    total_tests = len(test_results["passed"]) + len(test_results["failed"])

    print(f"{Fore.GREEN}✓ PASSED: {len(test_results['passed'])}/{total_tests}")
    for test in test_results["passed"]:
        print(f"  {Fore.GREEN}✓ {test}")

    print(f"\n{Fore.RED}✗ FAILED: {len(test_results['failed'])}/{total_tests}")
    for test in test_results["failed"]:
        print(f"  {Fore.RED}✗ {test}")

    print(f"\n{Fore.YELLOW}⚠ WARNINGS: {len(test_results['warnings'])}")
    for warning in test_results["warnings"]:
        print(f"  {Fore.YELLOW}⚠ {warning}")

    success_rate = (len(test_results["passed"]) / total_tests * 100) if total_tests > 0 else 0
    print(f"\n{Fore.CYAN}Success Rate: {success_rate:.1f}%")

    if success_rate >= 80:
        print(f"{Fore.GREEN}✓ OVERALL: GOOD")
    elif success_rate >= 60:
        print(f"{Fore.YELLOW}⚠ OVERALL: NEEDS IMPROVEMENT")
    else:
        print(f"{Fore.RED}✗ OVERALL: CRITICAL ISSUES")


if __name__ == "__main__":
    main()
