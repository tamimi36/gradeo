"""
Analytics API Endpoints
Provides advanced analytics for teachers and students
"""

from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.exam import Exam, Question
from app.models.submission import Submission, SubmissionAnswer
from app.models.grade import Grade
from app.models.analytics import (
    QuestionTopic, QuestionDifficulty, Cohort, CohortMember,
    StudentProgress, Misconception
)
from app.services.ai_service import ai_service
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from collections import defaultdict
import hashlib
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

analytics_ns = Namespace('analytics', description='Advanced Analytics & AI Features')

# ===========================
# Response Models
# ===========================

weakness_model = analytics_ns.model('StudentWeakness', {
    'topic_name': fields.String(description='Topic/skill name'),
    'mastery_level': fields.Float(description='0-100 mastery percentage'),
    'total_attempts': fields.Integer(description='Number of attempts'),
    'correct_count': fields.Integer(description='Number correct'),
    'weakness_severity': fields.String(description='minor, moderate, major'),
    'last_attempt': fields.String(description='ISO datetime of last attempt')
})

heatmap_model = analytics_ns.model('WeaknessHeatmap', {
    'student_id': fields.Integer(description='Student ID'),
    'student_name': fields.String(description='Student name'),
    'weaknesses': fields.List(fields.Nested(weakness_model)),
    'overall_performance': fields.Float(description='Overall performance 0-100')
})

difficulty_model = analytics_ns.model('QuestionDifficulty', {
    'question_id': fields.Integer,
    'question_text': fields.String,
    'difficulty_level': fields.String(description='easy, medium, hard, very_hard'),
    'difficulty_score': fields.Float(description='0-1 difficulty score'),
    'success_rate': fields.Float(description='Percentage of students who got it right'),
    'total_attempts': fields.Integer,
    'avg_time_seconds': fields.Float
})

progress_point_model = analytics_ns.model('ProgressPoint', {
    'date': fields.String(description='Date of exam'),
    'exam_title': fields.String,
    'score_percentage': fields.Float,
    'topics_tested': fields.List(fields.String)
})

progress_timeline_model = analytics_ns.model('ProgressTimeline', {
    'student_id': fields.Integer,
    'timeline': fields.List(fields.Nested(progress_point_model)),
    'overall_trend': fields.String(description='improving, declining, stable'),
    'improvement_rate': fields.Float(description='Percentage change'),
    'strengths': fields.List(fields.String),
    'weaknesses': fields.List(fields.String)
})

misconception_model = analytics_ns.model('Misconception', {
    'id': fields.Integer,
    'question_id': fields.Integer,
    'question_text': fields.String,
    'common_wrong_answer': fields.String,
    'student_count': fields.Integer,
    'misconception_type': fields.String,
    'why_students_think_this': fields.String,
    'how_to_correct': fields.String,
    'severity': fields.String,
    'affected_students': fields.List(fields.Integer)
})


# ===========================
# 📊 ANALYTICS ENDPOINTS
# ===========================

@analytics_ns.route('/weakness-heatmap/exam/<int:exam_id>')
class WeaknessHeatmap(Resource):
    @jwt_required()
    @teacher_required
    @analytics_ns.doc(description='Get weakness heatmap for all students in an exam')
    @analytics_ns.response(200, 'Success', [heatmap_model])
    def get(self, exam_id):
        """
        Student Weakness Heatmap
        Shows visual grid of topics each student struggled with
        """
        current_user_id = get_jwt_identity()

        # Verify exam ownership
        exam = Exam.query.get_or_404(exam_id)
        if exam.creator_id != current_user_id:
            return {'message': 'Not authorized'}, 403

        # Get all submissions for this exam
        submissions = Submission.query.filter_by(exam_id=exam_id).all()

        heatmap_data = []

        for submission in submissions:
            student = User.query.get(submission.student_id)
            if not student:
                continue

            # Get student's performance on each topic
            progress_records = StudentProgress.query.filter_by(
                student_id=submission.student_id
            ).all()

            weaknesses = []
            total_mastery = 0
            topic_count = 0

            for progress in progress_records:
                weakness_data = {
                    'topic_name': progress.topic_name,
                    'mastery_level': round(progress.mastery_level * 100, 1),
                    'total_attempts': progress.total_attempts,
                    'correct_count': progress.correct_count,
                    'weakness_severity': progress.weakness_severity,
                    'last_attempt': progress.last_attempt_date.isoformat() if progress.last_attempt_date else None
                }

                if progress.is_weakness:
                    weaknesses.append(weakness_data)

                total_mastery += progress.mastery_level
                topic_count += 1

            overall_performance = (total_mastery / topic_count * 100) if topic_count > 0 else 0

            heatmap_data.append({
                'student_id': student.id,
                'student_name': f"{student.first_name} {student.last_name}",
                'weaknesses': weaknesses,
                'overall_performance': round(overall_performance, 1)
            })

        # Sort by overall performance (worst first)
        heatmap_data.sort(key=lambda x: x['overall_performance'])

        return {
            'exam_id': exam_id,
            'exam_title': exam.title,
            'student_count': len(heatmap_data),
            'heatmap': heatmap_data
        }, 200


@analytics_ns.route('/question-difficulty/exam/<int:exam_id>')
class QuestionDifficultyTracking(Resource):
    @jwt_required()
    @teacher_required
    @analytics_ns.doc(description='Track which questions students struggle with most')
    @analytics_ns.response(200, 'Success', [difficulty_model])
    def get(self, exam_id):
        """
        Per-Question Difficulty Tracking
        Detects which questions students struggle with the most
        """
        current_user_id = get_jwt_identity()

        # Verify exam ownership
        exam = Exam.query.get_or_404(exam_id)
        if exam.creator_id != current_user_id:
            return {'message': 'Not authorized'}, 403

        questions = Question.query.filter_by(exam_id=exam_id).order_by(Question.order_number).all()

        difficulty_data = []

        for question in questions:
            # Get or create difficulty stats
            difficulty = QuestionDifficulty.query.filter_by(question_id=question.id).first()

            if not difficulty:
                # Create new difficulty record
                difficulty = QuestionDifficulty(question_id=question.id)
                db.session.add(difficulty)

            # Recalculate from submission answers
            answers = SubmissionAnswer.query.filter_by(question_id=question.id).all()

            difficulty.total_attempts = len(answers)
            difficulty.correct_count = sum(1 for a in answers if a.auto_grade_score and a.auto_grade_score >= question.points)
            difficulty.incorrect_count = sum(1 for a in answers if a.auto_grade_score and a.auto_grade_score < question.points * 0.5)
            difficulty.partial_count = difficulty.total_attempts - difficulty.correct_count - difficulty.incorrect_count

            difficulty.recalculate()

            db.session.commit()

            difficulty_data.append({
                'question_id': question.id,
                'question_text': question.question_text,
                'question_number': question.order_number,
                'difficulty_level': difficulty.difficulty_level,
                'difficulty_score': round(difficulty.difficulty_score, 2),
                'success_rate': round(difficulty.success_rate * 100, 1),
                'total_attempts': difficulty.total_attempts,
                'correct_count': difficulty.correct_count,
                'partial_count': difficulty.partial_count,
                'incorrect_count': difficulty.incorrect_count,
                'avg_time_seconds': difficulty.avg_time_seconds
            })

        # Sort by difficulty (hardest first)
        difficulty_data.sort(key=lambda x: x['difficulty_score'], reverse=True)

        return {
            'exam_id': exam_id,
            'exam_title': exam.title,
            'total_questions': len(questions),
            'difficulties': difficulty_data,
            'hardest_questions': [q for q in difficulty_data if q['difficulty_level'] in ['hard', 'very_hard']],
            'easiest_questions': [q for q in difficulty_data if q['difficulty_level'] == 'easy']
        }, 200


@analytics_ns.route('/cohort-comparison')
class CohortComparison(Resource):
    @jwt_required()
    @teacher_required
    @analytics_ns.doc(description='Compare performance across cohorts')
    def get(self):
        """
        Cohort Comparison
        Compare performance across classes, sections, or years
        """
        current_user_id = get_jwt_identity()

        # Get query parameters
        cohort_ids = request.args.get('cohort_ids', '').split(',')  # Comma-separated cohort IDs
        exam_id = request.args.get('exam_id', type=int)

        if not cohort_ids or not cohort_ids[0]:
            return {'message': 'cohort_ids parameter required (comma-separated)'}, 400

        cohort_ids = [int(c) for c in cohort_ids if c]

        cohorts_data = []

        for cohort_id in cohort_ids:
            cohort = Cohort.query.get(cohort_id)
            if not cohort or cohort.created_by != current_user_id:
                continue

            # Get cohort members
            members = CohortMember.query.filter_by(cohort_id=cohort_id).all()
            student_ids = [m.student_id for m in members]

            # Get grades for these students
            grades_query = Grade.query.join(Submission).filter(
                Submission.student_id.in_(student_ids)
            )

            if exam_id:
                grades_query = grades_query.join(Exam).filter(Exam.id == exam_id)

            grades = grades_query.all()

            if not grades:
                continue

            # Calculate statistics
            scores = [g.percentage for g in grades if g.percentage is not None]
            avg_score = sum(scores) / len(scores) if scores else 0
            median_score = sorted(scores)[len(scores) // 2] if scores else 0
            min_score = min(scores) if scores else 0
            max_score = max(scores) if scores else 0

            cohorts_data.append({
                'cohort_id': cohort.id,
                'cohort_name': cohort.name,
                'cohort_type': cohort.cohort_type,
                'member_count': len(student_ids),
                'exams_taken': len(grades),
                'average_score': round(avg_score, 1),
                'median_score': round(median_score, 1),
                'min_score': round(min_score, 1),
                'max_score': round(max_score, 1),
                'performance_distribution': {
                    'excellent': len([s for s in scores if s >= 90]),
                    'good': len([s for s in scores if 75 <= s < 90]),
                    'satisfactory': len([s for s in scores if 60 <= s < 75]),
                    'needs_improvement': len([s for s in scores if s < 60])
                }
            })

        # Sort by average score
        cohorts_data.sort(key=lambda x: x['average_score'], reverse=True)

        return {
            'cohort_count': len(cohorts_data),
            'comparisons': cohorts_data,
            'best_performing': cohorts_data[0] if cohorts_data else None,
            'needs_attention': cohorts_data[-1] if cohorts_data else None
        }, 200


@analytics_ns.route('/student-progress/<int:student_id>')
class StudentProgressTimeline(Resource):
    @jwt_required()
    @analytics_ns.doc(description='Get individual student progress timeline')
    @analytics_ns.response(200, 'Success', progress_timeline_model)
    def get(self, student_id):
        """
        Individual Progress Timeline
        Shows student's skill growth, topic mastery, and improvement over time
        """
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Check permissions (teacher or the student themselves)
        if current_user.get_role() not in ['teacher', 'admin'] and current_user_id != student_id:
            return {'message': 'Not authorized'}, 403

        student = User.query.get_or_404(student_id)

        # Get all submissions for this student
        submissions = Submission.query.filter_by(
            student_id=student_id,
            submission_status='processed'
        ).order_by(Submission.submitted_at).all()

        timeline = []
        all_scores = []

        for submission in submissions:
            grade = Grade.query.filter_by(submission_id=submission.id).first()
            if not grade:
                continue

            # Get topics tested in this exam
            exam_topics = db.session.query(QuestionTopic.topic_name).distinct()\
                .join(Question).filter(Question.exam_id == submission.exam_id).all()
            topics = [t[0] for t in exam_topics]

            timeline.append({
                'date': submission.submitted_at.isoformat(),
                'exam_id': submission.exam_id,
                'exam_title': submission.exam.title if submission.exam else 'Unknown',
                'score_percentage': round(grade.percentage, 1) if grade.percentage else 0,
                'topics_tested': topics
            })

            if grade.percentage is not None:
                all_scores.append(grade.percentage)

        # Calculate trend
        if len(all_scores) >= 3:
            # Compare last 3 scores to previous scores
            recent_avg = sum(all_scores[-3:]) / 3
            older_avg = sum(all_scores[:-3]) / len(all_scores[:-3]) if len(all_scores) > 3 else recent_avg
            improvement_rate = ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0

            if improvement_rate > 5:
                trend = 'improving'
            elif improvement_rate < -5:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            improvement_rate = 0
            trend = 'insufficient_data'

        # Get strengths and weaknesses
        progress_records = StudentProgress.query.filter_by(student_id=student_id).all()

        strengths = [p.topic_name for p in progress_records if p.mastery_level >= 0.8]
        weaknesses = [p.topic_name for p in progress_records if p.is_weakness]

        return {
            'student_id': student_id,
            'student_name': f"{student.first_name} {student.last_name}",
            'timeline': timeline,
            'overall_trend': trend,
            'improvement_rate': round(improvement_rate, 1),
            'current_average': round(sum(all_scores[-5:]) / min(5, len(all_scores)), 1) if all_scores else 0,
            'all_time_average': round(sum(all_scores) / len(all_scores), 1) if all_scores else 0,
            'total_exams': len(timeline),
            'strengths': strengths[:5],  # Top 5
            'weaknesses': weaknesses[:5],  # Top 5
            'improvement_suggestions': self._generate_suggestions(weaknesses, trend)
        }, 200

    def _generate_suggestions(self, weaknesses, trend):
        """Generate improvement suggestions"""
        suggestions = []

        if trend == 'declining':
            suggestions.append("Performance is declining - consider reviewing recent material")

        if weaknesses:
            suggestions.append(f"Focus on improving: {', '.join(weaknesses[:3])}")
        else:
            suggestions.append("Great job! Keep up the consistent performance")

        if trend == 'improving':
            suggestions.append("Excellent progress! Continue with current study methods")

        return suggestions


@analytics_ns.route('/misconceptions/exam/<int:exam_id>')
class MisconceptionDetector(Resource):
    @jwt_required()
    @teacher_required
    @analytics_ns.doc(description='Detect common misconceptions across students')
    @analytics_ns.response(200, 'Success', [misconception_model])
    def get(self, exam_id):
        """
        Misconception Detector
        Identifies common wrong answers and groups students with same misunderstanding
        """
        current_user_id = get_jwt_identity()

        # Verify exam ownership
        exam = Exam.query.get_or_404(exam_id)
        if exam.creator_id != current_user_id:
            return {'message': 'Not authorized'}, 403

        # Get all questions
        questions = Question.query.filter_by(exam_id=exam_id).all()

        misconceptions_data = []

        for question in questions:
            # Get all wrong answers for this question
            answers = SubmissionAnswer.query.filter(
                SubmissionAnswer.question_id == question.id,
                SubmissionAnswer.auto_grade_score < question.points * 0.5  # Less than 50% = wrong
            ).all()

            if len(answers) < 2:  # Need at least 2 wrong answers
                continue

            # Group similar wrong answers
            answer_groups = defaultdict(list)

            for answer in answers:
                if not answer.answer_text:
                    continue

                # Normalize answer for grouping
                normalized = answer.answer_text.strip().lower()[:100]  # First 100 chars
                answer_groups[normalized].append(answer)

            # Find misconceptions (groups with 2+ students)
            for normalized_answer, answer_list in answer_groups.items():
                if len(answer_list) < 2:
                    continue

                student_ids = [a.submission.student_id for a in answer_list]

                # Check if already detected
                existing = Misconception.query.filter_by(
                    question_id=question.id,
                    common_wrong_answer=normalized_answer
                ).first()

                if existing:
                    # Update existing
                    existing.student_count = len(student_ids)
                    existing.affected_student_ids = student_ids
                    misconception = existing
                else:
                    # Create new misconception
                    misconception = Misconception(
                        question_id=question.id,
                        exam_id=exam_id,
                        common_wrong_answer=normalized_answer,
                        student_count=len(student_ids),
                        affected_student_ids=student_ids
                    )
                    db.session.add(misconception)

                    # Analyze with AI (if not already analyzed)
                    if not misconception.why_students_think_this:
                        try:
                            # Get correct answer
                            from app.models.exam import AnswerKey
                            answer_key = AnswerKey.query.filter_by(question_id=question.id).first()
                            correct_answer = answer_key.correct_answer if answer_key else "Unknown"

                            # Get multiple wrong answers for context
                            wrong_answer_samples = [a.answer_text for a in answer_list[:5]]

                            # AI analysis
                            analysis = ai_service.analyze_misconception(
                                question.question_text,
                                wrong_answer_samples
                            )

                            misconception.misconception_type = analysis.get('common_misconception', 'Unknown')
                            misconception.why_students_think_this = analysis.get('why_students_think_this')
                            misconception.how_to_correct = analysis.get('how_to_correct')
                            misconception.severity = analysis.get('severity', 'moderate')

                        except Exception as e:
                            current_app.logger.error(f"AI misconception analysis failed: {str(e)}")

                db.session.commit()

                misconceptions_data.append({
                    'id': misconception.id,
                    'question_id': question.id,
                    'question_text': question.question_text,
                    'question_number': question.order_number,
                    'common_wrong_answer': misconception.common_wrong_answer,
                    'student_count': misconception.student_count,
                    'affected_students': misconception.affected_student_ids,
                    'misconception_type': misconception.misconception_type,
                    'why_students_think_this': misconception.why_students_think_this,
                    'how_to_correct': misconception.how_to_correct,
                    'severity': misconception.severity,
                    'is_resolved': misconception.is_resolved
                })

        # Sort by student count (most common first)
        misconceptions_data.sort(key=lambda x: x['student_count'], reverse=True)

        return {
            'exam_id': exam_id,
            'exam_title': exam.title,
            'total_misconceptions': len(misconceptions_data),
            'misconceptions': misconceptions_data,
            'critical_misconceptions': [m for m in misconceptions_data if m['severity'] == 'major']
        }, 200


# Mark misconception as resolved
@analytics_ns.route('/misconceptions/<int:misconception_id>/resolve')
class ResolveMisconception(Resource):
    @jwt_required()
    @teacher_required
    @analytics_ns.doc(description='Mark a misconception as resolved')
    def post(self, misconception_id):
        """Mark misconception as addressed/resolved"""
        current_user_id = get_jwt_identity()

        misconception = Misconception.query.get_or_404(misconception_id)

        data = request.get_json()
        resolution_notes = data.get('resolution_notes', '')

        misconception.is_resolved = True
        misconception.resolved_by = current_user_id
        misconception.resolved_at = datetime.utcnow()
        misconception.resolution_notes = resolution_notes

        db.session.commit()

        return {
            'message': 'Misconception marked as resolved',
            'misconception': misconception.to_dict()
        }, 200


# ===========================
# Update student progress after grading
# ===========================

def update_student_progress(submission_id):
    """
    Update student progress records after a submission is graded
    Called automatically by grading system
    """
    submission = Submission.query.get(submission_id)
    if not submission:
        return

    # Get all answers for this submission
    answers = SubmissionAnswer.query.filter_by(submission_id=submission_id).all()

    for answer in answers:
        # Get question topics
        topics = QuestionTopic.query.filter_by(question_id=answer.question_id).all()

        if not topics:
            # Auto-detect topics with AI
            question = Question.query.get(answer.question_id)
            if question:
                try:
                    detected_topics = ai_service.detect_topics(question.question_text)
                    for topic_name in detected_topics:
                        topic = QuestionTopic(
                            question_id=question.id,
                            topic_name=topic_name,
                            detection_method='ai_detected',
                            confidence=0.8
                        )
                        db.session.add(topic)
                        topics.append(topic)
                    db.session.commit()
                except Exception as e:
                    print(f"Topic detection failed: {e}")

        # Update progress for each topic
        for topic in topics:
            progress = StudentProgress.query.filter_by(
                student_id=submission.student_id,
                topic_name=topic.topic_name
            ).first()

            if not progress:
                progress = StudentProgress(
                    student_id=submission.student_id,
                    topic_name=topic.topic_name
                )
                db.session.add(progress)

            progress.total_attempts += 1

            # Check if answer was correct
            question = Question.query.get(answer.question_id)
            if answer.auto_grade_score and question:
                if answer.auto_grade_score >= question.points * 0.8:  # 80%+ = correct
                    progress.correct_count += 1

            # Update dates
            if not progress.first_attempt_date:
                progress.first_attempt_date = datetime.utcnow()
            progress.last_attempt_date = datetime.utcnow()

            # Recalculate mastery
            progress.recalculate()

    db.session.commit()
