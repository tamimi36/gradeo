# API Endpoints Guide

## Overview
This document lists all the newly added API endpoints for the Exam Scanner application.

## Table of Contents
1. [Exams Management](#exams-management)
2. [Questions Management](#questions-management)
3. [Answer Keys Management](#answer-keys-management)
4. [Submissions Management](#submissions-management)
5. [Grading Management](#grading-management)

---

## Exams Management

### Base Path: `/api/v1/exams`

#### List/Create Exams
- **GET** `/api/v1/exams` - Get list of exams (role-based filtering)
  - Query params: `page`, `per_page`, `is_published`, `is_active`
  - Students: See only published & active exams
  - Teachers: See their own exams
  - Admins: See all exams

- **POST** `/api/v1/exams` - Create new exam (Teacher/Admin only)
  - Required: `title`
  - Optional: `description`, `duration_minutes`, `start_date`, `end_date`

#### Single Exam Operations
- **GET** `/api/v1/exams/{exam_id}` - Get exam details with questions
- **PUT** `/api/v1/exams/{exam_id}` - Update exam (Owner/Admin only)
- **DELETE** `/api/v1/exams/{exam_id}` - Delete exam (Owner/Admin only)

#### Publish/Unpublish
- **POST** `/api/v1/exams/{exam_id}/publish` - Toggle exam published status (Owner/Admin only)

---

## Questions Management

### Base Path: `/api/v1/exams/{exam_id}/questions`

#### List/Add Questions
- **GET** `/api/v1/exams/{exam_id}/questions` - Get all questions for an exam
- **POST** `/api/v1/exams/{exam_id}/questions` - Add question to exam (Owner/Admin only)
  - Required: `question_text`, `question_type`, `points`, `order_number`
  - Optional: `requires_review`, `options` (for multiple choice)

#### Single Question Operations
- **GET** `/api/v1/exams/{exam_id}/questions/{question_id}` - Get question details
- **PUT** `/api/v1/exams/{exam_id}/questions/{question_id}` - Update question (Owner/Admin only)
- **DELETE** `/api/v1/exams/{exam_id}/questions/{question_id}` - Delete question (Owner/Admin only)

#### Question Options (Multiple Choice)
- **POST** `/api/v1/exams/{exam_id}/questions/{question_id}/options` - Add option (Owner/Admin only)
- **DELETE** `/api/v1/exams/{exam_id}/questions/{question_id}/options/{option_id}` - Delete option (Owner/Admin only)

---

## Answer Keys Management

### Base Path: `/api/v1/exams/{exam_id}/answer-keys`

#### Bulk Operations
- **GET** `/api/v1/exams/{exam_id}/answer-keys` - Get all answer keys (Owner/Admin only)
- **POST** `/api/v1/exams/{exam_id}/answer-keys` - Add answer keys in bulk (JSON format)
  - Accepts array of: `{question_id, correct_answer, answer_type, points}`

#### File Upload
- **POST** `/api/v1/exams/{exam_id}/answer-keys/upload` - Upload answer keys from file (CSV/JSON)
  - Supported formats: CSV, JSON
  - CSV format: `question_id,correct_answer,answer_type,points`
  - JSON format: `{"answer_keys": [...]}`

#### Single Answer Key Operations
- **GET** `/api/v1/exams/{exam_id}/answer-keys/{question_id}` - Get answer key for question
- **PUT** `/api/v1/exams/{exam_id}/answer-keys/{question_id}` - Update answer key
- **DELETE** `/api/v1/exams/{exam_id}/answer-keys/{question_id}` - Delete answer key

---

## Submissions Management

### Base Path: `/api/v1/submissions`

#### List/Upload Submissions
- **GET** `/api/v1/submissions` - Get list of submissions (role-based filtering)
  - Query params: `page`, `per_page`, `exam_id`, `status`
  - Students: See their own submissions
  - Teachers: See submissions for their exams
  - Admins: See all submissions

- **POST** `/api/v1/submissions` - Upload scanned exam paper
  - Form data: `exam_id`, `file` (image or PDF)
  - Optional (Teacher/Admin): `student_id`
  - Accepted formats: PNG, JPG, JPEG, PDF

#### Single Submission Operations
- **GET** `/api/v1/submissions/{submission_id}` - Get submission details with answers & grade
- **DELETE** `/api/v1/submissions/{submission_id}` - Delete submission (if not completed or admin)

#### Reprocessing
- **POST** `/api/v1/submissions/{submission_id}/reprocess` - Trigger OCR reprocessing (Teacher/Admin only)

#### Filter by Exam/Student
- **GET** `/api/v1/submissions/exam/{exam_id}` - Get all submissions for an exam
- **GET** `/api/v1/submissions/student/{student_id}` - Get all submissions for a student (Teacher/Admin only)

---

## Grading Management

### Base Path: `/api/v1/grading`

#### Grades
- **GET** `/api/v1/grading/grades` - Get list of grades (role-based filtering)
  - Query params: `page`, `per_page`, `exam_id`, `is_finalized`

- **GET** `/api/v1/grading/grades/{grade_id}` - Get grade details with adjustments
- **GET** `/api/v1/grading/grades/submission/{submission_id}` - Get grade for a submission

#### Grade Finalization
- **POST** `/api/v1/grading/grades/{grade_id}/finalize` - Finalize grade after review (Teacher/Admin only)
  - Optional: `notes`

#### Grade Adjustments
- **GET** `/api/v1/grading/grades/{grade_id}/adjustments` - Get all adjustments for a grade
- **POST** `/api/v1/grading/grades/{grade_id}/adjustments` - Add grade adjustment (Teacher/Admin only)
  - Required: `question_id`, `adjusted_score`, `adjustment_reason`

#### Review Queue
- **GET** `/api/v1/grading/review-queue` - Get review queue items (Teacher/Admin only)
  - Query params: `page`, `per_page`, `exam_id`, `status`

- **GET** `/api/v1/grading/review-queue/{review_id}` - Get review item details
- **PUT** `/api/v1/grading/review-queue/{review_id}` - Update review item (approve/reject)
  - Required: `review_status` (approved/rejected)
  - Optional: `review_notes`, `adjusted_score`

- **GET** `/api/v1/grading/review-queue/exam/{exam_id}` - Get review queue for specific exam

---

## Authentication

All endpoints (except auth endpoints) require JWT authentication:
- Include `Authorization: Bearer <token>` header
- Get token from `/api/v1/auth/login` endpoint

## File Storage

- Files are stored locally in `uploads/` directory
- Structure: `uploads/submissions/` for student papers
- Each file gets a unique timestamp-based name
- Easy to migrate to cloud storage later

## Swagger Documentation

Access interactive API documentation at: `http://localhost:5001/api/v1/swagger/`

## Role-Based Access Control

- **Student**: Can view published exams, submit papers, view own grades
- **Teacher**: Can create exams, manage questions/answers, grade submissions for their exams
- **Admin**: Full access to all resources

---

## Example Usage

### 1. Create an Exam (Teacher)
```bash
POST /api/v1/exams
{
  "title": "Midterm Exam",
  "description": "Mathematics Midterm",
  "duration_minutes": 120,
  "start_date": "2025-01-15T09:00:00Z",
  "end_date": "2025-01-15T11:00:00Z"
}
```

### 2. Add Questions
```bash
POST /api/v1/exams/1/questions
{
  "question_text": "What is 2 + 2?",
  "question_type": "multiple_choice",
  "points": 5,
  "order_number": 1,
  "options": [
    {"option_text": "3", "order_number": 1, "is_correct": false},
    {"option_text": "4", "order_number": 2, "is_correct": true},
    {"option_text": "5", "order_number": 3, "is_correct": false}
  ]
}
```

### 3. Add Answer Keys (Bulk)
```bash
POST /api/v1/exams/1/answer-keys
{
  "answer_keys": [
    {
      "question_id": 1,
      "correct_answer": "4",
      "answer_type": "multiple_choice",
      "points": 5
    }
  ]
}
```

### 4. Upload Submission (Student)
```bash
POST /api/v1/submissions
Content-Type: multipart/form-data

exam_id=1
file=<scanned_paper.pdf>
```

### 5. View Grade (Student)
```bash
GET /api/v1/grading/grades/submission/1
```

### 6. Adjust Grade (Teacher)
```bash
POST /api/v1/grading/grades/1/adjustments
{
  "question_id": 1,
  "adjusted_score": 4.5,
  "adjustment_reason": "Partial credit for showing work"
}
```

---

## Notes

1. **OCR Processing**: Currently marked as TODO - needs to be integrated with your OCR service
2. **File Validation**: All uploads are validated for type and size (max 16MB by default)
3. **Error Handling**: All endpoints return consistent error messages with `status` field
4. **Pagination**: Most list endpoints support pagination with `page` and `per_page` parameters
5. **Database Transactions**: All write operations use transactions with proper rollback on errors

## Next Steps

1. Integrate OCR processing service
2. Add background job queue for async processing
3. Implement file serving endpoint for viewing uploaded papers
4. Add analytics/statistics endpoints
5. Consider adding bulk import/export features
