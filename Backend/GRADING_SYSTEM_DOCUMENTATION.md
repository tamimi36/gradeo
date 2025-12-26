# Gradeo Grading System Documentation

## Overview

The Gradeo grading system provides intelligent, automated grading for exam submissions with support for both multiple choice and open-ended questions. It features keyword-based grading with configurable strictness levels, automatic review queue population, and comprehensive teacher review workflows.

---

## Key Features

### 1. **Keyword-Based Grading for Open-Ended Questions**
- Teachers provide keywords for each open-ended answer
- System scores based on how many keywords are present in student answers
- Fuzzy matching for spelling variations
- Supports both English and Arabic text

### 2. **Configurable Strictness Levels**
- **Lenient**: 50%+ keyword match = proportional scoring
- **Normal**: 70%+ keyword match = tiered scoring (default)
- **Strict**: 85%+ keyword match = tiered scoring with high thresholds

### 3. **Two-Tier Review Queue**
- **High Priority**: OCR confidence < 70% (must review before finalizing)
- **Low Priority**: Grading confidence issues, questions marked for review (suggested)

### 4. **Multiple Choice Support**
- Exact match scoring (100% or 0%)
- Single correct answer per question
- High confidence grading (always 1.0)

### 5. **Comprehensive Grading Workflow**
- Automatic grading after OCR completion
- Manual grading trigger for teachers
- Regrade functionality after answer key updates
- Grade adjustments and finalization

---

## Database Schema Changes

### New Fields in `answer_keys` Table
```sql
strictness_level VARCHAR(20) DEFAULT 'normal'  -- 'lenient', 'normal', 'strict'
keywords JSON                                  -- Array of keywords for grading
additional_notes TEXT                          -- Teacher hints for grading
```

### New Fields in `submission_answers` Table
```sql
grading_confidence FLOAT       -- Grading algorithm confidence (0-1)
similarity_score FLOAT         -- Text similarity/keyword match score (0-1)
```

### New Field in `review_queue` Table
```sql
priority VARCHAR(10) DEFAULT 'low'  -- 'high' or 'low'
```

---

## Grading Algorithm

### Multiple Choice Questions
```
IF student_answer_option_id == correct_answer_option_id:
    score = full points
    confidence = 1.0
ELSE:
    score = 0
    confidence = 1.0
```

### Open-Ended Questions (Keyword-Based)

**Step 1: Keyword Matching**
```
matched_keywords = 0
FOR each keyword in answer_key.keywords:
    IF keyword found in student_answer (with fuzzy matching):
        matched_keywords += 1

match_percentage = matched_keywords / total_keywords
```

**Step 2: Score Calculation Based on Strictness**

**Strict Mode (Tiered Scoring):**
- 85%+ match → 100% of points (confidence: 0.95)
- 70-85% match → 75% of points (confidence: 0.80)
- 50-70% match → 50% of points (confidence: 0.60)
- <50% match → 0% of points (confidence: 0.40)

**Normal Mode (Tiered with Lower Thresholds):**
- 70%+ match → 100% of points (confidence: 0.90)
- 50-70% match → 75% of points (confidence: 0.75)
- 30-50% match → 50% of points (confidence: 0.55)
- <30% match → Proportional (confidence: 0.40)

**Lenient Mode (Proportional Scoring):**
- 50%+ match → Proportional to match percentage (confidence: 0.85)
- 30-50% match → 80% of proportional (confidence: 0.65)
- <30% match → 50% of proportional (confidence: 0.45)

---

## Review Queue Logic

### High Priority (Must Review)
Triggers:
- OCR confidence < 70%

These items **must** be reviewed by the teacher before the grade can be finalized.

### Low Priority (Suggested Review)
Triggers:
- Grading confidence < 40%
- Grading confidence between 40-70% (gray zone)
- Question marked with `requires_review` flag

These items are suggested for review but don't block grade finalization.

---

## API Endpoints

### Answer Key Management

**POST /api/v1/exams/{exam_id}/answer-keys**

Create or update answer keys in bulk:

```json
{
  "answer_keys": [
    {
      "question_id": 1,
      "correct_answer": "1",
      "answer_type": "multiple_choice",
      "points": 5.0
    },
    {
      "question_id": 2,
      "correct_answer": "Photosynthesis is the process by which plants convert sunlight into energy",
      "answer_type": "open_ended",
      "points": 10.0,
      "strictness_level": "normal",
      "keywords": ["photosynthesis", "sunlight", "energy", "chlorophyll", "plants"],
      "additional_notes": "Accept variations like 'sun light' or 'sun energy'"
    }
  ]
}
```

### Grading Triggers

**POST /api/v1/grading/grade-submission/{submission_id}**

Manually trigger grading for a submission (Teacher/Admin only):

Response:
```json
{
  "submission_id": 1,
  "total_score": 85.0,
  "max_score": 100.0,
  "percentage": 85.0,
  "graded_answers": 10,
  "review_queue_items": 3,
  "high_priority_reviews": 1,
  "message": "Submission graded successfully",
  "status": "success"
}
```

**POST /api/v1/grading/regrade-submission/{submission_id}**

Regrade a submission after answer key updates:

- Deletes existing grade and review queue items
- Resets answer grading status
- Grades submission again from scratch

**GET /api/v1/grading/submission/{submission_id}/summary**

Get detailed grading summary:

Response:
```json
{
  "status": "graded",
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
      "question_number": 1,
      "question_type": "multiple_choice",
      "score": 5.0,
      "max_points": 5.0,
      "ocr_confidence": 0.95,
      "grading_confidence": 1.0,
      "similarity_score": null
    },
    {
      "question_id": 2,
      "question_number": 2,
      "question_type": "open_ended",
      "score": 7.5,
      "max_points": 10.0,
      "ocr_confidence": 0.88,
      "grading_confidence": 0.75,
      "similarity_score": 0.75
    }
  ],
  "review_queue": [
    {
      "id": 1,
      "question_id": 3,
      "review_reason": "low_ocr_confidence",
      "priority": "high",
      "review_status": "pending"
    }
  ],
  "high_priority_reviews": 1,
  "low_priority_reviews": 2
}
```

---

## Configuration

### config.py Settings

```python
# Grading Configuration
GRADING_OCR_CONFIDENCE_THRESHOLD = 0.70  # Below this = high priority review
GRADING_CONFIDENCE_LOW_THRESHOLD = 0.40  # Below this = suggest review
GRADING_CONFIDENCE_MID_THRESHOLD = 0.70  # Between LOW and MID = gray zone
AUTO_GRADE_ON_OCR_COMPLETE = True        # Auto-grade after OCR finishes
```

### Environment Variables (.env)

```bash
# Grading Thresholds
GRADING_OCR_CONFIDENCE_THRESHOLD=0.70
GRADING_CONFIDENCE_LOW_THRESHOLD=0.40
GRADING_CONFIDENCE_MID_THRESHOLD=0.70
AUTO_GRADE_ON_OCR_COMPLETE=True
```

---

## Usage Examples

### Example 1: Creating Answer Keys with Keywords

For a science exam question about photosynthesis:

```json
{
  "question_id": 5,
  "correct_answer": "Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to produce glucose and oxygen through chlorophyll in their leaves",
  "answer_type": "open_ended",
  "points": 15.0,
  "strictness_level": "normal",
  "keywords": [
    "photosynthesis",
    "sunlight",
    "water",
    "carbon dioxide",
    "glucose",
    "oxygen",
    "chlorophyll",
    "leaves"
  ],
  "additional_notes": "Student must mention at least 5-6 keywords for full credit. Accept 'CO2' for 'carbon dioxide' and 'light' for 'sunlight'."
}
```

### Example 2: Grading Workflow

1. **Student submits exam**
   - Submission created with status='pending'

2. **OCR processes submission**
   - Creates SubmissionAnswer records with extracted text
   - Sets submission status='completed'

3. **Automatic grading (if enabled)**
   - Grading service grades all answers
   - Creates Grade record with totals
   - Populates ReviewQueue with items needing review

4. **Teacher reviews**
   - Views high-priority reviews first
   - Approves/rejects answers
   - Makes manual adjustments if needed

5. **Grade finalization**
   - Teacher finalizes grade
   - Grade becomes visible to student
   - Sends notification (if configured)

### Example 3: Handling Different Strictness Levels

**Scenario**: Question worth 10 points, 5 keywords defined

**Student Answer**: Contains 4 out of 5 keywords (80% match)

**Results by Strictness Level:**

- **Lenient**: 8.0 points (80% × 10 points, proportional)
- **Normal**: 10.0 points (80% is in 70-100% tier = 100%)
- **Strict**: 7.5 points (80% is in 70-85% tier = 75%)

---

## Text Normalization

### English Text
- Convert to lowercase
- Remove extra whitespace
- Remove common punctuation (,;:!?'")
- Preserve important chars (+, -, =, %, etc.)

### Arabic Text
- Remove diacritics (tashkeel)
- Normalize Alef forms (إأآا → ا)
- Normalize Teh Marbuta (ة → ه)
- Apply English normalization rules

### Fuzzy Matching
- Uses SequenceMatcher with 80% threshold
- Catches spelling variations and typos
- Example: "chlorophyl" matches "chlorophyll"

---

## Integration with OCR Agent

The grading system is designed to work seamlessly with the OCR agent:

1. **OCR Agent Responsibilities:**
   - Process scanned images
   - Extract text from answers
   - Create SubmissionAnswer records
   - Set OCR confidence scores

2. **Grading Agent Responsibilities:**
   - Grade SubmissionAnswers
   - Compare with AnswerKeys
   - Calculate scores
   - Populate review queue

3. **Integration Point:**
   - After OCR completes, can automatically trigger grading
   - Or teacher can manually trigger grading via API

---

## Best Practices

### For Teachers

1. **Define Clear Keywords**
   - Use 5-10 keywords per open-ended question
   - Include synonyms and variations
   - Focus on key concepts, not common words

2. **Choose Appropriate Strictness**
   - Use 'strict' for technical/scientific questions requiring precision
   - Use 'normal' for most questions (balanced approach)
   - Use 'lenient' for creative/opinion-based questions

3. **Review High-Priority Items**
   - Always review items with low OCR confidence
   - These may have been misread by OCR
   - Could significantly impact the grade

4. **Use Additional Notes**
   - Provide guidance for edge cases
   - Mention acceptable variations
   - Help future reviewers understand intent

### For Students

1. **Write Clearly**
   - Better handwriting = higher OCR confidence
   - Higher OCR confidence = less likely to need manual review

2. **Include Key Terms**
   - Use technical terms from the course material
   - Include important concepts in answers

3. **Be Comprehensive**
   - For open-ended questions, cover multiple aspects
   - More keywords matched = higher scores

---

## Troubleshooting

### Issue: Low Grading Confidence

**Symptoms**: Many answers flagged for review with low grading confidence

**Solutions**:
- Add more keywords to answer keys
- Use more lenient strictness level
- Provide clearer answer keys
- Check if student answers are too brief

### Issue: All Answers Scoring Zero

**Symptoms**: Students getting 0 points despite correct answers

**Solutions**:
- Verify answer keys are set correctly
- Check if keywords are defined for open-ended questions
- Ensure correct_answer format matches answer_type
- For multiple choice, verify option IDs are correct

### Issue: High Priority Reviews Blocking Finalization

**Symptoms**: Cannot finalize grades due to pending high-priority reviews

**Solutions**:
- Review all items with priority='high' first
- These are answers with low OCR confidence
- Verify OCR extracted correct text
- Adjust scores if OCR misread the answer

---

## Migration Instructions

### Apply Database Migration

```bash
# Run the migration
flask db upgrade

# Verify migration applied
flask db current
```

### Seed Initial OCR Strategies (Optional)

If using the OCR agent's strategies table:

```python
from app import db
from app.models.submission import OCRStrategy

strategies = [
    OCRStrategy(
        strategy_name='general_text',
        ocr_method='text_detection',
        description='Fast text detection for printed text'
    ),
    OCRStrategy(
        strategy_name='handwriting',
        ocr_method='document_text_detection',
        language_hints=['en', 'ar'],
        description='Handwriting recognition with multi-language support'
    ),
    # Add more strategies as needed
]

db.session.bulk_save_objects(strategies)
db.session.commit()
```

---

## Future Enhancements

### Planned Features

1. **AI-Powered Semantic Comparison**
   - Integration with OpenAI API
   - Understand meaning beyond keywords
   - Better handling of paraphrased answers

2. **Multiple Correct Answers for Multiple Choice**
   - "Select all that apply" questions
   - Partial credit for partially correct selections

3. **Custom Grading Rubrics**
   - Teacher-defined scoring criteria
   - Point allocation per keyword or concept
   - Weighted keywords

4. **Batch Grading Operations**
   - Grade all submissions for an exam at once
   - Bulk regrade after answer key updates
   - Export grading statistics

5. **Machine Learning Improvements**
   - Learn from teacher adjustments
   - Improve keyword extraction
   - Suggest keywords based on correct answers

---

## Support

For issues or questions about the grading system:

1. Check this documentation first
2. Review the API documentation at `/api/docs`
3. Check the grading service logs for errors
4. Contact the development team

---

## Version History

### Version 1.0.0 (2025-12-09)
- Initial release
- Keyword-based grading for open-ended questions
- Multiple choice exact match grading
- Two-tier review queue system
- Configurable strictness levels
- Manual grading triggers
- Arabic and English text support
