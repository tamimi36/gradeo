# Database Schema Documentation

## Entity Relationship Overview

This document describes the complete database schema for the Exam Scanner application.

## Core Entities

### 1. Authentication & Authorization

#### `users`
- **Purpose**: User accounts for authentication
- **Key Fields**:
  - `id` (PK)
  - `username` (unique)
  - `email` (unique)
  - `password_hash`
  - `first_name`, `last_name`
  - `is_active`, `is_verified`
  - `last_login`
- **Relationships**:
  - One-to-many: `created_exams` (as creator)
  - One-to-many: `submissions` (as student)
  - Many-to-many: `roles` (through `user_roles`)

#### `roles`
- **Purpose**: User roles (admin, teacher, student)
- **Key Fields**:
  - `id` (PK)
  - `name` (unique)
  - `description`
- **Relationships**:
  - Many-to-many: `users` (through `user_roles`)

#### `user_roles`
- **Purpose**: Many-to-many relationship between users and roles
- **Key Fields**:
  - `id` (PK)
  - `user_id` (FK → users)
  - `role_id` (FK → roles)
  - `assigned_at`
- **Constraints**: Unique constraint on (user_id, role_id)

### 2. Exam Management

#### `exams`
- **Purpose**: Exam definitions created by teachers
- **Key Fields**:
  - `id` (PK)
  - `title`, `description`
  - `creator_id` (FK → users)
  - `duration_minutes`
  - `total_points`
  - `is_published`, `is_active`
  - `start_date`, `end_date`
- **Relationships**:
  - Many-to-one: `creator` (User)
  - One-to-many: `questions`
  - One-to-many: `answer_keys`
  - One-to-many: `submissions`

#### `questions`
- **Purpose**: Questions within exams
- **Key Fields**:
  - `id` (PK)
  - `exam_id` (FK → exams)
  - `question_text`
  - `question_type` ('multiple_choice' or 'open_ended')
  - `points`
  - `order_number`
  - `requires_review` (flag for teacher review after auto-grading)
- **Relationships**:
  - Many-to-one: `exam`
  - One-to-many: `options` (for multiple choice)
  - One-to-many: `answer_keys`
  - One-to-many: `submission_answers`

#### `question_options`
- **Purpose**: Options for multiple choice questions
- **Key Fields**:
  - `id` (PK)
  - `question_id` (FK → questions)
  - `option_text`
  - `order_number`
  - `is_correct`
- **Relationships**:
  - Many-to-one: `question`

#### `answer_keys`
- **Purpose**: Teacher-submitted correct answers
- **Key Fields**:
  - `id` (PK)
  - `exam_id` (FK → exams)
  - `question_id` (FK → questions)
  - `correct_answer` (text answer or option_id for multiple choice)
  - `answer_type`
  - `points`
- **Relationships**:
  - Many-to-one: `exam`
  - Many-to-one: `question`
- **Constraints**: Unique constraint on (exam_id, question_id)

### 3. Student Submissions

#### `submissions`
- **Purpose**: Student exam submissions
- **Key Fields**:
  - `id` (PK)
  - `exam_id` (FK → exams)
  - `student_id` (FK → users)
  - `scanned_paper_path` (path to uploaded image)
  - `submission_status` ('pending', 'processing', 'completed', 'failed')
  - `submitted_at`, `processed_at`
- **Relationships**:
  - Many-to-one: `exam`
  - Many-to-one: `student` (User)
  - One-to-many: `answers`
  - One-to-many: `ocr_results`
  - One-to-one: `grade`
- **Constraints**: Unique constraint on (exam_id, student_id)

#### `submission_answers`
- **Purpose**: Individual answers extracted from OCR
- **Key Fields**:
  - `id` (PK)
  - `submission_id` (FK → submissions)
  - `question_id` (FK → questions)
  - `answer_text` (extracted text from OCR)
  - `answer_option_id` (FK → question_options, for multiple choice)
  - `confidence_score` (OCR confidence 0-1)
  - `is_auto_graded`
  - `auto_grade_score`
- **Relationships**:
  - Many-to-one: `submission`
  - Many-to-one: `question`
  - Many-to-one: `answer_option`
- **Constraints**: Unique constraint on (submission_id, question_id)

#### `ocr_results`
- **Purpose**: OCR processing results and metadata
- **Key Fields**:
  - `id` (PK)
  - `submission_id` (FK → submissions)
  - `ocr_service` (service used: 'tesseract', 'google_vision', etc.)
  - `raw_text`, `processed_text`
  - `confidence_score`
  - `processing_status` ('pending', 'processing', 'completed', 'failed')
  - `error_message`
  - `processing_time_seconds`
- **Relationships**:
  - Many-to-one: `submission`

### 4. Grading System

#### `grades`
- **Purpose**: Final grades for submissions
- **Key Fields**:
  - `id` (PK)
  - `submission_id` (FK → submissions, unique)
  - `total_score`, `max_score`
  - `percentage`
  - `is_finalized` (true after teacher review)
  - `auto_graded_at`, `finalized_at`
  - `finalized_by` (FK → users, teacher who finalized)
  - `notes`
- **Relationships**:
  - One-to-one: `submission`
  - Many-to-one: `finalizer` (User)
  - One-to-many: `adjustments`

#### `review_queue`
- **Purpose**: Questions flagged for teacher review after auto-grading
- **Key Fields**:
  - `id` (PK)
  - `submission_id` (FK → submissions)
  - `question_id` (FK → questions)
  - `submission_answer_id` (FK → submission_answers)
  - `review_status` ('pending', 'in_review', 'approved', 'rejected')
  - `review_reason` (why it needs review)
  - `reviewed_by` (FK → users)
  - `reviewed_at`
  - `review_notes`
- **Relationships**:
  - Many-to-one: `submission`
  - Many-to-one: `question`
  - Many-to-one: `submission_answer`
  - Many-to-one: `reviewer` (User)

#### `grade_adjustments`
- **Purpose**: Manual grade corrections by teachers
- **Key Fields**:
  - `id` (PK)
  - `grade_id` (FK → grades)
  - `question_id` (FK → questions)
  - `original_score`, `adjusted_score`
  - `adjustment_reason`
  - `adjusted_by` (FK → users)
  - `adjusted_at`
- **Relationships**:
  - Many-to-one: `grade`
  - Many-to-one: `question`
  - Many-to-one: `adjuster` (User)

## Key Design Decisions

1. **Role-Based Access Control**: Flexible many-to-many relationship allows users to have multiple roles
2. **Answer Key Flexibility**: Supports both multiple choice (option_id) and open-ended (text) answers
3. **OCR Tracking**: Separate table for OCR results allows tracking of different OCR services and processing history
4. **Review Workflow**: `review_queue` table enables teacher oversight of automated grading
5. **Audit Trail**: `grade_adjustments` table maintains history of manual corrections
6. **Status Tracking**: Multiple status fields (`submission_status`, `processing_status`, `review_status`) enable workflow management
7. **Confidence Scores**: OCR confidence scores help identify answers that need review

## Indexes

Recommended indexes for performance:
- `users.username` (unique)
- `users.email` (unique)
- `roles.name` (unique)
- `exams.creator_id`
- `questions.exam_id`
- `submissions.exam_id`, `submissions.student_id`
- `submission_answers.submission_id`, `submission_answers.question_id`
- `grades.submission_id` (unique)
- `review_queue.review_status`

## Data Flow

1. **Teacher creates exam** → `exams` table
2. **Teacher adds questions** → `questions` table (with `question_options` for multiple choice)
3. **Teacher submits answer keys** → `answer_keys` table
4. **Student submits scanned paper** → `submissions` table
5. **OCR processing** → `ocr_results` and `submission_answers` tables
6. **Auto-grading** → `grades` table (with entries in `review_queue` if needed)
7. **Teacher review** → `review_queue` updated, `grade_adjustments` created if needed
8. **Finalization** → `grades.is_finalized` set to true

