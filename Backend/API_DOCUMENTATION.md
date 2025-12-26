# Exam Scanner API - Complete Documentation
## Production-Ready API for Web & Mobile Applications

**Base URL**: `http://your-domain.com/api/v1`
**Authentication**: Bearer Token (JWT)
**Version**: 1.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Exam Management](#exam-management)
3. [Submissions & OCR](#submissions--ocr)
4. [Advanced OCR Management](#advanced-ocr-management)
5. [Grading System](#grading-system)
6. [Response Codes](#response-codes)
7. [Error Handling](#error-handling)
8. [Mobile App Integration](#mobile-app-integration)

---

## Authentication

### Login
**POST** `/auth/login`

```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "roles": ["teacher"]
  },
  "status": "success"
}
```

**Use the `access_token` in all subsequent requests:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Exam Management

### Create Exam
**POST** `/exams`

```json
Request:
{
  "title": "Mathematics Final Exam",
  "description": "Final exam for Grade 10 Mathematics",
  "duration_minutes": 90,
  "subject_type": "mathematics",
  "primary_language": "en",
  "has_formulas": true,
  "has_diagrams": false,
  "is_published": true,
  "is_active": true
}

Response (201):
{
  "exam": {
    "id": 1,
    "title": "Mathematics Final Exam",
    "total_points": 0.0,
    "created_at": "2025-12-11T10:00:00"
  },
  "status": "success"
}
```

### Add Question
**POST** `/exams/{exam_id}/questions`

```json
Request:
{
  "question_text": "What is 2 + 2?",
  "question_type": "open_ended",
  "points": 10.0,
  "order_number": 1
}

Response (201):
{
  "question": {
    "id": 1,
    "exam_id": 1,
    "question_text": "What is 2 + 2?",
    "points": 10.0
  },
  "status": "success"
}
```

### Add Answer Key
**POST** `/exams/{exam_id}/answer-keys`

```json
Request:
{
  "question_id": 1,
  "correct_answer": "4",
  "answer_type": "open_ended",
  "keywords": ["4", "four"],
  "strictness_level": "normal"
}

Response (201):
{
  "answer_key": {
    "id": 1,
    "question_id": 1,
    "correct_answer": "4"
  },
  "status": "success"
}
```

---

## Submissions & OCR

### Upload Submission (with Image)
**POST** `/submissions`

**Content-Type**: `multipart/form-data`

```
Form Data:
  file: <image file>
  exam_id: 1
  student_id: 5 (optional, for teachers/admins)

Response (201):
{
  "submission": {
    "id": 1,
    "exam_id": 1,
    "student_id": 5,
    "scanned_paper_path": "submissions/exam1_student5_xxx.png",
    "submission_status": "pending",
    "submitted_at": "2025-12-11T10:30:00"
  },
  "task_id": "abc123-def456",
  "message": "Exam paper uploaded successfully. OCR processing has been queued.",
  "status": "success"
}
```

**Mobile Example (React Native / Flutter):**
```javascript
const formData = new FormData();
formData.append('file', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'exam_paper.jpg'
});
formData.append('exam_id', examId);

fetch(`${API_URL}/submissions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Check OCR Status
**GET** `/submissions/{submission_id}/ocr-status`

```json
Response (200):
{
  "status": "success",
  "job": {
    "id": 1,
    "submission_id": 1,
    "celery_task_id": "abc123-def456",
    "job_status": "completed",  // pending, processing, completed, failed
    "retry_count": 0,
    "error_details": null,
    "started_at": "2025-12-11T10:30:00",
    "completed_at": "2025-12-11T10:30:05"
  }
}
```

**Poll this endpoint every 2-3 seconds until `job_status` is `completed` or `failed`**

### Get OCR Results
**GET** `/submissions/{submission_id}/ocr-results`

```json
Response (200):
{
  "status": "success",
  "ocr_results": [
    {
      "id": 1,
      "submission_id": 1,
      "ocr_service": "google_vision",
      "raw_text": "Question 1: What is 2 + 2?\nAnswer: 4\n...",
      "confidence_score": 0.95,
      "created_at": "2025-12-11T10:30:05"
    }
  ]
}
```

### Get Submission Details (with Answers)
**GET** `/submissions/{submission_id}`

```json
Response (200):
{
  "submission": {
    "id": 1,
    "exam_id": 1,
    "student_id": 5,
    "submission_status": "completed",
    "submitted_at": "2025-12-11T10:30:00",
    "processed_at": "2025-12-11T10:30:05",
    "answers": [
      {
        "id": 1,
        "question_id": 1,
        "answer_text": "4",
        "confidence_score": 0.95
      }
    ]
  },
  "status": "success"
}
```

---

## Advanced OCR Management

### Detect Missing Questions
**GET** `/ocr-management/submissions/{submission_id}/missing-questions`

**Purpose**: Identify exam questions that weren't detected in the scanned paper

```json
Response (200):
{
  "submission_id": 1,
  "exam_id": 1,
  "total_questions": 10,
  "detected_questions": 8,
  "missing_questions": [
    {
      "question_id": 5,
      "question_text": "What is the capital of France?",
      "question_number": 5,
      "points": 10.0,
      "detected": false,
      "possible_matches": ["France", "capital"]
    }
  ],
  "detection_rate": 80.0,
  "status": "success"
}
```

**Mobile UI**: Display missing questions to alert student/teacher

### Generate PDF from Scanned Paper
**POST** `/ocr-management/submissions/{submission_id}/generate-pdf`

```json
Response (200):
{
  "submission_id": 1,
  "pdf_path": "pdfs/submission_1_20251211.pdf",
  "pdf_url": "/api/v1/ocr-management/download-pdf/1",
  "page_count": 3,
  "file_size": 1024000,
  "generated_at": "2025-12-11T10:35:00",
  "message": "PDF generated successfully",
  "status": "success"
}
```

### Download PDF
**GET** `/ocr-management/download-pdf/{submission_id}`

Returns PDF file for download

**Mobile Example:**
```javascript
const pdfUrl = `${API_URL}/ocr-management/download-pdf/${submissionId}`;
// Open in browser or download using library
Linking.openURL(pdfUrl);
```

### Bulk Generate PDFs for Exam (Teacher/Admin)
**POST** `/ocr-management/exams/{exam_id}/generate-all-pdfs`

```json
Response (200):
{
  "exam_id": 1,
  "total_submissions": 25,
  "successful": 24,
  "failed": 1,
  "pdf_urls": [
    "/api/v1/ocr-management/download-pdf/1",
    "/api/v1/ocr-management/download-pdf/2",
    ...
  ],
  "message": "Bulk PDF generation completed",
  "status": "success"
}
```

### OCR Quality Report
**GET** `/ocr-management/submissions/{submission_id}/ocr-quality`

```json
Response (200):
{
  "submission_id": 1,
  "average_confidence": 0.92,
  "low_confidence_areas": [
    {
      "confidence": 0.65,
      "text_sample": "unclear handwriting..."
    }
  ],
  "text_clarity_score": 0.88,
  "image_quality_score": 0.95,
  "recommendations": [
    "Overall OCR confidence is good.",
    "2 areas have low confidence. Manual review recommended."
  ],
  "status": "success"
}
```

**Mobile UI**: Show quality indicators and recommendations

### Exam OCR Statistics (Teacher/Admin)
**GET** `/ocr-management/exams/{exam_id}/ocr-statistics`

```json
Response (200):
{
  "exam_id": 1,
  "total_submissions": 25,
  "processed_submissions": 23,
  "pending_submissions": 2,
  "failed_submissions": 0,
  "average_confidence": 0.91,
  "average_processing_time": 2.5,
  "questions_missing_rate": 5.0,
  "status": "success"
}
```

**Mobile UI**: Dashboard with statistics

---

## Grading System

### Trigger Manual Grading
**POST** `/grading/grade-submission/{submission_id}`

```json
Response (200):
{
  "submission_id": 1,
  "total_score": 85.0,
  "max_score": 100.0,
  "percentage": 85.0,
  "graded_answers": 10,
  "review_queue_items": 2,
  "high_priority_reviews": 1,
  "message": "Submission graded successfully",
  "status": "success"
}
```

### Get Grading Summary
**GET** `/grading/submission/{submission_id}/summary`

```json
Response (200):
{
  "submission_id": 1,
  "grade": {
    "id": 1,
    "total_score": 85.0,
    "max_score": 100.0,
    "percentage": 85.0,
    "is_finalized": false
  },
  "answers": [
    {
      "question_id": 1,
      "answer_text": "4",
      "correct_answer": "4",
      "is_correct": true,
      "score": 10.0,
      "confidence": 0.95
    }
  ],
  "review_queue": [
    {
      "question_id": 5,
      "review_reason": "low_ocr_confidence",
      "priority": "high"
    }
  ],
  "high_priority_reviews": 1,
  "low_priority_reviews": 1,
  "status": "success"
}
```

**Mobile UI**: Show detailed breakdown with each answer's score

### Get Grade for Submission
**GET** `/grading/grades/submission/{submission_id}`

```json
Response (200):
{
  "grade": {
    "id": 1,
    "submission_id": 1,
    "total_score": 85.0,
    "max_score": 100.0,
    "percentage": 85.0,
    "is_finalized": false,
    "auto_graded_at": "2025-12-11T10:35:00",
    "adjustments": [
      {
        "id": 1,
        "question_id": 2,
        "original_score": 10.0,
        "adjusted_score": 12.0,
        "adjustment_reason": "Partial credit for showing work"
      }
    ]
  },
  "status": "success"
}
```

### Add Grade Adjustment (Teacher/Admin)
**POST** `/grading/grades/{grade_id}/adjustments`

```json
Request:
{
  "question_id": 2,
  "adjusted_score": 12.0,
  "adjustment_reason": "Partial credit for showing work"
}

Response (201):
{
  "adjustment": {
    "id": 1,
    "grade_id": 1,
    "question_id": 2,
    "original_score": 10.0,
    "adjusted_score": 12.0,
    "adjustment_reason": "Partial credit for showing work",
    "adjusted_by": 3,
    "adjusted_at": "2025-12-11T11:00:00"
  },
  "grade": {
    "id": 1,
    "total_score": 87.0,  // Updated
    "percentage": 87.0
  },
  "message": "Grade adjustment added successfully",
  "status": "success"
}
```

### Finalize Grade (Teacher/Admin)
**POST** `/grading/grades/{grade_id}/finalize`

```json
Request:
{
  "notes": "Good work overall. Keep practicing formulas."
}

Response (200):
{
  "grade": {
    "id": 1,
    "total_score": 87.0,
    "percentage": 87.0,
    "is_finalized": true,
    "finalized_at": "2025-12-11T11:05:00",
    "finalized_by": 3,
    "notes": "Good work overall. Keep practicing formulas."
  },
  "message": "Grade finalized successfully",
  "status": "success"
}
```

**Once finalized, grades are locked and cannot be changed**

### Review Queue (Teacher/Admin)
**GET** `/grading/review-queue?exam_id={exam_id}&status=pending`

```json
Response (200):
{
  "review_items": [
    {
      "id": 1,
      "submission_id": 1,
      "question_id": 5,
      "review_status": "pending",
      "review_reason": "low_ocr_confidence",
      "priority": "high",
      "created_at": "2025-12-11T10:35:00"
    }
  ],
  "total": 5,
  "page": 1,
  "per_page": 10,
  "status": "success"
}
```

### Update Review Item (Teacher/Admin)
**PUT** `/grading/review-queue/{review_id}`

```json
Request:
{
  "review_status": "approved",
  "review_notes": "Answer is correct",
  "adjusted_score": 10.0  // Optional
}

Response (200):
{
  "review_item": {
    "id": 1,
    "review_status": "approved",
    "reviewed_by": 3,
    "reviewed_at": "2025-12-11T11:10:00"
  },
  "message": "Review completed successfully",
  "status": "success"
}
```

### Regrade Submission (Teacher/Admin)
**POST** `/grading/regrade-submission/{submission_id}`

Deletes existing grade and regrrades all answers

```json
Response (200):
{
  "submission_id": 1,
  "total_score": 90.0,
  "max_score": 100.0,
  "percentage": 90.0,
  "message": "Submission regraded successfully",
  "status": "success"
}
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (validation error) |
| 401  | Unauthorized (invalid/expired token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found |
| 409  | Conflict (duplicate entry) |
| 422  | Unprocessable Entity |
| 500  | Internal Server Error |

---

## Error Handling

All errors follow this format:

```json
{
  "message": "Description of the error",
  "status": "error"
}
```

**Mobile App Error Handling:**
```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (response.ok) {
    // Success
    return data;
  } else {
    // Handle error
    throw new Error(data.message || 'Request failed');
  }
} catch (error) {
  // Show error to user
  Alert.alert('Error', error.message);
}
```

---

## Mobile App Integration

### Recommended Flow

**1. Student Submission Flow:**
```
1. Student logs in → Get access token
2. Student selects exam → GET /exams/{id}
3. Student takes photo → Capture image
4. Upload submission → POST /submissions (multipart)
5. Poll OCR status → GET /submissions/{id}/ocr-status (every 2-3s)
6. Show OCR results → GET /submissions/{id}/ocr-results
7. Show missing questions → GET /ocr-management/submissions/{id}/missing-questions
8. Show grade (if available) → GET /grading/grades/submission/{id}
```

**2. Teacher Grading Flow:**
```
1. Teacher logs in → Get access token
2. View submissions → GET /submissions?exam_id={id}
3. Select submission → GET /submissions/{id}
4. Trigger grading → POST /grading/grade-submission/{id}
5. View grading summary → GET /grading/submission/{id}/summary
6. Review flagged answers → GET /grading/review-queue?exam_id={id}
7. Approve/reject reviews → PUT /grading/review-queue/{id}
8. Add manual adjustments → POST /grading/grades/{id}/adjustments
9. Finalize grade → POST /grading/grades/{id}/finalize
10. Generate PDF → POST /ocr-management/submissions/{id}/generate-pdf
```

**3. Token Refresh:**
```javascript
// Check token expiry
if (tokenExpired) {
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshToken}`
    }
  });

  const { access_token } = await response.json();
  // Save new access token
}
```

### State Management (React Native Example)

```javascript
// Store in Redux/Context
const ExamContext = {
  currentExam: null,
  submissions: [],
  ocrStatus: {},
  grades: {}
};

// Actions
const uploadSubmission = async (examId, imageUri) => {
  const formData = new FormData();
  formData.append('file', { uri: imageUri, type: 'image/jpeg', name: 'exam.jpg' });
  formData.append('exam_id', examId);

  const response = await api.post('/submissions', formData);
  return response.data.submission;
};

const pollOCRStatus = async (submissionId) => {
  const interval = setInterval(async () => {
    const { job } = await api.get(`/submissions/${submissionId}/ocr-status`);

    if (job.job_status === 'completed') {
      clearInterval(interval);
      // Fetch results
      const results = await api.get(`/submissions/${submissionId}/ocr-results`);
      return results;
    }
  }, 3000);
};
```

### UI Components

**Submission Status Badge:**
```javascript
const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'yellow',
    processing: 'blue',
    completed: 'green',
    failed: 'red'
  };

  return (
    <Badge color={colors[status]}>
      {status.toUpperCase()}
    </Badge>
  );
};
```

**OCR Confidence Indicator:**
```javascript
const ConfidenceBar = ({ confidence }) => {
  const color = confidence > 0.8 ? 'green' : confidence > 0.6 ? 'yellow' : 'red';

  return (
    <View style={{flexDirection: 'row'}}>
      <Text>Confidence: {(confidence * 100).toFixed(0)}%</Text>
      <ProgressBar progress={confidence} color={color} />
    </View>
  );
};
```

---

## Testing

Use the provided test script to verify all endpoints:

```bash
python test_finalization.py
```

---

## Support

For API issues or questions:
- Check Swagger UI: `http://your-domain.com/api/swagger/`
- Review this documentation
- Check server logs for detailed error messages

---

## Changelog

### Version 1.0 (2025-12-11)
- ✅ Complete OCR system with Google Vision API
- ✅ Automatic grading with confidence scores
- ✅ Missing question detection
- ✅ PDF generation from scanned papers
- ✅ Bulk operations for teachers
- ✅ Review queue management
- ✅ Grade adjustments and finalization
- ✅ Comprehensive statistics and reports
- ✅ Production-ready for web and mobile apps

---

**🎉 The API is production-ready and fully tested!**
