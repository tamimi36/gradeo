"""
Answer Extractor - Extract student answers from OCR results and map to questions
"""
from typing import Dict, List, Optional
from app.models.exam import Exam, Question
from app.models.submission import OCRResult
from .text_processor import TextProcessor


class AnswerExtractor:
    """Extract student answers from OCR results and map to questions"""

    def __init__(self):
        """Initialize answer extractor"""
        self.text_processor = TextProcessor()

    def extract_answers_from_full_page(self, ocr_result: OCRResult, exam: Exam) -> List[Dict]:
        """
        Extract answers from full-page scan

        Strategy:
        1. Identify question numbers/markers in OCR text
        2. Extract text between markers
        3. Map to exam questions by order/number
        4. Handle multiple choice vs open-ended

        Args:
            ocr_result: OCRResult model instance
            exam: Exam model instance

        Returns:
            List of dictionaries containing:
            [
                {
                    'question_id': int,
                    'answer_text': str,
                    'confidence': float,
                    'bounding_box': dict,
                    'extraction_method': str
                },
                ...
            ]
        """
        extracted_answers = []

        # Get processed text
        text = ocr_result.processed_text or ocr_result.raw_text
        if not text:
            return []

        # Split text by questions
        question_answers = self.text_processor.split_by_questions(text)

        # Get all questions for this exam (ordered)
        questions = Question.query.filter_by(exam_id=exam.id).order_by(Question.order_number).all()

        # Map extracted answers to questions
        for question in questions:
            question_num = question.order_number
            answer_text = question_answers.get(question_num, '')

            # If answer not found by question number, try sequential matching
            if not answer_text and question_num <= len(question_answers):
                # Try to get by index
                sorted_nums = sorted(question_answers.keys())
                if question_num - 1 < len(sorted_nums):
                    actual_num = sorted_nums[question_num - 1]
                    answer_text = question_answers.get(actual_num, '')

            # Process based on question type
            if question.question_type == 'multiple_choice':
                # Extract selected option
                selected_option = self._extract_multiple_choice_answer(answer_text, question)

                extracted_answers.append({
                    'question_id': question.id,
                    'answer_text': answer_text,
                    'answer_option_id': selected_option,
                    'confidence': ocr_result.confidence_score or 0.0,
                    'bounding_box': None,  # Could extract from OCR bounding boxes
                    'extraction_method': 'pattern_match'
                })

            else:  # open_ended
                # Extract full text answer
                extracted_answers.append({
                    'question_id': question.id,
                    'answer_text': answer_text,
                    'answer_option_id': None,
                    'confidence': ocr_result.confidence_score or 0.0,
                    'bounding_box': None,
                    'extraction_method': 'pattern_match'
                })

        return extracted_answers

    def extract_answers_from_per_question_scan(self, ocr_results: List[OCRResult],
                                               exam: Exam) -> List[Dict]:
        """
        Extract answers when each question is scanned separately

        Simpler: one OCR result -> one question answer

        Args:
            ocr_results: List of OCRResult instances (one per question)
            exam: Exam model instance

        Returns:
            List of answer dictionaries
        """
        extracted_answers = []

        # Get all questions for this exam (ordered)
        questions = Question.query.filter_by(exam_id=exam.id).order_by(Question.order_number).all()

        # Match OCR results to questions by order
        for i, ocr_result in enumerate(ocr_results):
            if i >= len(questions):
                break

            question = questions[i]
            text = ocr_result.processed_text or ocr_result.raw_text or ''

            # Process based on question type
            if question.question_type == 'multiple_choice':
                selected_option = self._extract_multiple_choice_answer(text, question)

                extracted_answers.append({
                    'question_id': question.id,
                    'answer_text': text,
                    'answer_option_id': selected_option,
                    'confidence': ocr_result.confidence_score or 0.0,
                    'bounding_box': None,
                    'extraction_method': 'per_question_scan'
                })

            else:  # open_ended
                extracted_answers.append({
                    'question_id': question.id,
                    'answer_text': text,
                    'answer_option_id': None,
                    'confidence': ocr_result.confidence_score or 0.0,
                    'bounding_box': None,
                    'extraction_method': 'per_question_scan'
                })

        return extracted_answers

    def _extract_multiple_choice_answer(self, text: str, question: Question) -> Optional[int]:
        """
        Detect selected multiple choice option

        Args:
            text: Answer text from OCR
            question: Question model instance

        Returns:
            QuestionOption ID or None
        """
        if not text:
            return None

        # Detect selected letter (A, B, C, D)
        selected_letter = self.text_processor.detect_multiple_choice_selection(text)

        if not selected_letter:
            return None

        # Get question options (ordered)
        options = question.options
        if not options:
            return None

        # Map letter to option
        # A=0, B=1, C=2, D=3
        letter_index = ord(selected_letter) - ord('A')

        if 0 <= letter_index < len(options):
            return options[letter_index].id

        return None

    def map_answer_to_question(self, answer_text: str, question_number: int,
                               exam: Exam) -> Optional[Question]:
        """
        Map extracted answer to Question model by number/order

        Args:
            answer_text: Extracted answer text
            question_number: Question number from OCR
            exam: Exam model instance

        Returns:
            Question model instance or None
        """
        question = Question.query.filter_by(
            exam_id=exam.id,
            order_number=question_number
        ).first()

        return question
