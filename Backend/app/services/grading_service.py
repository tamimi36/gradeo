"""
Grading Service
Handles automatic grading of submissions based on answer keys
"""
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from app import db
from app.models.submission import Submission, SubmissionAnswer
from app.models.exam import AnswerKey, Question, Exam
from app.models.grade import Grade, ReviewQueue
from app.services.text_comparison import TextComparator, MultipleChoiceComparator


class GradingService:
    """Service for automatic grading of exam submissions"""

    # Confidence thresholds
    OCR_CONFIDENCE_THRESHOLD = 0.70  # Below this = high priority review
    GRADING_CONFIDENCE_LOW = 0.40    # Below this = suggest review
    GRADING_CONFIDENCE_MID = 0.70    # Between LOW and MID = gray zone

    @staticmethod
    def grade_submission(submission_id: int) -> Dict:
        """
        Grade a complete submission

        Args:
            submission_id: ID of the submission to grade

        Returns:
            Dict with grading results:
            {
                'submission_id': int,
                'total_score': float,
                'max_score': float,
                'percentage': float,
                'graded_answers': int,
                'review_queue_items': int,
                'high_priority_reviews': int,
                'status': str
            }
        """
        # Load submission with relationships
        submission = Submission.query.get(submission_id)
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")

        # Check if submission has answers
        if not submission.answers:
            raise ValueError(f"Submission {submission_id} has no answers to grade")

        # Get exam to check for language hints
        exam = submission.exam
        primary_language = getattr(exam, 'primary_language', 'en')

        # Grade each answer
        total_score = 0.0
        max_score = 0.0
        graded_count = 0
        review_items = []
        high_priority_count = 0

        for answer in submission.answers:
            try:
                result = GradingService._grade_single_answer(answer, primary_language)

                total_score += result['score']
                max_score += result['max_points']
                graded_count += 1

                # Update answer record
                answer.is_auto_graded = True
                answer.auto_grade_score = result['score']
                answer.grading_confidence = result['confidence']
                answer.similarity_score = result.get('similarity_score')

                # Check if needs review
                review_info = GradingService._check_review_needed(answer, result)
                if review_info:
                    review_items.append(review_info)
                    if review_info['priority'] == 'high':
                        high_priority_count += 1

            except Exception as e:
                # Log error but continue grading other answers
                print(f"Error grading answer {answer.id}: {str(e)}")
                # Add to high-priority review queue
                review_items.append({
                    'answer': answer,
                    'reason': 'grading_error',
                    'priority': 'high',
                    'notes': f"Error during grading: {str(e)}"
                })
                high_priority_count += 1

        # Create or update grade record
        grade = Grade.query.filter_by(submission_id=submission_id).first()
        if not grade:
            grade = Grade(submission_id=submission_id)
            db.session.add(grade)

        grade.total_score = round(total_score, 2)
        grade.max_score = round(max_score, 2)
        grade.percentage = round((total_score / max_score * 100) if max_score > 0 else 0.0, 2)
        grade.auto_graded_at = datetime.utcnow()
        grade.is_finalized = False  # Requires teacher review/finalization

        # Create review queue items
        for review_info in review_items:
            review_item = ReviewQueue(
                submission_id=submission_id,
                question_id=review_info['answer'].question_id,
                submission_answer_id=review_info['answer'].id,
                review_reason=review_info['reason'],
                priority=review_info['priority'],
                review_notes=review_info.get('notes')
            )
            db.session.add(review_item)

        # Update submission status
        submission.submission_status = 'completed'
        submission.processed_at = datetime.utcnow()

        # Commit all changes
        db.session.commit()

        return {
            'submission_id': submission_id,
            'total_score': grade.total_score,
            'max_score': grade.max_score,
            'percentage': grade.percentage,
            'graded_answers': graded_count,
            'review_queue_items': len(review_items),
            'high_priority_reviews': high_priority_count,
            'status': 'success'
        }

    @staticmethod
    def _grade_single_answer(answer: SubmissionAnswer, language: str = 'en') -> Dict:
        """
        Grade a single answer

        Args:
            answer: SubmissionAnswer object
            language: Primary language ('en', 'ar', 'mixed')

        Returns:
            Dict with:
            {
                'score': float,
                'max_points': float,
                'confidence': float,
                'similarity_score': float (optional),
                'details': dict
            }
        """
        # Get answer key for this question
        answer_key = AnswerKey.query.filter_by(
            question_id=answer.question_id,
            exam_id=answer.submission.exam_id
        ).first()

        if not answer_key:
            raise ValueError(f"No answer key found for question {answer.question_id}")

        # Get question details
        question = answer.question

        # Grade based on question type
        if answer_key.answer_type == 'multiple_choice':
            return GradingService._grade_multiple_choice(answer, answer_key)
        else:  # open_ended
            return GradingService._grade_open_ended(answer, answer_key, language)

    @staticmethod
    def _grade_multiple_choice(answer: SubmissionAnswer, answer_key: AnswerKey) -> Dict:
        """Grade a multiple choice answer"""

        # Get correct option ID from answer key
        try:
            correct_option_id = int(answer_key.correct_answer)
        except (ValueError, TypeError):
            raise ValueError("Invalid answer key format for multiple choice question")

        # Compare answers
        is_correct, confidence = MultipleChoiceComparator.compare(
            answer.answer_option_id,
            correct_option_id
        )

        # Calculate score
        score = answer_key.points if is_correct else 0.0

        return {
            'score': score,
            'max_points': answer_key.points,
            'confidence': confidence,
            'details': {
                'is_correct': is_correct,
                'student_option_id': answer.answer_option_id,
                'correct_option_id': correct_option_id
            }
        }

    @staticmethod
    def _grade_open_ended(answer: SubmissionAnswer, answer_key: AnswerKey, language: str) -> Dict:
        """Grade an open-ended answer using keyword matching"""

        student_answer = answer.answer_text or ""
        correct_answer = answer_key.correct_answer or ""
        keywords = answer_key.keywords or []
        strictness = answer_key.strictness_level or 'normal'

        # If keywords are provided, use keyword matching
        if keywords and len(keywords) > 0:
            match_percentage, match_details = TextComparator.keyword_match_score(
                student_answer,
                keywords,
                language
            )
        else:
            # Fall back to text similarity if no keywords
            match_percentage = TextComparator.text_similarity(
                student_answer,
                correct_answer,
                language
            )
            match_details = {
                'method': 'text_similarity',
                'note': 'No keywords provided, using text similarity'
            }

        # Calculate score based on strictness level
        score, confidence = TextComparator.calculate_score_with_strictness(
            match_percentage,
            strictness,
            answer_key.points
        )

        return {
            'score': score,
            'max_points': answer_key.points,
            'confidence': confidence,
            'similarity_score': match_percentage,
            'details': {
                'match_percentage': match_percentage,
                'strictness_level': strictness,
                'keywords_used': len(keywords) > 0,
                'match_details': match_details
            }
        }

    @staticmethod
    def _check_review_needed(answer: SubmissionAnswer, grading_result: Dict) -> Optional[Dict]:
        """
        Check if an answer needs to be added to review queue

        Priority Levels:
        - HIGH: OCR confidence < 70% (must review before finalizing)
        - LOW: Grading confidence issues, requires_review flag (suggested review)

        Returns:
            Dict with review info if review is needed, None otherwise
        """
        ocr_confidence = answer.confidence_score or 0.0
        grading_confidence = grading_result['confidence']
        question = answer.question

        # HIGH PRIORITY: Low OCR confidence
        if ocr_confidence < GradingService.OCR_CONFIDENCE_THRESHOLD:
            return {
                'answer': answer,
                'reason': 'low_ocr_confidence',
                'priority': 'high',
                'notes': f'OCR confidence: {ocr_confidence:.2%}. Manual verification required.'
            }

        # LOW PRIORITY: Question marked for review
        if question.requires_review:
            return {
                'answer': answer,
                'reason': 'requires_review',
                'priority': 'low',
                'notes': 'Question marked for manual review by teacher.'
            }

        # LOW PRIORITY: Low grading confidence
        if grading_confidence < GradingService.GRADING_CONFIDENCE_LOW:
            return {
                'answer': answer,
                'reason': 'low_grading_confidence',
                'priority': 'low',
                'notes': f'Grading confidence: {grading_confidence:.2%}. Suggested for review.'
            }

        # LOW PRIORITY: Gray zone (medium confidence)
        if grading_confidence < GradingService.GRADING_CONFIDENCE_MID:
            similarity = grading_result.get('similarity_score', 0.0)
            return {
                'answer': answer,
                'reason': 'medium_confidence',
                'priority': 'low',
                'notes': f'Grading confidence: {grading_confidence:.2%}, Match: {similarity:.2%}. Consider reviewing.'
            }

        # No review needed
        return None

    @staticmethod
    def regrade_submission(submission_id: int) -> Dict:
        """
        Regrade a submission (useful after answer key updates)

        Args:
            submission_id: ID of submission to regrade

        Returns:
            Dict with regrading results
        """
        # Delete existing grade and review queue items
        Grade.query.filter_by(submission_id=submission_id).delete()
        ReviewQueue.query.filter_by(submission_id=submission_id).delete()

        # Reset answer grading status
        SubmissionAnswer.query.filter_by(submission_id=submission_id).update({
            'is_auto_graded': False,
            'auto_grade_score': None,
            'grading_confidence': None,
            'similarity_score': None
        })

        db.session.commit()

        # Grade submission again
        return GradingService.grade_submission(submission_id)

    @staticmethod
    def get_grading_summary(submission_id: int) -> Dict:
        """
        Get detailed grading summary for a submission

        Returns:
            Dict with complete grading information including:
            - Grade details
            - Answer-by-answer breakdown
            - Review queue items
        """
        submission = Submission.query.get(submission_id)
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")

        grade = submission.grade
        if not grade:
            return {
                'status': 'not_graded',
                'message': 'Submission has not been graded yet'
            }

        # Get answer breakdown
        answers_breakdown = []
        for answer in submission.answers:
            answer_key = AnswerKey.query.filter_by(
                question_id=answer.question_id,
                exam_id=submission.exam_id
            ).first()

            answers_breakdown.append({
                'question_id': answer.question_id,
                'question_number': answer.question.order_number,
                'question_type': answer_key.answer_type if answer_key else None,
                'score': answer.auto_grade_score,
                'max_points': answer_key.points if answer_key else None,
                'ocr_confidence': answer.confidence_score,
                'grading_confidence': answer.grading_confidence,
                'similarity_score': answer.similarity_score
            })

        # Get review queue items
        review_items = ReviewQueue.query.filter_by(
            submission_id=submission_id
        ).order_by(
            ReviewQueue.priority.desc(),
            ReviewQueue.created_at
        ).all()

        return {
            'status': 'graded',
            'grade': grade.to_dict(),
            'answers': answers_breakdown,
            'review_queue': [item.to_dict() for item in review_items],
            'high_priority_reviews': sum(1 for item in review_items if item.priority == 'high'),
            'low_priority_reviews': sum(1 for item in review_items if item.priority == 'low')
        }
