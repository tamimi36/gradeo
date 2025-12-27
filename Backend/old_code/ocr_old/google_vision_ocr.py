"""
Google Cloud Vision API OCR Implementation
"""
import os
import io
import requests
from typing import Dict, List, Optional
from .base_ocr import BaseOCRService
import base64


class GoogleVisionOCR(BaseOCRService):
    """Google Cloud Vision API implementation using API Key authentication"""

    def __init__(self, api_key: str = None):
        """
        Initialize Google Vision OCR client

        Args:
            api_key: Google Cloud Vision API key (if None, uses env variable)
        """
        self.api_key = api_key or os.environ.get('GOOGLE_VISION_API_KEY')
        if not self.api_key:
            raise ValueError("Google Vision API key is required. Set GOOGLE_VISION_API_KEY environment variable.")

        self.base_url = "https://vision.googleapis.com/v1/images:annotate"

    def _encode_image(self, image_path: str) -> str:
        """Encode image file to base64"""
        with open(image_path, 'rb') as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    def _make_request(self, image_path: str, feature_type: str, language_hints: List[str] = None) -> Dict:
        """
        Make request to Google Vision API

        Args:
            image_path: Path to image file
            feature_type: 'TEXT_DETECTION' or 'DOCUMENT_TEXT_DETECTION'
            language_hints: Language codes

        Returns:
            API response dictionary
        """
        try:
            # Encode image
            image_content = self._encode_image(image_path)

            # Build request payload
            request_body = {
                "requests": [
                    {
                        "image": {
                            "content": image_content
                        },
                        "features": [
                            {
                                "type": feature_type,
                                "maxResults": 1
                            }
                        ]
                    }
                ]
            }

            # Add language hints if provided
            if language_hints:
                request_body["requests"][0]["imageContext"] = {
                    "languageHints": language_hints
                }

            # Make API request
            response = requests.post(
                f"{self.base_url}?key={self.api_key}",
                json=request_body,
                headers={'Content-Type': 'application/json'}
            )

            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            raise Exception(f"Google Vision API request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Error processing image: {str(e)}")

    def detect_text(self, image_path: str, language_hints: List[str] = None) -> Dict:
        """
        Perform basic text detection (best for general text)

        Returns:
            {
                'full_text': str,
                'annotations': List[Dict],
                'confidence': float,
                'language': str
            }
        """
        response = self._make_request(image_path, 'TEXT_DETECTION', language_hints)

        if 'responses' not in response or not response['responses']:
            return {
                'full_text': '',
                'annotations': [],
                'confidence': 0.0,
                'language': 'unknown'
            }

        result = response['responses'][0]

        if 'error' in result:
            raise Exception(f"Vision API error: {result['error'].get('message', 'Unknown error')}")

        if 'textAnnotations' not in result:
            return {
                'full_text': '',
                'annotations': [],
                'confidence': 0.0,
                'language': 'unknown'
            }

        annotations = result['textAnnotations']
        full_text = annotations[0]['description'] if annotations else ''

        # Detect language from first annotation
        detected_lang = 'unknown'
        if annotations and 'locale' in annotations[0]:
            detected_lang = annotations[0]['locale']

        # Extract bounding box information
        annotation_data = []
        for ann in annotations[1:]:  # Skip first one (full text)
            annotation_data.append({
                'text': ann['description'],
                'bounding_box': ann.get('boundingPoly', {}).get('vertices', []),
                'confidence': ann.get('confidence', 0.0)
            })

        return {
            'full_text': full_text,
            'annotations': annotation_data,
            'confidence': self._calculate_average_confidence(annotation_data),
            'language': detected_lang,
            'raw_response': result
        }

    def detect_document_text(self, image_path: str, language_hints: List[str] = None) -> Dict:
        """
        Document text detection with layout (best for handwriting, structured docs)

        Returns:
            {
                'full_text': str,
                'pages': List[Dict],
                'blocks': List[Dict],
                'paragraphs': List[Dict],
                'words': List[Dict],
                'confidence': float,
                'language': str,
                'breaks': Dict
            }
        """
        response = self._make_request(image_path, 'DOCUMENT_TEXT_DETECTION', language_hints)

        if 'responses' not in response or not response['responses']:
            return {
                'full_text': '',
                'pages': [],
                'blocks': [],
                'paragraphs': [],
                'words': [],
                'confidence': 0.0,
                'language': 'unknown',
                'breaks': {}
            }

        result = response['responses'][0]

        if 'error' in result:
            raise Exception(f"Vision API error: {result['error'].get('message', 'Unknown error')}")

        if 'fullTextAnnotation' not in result:
            return {
                'full_text': '',
                'pages': [],
                'blocks': [],
                'paragraphs': [],
                'words': [],
                'confidence': 0.0,
                'language': 'unknown',
                'breaks': {}
            }

        full_text_annotation = result['fullTextAnnotation']
        full_text = full_text_annotation.get('text', '')

        # Extract pages, blocks, paragraphs, and words
        pages_data = []
        blocks_data = []
        paragraphs_data = []
        words_data = []
        breaks_data = []

        for page in full_text_annotation.get('pages', []):
            detected_lang = 'unknown'
            if page.get('property', {}).get('detectedLanguages'):
                detected_lang = page['property']['detectedLanguages'][0].get('languageCode', 'unknown')

            for block in page.get('blocks', []):
                block_text = self._extract_text_from_block(block)
                blocks_data.append({
                    'text': block_text,
                    'confidence': block.get('confidence', 0.0),
                    'bounding_box': block.get('boundingBox', {}).get('vertices', [])
                })

                for paragraph in block.get('paragraphs', []):
                    para_text = self._extract_text_from_paragraph(paragraph)
                    paragraphs_data.append({
                        'text': para_text,
                        'confidence': paragraph.get('confidence', 0.0),
                        'bounding_box': paragraph.get('boundingBox', {}).get('vertices', [])
                    })

                    for word in paragraph.get('words', []):
                        word_text = ''.join([symbol.get('text', '') for symbol in word.get('symbols', [])])
                        words_data.append({
                            'text': word_text,
                            'confidence': word.get('confidence', 0.0),
                            'bounding_box': word.get('boundingBox', {}).get('vertices', [])
                        })

                        # Extract breaks (line breaks, spaces, etc.)
                        for symbol in word.get('symbols', []):
                            if symbol.get('property', {}).get('detectedBreak'):
                                breaks_data.append({
                                    'type': symbol['property']['detectedBreak'].get('type', 'SPACE'),
                                    'after_text': symbol.get('text', '')
                                })

            pages_data.append({
                'width': page.get('width', 0),
                'height': page.get('height', 0),
                'language': detected_lang,
                'confidence': page.get('confidence', 0.0)
            })

        return {
            'full_text': full_text,
            'pages': pages_data,
            'blocks': blocks_data,
            'paragraphs': paragraphs_data,
            'words': words_data,
            'confidence': self._calculate_average_confidence(words_data),
            'language': pages_data[0]['language'] if pages_data else 'unknown',
            'breaks': {'line_breaks': breaks_data},
            'raw_response': result
        }

    def detect_handwriting(self, image_path: str, language_hints: List[str] = None) -> Dict:
        """
        Handwriting detection (uses document_text_detection which is best for handwriting)
        """
        return self.detect_document_text(image_path, language_hints)

    def detect_math_formulas(self, image_path: str, language_hints: List[str] = None) -> Dict:
        """
        Combined approach for math formulas
        - Use document_text_detection for layout
        - Post-process to identify formula patterns
        """
        result = self.detect_document_text(image_path, language_hints)
        # Additional processing for formulas can be added here
        return result

    def get_confidence_score(self, ocr_result: Dict) -> float:
        """Extract average confidence from Vision API response"""
        return ocr_result.get('confidence', 0.0)

    def _extract_text_from_block(self, block: Dict) -> str:
        """Extract text from a block"""
        texts = []
        for paragraph in block.get('paragraphs', []):
            texts.append(self._extract_text_from_paragraph(paragraph))
        return ' '.join(texts)

    def _extract_text_from_paragraph(self, paragraph: Dict) -> str:
        """Extract text from a paragraph"""
        words = []
        for word in paragraph.get('words', []):
            word_text = ''.join([symbol.get('text', '') for symbol in word.get('symbols', [])])
            words.append(word_text)
        return ' '.join(words)

    def _calculate_average_confidence(self, items: List[Dict]) -> float:
        """Calculate average confidence from a list of items"""
        if not items:
            return 0.0

        confidences = [item.get('confidence', 0.0) for item in items if 'confidence' in item]
        if not confidences:
            return 0.0

        return sum(confidences) / len(confidences)
