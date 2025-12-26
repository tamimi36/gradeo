"""
AI Service Layer - Swappable AI Provider Architecture
Supports: Google Gemini, OpenAI, Anthropic Claude

Default: Google Gemini (using existing Google Cloud credentials)
"""

import os
import json
from typing import Dict, List, Optional, Any
from abc import ABC, abstractmethod
from flask import current_app

# Lazy import to avoid Python 3.14 compatibility issues
genai = None

def _ensure_genai():
    """Lazy load google.generativeai"""
    global genai
    if genai is None:
        try:
            import google.generativeai as _genai
            genai = _genai
        except Exception as e:
            current_app.logger.warning(f"Could not load google.generativeai: {e}")
            raise ImportError(f"Google Generative AI not available: {e}")
    return genai


class AIProvider(ABC):
    """Abstract base class for AI providers"""

    @abstractmethod
    def generate_text(self, prompt: str, temperature: float = 0.7, max_tokens: int = 1000) -> str:
        """Generate text completion"""
        pass

    @abstractmethod
    def analyze_answer(self, question: str, correct_answer: str, student_answer: str) -> Dict[str, Any]:
        """Analyze student answer and provide feedback"""
        pass


class GeminiAIProvider(AIProvider):
    """Google Gemini AI Provider"""

    def __init__(self):
        """Initialize Gemini with API key from environment"""
        api_key = os.getenv('GOOGLE_AI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise ValueError("GOOGLE_AI_API_KEY or GOOGLE_API_KEY is required for Gemini")

        # Lazy load genai
        g = _ensure_genai()
        g.configure(api_key=api_key)
        # Use gemini-1.5-flash for fast responses, gemini-1.5-pro for complex reasoning
        self.model = g.GenerativeModel('gemini-1.5-flash')
        self.pro_model = g.GenerativeModel('gemini-1.5-pro')

    def generate_text(self, prompt: str, temperature: float = 0.7, max_tokens: int = 1000) -> str:
        """Generate text using Gemini"""
        try:
            g = _ensure_genai()
            generation_config = g.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )

            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )

            return response.text
        except Exception as e:
            current_app.logger.error(f"Gemini generation error: {str(e)}")
            return f"AI service temporarily unavailable: {str(e)}"

    def analyze_answer(self, question: str, correct_answer: str, student_answer: str) -> Dict[str, Any]:
        """Analyze student answer using Gemini Pro for complex reasoning"""
        prompt = f"""You are an expert teacher analyzing a student's exam answer.

Question: {question}
Correct Answer: {correct_answer}
Student's Answer: {student_answer}

Analyze the student's answer and provide:
1. Is it correct? (yes/no/partial)
2. Confidence score (0-100)
3. What did they get right?
4. What did they get wrong?
5. Why is their answer incorrect (if wrong)?
6. The correct explanation
7. A helpful hint for improvement
8. Partial credit percentage (0-100) if applicable

Respond in JSON format:
{{
    "is_correct": "yes/no/partial",
    "confidence": 85,
    "strengths": ["point 1", "point 2"],
    "weaknesses": ["point 1", "point 2"],
    "explanation_why_wrong": "explanation here",
    "correct_explanation": "how to solve correctly",
    "hint": "helpful hint for next time",
    "partial_credit_percentage": 50,
    "reasoning_quality": "good/fair/poor",
    "shows_understanding": true/false
}}
"""

        try:
            # Use Pro model for complex analysis
            response = self.pro_model.generate_content(prompt)
            result_text = response.text

            # Extract JSON from response (handle markdown code blocks)
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0].strip()

            result = json.loads(result_text)
            return result
        except Exception as e:
            current_app.logger.error(f"Gemini answer analysis error: {str(e)}")
            return {
                "is_correct": "unknown",
                "confidence": 0,
                "error": str(e)
            }


class OpenAIProvider(AIProvider):
    """OpenAI GPT Provider (for future use)"""

    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY is required")
        # Import openai only if this provider is used
        import openai
        self.client = openai.OpenAI(api_key=api_key)

    def generate_text(self, prompt: str, temperature: float = 0.7, max_tokens: int = 1000) -> str:
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Fast and cost-effective
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            current_app.logger.error(f"OpenAI generation error: {str(e)}")
            return f"AI service temporarily unavailable: {str(e)}"

    def analyze_answer(self, question: str, correct_answer: str, student_answer: str) -> Dict[str, Any]:
        # Similar implementation to Gemini
        pass


class AnthropicProvider(AIProvider):
    """Anthropic Claude Provider (for future use)"""

    def __init__(self):
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY is required")
        # Import anthropic only if this provider is used
        import anthropic
        self.client = anthropic.Anthropic(api_key=api_key)

    def generate_text(self, prompt: str, temperature: float = 0.7, max_tokens: int = 1000) -> str:
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        except Exception as e:
            current_app.logger.error(f"Anthropic generation error: {str(e)}")
            return f"AI service temporarily unavailable: {str(e)}"

    def analyze_answer(self, question: str, correct_answer: str, student_answer: str) -> Dict[str, Any]:
        # Similar implementation to Gemini
        pass


class AIService:
    """
    Main AI Service - Swappable provider architecture

    Configure provider via environment variable: AI_PROVIDER=gemini|openai|anthropic
    Default: gemini (Google Gemini)
    """

    def __init__(self):
        self.provider_name = os.getenv('AI_PROVIDER', 'gemini').lower()
        self.provider = None
        self._provider_error = None

    def _get_provider(self) -> Optional[AIProvider]:
        """Get AI provider based on configuration (lazy initialization)"""
        if self.provider is not None:
            return self.provider

        if self._provider_error is not None:
            raise self._provider_error

        providers = {
            'gemini': GeminiAIProvider,
            'openai': OpenAIProvider,
            'anthropic': AnthropicProvider,
        }

        provider_class = providers.get(self.provider_name)
        if not provider_class:
            error = ValueError(f"Unknown AI provider: {self.provider_name}")
            self._provider_error = error
            raise error

        try:
            self.provider = provider_class()
            return self.provider
        except Exception as e:
            print(f"Warning: Failed to initialize {self.provider_name} provider: {str(e)}")
            print("AI features will not be available until API key is configured.")
            self._provider_error = e
            raise

    # === AI Explanation Generator ===

    def generate_explanation(self, question: str, correct_answer: str, student_answer: str) -> Dict[str, str]:
        """
        Generate AI explanation for why an answer is wrong/right

        Returns:
            {
                "why_wrong": "Explanation of the mistake",
                "correct_method": "How to solve correctly",
                "hint": "Hint for improvement"
            }
        """
        prompt = f"""You are a helpful teacher. A student answered a question incorrectly.

Question: {question}
Correct Answer: {correct_answer}
Student's Answer: {student_answer}

Provide:
1. Why their answer is wrong (be kind and educational)
2. The correct method to solve this
3. A helpful hint for future improvement

Be concise and student-friendly. Format as JSON:
{{
    "why_wrong": "explanation",
    "correct_method": "step by step",
    "hint": "helpful tip"
}}
"""

        response_text = self.provider.generate_text(prompt, temperature=0.5)

        try:
            # Extract JSON
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            return json.loads(response_text)
        except:
            return {
                "why_wrong": response_text,
                "correct_method": "See correct answer",
                "hint": "Review the material and try again"
            }

    # === AI Proofreader ===

    def proofread_answer(self, text: str) -> Dict[str, Any]:
        """
        Fix spelling/grammar mistakes in handwritten OCR text while keeping meaning

        Returns:
            {
                "original": "original text",
                "corrected": "corrected text",
                "changes": ["change 1", "change 2"],
                "confidence": 0.95
            }
        """
        prompt = f"""You are proofreading a student's handwritten answer that was scanned by OCR.
The OCR may have made mistakes. Fix spelling and grammar errors while preserving the student's original meaning.

Original text: {text}

Return JSON:
{{
    "corrected": "corrected text here",
    "changes": ["list of corrections made"],
    "confidence": 0.95,
    "had_errors": true/false
}}
"""

        response_text = self.provider.generate_text(prompt, temperature=0.3)

        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            result = json.loads(response_text)
            result['original'] = text
            return result
        except:
            return {
                "original": text,
                "corrected": text,
                "changes": [],
                "confidence": 0.0,
                "had_errors": False,
                "error": "Failed to parse AI response"
            }

    # === Smart Reasoning Comparison ===

    def compare_reasoning(self, question: str, correct_answer: str, student_answer: str,
                         expected_reasoning: Optional[str] = None) -> Dict[str, Any]:
        """
        Compare student's reasoning with expected logic (not just keywords)

        Returns:
            {
                "reasoning_match": 0.85,  # 0-1 score
                "logic_correct": true/false,
                "partial_credit": 0.7,  # 0-1
                "explanation": "analysis",
                "matched_concepts": ["concept1", "concept2"],
                "missing_concepts": ["concept3"]
            }
        """
        expected = expected_reasoning or correct_answer

        prompt = f"""Analyze if the student's reasoning/logic matches the expected answer, even if wording differs.

Question: {question}
Expected Answer/Reasoning: {expected}
Student's Answer: {student_answer}

Focus on:
- Do they understand the concept?
- Is their logic sound?
- Did they show correct reasoning steps?
- What percentage of the logic is correct?

Return JSON:
{{
    "reasoning_match": 0.85,
    "logic_correct": true,
    "partial_credit": 0.7,
    "explanation": "detailed analysis",
    "matched_concepts": ["concept1", "concept2"],
    "missing_concepts": ["concept3"],
    "shows_work": true,
    "reasoning_quality": "excellent/good/fair/poor"
}}
"""

        response_text = self.provider.generate_text(prompt, temperature=0.4)

        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            return json.loads(response_text)
        except:
            return {
                "reasoning_match": 0.0,
                "logic_correct": False,
                "partial_credit": 0.0,
                "explanation": "Analysis failed",
                "matched_concepts": [],
                "missing_concepts": [],
                "error": "Failed to parse AI response"
            }

    # === Comprehensive Answer Analysis ===

    def analyze_answer_comprehensive(self, question: str, correct_answer: str,
                                    student_answer: str) -> Dict[str, Any]:
        """Full analysis using AI provider's analyze_answer method"""
        return self.provider.analyze_answer(question, correct_answer, student_answer)

    # === Exam Difficulty Analysis ===

    def analyze_exam_difficulty(self, questions: List[Dict], performance_data: List[Dict]) -> Dict[str, Any]:
        """
        Analyze exam difficulty based on question content and student performance

        Args:
            questions: List of {text, type, points}
            performance_data: List of {question_id, correct_count, total_attempts, avg_time}

        Returns:
            {
                "overall_difficulty": "easy/medium/hard/very_hard",
                "difficulty_score": 0.65,  # 0-1
                "estimated_time_minutes": 45,
                "question_difficulties": [{question_id, difficulty, reasoning}],
                "recommendations": ["suggestion1", "suggestion2"]
            }
        """
        questions_summary = "\n".join([
            f"Q{i+1} ({q.get('type', 'open_ended')}): {q.get('text', '')[:100]}..."
            for i, q in enumerate(questions)
        ])

        performance_summary = "\n".join([
            f"Q{p.get('question_id')}: {p.get('correct_count', 0)}/{p.get('total_attempts', 0)} correct "
            f"({p.get('correct_count', 0) / max(p.get('total_attempts', 1), 1) * 100:.0f}%)"
            for p in performance_data
        ]) if performance_data else "No performance data available"

        prompt = f"""Analyze this exam's difficulty based on questions and student performance.

Questions:
{questions_summary}

Student Performance:
{performance_summary}

Analyze:
1. Overall difficulty level
2. Difficulty score (0=very easy, 1=very hard)
3. Estimated completion time
4. Individual question difficulties
5. Recommendations for improvement

Return JSON:
{{
    "overall_difficulty": "medium",
    "difficulty_score": 0.65,
    "estimated_time_minutes": 45,
    "question_difficulties": [
        {{"question_number": 1, "difficulty": "easy", "reasoning": "basic concept"}},
        {{"question_number": 2, "difficulty": "hard", "reasoning": "complex reasoning required"}}
    ],
    "recommendations": ["suggestion1", "suggestion2"],
    "time_pressure": "appropriate/too_short/too_long"
}}
"""

        response_text = self.provider.generate_text(prompt, temperature=0.5, max_tokens=1500)

        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            return json.loads(response_text)
        except:
            return {
                "overall_difficulty": "unknown",
                "difficulty_score": 0.5,
                "estimated_time_minutes": len(questions) * 5,
                "error": "Analysis failed"
            }

    # === Topic/Skill Detection ===

    def detect_topics(self, question_text: str) -> List[str]:
        """
        Auto-detect topics/skills from question text using AI

        Returns: ["algebra", "linear equations", "problem solving"]
        """
        prompt = f"""Analyze this exam question and identify the main topics/skills being tested.

Question: {question_text}

Return only a JSON array of topic strings (2-5 topics):
["topic1", "topic2", "topic3"]

Be specific and educational. Examples: "quadratic equations", "photosynthesis", "World War II"
"""

        response_text = self.provider.generate_text(prompt, temperature=0.3, max_tokens=200)

        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            topics = json.loads(response_text)
            return topics if isinstance(topics, list) else []
        except:
            return ["general knowledge"]

    # === Misconception Analysis ===

    def analyze_misconception(self, question: str, wrong_answers: List[str]) -> Dict[str, Any]:
        """
        Analyze common wrong answers to identify student misconceptions

        Args:
            question: The exam question
            wrong_answers: List of incorrect student answers

        Returns:
            {
                "common_misconception": "description",
                "why_students_think_this": "explanation",
                "how_to_correct": "teaching advice",
                "affected_concept": "concept name"
            }
        """
        answers_list = "\n".join([f"- {ans}" for ans in wrong_answers[:10]])  # Limit to 10

        prompt = f"""Multiple students gave similar wrong answers to this question. Identify the common misconception.

Question: {question}

Common Wrong Answers:
{answers_list}

Analyze:
1. What misconception do these students share?
2. Why do they think this way?
3. How should a teacher correct this?
4. What underlying concept are they missing?

Return JSON:
{{
    "common_misconception": "clear description",
    "why_students_think_this": "psychological/educational reason",
    "how_to_correct": "teaching strategy",
    "affected_concept": "concept name",
    "severity": "minor/moderate/major"
}}
"""

        response_text = self.provider.generate_text(prompt, temperature=0.5)

        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            return json.loads(response_text)
        except:
            return {
                "common_misconception": "Unable to analyze",
                "error": "Analysis failed"
            }


# Global AI service instance
# Note: Will initialize lazily when first used
try:
    ai_service = AIService()
except Exception as e:
    print(f"Warning: AI Service initialization deferred due to: {e}")
    ai_service = AIService()  # Will fail later when actually used, but allows app to start
