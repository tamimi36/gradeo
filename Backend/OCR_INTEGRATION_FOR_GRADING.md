# OCR Integration Guide for Grading Agents

This document explains how grading agents should integrate with the OCR system to implement automatic grading.

## Overview

The OCR system has been fully implemented and is ready to extract student answers from scanned exam papers. Your grading agents will read these extracted answers and compare them with answer keys to calculate scores.

---

## Database Schema for Grading

### Tables You'll Work With

#### 1. `submission_answers` - Extracted Student Answers

```python
class SubmissionAnswer:
    id: int
    submission_id: int               # Links to submission
    question_id: int                 # Links to question
    answer_text: str                 # Extracted answer text from OCR
    answer_option_id: int           # For multiple choice (selected option ID)
    confidence_score: float         # OCR confidence (0-1)

    # Fields for grading agents to populate:
    grading_confidence: float       # Your grading confidence (0-1)
    similarity_score: float         # Text similarity score (0-1)
    is_auto_graded: bool           # Set to True after grading
    auto_grade_score: float        # The score you assign

    ocr_result_id: int             # Link to full OCR data
    extracted_bounding_box: JSON   # Location in image
    extraction_method: str         # How it was extracted
```

#### 2. `answer_keys` - Correct Answers (Teacher-Provided)

```python
class AnswerKey:
    id: int
    exam_id: int
    question_id: int
    correct_answer: str            # The correct answer
    answer_type: str               # 'multiple_choice' or 'open_ended'
    points: float                  # Points for correct answer
    strictness_level: str          # 'lenient', 'normal', 'strict'
    keywords: JSON                 # Array of keywords for grading
    additional_notes: str          # Teacher's grading hints
```

#### 3. `grades` - Final Grades (For You to Create)

```python
class Grade:
    id: int
    submission_id: int
    total_score: float             # Sum of all question scores
    percentage: float              # (total_score / exam.total_points) * 100
    is_finalized: bool            # True when teacher approves
    created_at: datetime
    updated_at: datetime
```

#### 4. `review_queue` - Low Confidence Answers (For You to Populate)

```python
class ReviewQueue:
    id: int
    submission_id: int
    question_id: int
    answer_id: int                # SubmissionAnswer.id
    confidence_score: float
    reason: str                   # Why it needs review
    status: str                   # 'pending', 'approved', 'rejected'
```

---

## Integration Workflow

### Step 1: Listen for OCR Completion

Monitor submissions with status `completed`:

```python
from app.models.submission import Submission

# Get submissions ready for grading
submissions_to_grade = Submission.query.filter_by(
    submission_status='completed'
).all()

for submission in submissions_to_grade:
    # Check if already graded
    if submission.grade:
        continue  # Skip

    # Start grading process
    grade_submission(submission)
```

### Step 2: Load Student Answers

```python
from app.models.submission import SubmissionAnswer

answers = SubmissionAnswer.query.filter_by(
    submission_id=submission.id
).all()
```

### Step 3: Load Answer Keys

```python
from app.models.exam import AnswerKey

exam_id = submission.exam_id
answer_keys = AnswerKey.query.filter_by(exam_id=exam_id).all()

# Create a mapping for easy lookup
answer_key_map = {ak.question_id: ak for ak in answer_keys}
```

### Step 4: Grade Each Answer

#### Multiple Choice Grading

```python
def grade_multiple_choice(student_answer: SubmissionAnswer, answer_key: AnswerKey):
    """Grade a multiple choice question"""

    # Compare option IDs
    if student_answer.answer_option_id == int(answer_key.correct_answer):
        score = answer_key.points
        confidence = 1.0  # Certain for multiple choice
    else:
        score = 0.0
        confidence = 1.0

    # Update student answer
    student_answer.is_auto_graded = True
    student_answer.auto_grade_score = score
    student_answer.grading_confidence = confidence

    return score
```

#### Open-Ended Grading (Using AI/NLP)

```python
def grade_open_ended(student_answer: SubmissionAnswer, answer_key: AnswerKey):
    """Grade an open-ended question using AI/NLP"""

    student_text = student_answer.answer_text
    correct_answer = answer_key.correct_answer
    keywords = answer_key.keywords or []

    # Option 1: Use text similarity (simple)
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([student_text, correct_answer])
    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]

    # Option 2: Keyword matching
    keyword_score = sum(1 for kw in keywords if kw.lower() in student_text.lower())
    keyword_ratio = keyword_score / len(keywords) if keywords else 0

    # Option 3: Use LLM for semantic comparison
    # (You can implement this using Claude API, OpenAI, etc.)

    # Combine scores based on strictness level
    if answer_key.strictness_level == 'lenient':
        threshold = 0.5
        weight_similarity = 0.3
        weight_keywords = 0.7
    elif answer_key.strictness_level == 'strict':
        threshold = 0.8
        weight_similarity = 0.7
        weight_keywords = 0.3
    else:  # normal
        threshold = 0.65
        weight_similarity = 0.5
        weight_keywords = 0.5

    # Calculate final score
    combined_score = (similarity * weight_similarity) + (keyword_ratio * weight_keywords)

    if combined_score >= threshold:
        score = answer_key.points
    else:
        score = answer_key.points * combined_score  # Partial credit

    # Update student answer
    student_answer.is_auto_graded = True
    student_answer.auto_grade_score = score
    student_answer.grading_confidence = combined_score
    student_answer.similarity_score = similarity

    return score
```

### Step 5: Handle Low Confidence Answers

```python
from app.models.grade import ReviewQueue

# If OCR or grading confidence is low, add to review queue
OCR_CONFIDENCE_THRESHOLD = 0.7
GRADING_CONFIDENCE_THRESHOLD = 0.7

if (student_answer.confidence_score < OCR_CONFIDENCE_THRESHOLD or
    student_answer.grading_confidence < GRADING_CONFIDENCE_THRESHOLD):

    review_item = ReviewQueue(
        submission_id=submission.id,
        question_id=student_answer.question_id,
        answer_id=student_answer.id,
        confidence_score=min(student_answer.confidence_score,
                           student_answer.grading_confidence),
        reason=f"Low confidence: OCR={student_answer.confidence_score:.2f}, "
               f"Grading={student_answer.grading_confidence:.2f}",
        status='pending'
    )
    db.session.add(review_item)
```

### Step 6: Calculate Total Grade

```python
from app.models.grade import Grade

def calculate_final_grade(submission: Submission):
    """Calculate total grade for a submission"""

    # Get all graded answers
    answers = SubmissionAnswer.query.filter_by(
        submission_id=submission.id,
        is_auto_graded=True
    ).all()

    # Sum scores
    total_score = sum(ans.auto_grade_score or 0 for ans in answers)

    # Calculate percentage
    exam_total_points = submission.exam.total_points
    percentage = (total_score / exam_total_points * 100) if exam_total_points > 0 else 0

    # Create or update grade
    grade = Grade.query.filter_by(submission_id=submission.id).first()

    if not grade:
        grade = Grade(
            submission_id=submission.id,
            total_score=total_score,
            percentage=percentage,
            is_finalized=False  # Requires teacher approval
        )
        db.session.add(grade)
    else:
        grade.total_score = total_score
        grade.percentage = percentage

    db.session.commit()

    return grade
```

---

## Complete Example

```python
from app import db
from app.models.submission import Submission, SubmissionAnswer
from app.models.exam import AnswerKey
from app.models.grade import Grade, ReviewQueue

def auto_grade_submission(submission_id: int):
    """Complete auto-grading workflow"""

    submission = Submission.query.get(submission_id)

    if not submission or submission.submission_status != 'completed':
        return None

    # Load answer keys
    answer_keys = AnswerKey.query.filter_by(exam_id=submission.exam_id).all()
    answer_key_map = {ak.question_id: ak for ak in answer_keys}

    # Load student answers
    student_answers = SubmissionAnswer.query.filter_by(
        submission_id=submission_id
    ).all()

    total_score = 0.0

    for student_answer in student_answers:
        answer_key = answer_key_map.get(student_answer.question_id)

        if not answer_key:
            continue  # No answer key for this question

        # Grade based on question type
        if answer_key.answer_type == 'multiple_choice':
            score = grade_multiple_choice(student_answer, answer_key)
        else:  # open_ended
            score = grade_open_ended(student_answer, answer_key)

        total_score += score

        # Check if needs manual review
        if (student_answer.confidence_score < 0.7 or
            student_answer.grading_confidence < 0.7):
            add_to_review_queue(student_answer)

    # Create final grade
    exam_total = submission.exam.total_points
    percentage = (total_score / exam_total * 100) if exam_total > 0 else 0

    grade = Grade(
        submission_id=submission_id,
        total_score=total_score,
        percentage=percentage,
        is_finalized=False
    )
    db.session.add(grade)
    db.session.commit()

    return grade
```

---

## Configuration

Use these configuration values from `config.py`:

```python
from flask import current_app

# OCR confidence threshold
OCR_THRESHOLD = current_app.config.get('GRADING_OCR_CONFIDENCE_THRESHOLD', 0.70)

# Grading confidence thresholds
LOW_THRESHOLD = current_app.config.get('GRADING_CONFIDENCE_LOW_THRESHOLD', 0.40)
MID_THRESHOLD = current_app.config.get('GRADING_CONFIDENCE_MID_THRESHOLD', 0.70)

# Auto-grade after OCR completes?
AUTO_GRADE = current_app.config.get('AUTO_GRADE_ON_OCR_COMPLETE', True)
```

---

## Triggering Auto-Grading

### Option 1: Listen for OCR Completion Event

Modify `app/services/tasks/ocr_tasks.py` to trigger grading after OCR:

```python
# At the end of process_submission_ocr function:
if submission.submission_status == 'completed':
    # Trigger grading task
    from app.services.tasks.grading_tasks import auto_grade_submission
    auto_grade_submission.delay(submission.id)
```

### Option 2: Periodic Check (Celery Beat)

Create a periodic task that checks for ungraded submissions:

```python
from celery import Celery
from celery.schedules import crontab

@celery.task
def check_and_grade_submissions():
    """Check for completed but ungraded submissions"""
    from app.models.submission import Submission

    submissions = Submission.query.filter_by(
        submission_status='completed'
    ).all()

    for submission in submissions:
        if not submission.grade:
            auto_grade_submission.delay(submission.id)
```

---

## Testing Your Grading Integration

1. **Create a test submission:**
   - Upload a scanned exam paper
   - Wait for OCR to complete (check `/api/v1/submissions/{id}/ocr-status`)

2. **Check extracted answers:**
   ```bash
   GET /api/v1/submissions/{id}
   ```
   Verify `answers` array is populated

3. **Run your grading logic:**
   ```python
   from app.services.grading import auto_grade_submission
   result = auto_grade_submission(submission_id)
   ```

4. **Verify grade was created:**
   ```bash
   GET /api/v1/grading/grades/submission/{submission_id}
   ```

5. **Check review queue:**
   ```bash
   GET /api/v1/grading/review-queue
   ```

---

## Best Practices

1. **Always check OCR confidence:**
   - `answer.confidence_score < 0.7` → Flag for review

2. **Use multiple grading methods:**
   - Text similarity
   - Keyword matching
   - LLM semantic analysis

3. **Provide partial credit:**
   - Don't just give 0 or full points
   - Use similarity scores for partial credit

4. **Populate review queue:**
   - Any answer with low confidence
   - Helps teachers quickly review uncertain grades

5. **Log grading decisions:**
   - Store `grading_confidence` and `similarity_score`
   - Helps debug and improve grading

6. **Handle edge cases:**
   - Missing answers
   - Empty OCR text
   - Malformed input

---

## Database Fields Summary

### Fields OCR Agent Populates (✅ Done):
- `submission.submission_status` = 'completed'
- `submission_answer.answer_text` = Extracted text
- `submission_answer.answer_option_id` = Selected option (MC)
- `submission_answer.confidence_score` = OCR confidence
- `ocr_result.*` = Full OCR data

### Fields Grading Agent Should Populate (📝 Your Task):
- `submission_answer.is_auto_graded` = True
- `submission_answer.auto_grade_score` = Calculated score
- `submission_answer.grading_confidence` = Your confidence
- `submission_answer.similarity_score` = Text similarity
- `grade.total_score` = Sum of all scores
- `grade.percentage` = Final percentage
- `review_queue.*` = Low confidence answers

---

## API Endpoints Available

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/submissions/{id}` | Get submission with answers |
| `GET /api/v1/submissions/{id}/ocr-results` | Get OCR details |
| `GET /api/v1/exams/{id}/answer-keys` | Get correct answers |
| `POST /api/v1/grading/grades` | Create grade |
| `GET /api/v1/grading/grades/submission/{id}` | Get grade |
| `POST /api/v1/grading/review-queue` | Add to review queue |

---

## Questions?

If you need:
- Additional database fields
- New API endpoints
- Changes to OCR output format
- Help with integration

Let me know and I can update the OCR system accordingly!

**Good luck with implementing the grading logic!** 🎓
