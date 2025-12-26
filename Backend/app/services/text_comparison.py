"""
Text Comparison Utilities for Grading
Provides keyword matching and text similarity scoring for open-ended questions
"""
import re
from difflib import SequenceMatcher
from typing import List, Dict, Tuple


class TextComparator:
    """Handles text comparison and keyword matching for answer grading"""

    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Normalize text for comparison
        - Convert to lowercase
        - Remove extra whitespace
        - Remove punctuation (except for important chars in math/science)
        """
        if not text:
            return ""

        # Convert to lowercase
        text = text.lower().strip()

        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)

        # Remove common punctuation but keep important chars like +, -, =, %, etc.
        # This preserves math and science notation
        text = re.sub(r'[,;:!?\'"()]', '', text)

        return text

    @staticmethod
    def normalize_arabic_text(text: str) -> str:
        """
        Normalize Arabic text for comparison
        - Remove diacritics (tashkeel)
        - Normalize different forms of letters
        """
        if not text:
            return ""

        # Remove Arabic diacritics
        arabic_diacritics = re.compile(r'[\u064B-\u065F\u0670]')
        text = arabic_diacritics.sub('', text)

        # Normalize Alef forms
        text = re.sub(r'[إأآا]', 'ا', text)

        # Normalize Teh Marbuta
        text = re.sub(r'ة', 'ه', text)

        return TextComparator.normalize_text(text)

    @staticmethod
    def extract_keywords_from_text(text: str) -> List[str]:
        """Extract potential keywords from text (words longer than 3 chars)"""
        normalized = TextComparator.normalize_text(text)
        words = normalized.split()
        # Filter out short words and common stop words
        stop_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        keywords = [word for word in words if len(word) > 3 and word not in stop_words]
        return keywords

    @staticmethod
    def keyword_match_score(student_answer: str, keywords: List[str], language: str = 'en') -> Tuple[float, Dict]:
        """
        Calculate score based on keyword matching

        Args:
            student_answer: Student's answer text
            keywords: List of required keywords from answer key
            language: 'en' for English, 'ar' for Arabic

        Returns:
            Tuple of (score, details_dict)
            score: 0.0 to 1.0 representing percentage of keywords found
            details: {
                'total_keywords': int,
                'matched_keywords': list,
                'missing_keywords': list,
                'match_percentage': float
            }
        """
        if not keywords:
            # If no keywords specified, fall back to text similarity
            return 0.5, {'note': 'No keywords specified'}

        # Normalize student answer
        if language == 'ar':
            normalized_answer = TextComparator.normalize_arabic_text(student_answer)
        else:
            normalized_answer = TextComparator.normalize_text(student_answer)

        # Normalize keywords
        normalized_keywords = []
        for keyword in keywords:
            if language == 'ar':
                normalized_keywords.append(TextComparator.normalize_arabic_text(keyword))
            else:
                normalized_keywords.append(TextComparator.normalize_text(keyword))

        # Check which keywords are present
        matched_keywords = []
        missing_keywords = []

        for i, norm_keyword in enumerate(normalized_keywords):
            if norm_keyword in normalized_answer:
                matched_keywords.append(keywords[i])  # Store original form
            else:
                # Check for partial match (fuzzy matching)
                found = False
                for word in normalized_answer.split():
                    if TextComparator._fuzzy_match(word, norm_keyword, threshold=0.8):
                        matched_keywords.append(keywords[i])
                        found = True
                        break
                if not found:
                    missing_keywords.append(keywords[i])

        # Calculate match percentage
        total = len(keywords)
        matched = len(matched_keywords)
        match_percentage = matched / total if total > 0 else 0.0

        details = {
            'total_keywords': total,
            'matched_keywords': matched_keywords,
            'missing_keywords': missing_keywords,
            'match_percentage': match_percentage
        }

        return match_percentage, details

    @staticmethod
    def _fuzzy_match(word1: str, word2: str, threshold: float = 0.8) -> bool:
        """Check if two words are similar using fuzzy matching"""
        if not word1 or not word2:
            return False
        ratio = SequenceMatcher(None, word1, word2).ratio()
        return ratio >= threshold

    @staticmethod
    def text_similarity(text1: str, text2: str, language: str = 'en') -> float:
        """
        Calculate overall text similarity between two texts
        Uses SequenceMatcher for comparison

        Returns: float between 0.0 and 1.0
        """
        if not text1 or not text2:
            return 0.0

        # Normalize both texts
        if language == 'ar':
            norm1 = TextComparator.normalize_arabic_text(text1)
            norm2 = TextComparator.normalize_arabic_text(text2)
        else:
            norm1 = TextComparator.normalize_text(text1)
            norm2 = TextComparator.normalize_text(text2)

        # Calculate similarity ratio
        similarity = SequenceMatcher(None, norm1, norm2).ratio()
        return similarity

    @staticmethod
    def calculate_score_with_strictness(
        match_percentage: float,
        strictness_level: str,
        max_points: float
    ) -> Tuple[float, float]:
        """
        Calculate final score based on match percentage and strictness level

        Args:
            match_percentage: 0.0 to 1.0 representing keyword match percentage
            strictness_level: 'lenient', 'normal', or 'strict'
            max_points: Maximum points for this question

        Returns:
            Tuple of (score, confidence)
            score: Points awarded (0 to max_points)
            confidence: Grading confidence (0.0 to 1.0)
        """
        # Define thresholds for each strictness level
        if strictness_level == 'strict':
            # Strict: Use tiered scoring
            if match_percentage >= 0.85:
                score_ratio = 1.0
                confidence = 0.95
            elif match_percentage >= 0.70:
                score_ratio = 0.75
                confidence = 0.80
            elif match_percentage >= 0.50:
                score_ratio = 0.50
                confidence = 0.60
            else:
                score_ratio = 0.0
                confidence = 0.40

        elif strictness_level == 'normal':
            # Normal: Use tiered scoring with lower thresholds
            if match_percentage >= 0.70:
                score_ratio = 1.0
                confidence = 0.90
            elif match_percentage >= 0.50:
                score_ratio = 0.75
                confidence = 0.75
            elif match_percentage >= 0.30:
                score_ratio = 0.50
                confidence = 0.55
            else:
                score_ratio = match_percentage  # Proportional for very low matches
                confidence = 0.40

        else:  # lenient
            # Lenient: Mostly proportional scoring
            if match_percentage >= 0.50:
                score_ratio = match_percentage  # Proportional
                confidence = 0.85
            elif match_percentage >= 0.30:
                score_ratio = match_percentage * 0.8  # Slightly reduced
                confidence = 0.65
            else:
                score_ratio = match_percentage * 0.5  # More heavily reduced
                confidence = 0.45

        score = round(score_ratio * max_points, 2)

        # Ensure score doesn't exceed max_points
        score = min(score, max_points)

        return score, confidence


class MultipleChoiceComparator:
    """Handles multiple choice answer comparison"""

    @staticmethod
    def compare(student_option_id: int, correct_option_id: int) -> Tuple[bool, float]:
        """
        Compare multiple choice answers

        Args:
            student_option_id: Selected option ID by student
            correct_option_id: Correct option ID from answer key

        Returns:
            Tuple of (is_correct, confidence)
            is_correct: True if match, False otherwise
            confidence: Always 1.0 for multiple choice (exact match)
        """
        if student_option_id is None or correct_option_id is None:
            return False, 0.0

        is_correct = (student_option_id == correct_option_id)
        confidence = 1.0  # Multiple choice is always confident (exact match)

        return is_correct, confidence
