"""
OCR Strategy Selector - Selects optimal OCR strategy based on exam/question metadata
"""
from typing import Dict, List, Optional
from app.models.exam import Exam, Question
from app.models.submission import QuestionOCRMetadata
from .google_vision_ocr import GoogleVisionOCR


class OCRStrategy:
    """OCR strategy constants"""
    GENERAL_TEXT = 'general_text'
    HANDWRITING = 'handwriting'
    MATH_FORMULAS = 'math_formulas'
    MIXED_CONTENT = 'mixed_content'
    ARABIC_TEXT = 'arabic_text'
    ENGLISH_TEXT = 'english_text'


class OCRStrategySelector:
    """Selects optimal OCR strategy based on exam/question metadata"""

    def __init__(self, ocr_service: GoogleVisionOCR = None):
        """
        Initialize strategy selector

        Args:
            ocr_service: GoogleVisionOCR instance (creates new if None)
        """
        self.ocr_service = ocr_service or GoogleVisionOCR()

    def select_strategy_for_exam(self, exam: Exam) -> str:
        """
        Select OCR strategy based on exam metadata

        Logic:
        - If exam.subject_type == 'mathematics' -> MATH_FORMULAS
        - If exam.primary_language == 'ar' -> ARABIC_TEXT
        - If exam.has_formulas -> MATH_FORMULAS
        - Default -> HANDWRITING (best for handwritten exams)

        Args:
            exam: Exam model instance

        Returns:
            Strategy name
        """
        # Check for mathematics
        if exam.subject_type and 'math' in exam.subject_type.lower():
            return OCRStrategy.MATH_FORMULAS

        # Check for formulas
        if exam.has_formulas:
            return OCRStrategy.MATH_FORMULAS

        # Check primary language
        if exam.primary_language == 'ar':
            return OCRStrategy.ARABIC_TEXT
        elif exam.primary_language == 'en':
            return OCRStrategy.ENGLISH_TEXT

        # Check subject type for language-specific handling
        if exam.subject_type:
            subject_lower = exam.subject_type.lower()
            if 'arabic' in subject_lower:
                return OCRStrategy.ARABIC_TEXT
            elif 'english' in subject_lower:
                return OCRStrategy.ENGLISH_TEXT
            elif 'science' in subject_lower or 'physic' in subject_lower or 'chemistry' in subject_lower:
                return OCRStrategy.MIXED_CONTENT

        # Default to handwriting strategy for general handwritten exams
        return OCRStrategy.HANDWRITING

    def select_strategy_for_question(self, question: Question) -> str:
        """
        Select OCR strategy for individual question

        Checks for question-specific metadata first, then falls back to exam-level

        Args:
            question: Question model instance

        Returns:
            Strategy name
        """
        # Check if question has specific OCR metadata
        metadata = QuestionOCRMetadata.query.filter_by(question_id=question.id).first()

        if metadata:
            # Use question-specific settings
            if metadata.has_formulas:
                return OCRStrategy.MATH_FORMULAS

            if metadata.language == 'ar':
                return OCRStrategy.ARABIC_TEXT
            elif metadata.language == 'en':
                return OCRStrategy.ENGLISH_TEXT
            elif metadata.language == 'mixed':
                return OCRStrategy.MIXED_CONTENT

            if metadata.subject_type:
                subject_lower = metadata.subject_type.lower()
                if 'math' in subject_lower:
                    return OCRStrategy.MATH_FORMULAS
                elif 'arabic' in subject_lower:
                    return OCRStrategy.ARABIC_TEXT

        # Fall back to exam-level strategy
        return self.select_strategy_for_exam(question.exam)

    def get_language_hints(self, exam: Exam, question: Question = None) -> List[str]:
        """
        Get language hints for Vision API

        Args:
            exam: Exam model instance
            question: Optional Question model instance

        Returns:
            List of language codes (e.g., ['ar', 'en'])
        """
        # Check question-specific metadata first
        if question:
            metadata = QuestionOCRMetadata.query.filter_by(question_id=question.id).first()
            if metadata and metadata.language:
                if metadata.language == 'mixed':
                    return ['ar', 'en']
                return [metadata.language]

        # Fall back to exam-level language
        if exam.primary_language == 'mixed':
            return ['ar', 'en']
        elif exam.primary_language == 'ar':
            return ['ar']
        elif exam.primary_language == 'en':
            return ['en']

        # Default to English
        return ['en']

    def execute_strategy(self, strategy: str, image_path: str,
                         language_hints: List[str] = None) -> Dict:
        """
        Execute the selected OCR strategy

        Args:
            strategy: OCR strategy name
            image_path: Path to image file
            language_hints: Language codes

        Returns:
            OCR result dictionary
        """
        if strategy == OCRStrategy.GENERAL_TEXT:
            return self.ocr_service.detect_text(image_path, language_hints)

        elif strategy == OCRStrategy.HANDWRITING:
            return self.ocr_service.detect_handwriting(image_path, language_hints)

        elif strategy == OCRStrategy.MATH_FORMULAS:
            return self.ocr_service.detect_math_formulas(image_path, language_hints)

        elif strategy == OCRStrategy.ARABIC_TEXT:
            # Ensure Arabic is in language hints
            if not language_hints or 'ar' not in language_hints:
                language_hints = ['ar']
            return self.ocr_service.detect_handwriting(image_path, language_hints)

        elif strategy == OCRStrategy.ENGLISH_TEXT:
            # Ensure English is in language hints
            if not language_hints or 'en' not in language_hints:
                language_hints = ['en']
            return self.ocr_service.detect_handwriting(image_path, language_hints)

        elif strategy == OCRStrategy.MIXED_CONTENT:
            # Use both languages
            return self.ocr_service.detect_handwriting(image_path, ['ar', 'en'])

        else:
            # Default to handwriting
            return self.ocr_service.detect_handwriting(image_path, language_hints)
