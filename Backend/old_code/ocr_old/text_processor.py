"""
Text Processor - Post-processing for OCR text cleaning and normalization
"""
import re
from typing import List, Dict


class TextProcessor:
    """Post-processing for OCR text - cleaning, normalization"""

    @staticmethod
    def clean_text(raw_text: str, language: str = 'en') -> str:
        """
        Clean OCR output
        - Remove extra whitespace
        - Fix common OCR errors
        - Normalize Arabic text (if applicable)

        Args:
            raw_text: Raw OCR text
            language: Language code ('ar', 'en', 'mixed')

        Returns:
            Cleaned text
        """
        if not raw_text:
            return ''

        text = raw_text

        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()

        # Language-specific cleaning
        if language == 'ar' or language == 'mixed':
            text = TextProcessor.normalize_arabic_text(text)

        if language == 'en' or language == 'mixed':
            text = TextProcessor.fix_common_ocr_errors(text)

        return text

    @staticmethod
    def normalize_arabic_text(text: str) -> str:
        """
        Normalize Arabic text
        - Normalize Arabic letters
        - Handle diacritics
        - Fix common OCR confusions

        Args:
            text: Arabic text

        Returns:
            Normalized Arabic text
        """
        if not text:
            return ''

        # Normalize Arabic letters
        # Replace different forms of Alef
        text = re.sub(r'[إأآا]', 'ا', text)

        # Normalize Taa Marbuta and Haa
        text = re.sub(r'ة', 'ه', text)

        # Remove diacritics (harakat)
        arabic_diacritics = re.compile(r'[\u064B-\u0652\u0670]')
        text = arabic_diacritics.sub('', text)

        # Remove Tatweel (elongation character)
        text = text.replace('\u0640', '')

        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()

        return text

    @staticmethod
    def fix_common_ocr_errors(text: str) -> str:
        """
        Fix common OCR character confusion
        - 0 vs O
        - 1 vs I vs l
        - etc.

        Note: This is context-dependent and may need refinement

        Args:
            text: English text

        Returns:
            Text with common errors fixed
        """
        if not text:
            return ''

        # These replacements are conservative to avoid incorrect changes
        # Can be expanded based on specific use cases

        # Remove extra spaces around punctuation
        text = re.sub(r'\s+([.,!?;:])', r'\1', text)
        text = re.sub(r'([.,!?;:])\s+', r'\1 ', text)

        return text

    @staticmethod
    def extract_mathematical_expressions(text: str) -> List[str]:
        """
        Identify and extract mathematical expressions
        - Numbers
        - Equations
        - Mathematical operators

        Args:
            text: Text containing math expressions

        Returns:
            List of mathematical expressions found
        """
        expressions = []

        # Pattern for equations (e.g., "x + 5 = 10", "2x^2 + 3x - 1 = 0")
        equation_pattern = r'[a-zA-Z0-9\s\+\-\*/\^\(\)=]+'
        equations = re.findall(equation_pattern, text)

        # Pattern for numbers (integers, decimals, fractions)
        number_pattern = r'\d+\.?\d*'
        numbers = re.findall(number_pattern, text)

        # Combine and deduplicate
        all_expressions = equations + numbers
        expressions = list(set(all_expressions))

        return expressions

    @staticmethod
    def extract_numeric_answer(text: str) -> str:
        """
        Extract numeric answer from text
        Useful for math questions

        Args:
            text: Text containing numeric answer

        Returns:
            Extracted number as string (empty if not found)
        """
        # Look for numbers (integers or decimals)
        numbers = re.findall(r'-?\d+\.?\d*', text)

        if numbers:
            # Return the first number found
            return numbers[0]

        return ''

    @staticmethod
    def extract_answer_from_pattern(text: str, question_number: int) -> str:
        """
        Extract answer for a specific question from full-page scan
        Looks for patterns like "Q1: answer", "1. answer", etc.

        Args:
            text: Full text from OCR
            question_number: Question number to extract

        Returns:
            Extracted answer text (empty if not found)
        """
        # Patterns to match question markers
        patterns = [
            # English patterns
            rf'(?:Q|Question)\s*{question_number}[\s:.-]+([^\n]+)',
            rf'{question_number}[\s:.-]+([^\n]+)',
            rf'(?:Q|Question)\s*{question_number}(?:\)|\.)\s*([^\n]+)',

            # Arabic patterns (Arabic numerals and Arabic question markers)
            rf'(?:س|السؤال)\s*{question_number}[\s:.-]+([^\n]+)',
            rf'(?:س|السؤال)\s*{question_number}(?:\)|\.)\s*([^\n]+)',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
            if matches:
                return matches[0].strip()

        return ''

    @staticmethod
    def split_by_questions(text: str) -> Dict[int, str]:
        """
        Split full-page OCR text into individual question answers
        Returns dictionary mapping question number to answer text

        Args:
            text: Full OCR text

        Returns:
            Dictionary: {question_number: answer_text}
        """
        answers = {}

        # Pattern to find question markers (English and Arabic)
        # Matches: "Q1", "Question 1", "1.", "س1", "السؤال 1", etc.
        question_pattern = r'(?:Q|Question|س|السؤال)?\s*(\d+)[\s:.-]'

        # Find all question markers
        matches = list(re.finditer(question_pattern, text, re.IGNORECASE))

        for i, match in enumerate(matches):
            question_num = int(match.group(1))
            start_pos = match.end()

            # Find end position (start of next question or end of text)
            if i + 1 < len(matches):
                end_pos = matches[i + 1].start()
            else:
                end_pos = len(text)

            # Extract answer text
            answer_text = text[start_pos:end_pos].strip()

            # Clean the answer
            answer_text = re.sub(r'\s+', ' ', answer_text)

            answers[question_num] = answer_text

        return answers

    @staticmethod
    def detect_multiple_choice_selection(text: str) -> str:
        """
        Detect which multiple choice option was selected
        Looks for patterns like "(A)", "A)", "A.", etc.

        Args:
            text: Text containing multiple choice answer

        Returns:
            Selected option letter (A, B, C, D) or empty string
        """
        # Patterns for English options
        english_patterns = [
            r'\(?([A-Da-d])\)?',  # (A), A), A
            r'([A-Da-d])\.',       # A.
        ]

        for pattern in english_patterns:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0].upper()

        # Patterns for Arabic options (أ, ب, ج, د)
        arabic_options = {'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D'}
        for arabic_letter, english_letter in arabic_options.items():
            if arabic_letter in text:
                return english_letter

        return ''
