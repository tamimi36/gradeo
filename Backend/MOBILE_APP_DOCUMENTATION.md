# GRADEO - Mobile App Development Guide

**Complete API Integration & UX Documentation**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [API Architecture Overview](#api-architecture-overview)
3. [Authentication & Authorization](#authentication--authorization)
4. [Database Schema Reference](#database-schema-reference)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Mobile App Architecture](#mobile-app-architecture)
8. [Screen-by-Screen Breakdown](#screen-by-screen-breakdown)
9. [User Flows](#user-flows)
10. [UX Best Practices](#ux-best-practices)
11. [Technical Implementation Guide](#technical-implementation-guide)
12. [Error Handling](#error-handling)
13. [Performance Optimization](#performance-optimization)

---

## Executive Summary

**Gradeo** is an AI-powered exam grading platform that allows:
- **Teachers** to create exams, scan student submissions, and leverage automated grading with AI assistance
- **Students** to submit handwritten exam papers via mobile scan
- **Admins** to manage users and system operations

### Core Technology Stack (Backend)
- **Framework**: Flask (Python 3.13+)
- **Database**: SQLAlchemy ORM (SQLite/PostgreSQL)
- **Authentication**: JWT + OAuth 2.0 (Google, Microsoft)
- **OCR**: Google Cloud Vision API
- **AI**: Google Gemini, OpenAI, Anthropic Claude
- **Background Jobs**: Celery + Redis
- **API Documentation**: Swagger/OpenAPI at `/api/swagger/`

### Key Features
1. Multi-role authentication with social login
2. Handwritten exam OCR with Arabic & English support
3. AI-powered auto-grading with keyword matching
4. Manual review queue for low-confidence answers
5. Advanced analytics (weakness heatmaps, difficulty tracking)
6. Misconception detection
7. Student progress tracking
8. Real-time submission processing

---

## API Architecture Overview

### Base Configuration
```
Base URL: /api/v1/
Swagger Docs: /api/swagger/
Authentication: JWT Bearer Tokens
Content-Type: application/json (for JSON) or multipart/form-data (for file uploads)
```

### Authentication Headers
```
Authorization: Bearer {access_token}
```

### Response Format
**Success Response:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication & Authorization

### 1. Registration Flow

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "first_name": "Ahmed",
  "last_name": "Hassan",
  "role": "student"  // "student", "teacher", or "admin"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Registration successful. Please check your email for OTP verification.",
  "data": {
    "user_id": 1,
    "email": "student@example.com",
    "otp_sent": true
  }
}
```

**Mobile UX:**
- Clear password requirements (min 8 chars, uppercase, lowercase, number)
- Real-time email validation
- Role selection with visual icons (student, teacher, admin)
- Progress indicator: "Step 1 of 2: Create Account"

---

### 2. OTP Verification

**Endpoint:** `POST /api/v1/auth/verify-otp`

**Request Body:**
```json
{
  "email": "student@example.com",
  "otp_code": "123456",
  "otp_type": "registration"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Email verified successfully. You can now login.",
  "data": {
    "is_verified": true,
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "email": "student@example.com",
      "first_name": "Ahmed",
      "last_name": "Hassan",
      "roles": ["student"],
      "avatar_url": null,
      "is_verified": true
    }
  }
}
```

**Mobile UX:**
- 6-digit OTP input with auto-focus
- Auto-submit on 6th digit entry
- Resend OTP button (5-minute cooldown)
- Visual countdown timer
- "Didn't receive code?" help text

---

### 3. Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "email": "student@example.com",
      "first_name": "Ahmed",
      "last_name": "Hassan",
      "roles": ["student"],
      "is_verified": true,
      "avatar_url": null
    }
  }
}
```

**Token Lifecycle:**
- **Access Token**: 24 hours expiry
- **Refresh Token**: 30 days expiry
- Store securely using:
  - iOS: Keychain
  - Android: EncryptedSharedPreferences

---

### 4. OAuth 2.0 Social Login

**Google Sign-In:**
```
GET /api/v1/auth/google/authorize
→ Redirects to Google OAuth consent screen
→ Callback: GET /api/v1/auth/google/callback
```

**Microsoft Sign-In:**
```
GET /api/v1/auth/microsoft/authorize
→ Redirects to Microsoft OAuth consent screen
→ Callback: GET /api/v1/auth/microsoft/callback
```

**Mobile Implementation:**
- Use platform-specific OAuth libraries:
  - **iOS**: `GoogleSignIn`, `MSAL` (Microsoft Authentication Library)
  - **Android**: `Google Sign-In SDK`, `MSAL Android`
  - **React Native**: `@react-native-google-signin/google-signin`, `react-native-msal`
  - **Flutter**: `google_sign_in`, `msal_flutter`

**OAuth Flow:**
1. User taps "Sign in with Google/Microsoft"
2. Native OAuth library handles authentication
3. Get authorization code/token
4. Send to backend `/auth/google/callback` or `/auth/microsoft/callback`
5. Backend returns JWT tokens + user data
6. Store tokens locally

---

### 5. Token Refresh

**Endpoint:** `POST /api/v1/auth/refresh`

**Headers:**
```
Authorization: Bearer {refresh_token}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Mobile Implementation:**
- Implement automatic token refresh interceptor
- Refresh token 5 minutes before expiry
- Queue failed requests and retry after refresh
- Log out user if refresh token is invalid

---

### 6. Password Reset Flow

**Step 1 - Request Reset:**
```
POST /api/v1/auth/forgot-password
{
  "email": "student@example.com"
}
```

**Step 2 - Verify Token:**
```
POST /api/v1/auth/verify-reset-token
{
  "email": "student@example.com",
  "otp_code": "123456"
}
```

**Step 3 - Reset Password:**
```
POST /api/v1/auth/reset-password
{
  "email": "student@example.com",
  "otp_code": "123456",
  "new_password": "NewSecurePass123!"
}
```

---

## Database Schema Reference

### 1. User Management

#### User Model
```typescript
interface User {
  id: number;
  username: string | null;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  last_login: string | null;  // ISO datetime

  // OAuth fields
  provider: 'local' | 'google' | 'microsoft' | null;
  provider_id: string | null;
  avatar_url: string | null;

  // Timestamps
  created_at: string;  // ISO datetime
  updated_at: string;  // ISO datetime

  // Relationships
  roles: string[];  // ["student"], ["teacher"], ["admin"]
}
```

#### Role Model
```typescript
interface Role {
  id: number;
  name: 'student' | 'teacher' | 'admin';
  description: string;
  created_at: string;
  updated_at: string;
}
```

---

### 2. Exam Management

#### Exam Model
```typescript
interface Exam {
  id: number;
  title: string;
  description: string;
  creator_id: number;
  duration_minutes: number | null;
  total_points: number;
  subject_type: 'mathematics' | 'english' | 'arabic' | 'science' | 'mixed';
  primary_language: 'en' | 'ar' | 'mixed';
  has_formulas: boolean;
  has_diagrams: boolean;
  is_published: boolean;
  is_active: boolean;
  start_date: string | null;  // ISO datetime
  end_date: string | null;    // ISO datetime
  created_at: string;
  updated_at: string;

  // Optional relationships
  questions?: Question[];
  answer_keys?: AnswerKey[];
}
```

#### Question Model
```typescript
interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'open_ended';
  points: number;
  order_number: number;
  requires_review: boolean;  // Flag for manual teacher review
  created_at: string;
  updated_at: string;

  // Optional relationships
  options?: QuestionOption[];  // Only for multiple_choice
  answer_keys?: AnswerKey[];
}
```

#### QuestionOption Model (for Multiple Choice)
```typescript
interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  order_number: number;
  is_correct: boolean;
  created_at: string;
}
```

#### AnswerKey Model
```typescript
interface AnswerKey {
  id: number;
  exam_id: number;
  question_id: number;
  correct_answer: string;  // For MCQ: option_id, for open-ended: text answer
  answer_type: 'multiple_choice' | 'open_ended';
  points: number;
  strictness_level: 'lenient' | 'normal' | 'strict';
  keywords: string[] | null;  // For open-ended grading (e.g., ["photosynthesis", "chlorophyll"])
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### 3. Submissions & OCR

#### Submission Model
```typescript
interface Submission {
  id: number;
  exam_id: number;
  student_id: number;
  scanned_paper_path: string;  // File path to scanned image
  scan_type: 'full_page' | 'per_question';
  page_count: number;
  submission_status: 'pending' | 'processing' | 'completed' | 'failed';
  submitted_at: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;

  // Optional relationships
  answers?: SubmissionAnswer[];
  grade?: Grade;
}
```

#### SubmissionAnswer Model
```typescript
interface SubmissionAnswer {
  id: number;
  submission_id: number;
  question_id: number;
  answer_text: string | null;  // Extracted OCR text
  answer_option_id: number | null;  // For MCQ
  confidence_score: number | null;  // OCR confidence (0-1)
  grading_confidence: number | null;  // Grading confidence (0-1)
  similarity_score: number | null;  // Text similarity for open-ended (0-1)
  ocr_result_id: number | null;
  extracted_bounding_box: any | null;  // JSON coordinates
  extraction_method: string | null;
  is_auto_graded: boolean;
  auto_grade_score: number | null;
  created_at: string;
  updated_at: string;
}
```

#### OCRResult Model
```typescript
interface OCRResult {
  id: number;
  submission_id: number;
  ocr_service: string;  // 'google_vision'
  ocr_strategy_id: number | null;
  raw_text: string;
  processed_text: string;
  confidence_score: number;  // 0-1
  raw_response: any;  // JSON - Full Google Vision response
  bounding_boxes: any;  // JSON - Text location coordinates
  detected_language: string;  // 'en', 'ar'
  detected_breaks: any;  // JSON - Paragraph/line breaks
  page_number: number;
  retry_count: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  processing_time_seconds: number;
  created_at: string;
  updated_at: string;
}
```

---

### 4. Grading System

#### Grade Model
```typescript
interface Grade {
  id: number;
  submission_id: number;
  total_score: number;
  max_score: number;
  percentage: number;  // (total_score / max_score) * 100
  is_finalized: boolean;  // True after teacher approval
  auto_graded_at: string;
  finalized_at: string | null;
  finalized_by: number | null;  // Teacher ID
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Optional relationships
  adjustments?: GradeAdjustment[];
}
```

#### ReviewQueue Model
```typescript
interface ReviewQueueItem {
  id: number;
  submission_id: number;
  question_id: number;
  submission_answer_id: number;
  review_status: 'pending' | 'in_review' | 'approved' | 'rejected';
  review_reason: 'low_ocr_confidence' | 'low_grading_confidence' |
                 'requires_review' | 'medium_confidence' | 'grading_error';
  priority: 'high' | 'low';  // high = must review, low = suggested
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}
```

#### GradeAdjustment Model
```typescript
interface GradeAdjustment {
  id: number;
  grade_id: number;
  question_id: number;
  original_score: number;
  adjusted_score: number;
  adjustment_reason: string;
  adjusted_by: number;  // Teacher ID
  adjusted_at: string;
  created_at: string;
}
```

---

### 5. Analytics Models

#### QuestionDifficulty Model
```typescript
interface QuestionDifficulty {
  id: number;
  question_id: number;
  total_attempts: number;
  correct_count: number;
  partial_count: number;
  incorrect_count: number;
  success_rate: number;  // 0-1
  difficulty_score: number;  // 0=easy, 1=very hard
  difficulty_level: 'easy' | 'medium' | 'hard' | 'very_hard';
  avg_time_seconds: number | null;
  median_score: number | null;
  ai_difficulty_estimate: string | null;
  ai_reasoning: string | null;
  last_updated: string;
  created_at: string;
}
```

#### StudentProgress Model
```typescript
interface StudentProgress {
  id: number;
  student_id: number;
  topic_name: string;
  total_attempts: number;
  correct_count: number;
  mastery_level: number;  // 0-1
  improvement_rate: number;  // Positive = improving, negative = declining
  first_attempt_date: string;
  last_attempt_date: string;
  is_weakness: boolean;
  weakness_severity: 'minor' | 'moderate' | 'major' | null;
  updated_at: string;
  created_at: string;
}
```

#### Misconception Model
```typescript
interface Misconception {
  id: number;
  question_id: number;
  exam_id: number;
  common_wrong_answer: string;
  student_count: number;
  affected_student_ids: number[];  // JSON array
  misconception_type: string | null;  // AI-detected type
  why_students_think_this: string | null;  // AI explanation
  how_to_correct: string | null;  // Teaching advice
  severity: 'minor' | 'moderate' | 'major' | null;
  is_resolved: boolean;
  resolved_by: number | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  detected_at: string;
  updated_at: string;
}
```

#### Cohort Model
```typescript
interface Cohort {
  id: number;
  name: string;
  cohort_type: 'class' | 'year' | 'subject' | 'custom';
  description: string;
  created_by: number;  // Teacher ID
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
}
```

---

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/verify-otp` | No | Verify email with OTP |
| POST | `/auth/resend-otp` | No | Resend OTP code |
| POST | `/auth/login` | No | Login with email/password |
| POST | `/auth/refresh` | Yes (Refresh Token) | Refresh access token |
| POST | `/auth/logout` | Yes | Logout (invalidate token) |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/verify-reset-token` | No | Verify reset token |
| POST | `/auth/reset-password` | No | Reset password |
| GET | `/auth/google/authorize` | No | Initiate Google OAuth |
| GET | `/auth/google/callback` | No | Google OAuth callback |
| GET | `/auth/microsoft/authorize` | No | Initiate Microsoft OAuth |
| GET | `/auth/microsoft/callback` | No | Microsoft OAuth callback |

---

### User Management Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/users/me` | All | Get current user profile |
| PUT | `/users/me` | All | Update current user |
| DELETE | `/users/me` | All | Delete own account |
| GET | `/users` | Teacher, Admin | List all users |
| GET | `/users/{user_id}` | Teacher, Admin | Get specific user |
| PUT | `/users/{user_id}` | Admin | Update user |
| DELETE | `/users/{user_id}` | Admin | Delete user |
| POST | `/users/{user_id}/roles` | Admin | Assign role to user |
| DELETE | `/users/{user_id}/roles/{role_id}` | Admin | Remove role from user |
| GET | `/users/students` | Teacher, Admin | List all students |
| GET | `/users/teachers` | Admin | List all teachers |

**Example: Get Current User Profile**
```
GET /api/v1/users/me
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "student@example.com",
    "first_name": "Ahmed",
    "last_name": "Hassan",
    "roles": ["student"],
    "is_verified": true,
    "avatar_url": null,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

### Exam Management Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/exams` | Teacher | Create new exam |
| GET | `/exams` | All | List exams (filtered by role) |
| GET | `/exams/{exam_id}` | All | Get exam details |
| PUT | `/exams/{exam_id}` | Teacher (owner) | Update exam |
| DELETE | `/exams/{exam_id}` | Teacher (owner) | Delete exam |
| POST | `/exams/{exam_id}/questions` | Teacher | Add question to exam |
| GET | `/exams/{exam_id}/questions` | All | List exam questions |
| GET | `/exams/{exam_id}/questions/{q_id}` | All | Get specific question |
| PUT | `/exams/{exam_id}/questions/{q_id}` | Teacher | Update question |
| DELETE | `/exams/{exam_id}/questions/{q_id}` | Teacher | Delete question |
| POST | `/exams/{exam_id}/answer-keys` | Teacher | Create answer key |
| GET | `/exams/{exam_id}/answer-keys` | Teacher | Get all answer keys |
| GET | `/exams/{exam_id}/answer-keys/{ak_id}` | Teacher | Get specific answer key |
| PUT | `/exams/{exam_id}/answer-keys/{ak_id}` | Teacher | Update answer key |
| DELETE | `/exams/{exam_id}/answer-keys/{ak_id}` | Teacher | Delete answer key |
| POST | `/exams/{exam_id}/duplicate` | Teacher | Duplicate exam |
| GET | `/exams/{exam_id}/statistics` | Teacher | Get exam statistics |

**Example: Create Exam**
```
POST /api/v1/exams
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Mathematics Midterm Exam",
  "description": "Covers chapters 1-5",
  "subject_type": "mathematics",
  "primary_language": "en",
  "has_formulas": true,
  "duration_minutes": 60,
  "total_points": 100,
  "start_date": "2025-02-01T09:00:00Z",
  "end_date": "2025-02-01T10:00:00Z"
}

Response:
{
  "status": "success",
  "message": "Exam created successfully",
  "data": {
    "id": 1,
    "title": "Mathematics Midterm Exam",
    "creator_id": 2,
    "is_published": false,
    ...
  }
}
```

**Example: Add Question**
```
POST /api/v1/exams/1/questions
Authorization: Bearer {access_token}

{
  "question_text": "Solve for x: 2x + 5 = 15",
  "question_type": "open_ended",
  "points": 5,
  "order_number": 1,
  "requires_review": false
}
```

**Example: Add Answer Key**
```
POST /api/v1/exams/1/answer-keys
Authorization: Bearer {access_token}

{
  "question_id": 1,
  "correct_answer": "x = 5",
  "answer_type": "open_ended",
  "points": 5,
  "strictness_level": "normal",
  "keywords": ["x", "5", "equals", "="]
}
```

---

### Submission Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/submissions` | Student | Upload submission |
| GET | `/submissions` | All | List submissions (filtered by role) |
| GET | `/submissions/{sub_id}` | Student (owner), Teacher | Get submission details |
| DELETE | `/submissions/{sub_id}` | Student (owner), Teacher | Delete submission |
| GET | `/submissions/{sub_id}/answers` | Student (owner), Teacher | Get submission answers |
| PUT | `/submissions/{sub_id}/answers/{ans_id}` | Teacher | Update answer |
| POST | `/submissions/{sub_id}/reprocess` | Teacher | Reprocess OCR |
| GET | `/submissions/exam/{exam_id}` | Teacher | List submissions for exam |
| GET | `/submissions/student/{student_id}` | Teacher, Student (self) | List student submissions |

**Example: Submit Exam (Student)**
```
POST /api/v1/submissions
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Form Data:
- exam_id: 1
- scanned_paper: [File - JPG/PNG/PDF, max 16MB]
- scan_type: "full_page"

Response:
{
  "status": "success",
  "message": "Submission uploaded successfully. OCR processing started.",
  "data": {
    "submission_id": 1,
    "exam_id": 1,
    "student_id": 1,
    "submission_status": "processing",
    "scanned_paper_path": "submissions/submission_20250115_143025_abc123.jpg",
    "submitted_at": "2025-01-15T14:30:25Z"
  }
}
```

**Example: Get Submission Status**
```
GET /api/v1/submissions/1
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "data": {
    "id": 1,
    "exam_id": 1,
    "student_id": 1,
    "submission_status": "completed",  // or "processing", "failed"
    "processed_at": "2025-01-15T14:32:15Z",
    "answers": [...],  // if include_answers=true
    "grade": {...}     // if include_grade=true
  }
}
```

---

### Grading Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/grading/submission/{sub_id}` | Teacher | Grade submission |
| GET | `/grading/submission/{sub_id}` | Teacher, Student (owner) | Get grading results |
| POST | `/grading/submission/{sub_id}/regrade` | Teacher | Regrade submission |
| GET | `/grading/review-queue` | Teacher | Get review queue |
| GET | `/grading/review-queue/{item_id}` | Teacher | Get review item |
| POST | `/grading/review-queue/{item_id}/review` | Teacher | Mark as reviewed |
| POST | `/grading/review-queue/{item_id}/skip` | Teacher | Skip review item |
| POST | `/grading/adjust/{grade_id}` | Teacher | Adjust grade manually |
| POST | `/grading/finalize/{grade_id}` | Teacher | Finalize grade |

**Example: Get Grading Results**
```
GET /api/v1/grading/submission/1
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "data": {
    "grade": {
      "id": 1,
      "submission_id": 1,
      "total_score": 85.5,
      "max_score": 100,
      "percentage": 85.5,
      "is_finalized": false,
      "auto_graded_at": "2025-01-15T14:32:15Z"
    },
    "answers": [
      {
        "question_id": 1,
        "answer_text": "x = 5",
        "auto_grade_score": 5,
        "grading_confidence": 0.95,
        "is_auto_graded": true
      },
      ...
    ],
    "review_queue_items": [
      {
        "question_id": 3,
        "review_reason": "low_ocr_confidence",
        "priority": "high",
        "review_status": "pending"
      }
    ]
  }
}
```

**Example: Review Queue Item**
```
POST /api/v1/grading/review-queue/1/review
Authorization: Bearer {access_token}

{
  "corrected_answer_text": "x = 5",
  "manual_score": 5,
  "review_notes": "OCR misread '5' as 'S', manually corrected"
}

Response:
{
  "status": "success",
  "message": "Review completed successfully"
}
```

**Example: Finalize Grade**
```
POST /api/v1/grading/finalize/1
Authorization: Bearer {access_token}

{
  "notes": "Excellent work on algebra questions"
}

Response:
{
  "status": "success",
  "message": "Grade finalized successfully",
  "data": {
    "grade_id": 1,
    "is_finalized": true,
    "finalized_at": "2025-01-15T15:00:00Z",
    "finalized_by": 2
  }
}
```

---

### OCR Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/ocr/process/{sub_id}` | Teacher | Trigger OCR processing |
| GET | `/ocr/status/{sub_id}` | Teacher, Student (owner) | Get OCR status |
| GET | `/ocr/results/{sub_id}` | Teacher | Get OCR results |
| POST | `/ocr/reprocess/{sub_id}` | Teacher | Reprocess OCR |

**Example: Get OCR Status**
```
GET /api/v1/ocr/status/1
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "data": {
    "submission_id": 1,
    "ocr_status": "completed",  // or "processing", "failed"
    "processing_job": {
      "job_status": "completed",
      "started_at": "2025-01-15T14:30:30Z",
      "completed_at": "2025-01-15T14:32:00Z",
      "retry_count": 0
    },
    "ocr_results": [
      {
        "confidence_score": 0.92,
        "detected_language": "en",
        "processing_time_seconds": 1.5
      }
    ]
  }
}
```

---

### Analytics Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/analytics/weakness-heatmap/exam/{exam_id}` | Teacher | Student weakness heatmap |
| GET | `/analytics/question-difficulty/exam/{exam_id}` | Teacher | Question difficulty tracking |
| GET | `/analytics/cohort-comparison` | Teacher | Compare cohorts |
| GET | `/analytics/student-progress/{student_id}` | Teacher, Student (self) | Student progress timeline |
| GET | `/analytics/misconceptions/exam/{exam_id}` | Teacher | Detect misconceptions |
| POST | `/analytics/misconceptions/{misc_id}/resolve` | Teacher | Mark misconception resolved |

**Example: Weakness Heatmap**
```
GET /api/v1/analytics/weakness-heatmap/exam/1
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "data": {
    "exam_id": 1,
    "heatmap": [
      {
        "student_id": 1,
        "student_name": "Ahmed Hassan",
        "topics": [
          {
            "topic_name": "Algebra",
            "mastery_level": 45.5,  // percentage
            "is_weakness": true,
            "weakness_severity": "moderate"
          },
          {
            "topic_name": "Geometry",
            "mastery_level": 85.0,
            "is_weakness": false
          }
        ]
      }
    ]
  }
}
```

**Example: Student Progress**
```
GET /api/v1/analytics/student-progress/1
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "data": {
    "student_id": 1,
    "progress_timeline": [
      {
        "topic_name": "Algebra",
        "total_attempts": 15,
        "correct_count": 10,
        "mastery_level": 66.7,
        "improvement_rate": 0.15,  // 15% improvement
        "trend": "improving"
      },
      ...
    ]
  }
}
```

---

### AI Features Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/ai/explain-answer/{answer_id}` | All | Generate AI explanation |
| POST | `/ai/proofread/{answer_id}` | Teacher | Proofread OCR text |
| POST | `/ai/compare-reasoning/{answer_id}` | Teacher | Smart reasoning comparison |
| GET | `/ai/estimate-difficulty/exam/{exam_id}` | Teacher | Estimate exam difficulty |
| POST | `/ai/batch-analyze/exam/{exam_id}` | Teacher | Batch analyze answers |
| GET | `/ai/cache/stats` | Teacher | AI cache statistics |
| DELETE | `/ai/cache/clear` | Admin | Clear AI cache |

**Example: Explain Answer (AI)**
```
POST /api/v1/ai/explain-answer/1
Authorization: Bearer {access_token}

Response:
{
  "status": "success",
  "data": {
    "answer_id": 1,
    "student_answer": "x = 3",
    "correct_answer": "x = 5",
    "ai_explanation": "You made an algebraic error. When solving 2x + 5 = 15, you need to subtract 5 from both sides to get 2x = 10, then divide by 2 to get x = 5. It appears you might have subtracted 5 from 15 incorrectly.",
    "how_to_correct": "Practice order of operations: 1) Subtract 5 from both sides, 2) Divide both sides by 2.",
    "cached": false
  }
}
```

---

## User Roles & Permissions

### Role Matrix

| Feature | Student | Teacher | Admin |
|---------|---------|---------|-------|
| Register/Login | ✅ | ✅ | ✅ |
| OAuth Social Login | ✅ | ✅ | ✅ |
| View Own Profile | ✅ | ✅ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ |
| Delete Own Account | ✅ | ✅ | ✅ |
| **Exams** |
| View Published Exams | ✅ | ✅ | ✅ |
| Create Exams | ❌ | ✅ | ✅ |
| Edit Own Exams | ❌ | ✅ (owner) | ✅ |
| Delete Exams | ❌ | ✅ (owner) | ✅ |
| View All Exams | ❌ | ✅ (own) | ✅ |
| **Submissions** |
| Submit Exam Papers | ✅ | ✅ | ✅ |
| View Own Submissions | ✅ | ✅ | ✅ |
| View All Submissions | ❌ | ✅ (for own exams) | ✅ |
| Reprocess OCR | ❌ | ✅ | ✅ |
| **Grading** |
| View Own Grades | ✅ | ✅ | ✅ |
| Auto-Grade Submissions | ❌ | ✅ | ✅ |
| Manual Grade Adjustment | ❌ | ✅ | ✅ |
| Access Review Queue | ❌ | ✅ | ✅ |
| Finalize Grades | ❌ | ✅ | ✅ |
| **Analytics** |
| View Own Progress | ✅ | ✅ | ✅ |
| View Weakness Heatmap | ❌ | ✅ | ✅ |
| View Question Difficulty | ❌ | ✅ | ✅ |
| View Misconceptions | ❌ | ✅ | ✅ |
| Compare Cohorts | ❌ | ✅ | ✅ |
| **AI Features** |
| View AI Explanations | ✅ | ✅ | ✅ |
| Proofread OCR | ❌ | ✅ | ✅ |
| Batch AI Analysis | ❌ | ✅ | ✅ |
| **Admin** |
| Manage Users | ❌ | ❌ | ✅ |
| Assign Roles | ❌ | ❌ | ✅ |
| OCR Job Management | ❌ | ❌ | ✅ |
| Clear AI Cache | ❌ | ❌ | ✅ |

---

## Mobile App Architecture

### Recommended Tech Stack

#### Option 1: React Native (Cross-Platform)
```
- Framework: React Native 0.73+
- State Management: Redux Toolkit + RTK Query
- Navigation: React Navigation 6
- UI Library: React Native Paper / NativeBase
- Camera: react-native-vision-camera
- Image Processing: react-native-image-crop-picker
- PDF Viewing: react-native-pdf
- Charts: react-native-chart-kit / Victory Native
- OAuth: @react-native-google-signin/google-signin, react-native-msal
- Storage: @react-native-async-storage/async-storage
- Network: Axios with interceptors
- Notifications: @react-native-firebase/messaging
```

#### Option 2: Flutter (Cross-Platform)
```
- Framework: Flutter 3.16+
- State Management: Riverpod / Bloc
- Routing: GoRouter
- UI: Material 3 / Cupertino
- Camera: camera + image_picker
- Image Processing: image_cropper
- PDF: flutter_pdfview
- Charts: fl_chart
- OAuth: google_sign_in, msal_flutter
- Storage: flutter_secure_storage
- Network: Dio with interceptors
- Notifications: firebase_messaging
```

#### Option 3: Native (iOS + Android)
```
iOS:
- Language: Swift 5.9+
- UI: SwiftUI
- Networking: URLSession / Alamofire
- Storage: Keychain
- Camera: AVFoundation
- OAuth: GoogleSignIn-iOS, MSAL

Android:
- Language: Kotlin 1.9+
- UI: Jetpack Compose
- Networking: Retrofit + OkHttp
- Storage: EncryptedSharedPreferences
- Camera: CameraX
- OAuth: Google Sign-In SDK, MSAL Android
```

---

### App Architecture Pattern

**Recommended: Clean Architecture with MVVM**

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│   ┌─────────────┐      ┌────────────┐     │
│   │   Screens   │◄─────┤ ViewModels │     │
│   │  (UI/UX)    │      │  (Logic)   │     │
│   └─────────────┘      └────────────┘     │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│            Domain Layer                     │
│   ┌──────────────┐    ┌──────────────┐    │
│   │  Use Cases   │    │   Models     │    │
│   │ (Business)   │    │ (Entities)   │    │
│   └──────────────┘    └──────────────┘    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│             Data Layer                      │
│   ┌─────────────┐     ┌──────────────┐    │
│   │ Repositories│◄────┤ Data Sources │    │
│   │             │     │  (API, DB)   │    │
│   └─────────────┘     └──────────────┘    │
└─────────────────────────────────────────────┘
```

**Folder Structure (React Native Example):**
```
src/
├── api/
│   ├── client.ts              # Axios instance with interceptors
│   ├── endpoints.ts           # API endpoint constants
│   └── services/
│       ├── authService.ts     # Authentication API calls
│       ├── examService.ts     # Exam management
│       ├── submissionService.ts
│       ├── gradingService.ts
│       └── analyticsService.ts
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── exam/
│   │   ├── ExamCard.tsx
│   │   ├── QuestionItem.tsx
│   │   └── AnswerKeyForm.tsx
│   └── submission/
│       ├── CameraCapture.tsx
│       ├── SubmissionCard.tsx
│       └── OCRStatusIndicator.tsx
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── OTPVerificationScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   ├── student/
│   │   ├── StudentDashboard.tsx
│   │   ├── ExamListScreen.tsx
│   │   ├── SubmitExamScreen.tsx
│   │   ├── MySubmissionsScreen.tsx
│   │   ├── ViewGradeScreen.tsx
│   │   └── ProgressScreen.tsx
│   ├── teacher/
│   │   ├── TeacherDashboard.tsx
│   │   ├── CreateExamScreen.tsx
│   │   ├── ManageExamsScreen.tsx
│   │   ├── ReviewQueueScreen.tsx
│   │   ├── GradingScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   └── MisconceptionsScreen.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── UserManagementScreen.tsx
│       └── SystemStatsScreen.tsx
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── StudentNavigator.tsx
│   ├── TeacherNavigator.tsx
│   └── AdminNavigator.tsx
├── store/
│   ├── index.ts               # Redux store configuration
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── examSlice.ts
│   │   ├── submissionSlice.ts
│   │   └── analyticsSlice.ts
│   └── api/                   # RTK Query API slices
│       ├── authApi.ts
│       ├── examApi.ts
│       └── submissionApi.ts
├── models/
│   ├── User.ts
│   ├── Exam.ts
│   ├── Submission.ts
│   ├── Grade.ts
│   └── Analytics.ts
├── utils/
│   ├── storage.ts             # Secure storage helpers
│   ├── validation.ts          # Form validation
│   ├── dateFormatter.ts
│   └── constants.ts
└── App.tsx
```

---

## Screen-by-Screen Breakdown

### 1. Authentication Screens

#### 1.1 Login Screen
**Purpose:** User authentication entry point

**UI Elements:**
- App logo & tagline
- Email input field (with validation)
- Password input field (with show/hide toggle)
- "Remember me" checkbox
- Login button
- "Forgot password?" link
- Social login buttons (Google, Microsoft)
- "Don't have an account? Register" link

**API Calls:**
- `POST /auth/login`
- `GET /auth/google/authorize` (OAuth)
- `GET /auth/microsoft/authorize` (OAuth)

**UX Considerations:**
- Real-time email/password validation
- Clear error messages
- Loading state during authentication
- Auto-focus on email field
- Smooth transition to OTP if unverified

**State Management:**
```typescript
interface LoginState {
  email: string;
  password: string;
  rememberMe: boolean;
  isLoading: boolean;
  error: string | null;
}
```

---

#### 1.2 Registration Screen
**Purpose:** New user account creation

**UI Elements:**
- Progress indicator (Step 1 of 2)
- First name input
- Last name input
- Email input (with validation)
- Password input (with strength meter)
- Confirm password input
- Role selection (Student/Teacher/Admin with icons)
- Terms & conditions checkbox
- Register button
- "Already have an account? Login" link

**API Calls:**
- `POST /auth/register`

**UX Considerations:**
- Real-time password strength indicator
- Password requirements tooltip
- Email format validation
- Role selection with visual cards/icons
- Success animation before OTP screen

**Validation Rules:**
- Email: Valid format, not already registered
- Password: Min 8 chars, uppercase, lowercase, number
- First/Last name: Required, 2-50 characters

---

#### 1.3 OTP Verification Screen
**Purpose:** Email verification via OTP

**UI Elements:**
- Header: "Verify your email"
- Subtitle: "Enter the 6-digit code sent to {email}"
- 6-digit OTP input (auto-focus, auto-submit)
- Countdown timer (5:00)
- "Resend OTP" button (disabled during countdown)
- Edit email link
- Verify button

**API Calls:**
- `POST /auth/verify-otp`
- `POST /auth/resend-otp`

**UX Considerations:**
- Auto-focus on first digit
- Auto-advance to next digit
- Auto-submit on 6th digit
- Visual countdown timer
- Clear success/error feedback
- Automatic navigation to dashboard on success

---

#### 1.4 Forgot Password Screen
**Purpose:** Password reset initiation

**UI Elements:**
- Header: "Reset password"
- Email input
- Send OTP button
- Back to login link

**Flow:**
1. User enters email
2. OTP sent (same OTP screen as registration)
3. OTP verified
4. New password entry screen
5. Success → Redirect to login

**API Calls:**
- `POST /auth/forgot-password`
- `POST /auth/verify-reset-token`
- `POST /auth/reset-password`

---

### 2. Student Screens

#### 2.1 Student Dashboard
**Purpose:** Main hub for students

**UI Elements:**
```
┌──────────────────────────────────────┐
│ Welcome back, Ahmed! 👋              │
├──────────────────────────────────────┤
│ Quick Stats:                         │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ Exams  │ │Pending │ │  Avg   │   │
│ │  12    │ │   3    │ │ 85.5%  │   │
│ └────────┘ └────────┘ └────────┘   │
├──────────────────────────────────────┤
│ Available Exams:                     │
│ ┌──────────────────────────────────┐│
│ │ Mathematics Midterm              ││
│ │ Due: Feb 1, 2025                 ││
│ │ Duration: 60 min | Points: 100  ││
│ │ [Take Exam] ─────────────────────││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ English Essay Writing            ││
│ │ ...                              ││
│ └──────────────────────────────────┘│
├──────────────────────────────────────┤
│ Recent Submissions:                  │
│ ┌──────────────────────────────────┐│
│ │ Physics Quiz - 90% ✅            ││
│ │ Graded on Jan 14                 ││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ Chemistry Lab - Processing ⏳    ││
│ │ Submitted Jan 15                 ││
│ └──────────────────────────────────┘│
└──────────────────────────────────────┘
Bottom Nav: [Home] [Exams] [Progress] [Profile]
```

**API Calls:**
- `GET /users/me` (user info)
- `GET /exams?is_published=true&is_active=true` (available exams)
- `GET /submissions?student_id={current_user_id}` (recent submissions)

**Features:**
- Pull-to-refresh
- Real-time submission status updates
- Quick access to pending exams
- Grade notifications

---

#### 2.2 Submit Exam Screen
**Purpose:** Scan and submit exam paper

**UI Elements:**
```
┌──────────────────────────────────────┐
│ ← Submit: Mathematics Midterm        │
├──────────────────────────────────────┤
│ Exam Details:                        │
│ Duration: 60 minutes                 │
│ Total Points: 100                    │
│ Questions: 20                        │
├──────────────────────────────────────┤
│ Upload Your Answer Sheet:            │
│                                      │
│ ┌──────────────────────────────────┐│
│ │                                  ││
│ │      [Camera Icon]               ││
│ │                                  ││
│ │   Scan with Camera               ││
│ │         or                       ││
│ │   Choose from Gallery            ││
│ │                                  ││
│ └──────────────────────────────────┘│
│                                      │
│ Tips:                                │
│ ✓ Ensure good lighting              │
│ ✓ Capture all pages                 │
│ ✓ Avoid shadows & blurriness        │
│                                      │
│ [Preview]  [Retake]  [Submit] ──────│
└──────────────────────────────────────┘
```

**Flow:**
1. User taps "Take Exam" from dashboard
2. Camera opens (using react-native-vision-camera)
3. User captures all pages
4. Preview with crop/rotate options
5. Confirm & upload
6. Progress indicator during upload
7. Success → Navigate to "My Submissions"

**API Calls:**
- `GET /exams/{exam_id}` (exam details)
- `POST /submissions` (multipart/form-data)

**Camera Features:**
- Auto-focus
- Flash toggle
- Grid overlay
- Auto-detect paper boundaries (edge detection)
- Multi-page scanning
- Cropping & rotation
- Image compression (max 16MB)

**UX Considerations:**
- Clear scanning instructions
- Real-time upload progress bar
- Offline queue (upload when network available)
- Confirmation before submission

---

#### 2.3 My Submissions Screen
**Purpose:** View all submitted exams

**UI Elements:**
```
┌──────────────────────────────────────┐
│ My Submissions                       │
├──────────────────────────────────────┤
│ Filter: [All] [Graded] [Pending]     │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐│
│ │ Mathematics Midterm              ││
│ │ Submitted: Jan 15, 2025          ││
│ │ Status: ✅ Graded                ││
│ │ Score: 85.5/100 (85.5%)          ││
│ │ [View Details] ──────────────────││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ English Essay                    ││
│ │ Submitted: Jan 14, 2025          ││
│ │ Status: ⏳ Processing OCR        ││
│ │ Progress: ████░░ 60%             ││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ Chemistry Lab                    ││
│ │ Submitted: Jan 13, 2025          ││
│ │ Status: 👁️ Under Review          ││
│ └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

**API Calls:**
- `GET /submissions?student_id={current_user_id}`
- WebSocket/Polling for real-time status updates

**Status Types:**
- **Pending** ⏳ - Uploaded, awaiting OCR
- **Processing** 🔄 - OCR in progress
- **Graded** ✅ - Auto-grading complete
- **Under Review** 👁️ - Teacher reviewing
- **Finalized** 🎯 - Grade published
- **Failed** ❌ - Processing error (with retry button)

---

#### 2.4 View Grade Screen
**Purpose:** Detailed grade breakdown

**UI Elements:**
```
┌──────────────────────────────────────┐
│ ← Mathematics Midterm                │
├──────────────────────────────────────┤
│ Overall Score:                       │
│         85.5 / 100                   │
│           85.5%                      │
│ ┌────────────────────────────────┐  │
│ │██████████████████░░░░░░░░░░░░░│  │
│ └────────────────────────────────┘  │
│ Graded on: Jan 15, 2025              │
│ Status: ✅ Finalized                 │
├──────────────────────────────────────┤
│ Question Breakdown:                  │
│ ┌──────────────────────────────────┐│
│ │ Q1: Solve for x                  ││
│ │ Your Answer: x = 5               ││
│ │ Correct Answer: x = 5            ││
│ │ Score: 5/5 ✅                    ││
│ │ [View AI Explanation]            ││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ Q2: Quadratic equation           ││
│ │ Your Answer: x = 2, x = 3        ││
│ │ Correct Answer: x = 2, x = -3    ││
│ │ Score: 2.5/5 ⚠️ Partial credit  ││
│ │ [View AI Explanation]            ││
│ └──────────────────────────────────┘│
│                                      │
│ Teacher Notes:                       │
│ "Great work on algebraic problems!   │
│  Review sign rules for Q2."          │
│                                      │
│ [Download Report PDF] ───────────────│
└──────────────────────────────────────┘
```

**API Calls:**
- `GET /grading/submission/{submission_id}`
- `GET /submissions/{submission_id}?include_answers=true&include_grade=true`
- `POST /ai/explain-answer/{answer_id}` (on demand)

**Features:**
- Question-by-question breakdown
- Visual score indicators (✅ correct, ⚠️ partial, ❌ incorrect)
- AI explanations for wrong answers
- Scanned answer image overlay
- Export grade report as PDF
- Share grade (optional)

---

#### 2.5 Progress Screen
**Purpose:** Track learning progress & weaknesses

**UI Elements:**
```
┌──────────────────────────────────────┐
│ My Progress                          │
├──────────────────────────────────────┤
│ Overall Performance:                 │
│ ┌──────────────────────────────────┐│
│ │ Average Score: 82.3%             ││
│ │ Exams Taken: 12                  ││
│ │ Improvement: +5.2% 📈            ││
│ └──────────────────────────────────┘│
├──────────────────────────────────────┤
│ Topic Mastery:                       │
│ ┌──────────────────────────────────┐│
│ │ Algebra                          ││
│ │ ████████████████░░░░ 85%         ││
│ │ Strong ✅                        ││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ Geometry                         ││
│ │ ████████░░░░░░░░░░░░ 45%         ││
│ │ Needs Work ⚠️                    ││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ Trigonometry                     ││
│ │ █████████████░░░░░░░ 70%         ││
│ │ Good 👍                          ││
│ └──────────────────────────────────┘│
├──────────────────────────────────────┤
│ Your Weaknesses:                     │
│ • Geometry (45% mastery)             │
│   - 15 attempts, 7 correct           │
│   - Severity: Moderate               │
│   [Practice More]                    │
│                                      │
│ • Quadratic Equations (55% mastery)  │
│   - 10 attempts, 5 correct           │
│   - Severity: Minor                  │
│   [Practice More]                    │
│                                      │
│ Performance Timeline:                │
│ [Line Chart showing score trend]     │
└──────────────────────────────────────┘
```

**API Calls:**
- `GET /analytics/student-progress/{student_id}`

**Features:**
- Visual mastery indicators
- Trend charts (line/bar graphs)
- Weakness identification
- Actionable recommendations
- Filterable by subject/time period

---

### 3. Teacher Screens

#### 3.1 Teacher Dashboard
**Purpose:** Central hub for exam management

**UI Elements:**
```
┌──────────────────────────────────────┐
│ Welcome back, Dr. Sarah! 👩‍🏫         │
├──────────────────────────────────────┤
│ Quick Stats:                         │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ Active │ │Pending │ │Students│   │
│ │ Exams  │ │ Review │ │  245   │   │
│ │   8    │ │   12   │ │        │   │
│ └────────┘ └────────┘ └────────┘   │
├──────────────────────────────────────┤
│ [➕ Create New Exam] ─────────────────│
├──────────────────────────────────────┤
│ My Exams:                            │
│ ┌──────────────────────────────────┐│
│ │ Mathematics Midterm              ││
│ │ 45 submissions | 12 need review  ││
│ │ [Manage] [Analytics] [Review]    ││
│ └──────────────────────────────────┘│
│                                      │
│ Review Queue (High Priority):       │
│ ┌──────────────────────────────────┐│
│ │ Ahmed H. - Math Midterm Q5       ││
│ │ Reason: Low OCR confidence       ││
│ │ [Review Now] ────────────────────││
│ └──────────────────────────────────┘│
│                                      │
│ Recent Activity:                     │
│ • 3 new submissions (Math Midterm)   │
│ • 5 grades finalized today           │
└──────────────────────────────────────┘
Bottom Nav: [Home] [Exams] [Review] [Analytics] [Profile]
```

**API Calls:**
- `GET /users/me`
- `GET /exams?creator_id={current_user_id}`
- `GET /grading/review-queue?priority=high`
- `GET /submissions?exam_id={exam_ids}`

---

#### 3.2 Create Exam Screen
**Purpose:** Create and configure new exam

**UI Elements:**
```
┌──────────────────────────────────────┐
│ ← Create New Exam                    │
├──────────────────────────────────────┤
│ Basic Information:                   │
│ ┌──────────────────────────────────┐│
│ │ Title*                           ││
│ │ [Mathematics Midterm]            ││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ Description                      ││
│ │ [Covers chapters 1-5...]         ││
│ └──────────────────────────────────┘│
│ ┌─────────┐ ┌──────────┐           │
│ │Subject  │ │Language  │           │
│ │[Math ▼] │ │[English▼]│           │
│ └─────────┘ └──────────┘           │
│ ┌─────────┐ ┌──────────┐           │
│ │Duration │ │Points    │           │
│ │[60 min] │ │[100]     │           │
│ └─────────┘ └──────────┘           │
│ ☑️ Has formulas                      │
│ ☐ Has diagrams                       │
│ ┌──────────────────────────────────┐│
│ │ Start Date: [Feb 1, 2025 9:00]  ││
│ │ End Date: [Feb 1, 2025 10:00]   ││
│ └──────────────────────────────────┘│
│                                      │
│ [Next: Add Questions] ───────────────│
└──────────────────────────────────────┘
```

**Multi-Step Flow:**
1. **Basic Info** (above)
2. **Add Questions**
3. **Set Answer Keys**
4. **Review & Publish**

**API Calls:**
- `POST /exams` (create exam)
- `POST /exams/{exam_id}/questions` (add questions)
- `POST /exams/{exam_id}/answer-keys` (set answer keys)

---

#### 3.3 Add Questions Screen
**Purpose:** Add questions to exam

**UI Elements:**
```
┌──────────────────────────────────────┐
│ ← Add Questions                      │
│ Mathematics Midterm                  │
├──────────────────────────────────────┤
│ Question 1:                          │
│ ┌──────────────────────────────────┐│
│ │ Question Text*                   ││
│ │ [Solve for x: 2x + 5 = 15]       ││
│ └──────────────────────────────────┘│
│ Type: ○ Multiple Choice              │
│       ● Open-Ended                   │
│ ┌─────────┐ ┌──────────┐            │
│ │Points   │ │☑️ Requires│            │
│ │[5]      │ │  Review   │            │
│ └─────────┘ └──────────┘            │
│                                      │
│ [+ Add Another Question]             │
│                                      │
│ Questions (2):                       │
│ 1. Solve for x: 2x + 5 = 15 (5 pts)  │
│ 2. Quadratic equation... (10 pts)    │
│                                      │
│ [Next: Set Answer Keys] ─────────────│
└──────────────────────────────────────┘
```

**For Multiple Choice:**
- Show option inputs (A, B, C, D)
- Mark correct option

---

#### 3.4 Set Answer Keys Screen
**Purpose:** Define correct answers & grading criteria

**UI Elements:**
```
┌──────────────────────────────────────┐
│ ← Set Answer Keys                    │
│ Mathematics Midterm                  │
├──────────────────────────────────────┤
│ Question 1: Solve for x: 2x + 5 = 15 │
│                                      │
│ Correct Answer*:                     │
│ ┌──────────────────────────────────┐│
│ │ [x = 5]                          ││
│ └──────────────────────────────────┘│
│                                      │
│ Grading Keywords (optional):         │
│ ┌──────────────────────────────────┐│
│ │ x, 5, equals                     ││
│ │ [+ Add keyword]                  ││
│ └──────────────────────────────────┘│
│                                      │
│ Strictness Level:                    │
│ ○ Lenient  ● Normal  ○ Strict        │
│                                      │
│ Points: [5]                          │
│                                      │
│ Additional Notes:                    │
│ ┌──────────────────────────────────┐│
│ │ [Accept equivalent forms]        ││
│ └──────────────────────────────────┘│
│                                      │
│ [Save & Next Question] ──────────────│
│ [Save & Finish] ─────────────────────│
└──────────────────────────────────────┘
```

**Strictness Levels Explained:**
- **Lenient**: 50%+ keyword match = full credit
- **Normal**: 70%+ keyword match = full credit
- **Strict**: 85%+ keyword match = full credit

**API Calls:**
- `POST /exams/{exam_id}/answer-keys`

---

#### 3.5 Review Queue Screen
**Purpose:** Manual review of flagged answers

**UI Elements:**
```
┌──────────────────────────────────────┐
│ Review Queue                         │
├──────────────────────────────────────┤
│ Filter: [High Priority] [All]        │
│ Sort: [Oldest First] ▼               │
├──────────────────────────────────────┤
│ 🔴 HIGH PRIORITY (5)                 │
│ ┌──────────────────────────────────┐│
│ │ Ahmed Hassan                     ││
│ │ Math Midterm - Q5                ││
│ │ Reason: Low OCR confidence (45%) ││
│ │ Auto Score: 0/5                  ││
│ │ [Review] ────────────────────────││
│ └──────────────────────────────────┘│
│                                      │
│ ⚠️ LOW PRIORITY (7)                  │
│ ┌──────────────────────────────────┐│
│ │ Sara Ahmed                       ││
│ │ Math Midterm - Q3                ││
│ │ Reason: Medium grading confidence││
│ │ Auto Score: 3/5                  ││
│ │ [Review] [Skip]                  ││
│ └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

**Review Detail Screen:**
```
┌──────────────────────────────────────┐
│ ← Review Answer                      │
│ Ahmed Hassan - Math Midterm Q5       │
├──────────────────────────────────────┤
│ Question:                            │
│ "Solve for x: 2x + 5 = 15"           │
│                                      │
│ Correct Answer:                      │
│ "x = 5"                              │
│ Keywords: x, 5, equals               │
├──────────────────────────────────────┤
│ Student's Scanned Answer:            │
│ ┌──────────────────────────────────┐│
│ │ [Image of handwritten answer]   ││
│ │ OCR Text: "x = S" (45% conf.)    ││
│ └──────────────────────────────────┘│
│                                      │
│ Corrected OCR Text:                  │
│ ┌──────────────────────────────────┐│
│ │ [x = 5]                          ││
│ └──────────────────────────────────┘│
│ [🔍 AI Proofread]                    │
│                                      │
│ Manual Score:                        │
│ ┌──┐                                │
│ │5 │ / 5                            │
│ └──┘                                │
│ ○ 0  ○ 2.5  ● 5 points               │
│                                      │
│ Review Notes:                        │
│ ┌──────────────────────────────────┐│
│ │ [OCR misread '5' as 'S']         ││
│ └──────────────────────────────────┘│
│                                      │
│ [Save & Next] [Skip] ────────────────│
└──────────────────────────────────────┘
```

**API Calls:**
- `GET /grading/review-queue`
- `GET /grading/review-queue/{item_id}`
- `POST /grading/review-queue/{item_id}/review`
- `POST /ai/proofread/{answer_id}` (AI assist)

**Features:**
- Side-by-side comparison (correct vs. student answer)
- Zoom into scanned image
- AI proofreading assistance
- Quick score adjustment slider
- Batch review mode

---

#### 3.6 Analytics Dashboard
**Purpose:** Exam performance insights

**UI Elements:**
```
┌──────────────────────────────────────┐
│ Analytics - Math Midterm             │
├──────────────────────────────────────┤
│ Select Exam: [Math Midterm ▼]       │
├──────────────────────────────────────┤
│ Overview:                            │
│ • Submissions: 45                    │
│ • Average Score: 82.3%               │
│ • Completion Rate: 90%               │
├──────────────────────────────────────┤
│ Question Difficulty:                 │
│ ┌──────────────────────────────────┐│
│ │ Q1: Solve for x                  ││
│ │ ████████████████░░░░ 85% success ││
│ │ Difficulty: Easy                 ││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ Q5: Quadratic formula            ││
│ │ ██████░░░░░░░░░░░░░░ 35% success ││
│ │ Difficulty: Very Hard ⚠️         ││
│ │ [View Misconceptions]            ││
│ └──────────────────────────────────┘│
├──────────────────────────────────────┤
│ Weakness Heatmap:                    │
│ ┌──────────────────────────────────┐│
│ │ Student    │ Algebra │ Geometry  ││
│ │─────────────────────────────────││
│ │ Ahmed H.   │ 🟢 85%  │ 🔴 45%    ││
│ │ Sara A.    │ 🟡 70%  │ 🟢 90%    ││
│ │ Mohamed K. │ 🔴 40%  │ 🟡 65%    ││
│ └──────────────────────────────────┘│
│                                      │
│ [View Full Report] [Export PDF] ─────│
└──────────────────────────────────────┘
```

**API Calls:**
- `GET /analytics/question-difficulty/exam/{exam_id}`
- `GET /analytics/weakness-heatmap/exam/{exam_id}`
- `GET /analytics/misconceptions/exam/{exam_id}`
- `GET /exams/{exam_id}/statistics`

**Features:**
- Interactive charts (Victory Native / fl_chart)
- Color-coded heatmaps (🟢 strong, 🟡 moderate, 🔴 weak)
- Drill-down into question details
- Exportable reports
- Cohort comparison

---

#### 3.7 Misconceptions Screen
**Purpose:** Identify common student errors

**UI Elements:**
```
┌──────────────────────────────────────┐
│ Common Misconceptions                │
│ Math Midterm                         │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐│
│ │ Q5: Quadratic Formula            ││
│ │ 🔴 Major Misconception           ││
│ │                                  ││
│ │ Common Wrong Answer:             ││
│ │ "x = -2, x = 3"                  ││
│ │                                  ││
│ │ 12 students affected (26%)       ││
│ │                                  ││
│ │ 🤖 AI Analysis:                  ││
│ │ Type: "Algebraic sign error"     ││
│ │                                  ││
│ │ Why students think this:         ││
│ │ "Students are confusing the      ││
│ │  signs when applying the         ││
│ │  quadratic formula..."           ││
│ │                                  ││
│ │ How to correct:                  ││
│ │ "Emphasize that when b² = 9,     ││
│ │  b = ±3, not just +3..."         ││
│ │                                  ││
│ │ [View Affected Students]         ││
│ │ [Mark as Resolved]               ││
│ └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

**API Calls:**
- `GET /analytics/misconceptions/exam/{exam_id}`
- `POST /analytics/misconceptions/{misc_id}/resolve`

**Features:**
- AI-generated explanations
- Affected student list
- Severity indicators
- Teaching recommendations
- Resolution tracking

---

### 4. Admin Screens

#### 4.1 Admin Dashboard
**Purpose:** System overview & user management

**UI Elements:**
```
┌──────────────────────────────────────┐
│ Admin Dashboard                      │
├──────────────────────────────────────┤
│ System Stats:                        │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ Total  │ │ Active │ │  OCR   │   │
│ │ Users  │ │ Exams  │ │ Jobs   │   │
│ │  512   │ │   45   │ │   23   │   │
│ └────────┘ └────────┘ └────────┘   │
├──────────────────────────────────────┤
│ User Management:                     │
│ [+ Add User] [View All Users] ───────│
│                                      │
│ OCR Management:                      │
│ [View Jobs] [Clear Cache] ───────────│
│                                      │
│ AI Cache Stats:                      │
│ • Cached responses: 1,234            │
│ • Hit rate: 68.5%                    │
│ • Cost savings: $156.78              │
│ [View Details] [Clear Cache] ────────│
└──────────────────────────────────────┘
```

**API Calls:**
- `GET /users`
- `GET /exams`
- `GET /ocr-management/statistics`
- `GET /ai/cache/stats`

---

#### 4.2 User Management Screen
**Purpose:** CRUD operations on users

**UI Elements:**
```
┌──────────────────────────────────────┐
│ User Management                      │
├──────────────────────────────────────┤
│ Search: [🔍 Search users...]         │
│ Filter: [All Roles ▼] [Active ▼]    │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐│
│ │ Ahmed Hassan                     ││
│ │ student@example.com              ││
│ │ Role: Student | Active           ││
│ │ [Edit] [Delete] [View Profile]   ││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ Dr. Sarah Ahmed                  ││
│ │ teacher@example.com              ││
│ │ Role: Teacher | Active           ││
│ │ [Edit] [Delete] [View Profile]   ││
│ └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

**API Calls:**
- `GET /users`
- `GET /users/{user_id}`
- `PUT /users/{user_id}`
- `DELETE /users/{user_id}`
- `POST /users/{user_id}/roles`
- `DELETE /users/{user_id}/roles/{role_id}`

---

## User Flows

### Student Flow: Taking an Exam

```
1. Login → Student Dashboard
2. View "Available Exams" list
3. Tap "Take Exam" on "Mathematics Midterm"
4. Read exam details (duration, points, questions)
5. Tap "Start Submission"
6. Camera opens
7. Scan all answer sheets (multi-page)
8. Preview scanned images
9. Crop/rotate if needed
10. Tap "Submit"
11. Upload progress indicator
12. Success notification
13. Navigate to "My Submissions"
14. See "Processing OCR..." status
15. (Backend: Celery processes OCR → Auto-grading)
16. Push notification: "Your grade is ready!"
17. Tap notification → View Grade Screen
18. See overall score + question breakdown
19. Tap "View AI Explanation" for wrong answers
20. Review detailed feedback
```

---

### Teacher Flow: Creating & Grading an Exam

```
1. Login → Teacher Dashboard
2. Tap "Create New Exam"
3. Fill basic info (title, subject, duration, etc.)
4. Tap "Next: Add Questions"
5. Add Question 1 (type, text, points)
6. Add Question 2, 3, ...
7. Tap "Next: Set Answer Keys"
8. For each question:
   - Enter correct answer
   - Add keywords (for open-ended)
   - Set strictness level
9. Tap "Save & Publish"
10. Exam is now live for students
11. (Students submit answers)
12. Dashboard shows "12 new submissions"
13. Tap "Review Queue"
14. See high-priority items (low OCR confidence)
15. Tap "Review" on first item
16. View scanned answer + OCR text
17. Correct OCR errors
18. Adjust score if needed
19. Add review notes
20. Tap "Save & Next"
21. Repeat for all review queue items
22. Navigate to "Grading"
23. View submission list
24. Tap "Finalize" on graded submissions
25. Enter teacher notes
26. Confirm finalization
27. Students receive grade notification
```

---

## UX Best Practices

### 1. Onboarding Experience
- **First-time User Tutorial**: Interactive walkthrough for each role
- **Progress Indicators**: Show users where they are in multi-step processes
- **Tooltips**: Explain complex features (e.g., strictness levels, keywords)
- **Empty States**: Friendly messages when no data exists ("No exams yet. Create your first exam!")

---

### 2. Loading States
- **Skeleton Screens**: Show placeholder content while loading
- **Optimistic UI Updates**: Assume success and update UI immediately (rollback on error)
- **Progress Indicators**:
  - Determinate (upload: 45%)
  - Indeterminate (processing...)
  - Step indicators (Step 1 of 3)

---

### 3. Error Handling
**Graceful Degradation:**
- Offline mode: Queue submissions for later upload
- Retry mechanisms: Auto-retry failed API calls (3 attempts)
- Fallback states: Show cached data when network fails

**Error Messages:**
- **User-friendly**: "Oops! Couldn't upload your exam. Check your internet connection."
- **Actionable**: "Retry" button, "Contact Support" link
- **Specific**: "Email already registered. Try logging in instead."

**Error Types:**
| Error | Message | Action |
|-------|---------|--------|
| Network Error | "No internet connection" | [Retry] |
| 401 Unauthorized | "Session expired. Please log in again." | [Login] |
| 400 Bad Request | "Invalid email format" | Inline validation |
| 500 Server Error | "Something went wrong. We're working on it!" | [Retry] [Report] |

---

### 4. Accessibility (a11y)
- **Screen Reader Support**: Semantic labels for all UI elements
- **Color Contrast**: WCAG AA compliance (4.5:1 ratio)
- **Font Sizes**: Scalable text (respect system font size)
- **Touch Targets**: Minimum 44x44pt tap areas
- **Focus Indicators**: Visible keyboard navigation
- **Alt Text**: Image descriptions for scanned documents

---

### 5. Localization (i18n)
**Supported Languages:**
- English (en)
- Arabic (ar)

**Implementation:**
- Use i18n library (react-i18next, flutter_localizations)
- RTL support for Arabic
- Date/time localization
- Number formatting (decimal separators)
- Currency symbols (if applicable)

**Example:**
```typescript
// English
"exam.title": "Mathematics Midterm"

// Arabic
"exam.title": "امتحان الرياضيات النصفي"
```

---

### 6. Performance Optimization
**Image Optimization:**
- Compress images before upload (70-80% quality)
- Lazy load images in lists
- Thumbnail generation for previews
- Progressive JPEG loading

**Network Optimization:**
- Request batching (combine multiple API calls)
- Response caching (React Query, SWR)
- Pagination for long lists (20 items per page)
- WebSocket for real-time updates (submission status)

**App Performance:**
- Code splitting (lazy load screens)
- Memoization (React.memo, useMemo)
- Virtual lists for long scrollable content
- Background job management (limit concurrent operations)

---

### 7. Notifications
**Push Notifications:**
- Exam published (for students)
- Submission processed (for students)
- Grade finalized (for students)
- New submission (for teachers)
- Review queue items (for teachers)

**In-App Notifications:**
- Badge counts on bottom nav
- Toast messages for success/error
- Notification center

---

### 8. Offline Capabilities
**What Works Offline:**
- View cached exams
- View cached grades
- Draft exam creation (save locally)

**What Requires Online:**
- Submission upload
- OCR processing
- Real-time grading
- Analytics

**Sync Strategy:**
- Queue offline actions
- Auto-sync when online
- Conflict resolution (last-write-wins)

---

## Technical Implementation Guide

### 1. Authentication Flow (React Native Example)

```typescript
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../api/services/authService';
import { setTokens, clearTokens } from '../../utils/storage';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      await setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      clearTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

---

### 2. API Client with Interceptors

```typescript
// src/api/client.ts
import axios from 'axios';
import { getTokens, setTokens, clearTokens } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add access token
apiClient.interceptors.request.use(
  async (config) => {
    const { accessToken } = await getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = await getTokens();
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const { access_token } = response.data;
        await setTokens(access_token, refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed → Logout
        await clearTokens();
        // Navigate to login screen
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### 3. File Upload with Progress

```typescript
// src/api/services/submissionService.ts
import apiClient from '../client';

export const uploadSubmission = async (
  examId: number,
  file: File,
  onProgress: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append('exam_id', examId.toString());
  formData.append('scanned_paper', file);
  formData.append('scan_type', 'full_page');

  const response = await apiClient.post('/submissions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      onProgress(percentCompleted);
    },
  });

  return response.data;
};
```

**Usage in Component:**
```typescript
const [uploadProgress, setUploadProgress] = useState(0);

const handleSubmit = async () => {
  try {
    await uploadSubmission(examId, selectedFile, (progress) => {
      setUploadProgress(progress);
    });
    // Success
  } catch (error) {
    // Error handling
  }
};
```

---

### 4. Real-Time Submission Status (Polling)

```typescript
// src/hooks/useSubmissionStatus.ts
import { useEffect, useState } from 'react';
import { getSubmission } from '../api/services/submissionService';

export const useSubmissionStatus = (submissionId: number, interval = 5000) => {
  const [status, setStatus] = useState<string>('pending');
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!isPolling) return;

    const poll = async () => {
      try {
        const response = await getSubmission(submissionId);
        setStatus(response.data.submission_status);

        // Stop polling if completed or failed
        if (['completed', 'failed'].includes(response.data.submission_status)) {
          setIsPolling(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    const intervalId = setInterval(poll, interval);
    poll(); // Initial call

    return () => clearInterval(intervalId);
  }, [submissionId, interval, isPolling]);

  return { status, isPolling };
};
```

**Usage:**
```typescript
const { status } = useSubmissionStatus(submissionId);

return (
  <View>
    {status === 'processing' && <Spinner text="Processing OCR..." />}
    {status === 'completed' && <Text>✅ Grading complete!</Text>}
    {status === 'failed' && <Text>❌ Processing failed</Text>}
  </View>
);
```

---

### 5. Secure Storage

**iOS/Android (React Native):**
```typescript
// src/utils/storage.ts
import EncryptedStorage from 'react-native-encrypted-storage';

export const setTokens = async (accessToken: string, refreshToken: string) => {
  await EncryptedStorage.setItem('access_token', accessToken);
  await EncryptedStorage.setItem('refresh_token', refreshToken);
};

export const getTokens = async () => {
  const accessToken = await EncryptedStorage.getItem('access_token');
  const refreshToken = await EncryptedStorage.getItem('refresh_token');
  return { accessToken, refreshToken };
};

export const clearTokens = async () => {
  await EncryptedStorage.removeItem('access_token');
  await EncryptedStorage.removeItem('refresh_token');
};
```

---

## Error Handling

### Common Error Scenarios

#### 1. Network Errors
**Cause:** No internet connection, timeout

**User Message:** "No internet connection. Please check your network and try again."

**Action:**
- Show retry button
- Queue offline actions (submissions)
- Show cached data

---

#### 2. Authentication Errors (401)
**Cause:** Token expired, invalid token

**User Message:** "Your session has expired. Please log in again."

**Action:**
- Attempt token refresh (automatic)
- If refresh fails → Redirect to login
- Clear stored tokens

---

#### 3. Validation Errors (400)
**Cause:** Invalid input data

**User Message:** Specific field errors (e.g., "Email is required", "Password must be at least 8 characters")

**Action:**
- Highlight error fields in red
- Show inline error messages
- Prevent form submission until fixed

---

#### 4. Permission Errors (403)
**Cause:** Insufficient permissions

**User Message:** "You don't have permission to perform this action."

**Action:**
- Disable restricted UI elements
- Show informative message
- Suggest contacting admin (if applicable)

---

#### 5. Server Errors (500)
**Cause:** Backend error, database issue

**User Message:** "Something went wrong on our end. We're working to fix it!"

**Action:**
- Show retry button
- Log error details for debugging
- Provide "Report Issue" option

---

#### 6. OCR Processing Errors
**Cause:** Poor image quality, OCR service failure

**User Message:** "We couldn't process your exam. Please try rescanning with better lighting."

**Action:**
- Show rescanning instructions
- Allow resubmission
- Suggest manual entry (fallback)

---

## Performance Optimization

### 1. Image Optimization
- **Compression**: Use ImagePicker compression (70-80% quality)
- **Resizing**: Resize large images before upload (max 2000x2000px)
- **Format**: Convert to JPEG (smaller than PNG)

```typescript
// React Native example
import ImagePicker from 'react-native-image-crop-picker';

const selectImage = async () => {
  const image = await ImagePicker.openPicker({
    width: 2000,
    height: 2000,
    cropping: true,
    compressImageQuality: 0.75,
  });
  return image;
};
```

---

### 2. List Virtualization
**Problem:** Rendering 1000+ items causes lag

**Solution:** Use FlatList (React Native) or ListView (Flutter)

```typescript
import { FlatList } from 'react-native';

<FlatList
  data={submissions}
  renderItem={({ item }) => <SubmissionCard submission={item} />}
  keyExtractor={(item) => item.id.toString()}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

---

### 3. Caching Strategy
**API Responses:**
- Cache GET requests for 5 minutes
- Invalidate cache on mutations (POST, PUT, DELETE)

**Using React Query:**
```typescript
import { useQuery } from 'react-query';

const { data, isLoading } = useQuery(
  ['exams', { is_published: true }],
  () => fetchExams({ is_published: true }),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);
```

---

### 4. Code Splitting
**Lazy Load Screens:**
```typescript
// React Native (React.lazy + Suspense)
const StudentDashboard = React.lazy(() => import('./screens/student/StudentDashboard'));
const TeacherDashboard = React.lazy(() => import('./screens/teacher/TeacherDashboard'));

<Suspense fallback={<LoadingSpinner />}>
  {user.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
</Suspense>
```

---

## Conclusion

This documentation provides a complete blueprint for building a professional, user-friendly mobile app for the Gradeo platform. Key takeaways:

### For Students:
- Seamless exam submission via camera scanning
- Real-time grading status updates
- Detailed grade breakdowns with AI explanations
- Progress tracking to identify weaknesses

### For Teachers:
- Intuitive exam creation with answer key configuration
- Automated grading with manual review queue
- Advanced analytics (weakness heatmaps, misconception detection)
- AI-powered insights

### For Admins:
- Comprehensive user management
- System monitoring and OCR job tracking
- AI cache optimization

### Technical Excellence:
- Clean architecture (MVVM pattern)
- Secure authentication (JWT + OAuth)
- Robust error handling
- Performance optimizations
- Accessibility compliance

### Next Steps:
1. Choose your mobile framework (React Native, Flutter, or Native)
2. Set up project structure following the recommended architecture
3. Implement authentication flow first
4. Build screen-by-screen, starting with core features
5. Integrate API endpoints one feature at a time
6. Test thoroughly (unit, integration, E2E)
7. Optimize performance before release
8. Implement analytics (Firebase Analytics, Mixpanel)
9. Beta testing with real users
10. Launch! 🚀

---

**Document Version:** 1.0
**Last Updated:** January 15, 2025
**API Base URL:** `/api/v1/`
**Swagger Docs:** `/api/swagger/`

For questions or clarifications, refer to the Swagger documentation or contact the backend development team.
