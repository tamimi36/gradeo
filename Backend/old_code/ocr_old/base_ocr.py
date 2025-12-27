"""
Abstract Base Class for OCR Service Providers
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional


class BaseOCRService(ABC):
    """Abstract base class for OCR service providers"""

    @abstractmethod
    def detect_text(self, image_path: str, language_hints: List[str] = None) -> Dict:
        """
        Basic text detection

        Args:
            image_path: Path to the image file
            language_hints: List of language codes (e.g., ['ar', 'en'])

        Returns:
            Dictionary containing OCR results
        """
        pass

    @abstractmethod
    def detect_document_text(self, image_path: str, language_hints: List[str] = None) -> Dict:
        """
        Document text detection with layout preservation
        Best for handwriting and structured documents

        Args:
            image_path: Path to the image file
            language_hints: List of language codes (e.g., ['ar', 'en'])

        Returns:
            Dictionary containing OCR results with layout information
        """
        pass

    @abstractmethod
    def get_confidence_score(self, ocr_result: Dict) -> float:
        """
        Extract overall confidence score from OCR result

        Args:
            ocr_result: OCR result dictionary

        Returns:
            Confidence score between 0 and 1
        """
        pass
