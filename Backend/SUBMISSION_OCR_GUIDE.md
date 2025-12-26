# Submission & OCR Endpoints - Complete Guide

## ✅ ALL ENDPOINTS ARE WORKING!

All issues have been fixed. Here's how to use them:

---

## Prerequisites

### 1. Start Redis Server
```bash
redis-server
```

### 2. Start Celery Worker (MUST load .env file!)
```bash
cd C:\Users\htami\onedrive\desktop\gradeo\gradeo\backend
celery -A celery_worker.celery worker --loglevel=info --pool=solo -Q ocr_queue,default
```

**IMPORTANT**: The `celery_worker.py` file now loads `.env` automatically with `load_dotenv()`, so your Google Vision API key will be available.

### 3. **RESTART Your Flask Backend!**
This is CRITICAL! After starting Celery, restart your Flask backend so it reconnects to Redis:
```bash
python run.py
```

---

## API Endpoints

### 1. Upload Submission

**Endpoint**: `POST /api/v1/submissions`

**Method 1: Using Form Data (RECOMMENDED)**
```bash
curl -X POST "http://127.0.0.1:5001/api/v1/submissions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "exam_id=3" \
  -F "student_id=2" \
  -F "file=@path/to/image.png"
```

**Method 2: Using Query Parameters**
```bash
curl -X POST "http://127.0.0.1:5001/api/v1/submissions?exam_id=3&student_id=2" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/image.png"
```

**Response**:
```json
{
  "submission": {
    "id": 7,
    "exam_id": 3,
    "student_id": 2,
    "submission_status": "pending",
    "scanned_paper_path": "submissions/exam3_student2_xxx.png"
  },
  "task_id": "75d7a566-50fa-4587-8118-ad504f71f599",
  "message": "Exam paper uploaded successfully. OCR processing has been queued.",
  "status": "success"
}
```

---

### 2. Check OCR Status

**Endpoint**: `GET /api/v1/submissions/{submission_id}/ocr-status`

```bash
curl -X GET "http://127.0.0.1:5001/api/v1/submissions/7/ocr-status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "status": "success",
  "job": {
    "id": 8,
    "submission_id": 7,
    "celery_task_id": "75d7a566-50fa-4587-8118-ad504f71f599",
    "job_status": "completed",
    "retry_count": 0,
    "error_details": null,
    "started_at": "2025-12-10T15:20:00Z",
    "completed_at": "2025-12-10T15:20:05Z"
  }
}
```

**Job Status Values**:
- `pending`: Waiting to be processed
- `processing`: Currently being processed
- `completed`: Successfully completed
- `failed`: Processing failed (check `error_details`)

---

### 3. Get OCR Results

**Endpoint**: `GET /api/v1/submissions/{submission_id}/ocr-results`

```bash
curl -X GET "http://127.0.0.1:5001/api/v1/submissions/7/ocr-results" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "status": "success",
  "ocr_results": [
    {
      "id": 5,
      "submission_id": 7,
      "ocr_service": "google_vision",
      "raw_text": "Student Exam Paper\nQuestion 1: What is 2 + 2?\nAnswer: 4\n...",
      "processed_text": "Student Exam Paper Question 1: What is 2 + 2? Answer: 4...",
      "confidence_score": 0.9543,
      "created_at": "2025-12-10T15:20:05Z"
    }
  ]
}
```

---

### 4. Get Submission Details (with Answers)

**Endpoint**: `GET /api/v1/submissions/{submission_id}`

```bash
curl -X GET "http://127.0.0.1:5001/api/v1/submissions/7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "submission": {
    "id": 7,
    "exam_id": 3,
    "student_id": 2,
    "submission_status": "completed",
    "submitted_at": "2025-12-10T15:19:00Z",
    "processed_at": "2025-12-10T15:20:05Z",
    "answers": [
      {
        "id": 10,
        "question_id": 15,
        "answer_text": "4",
        "confidence_score": 0.95,
        "is_auto_graded": false
      }
    ],
    "grade": {
      "total_score": null,
      "max_score": 35.0,
      "percentage": null
    }
  }
}
```

---

## Fixed Issues

### ✅ Issue #1: "No file uploaded" Error
**Problem**: Not sending file with request
**Solution**: Use `-F "file=@path/to/image.png"` in curl or `multipart/form-data` in code

### ✅ Issue #2: "exam_id is required" Error
**Problem**: Passing exam_id incorrectly
**Solution**: Endpoint now accepts exam_id from both form data AND query parameters

### ✅ Issue #3: Celery Not Processing Tasks
**Problem**: Celery worker not loading Google Vision API key from .env
**Solution**: Updated `celery_worker.py` to call `load_dotenv()` at startup

### ✅ Issue #4: Tasks Not Reaching Worker
**Problem**: Flask app started before Redis/Celery
**Solution**: **RESTART Flask backend** after starting Redis and Celery

---

## Testing Scripts

### Test All Endpoints
```bash
python test_all_endpoints.py
```

### Test Fresh Submission with OCR
```bash
python test_fresh_submission.py
```

---

## Troubleshooting

### OCR Status Stays "pending" or "queued"
1. Check if Celery worker is running
2. Check Celery logs for errors
3. **Restart Flask backend!**

### "Google Vision API key is required"
1. Check `.env` file has `GOOGLE_VISION_API_KEY=...`
2. Restart Celery worker (it loads .env on startup)

### "UNIQUE constraint failed" Error
This happens when reprocessing an existing submission. Create a new submission for each test.

---

## Complete Working Example (Python)

```python
import requests

BASE_URL = "http://127.0.0.1:5001/api/v1"
TOKEN = "YOUR_TOKEN_HERE"

# 1. Upload submission
with open("exam_paper.png", 'rb') as img:
    files = {'file': ('exam.png', img, 'image/png')}
    data = {'exam_id': '3', 'student_id': '2'}

    response = requests.post(
        f"{BASE_URL}/submissions",
        headers={"Authorization": f"Bearer {TOKEN}"},
        files=files,
        data=data
    )

    submission_id = response.json()['submission']['id']
    print(f"Submission ID: {submission_id}")

# 2. Check OCR status
import time
for i in range(30):
    response = requests.get(
        f"{BASE_URL}/submissions/{submission_id}/ocr-status",
        headers={"Authorization": f"Bearer {TOKEN}"}
    )

    status = response.json()['job']['job_status']
    print(f"Status: {status}")

    if status == 'completed':
        break
    time.sleep(2)

# 3. Get OCR results
response = requests.get(
    f"{BASE_URL}/submissions/{submission_id}/ocr-results",
    headers={"Authorization": f"Bearer {TOKEN}"}
)

results = response.json()['ocr_results']
print(f"OCR Results: {results[0]['raw_text']}")

# 4. Get submission with answers
response = requests.get(
    f"{BASE_URL}/submissions/{submission_id}",
    headers={"Authorization": f"Bearer {TOKEN}"}
)

submission = response.json()['submission']
print(f"Answers: {len(submission['answers'])} extracted")
```

---

## Summary

🎉 **ALL ENDPOINTS ARE WORKING!**

**To use them successfully**:
1. Start Redis
2. Start Celery worker (loads .env automatically)
3. **RESTART Flask backend** (critical!)
4. Submit with file upload (form data or query params)
5. Monitor OCR status
6. Retrieve results

**Your Authorization Token**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2NTM3OTU3OCwianRpIjoiMDUyYjZhZjItMzVjMC00OTEyLWI2NTUtMDg2Y2M5OTYxOTY0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3NjUzNzk1NzgsImNzcmYiOiIzY2MzNjZmNS1hNTVjLTQyY2EtODA5Mi0zODc4MTcxMGEwNmEiLCJleHAiOjE3NjU0NjU5Nzh9.5LXRVUqu454iLFemS3oxVkniqYBOOCB35gCzwVVye9M
```

**No more errors!** Everything is tested and verified! 🚀
