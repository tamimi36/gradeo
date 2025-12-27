"""
AI-Powered Features API
Intelligent features using Google Gemini AI
"""

from flask import request, jsonify, current_app
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.exam import Exam, Question, AnswerKey
from app.models.submission import Submission, SubmissionAnswer
from app.models.grade import Grade
from app.models.analytics import QuestionDifficulty, AIAnalysisCache
from app.services.ai_service import ai_service
from sqlalchemy import func
import hashlib
import json
from functools import wraps

# Permission decorators
def teacher_required(func):
    """Decorator to require teacher or admin role"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or (not user.has_role('teacher') and not user.has_role('admin')):
            return {'message': 'Requires teacher or admin role', 'status': 'error'}, 403
        return func(*args, **kwargs)
    return wrapper

def admin_required(func):
    """Decorator to require admin role"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or not user.has_role('admin'):
            return {'message': 'Requires admin role', 'status': 'error'}, 403
        return func(*args, **kwargs)
    return wrapper

ai_ns = Namespace('ai', description='AI-Intelligent Features')

# ===========================
# Response Models
# ===========================

explanation_model = ai_ns.model('AIExplanation', {
    'why_wrong': fields.String(description='Explanation of why answer is incorrect'),
    'correct_method': fields.String(description='How to solve correctly'),
    'hint': fields.String(description='Helpful hint for improvement'),
    'cached': fields.Boolean(description='Whether result was from cache')
})

proofread_model = ai_ns.model('ProofreadResult', {
    'original': fields.String(description='Original OCR text'),
    'corrected': fields.String(description='Corrected text'),
    'changes': fields.List(fields.String, description='List of corrections made'),
    'confidence': fields.Float(description='Confidence in corrections 0-1'),
    'had_errors': fields.Boolean(description='Whether errors were found')
})

reasoning_model = ai_ns.model('ReasoningComparison', {
    'reasoning_match': fields.Float(description='How well reasoning matches 0-1'),
    'logic_correct': fields.Boolean(description='Is logic sound'),
    'partial_credit': fields.Float(description='Suggested partial credit 0-1'),
    'explanation': fields.String(description='Detailed analysis'),
    'matched_concepts': fields.List(fields.String),
    'missing_concepts': fields.List(fields.String),
    'shows_work': fields.Boolean(description='Did student show work'),
    'reasoning_quality': fields.String(description='excellent, good, fair, poor')
})

difficulty_estimate_model = ai_ns.model('DifficultyEstimate', {
    'overall_difficulty': fields.String(description='easy, medium, hard, very_hard'),
    'difficulty_score': fields.Float(description='0-1 difficulty score'),
    'estimated_time_minutes': fields.Integer(description='Estimated completion time'),
    'question_difficulties': fields.List(fields.Raw),
    'recommendations': fields.List(fields.String),
    'time_pressure': fields.String(description='appropriate, too_short, too_long')
})


# ===========================
# AI EXPLANATION GENERATOR
# ===========================

@ai_ns.route('/explain-answer/<int:answer_id>')
class ExplainAnswer(Resource):
    @jwt_required()
    @ai_ns.doc(description='Generate AI explanation for why an answer is wrong/right')
    @ai_ns.response(200, 'Success', explanation_model)
    def post(self, answer_id):
        """
        AI Explanation Generator

        When correcting an answer, AI explains:
        - Why the answer is wrong
        - The correct method
        - A helpful hint for improvement
        """
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        answer = SubmissionAnswer.query.get_or_404(answer_id)
        submission = Submission.query.get(answer.submission_id)

        # Check permissions
        is_teacher = current_user.get_role() in ['teacher', 'admin']
        is_own_answer = submission.student_id == current_user_id

        if not (is_teacher or is_own_answer):
            return {'message': 'Not authorized'}, 403

        # Get question and correct answer
        question = Question.query.get(answer.question_id)
        answer_key = AnswerKey.query.filter_by(question_id=question.id).first()

        if not answer_key:
            return {'message': 'No answer key available for this question'}, 400

        # Create cache key
        cache_key = hashlib.sha256(
            f"explain:{question.question_text}:{answer_key.correct_answer}:{answer.answer_text}".encode()
        ).hexdigest()

        # Check cache
        cached = AIAnalysisCache.query.filter_by(
            analysis_type='explanation',
            content_hash=cache_key
        ).first()

        if cached:
            # Update cache hit count
            cached.hit_count += 1
            cached.last_accessed = db.func.now()
            db.session.commit()

            result = cached.output_data
            result['cached'] = True
            return result, 200

        # Generate explanation with AI
        try:
            explanation = ai_service.generate_explanation(
                question.question_text,
                answer_key.correct_answer,
                answer.answer_text
            )

            # Cache the result
            cache_record = AIAnalysisCache(
                analysis_type='explanation',
                content_hash=cache_key,
                input_data={
                    'question': question.question_text,
                    'correct_answer': answer_key.correct_answer,
                    'student_answer': answer.answer_text
                },
                output_data=explanation,
                ai_provider='gemini'
            )
            db.session.add(cache_record)
            db.session.commit()

            explanation['cached'] = False
            return explanation, 200

        except Exception as e:
            current_app.logger.error(f"AI explanation generation failed: {str(e)}")
            return {
                'message': 'AI service temporarily unavailable',
                'error': str(e)
            }, 500


# ===========================
# AI PROOFREADER
# ===========================

@ai_ns.route('/proofread/<int:answer_id>')
class ProofreadAnswer(Resource):
    @jwt_required()
    @teacher_required
    @ai_ns.doc(description='Fix spelling/grammar in handwritten OCR text')
    @ai_ns.response(200, 'Success', proofread_model)
    def post(self, answer_id):
        """
        AI Proofreader for Handwritten Answers

        Fixes spelling and grammar mistakes from OCR while keeping original meaning
        """
        answer = SubmissionAnswer.query.get_or_404(answer_id)

        if not answer.answer_text:
            return {'message': 'No text to proofread'}, 400

        # Cache key
        cache_key = hashlib.sha256(f"proofread:{answer.answer_text}".encode()).hexdigest()

        # Check cache
        cached = AIAnalysisCache.query.filter_by(
            analysis_type='proofread',
            content_hash=cache_key
        ).first()

        if cached:
            cached.hit_count += 1
            cached.last_accessed = db.func.now()
            db.session.commit()

            result = cached.output_data
            result['cached'] = True
            return result, 200

        # Proofread with AI
        try:
            proofread_result = ai_service.proofread_answer(answer.answer_text)

            # Optionally update the answer text
            update_answer = request.args.get('update', 'false').lower() == 'true'
            if update_answer and proofread_result.get('had_errors'):
                answer.answer_text = proofread_result['corrected']
                db.session.commit()

            # Cache result
            cache_record = AIAnalysisCache(
                analysis_type='proofread',
                content_hash=cache_key,
                input_data={'text': answer.answer_text},
                output_data=proofread_result,
                ai_provider='gemini'
            )
            db.session.add(cache_record)
            db.session.commit()

            proofread_result['cached'] = False
            proofread_result['updated'] = update_answer and proofread_result.get('had_errors', False)

            return proofread_result, 200

        except Exception as e:
            current_app.logger.error(f"AI proofreading failed: {str(e)}")
            return {
                'message': 'AI service temporarily unavailable',
                'error': str(e)
            }, 500


# ===========================
# SMART REASONING COMPARISON
# ===========================

@ai_ns.route('/compare-reasoning/<int:answer_id>')
class CompareReasoning(Resource):
    @jwt_required()
    @teacher_required
    @ai_ns.doc(description='Compare student reasoning with expected logic (not just keywords)')
    @ai_ns.response(200, 'Success', reasoning_model)
    def post(self, answer_id):
        """
        Smart Reasoning Comparison

        Checks if student's logic matches expected reasoning,
        not just keyword matching. Provides partial credit suggestions.
        """
        answer = SubmissionAnswer.query.get_or_404(answer_id)

        # Get question and answer key
        question = Question.query.get(answer.question_id)
        answer_key = AnswerKey.query.filter_by(question_id=question.id).first()

        if not answer_key:
            return {'message': 'No answer key available'}, 400

        # Get expected reasoning (if provided in request body)
        data = request.get_json() or {}
        expected_reasoning = data.get('expected_reasoning', answer_key.correct_answer)

        # Cache key
        cache_key = hashlib.sha256(
            f"reasoning:{question.question_text}:{expected_reasoning}:{answer.answer_text}".encode()
        ).hexdigest()

        # Check cache
        cached = AIAnalysisCache.query.filter_by(
            analysis_type='reasoning',
            content_hash=cache_key
        ).first()

        if cached:
            cached.hit_count += 1
            cached.last_accessed = db.func.now()
            db.session.commit()

            result = cached.output_data
            result['cached'] = True
            return result, 200

        # Compare reasoning with AI
        try:
            reasoning_analysis = ai_service.compare_reasoning(
                question.question_text,
                answer_key.correct_answer,
                answer.answer_text,
                expected_reasoning
            )

            # Optionally apply partial credit
            apply_credit = data.get('apply_partial_credit', False)
            if apply_credit and reasoning_analysis.get('partial_credit'):
                partial_credit = reasoning_analysis['partial_credit']
                answer.auto_grade_score = question.points * partial_credit
                db.session.commit()
                reasoning_analysis['partial_credit_applied'] = True
            else:
                reasoning_analysis['partial_credit_applied'] = False

            # Cache result
            cache_record = AIAnalysisCache(
                analysis_type='reasoning',
                content_hash=cache_key,
                input_data={
                    'question': question.question_text,
                    'expected': expected_reasoning,
                    'student_answer': answer.answer_text
                },
                output_data=reasoning_analysis,
                ai_provider='gemini'
            )
            db.session.add(cache_record)
            db.session.commit()

            reasoning_analysis['cached'] = False

            return reasoning_analysis, 200

        except Exception as e:
            current_app.logger.error(f"AI reasoning comparison failed: {str(e)}")
            return {
                'message': 'AI service temporarily unavailable',
                'error': str(e)
            }, 500


# ===========================
# EXAM DIFFICULTY ESTIMATOR
# ===========================

@ai_ns.route('/estimate-difficulty/exam/<int:exam_id>')
class EstimateExamDifficulty(Resource):
    @jwt_required()
    @teacher_required
    @ai_ns.doc(description='Analyze exam difficulty using AI and performance data')
    @ai_ns.response(200, 'Success', difficulty_estimate_model)
    def get(self, exam_id):
        """
        Exam Difficulty Estimator

        Automatically analyzes:
        - How hard questions are
        - How long they take to finish
        - How many students answered correctly

        Combines AI analysis with actual student performance
        """
        current_user_id = get_jwt_identity()

        # Verify exam ownership
        exam = Exam.query.get_or_404(exam_id)
        if exam.creator_id != current_user_id:
            return {'message': 'Not authorized'}, 403

        # Get all questions
        questions = Question.query.filter_by(exam_id=exam_id).order_by(Question.order_number).all()

        if not questions:
            return {'message': 'No questions in exam'}, 400

        # Prepare question data
        questions_data = []
        for q in questions:
            questions_data.append({
                'text': q.question_text,
                'type': q.question_type,
                'points': q.points
            })

        # Get performance data
        performance_data = []
        for q in questions:
            difficulty = QuestionDifficulty.query.filter_by(question_id=q.id).first()

            if difficulty:
                performance_data.append({
                    'question_id': q.id,
                    'correct_count': difficulty.correct_count,
                    'total_attempts': difficulty.total_attempts,
                    'avg_time': difficulty.avg_time_seconds
                })

        # Cache key
        cache_key = hashlib.sha256(
            f"difficulty:{exam_id}:{len(questions)}:{len(performance_data)}".encode()
        ).hexdigest()

        # Check cache (short TTL for this one, as data changes)
        cached = AIAnalysisCache.query.filter_by(
            analysis_type='difficulty_estimate',
            content_hash=cache_key
        ).first()

        # Only use cache if recent (within 1 hour)
        from datetime import datetime, timedelta
        if cached and (datetime.utcnow() - cached.created_at) < timedelta(hours=1):
            cached.hit_count += 1
            cached.last_accessed = db.func.now()
            db.session.commit()

            result = cached.output_data
            result['cached'] = True
            return result, 200

        # Analyze with AI
        try:
            difficulty_analysis = ai_service.analyze_exam_difficulty(
                questions_data,
                performance_data
            )

            # Add actual performance summary
            if performance_data:
                total_attempts = sum(p['total_attempts'] for p in performance_data)
                total_correct = sum(p['correct_count'] for p in performance_data)
                actual_success_rate = (total_correct / total_attempts * 100) if total_attempts > 0 else 0

                difficulty_analysis['actual_performance'] = {
                    'total_attempts': total_attempts,
                    'overall_success_rate': round(actual_success_rate, 1),
                    'has_data': True
                }
            else:
                difficulty_analysis['actual_performance'] = {
                    'has_data': False,
                    'note': 'No student attempts yet - estimates are AI-based only'
                }

            # Cache result
            cache_record = AIAnalysisCache(
                analysis_type='difficulty_estimate',
                content_hash=cache_key,
                input_data={
                    'exam_id': exam_id,
                    'question_count': len(questions),
                    'has_performance_data': len(performance_data) > 0
                },
                output_data=difficulty_analysis,
                ai_provider='gemini'
            )
            db.session.add(cache_record)
            db.session.commit()

            difficulty_analysis['cached'] = False
            difficulty_analysis['exam_id'] = exam_id
            difficulty_analysis['exam_title'] = exam.title

            return difficulty_analysis, 200

        except Exception as e:
            current_app.logger.error(f"AI difficulty estimation failed: {str(e)}")
            return {
                'message': 'AI service temporarily unavailable',
                'error': str(e)
            }, 500


# ===========================
# BATCH AI ANALYSIS
# ===========================

@ai_ns.route('/batch-analyze/exam/<int:exam_id>')
class BatchAnalyze(Resource):
    @jwt_required()
    @teacher_required
    @ai_ns.doc(description='Batch analyze all answers in an exam with AI')
    def post(self, exam_id):
        """
        Batch AI Analysis

        Analyzes all student answers in an exam with AI to:
        - Generate explanations for wrong answers
        - Detect reasoning quality
        - Suggest partial credit
        - Identify misconceptions

        This can take a while for large exams!
        """
        current_user_id = get_jwt_identity()

        # Verify exam ownership
        exam = Exam.query.get_or_404(exam_id)
        if exam.creator_id != current_user_id:
            return {'message': 'Not authorized'}, 403

        # Get options from request
        data = request.get_json() or {}
        analyze_correct = data.get('analyze_correct_answers', False)  # Usually we only analyze wrong answers
        apply_partial_credit = data.get('apply_partial_credit', False)

        # Get all submissions
        submissions = Submission.query.filter_by(exam_id=exam_id).all()

        analyzed_count = 0
        skipped_count = 0
        results = []

        for submission in submissions:
            answers = SubmissionAnswer.query.filter_by(submission_id=submission.id).all()

            for answer in answers:
                question = Question.query.get(answer.question_id)
                answer_key = AnswerKey.query.filter_by(question_id=question.id).first()

                if not answer_key or not answer.answer_text:
                    skipped_count += 1
                    continue

                # Skip correct answers unless requested
                if not analyze_correct and answer.auto_grade_score and answer.auto_grade_score >= question.points * 0.8:
                    skipped_count += 1
                    continue

                try:
                    # Comprehensive AI analysis
                    analysis = ai_service.analyze_answer_comprehensive(
                        question.question_text,
                        answer_key.correct_answer,
                        answer.answer_text
                    )

                    # Apply partial credit if requested
                    if apply_partial_credit and analysis.get('partial_credit_percentage'):
                        new_score = question.points * (analysis['partial_credit_percentage'] / 100)
                        answer.auto_grade_score = new_score

                    analyzed_count += 1

                    results.append({
                        'submission_id': submission.id,
                        'answer_id': answer.id,
                        'question_id': question.id,
                        'analysis': analysis,
                        'partial_credit_applied': apply_partial_credit
                    })

                except Exception as e:
                    current_app.logger.error(f"Batch analysis failed for answer {answer.id}: {str(e)}")
                    skipped_count += 1

        db.session.commit()

        return {
            'exam_id': exam_id,
            'exam_title': exam.title,
            'total_submissions': len(submissions),
            'analyzed_answers': analyzed_count,
            'skipped_answers': skipped_count,
            'partial_credit_applied': apply_partial_credit,
            'results': results[:20],  # Return first 20 for performance
            'note': 'Full results are saved to database'
        }, 200


# ===========================
# AI CACHE MANAGEMENT
# ===========================

@ai_ns.route('/cache/stats')
class CacheStats(Resource):
    @jwt_required()
    @teacher_required
    @ai_ns.doc(description='Get AI cache statistics')
    def get(self):
        """Get AI analysis cache statistics"""
        total_cached = AIAnalysisCache.query.count()
        total_hits = db.session.query(func.sum(AIAnalysisCache.hit_count)).scalar() or 0

        by_type = db.session.query(
            AIAnalysisCache.analysis_type,
            func.count(AIAnalysisCache.id),
            func.sum(AIAnalysisCache.hit_count)
        ).group_by(AIAnalysisCache.analysis_type).all()

        type_stats = []
        for analysis_type, count, hits in by_type:
            type_stats.append({
                'type': analysis_type,
                'cached_items': count,
                'total_hits': hits or 0
            })

        return {
            'status': 'success',
            'message': 'AI cache statistics retrieved successfully',
            'total_cached_items': total_cached,
            'total_cache_hits': total_hits,
            'by_type': type_stats,
            'cache_hit_rate': f"{(total_hits / max(total_cached, 1) * 100):.1f}%"
        }, 200


@ai_ns.route('/cache/clear')
class ClearCache(Resource):
    @jwt_required()
    @admin_required
    @ai_ns.doc(description='Clear AI analysis cache (admin only)')
    def delete(self):
        """Clear all AI analysis cache"""
        deleted_count = AIAnalysisCache.query.delete()
        db.session.commit()

        return {
            'message': 'AI cache cleared',
            'deleted_items': deleted_count
        }, 200
