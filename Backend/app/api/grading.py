"""
Grading Management Routes
Handles viewing grades, review queue, and grade adjustments
"""
from flask import Blueprint, request
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.user import User
from app.models.exam import Exam
from app.models.submission import Submission
from app.models.grade import Grade, ReviewQueue, GradeAdjustment
from app.api import api

grading_bp = Blueprint('grading', __name__)
grading_ns = Namespace('grading', description='Grading and review operations')

# ============================================================================
# REQUEST/RESPONSE MODELS FOR SWAGGER
# ============================================================================

grade_adjustment_response = api.model('GradeAdjustmentResponse', {
    'id': fields.Integer(description='Adjustment ID', example=1),
    'grade_id': fields.Integer(description='Grade ID', example=1),
    'question_id': fields.Integer(description='Question ID', example=1),
    'original_score': fields.Float(description='Original auto-graded score', example=3.0),
    'adjusted_score': fields.Float(description='Adjusted score', example=5.0),
    'adjustment_reason': fields.String(description='Reason for adjustment', example='Partial credit for showing work'),
    'adjusted_by': fields.Integer(description='Teacher user ID who made adjustment', example=3),
    'adjusted_at': fields.String(description='Adjustment date (ISO format)', example='2025-12-05T10:30:00.123456'),
    'created_at': fields.String(description='Creation date (ISO format)', example='2025-12-05T10:30:00.123456')
})

grade_response_model = api.model('GradeResponse', {
    'id': fields.Integer(description='Grade ID', example=1),
    'submission_id': fields.Integer(description='Submission ID', example=1),
    'total_score': fields.Float(description='Total score (includes adjustments)', example=85.0),
    'max_score': fields.Float(description='Maximum possible score', example=100.0),
    'percentage': fields.Float(description='Percentage score', example=85.0),
    'is_finalized': fields.Boolean(description='Is grade finalized by teacher', example=False),
    'auto_graded_at': fields.String(description='Auto-grading date (ISO format)', example='2025-12-05T10:35:00.123456'),
    'finalized_at': fields.String(description='Finalization date (ISO format)', example='2025-12-05T11:00:00.123456'),
    'finalized_by': fields.Integer(description='Teacher user ID who finalized', example=3),
    'notes': fields.String(description='Teacher notes/comments', example='Good work overall'),
    'created_at': fields.String(description='Creation date (ISO format)', example='2025-12-05T10:35:00.123456'),
    'updated_at': fields.String(description='Last update date (ISO format)', example='2025-12-05T11:00:00.123456'),
    'adjustments': fields.List(fields.Nested(grade_adjustment_response), description='List of grade adjustments')
})

grade_list_response = api.model('GradeListResponse', {
    'grades': fields.List(fields.Nested(grade_response_model), description='List of grades'),
    'total': fields.Integer(description='Total number of grades', example=25),
    'page': fields.Integer(description='Current page number', example=1),
    'per_page': fields.Integer(description='Items per page', example=10),
    'status': fields.String(description='Response status', example='success')
})

grade_detail_response = api.model('GradeDetailResponse', {
    'grade': fields.Nested(grade_response_model, description='Grade object with adjustments'),
    'status': fields.String(description='Response status', example='success')
})

grade_adjustment_model = api.model('GradeAdjustment', {
    'question_id': fields.Integer(required=True, description='Question ID', example=1),
    'adjusted_score': fields.Float(required=True, description='Adjusted score', example=5.0),
    'adjustment_reason': fields.String(required=True, description='Reason for adjustment', example='Partial credit for showing work')
})

grade_adjustment_list_response = api.model('GradeAdjustmentListResponse', {
    'adjustments': fields.List(fields.Nested(grade_adjustment_response), description='List of grade adjustments'),
    'total': fields.Integer(description='Total number of adjustments', example=3),
    'status': fields.String(description='Response status', example='success')
})

grade_adjustment_create_response = api.model('GradeAdjustmentCreateResponse', {
    'adjustment': fields.Nested(grade_adjustment_response, description='Created adjustment'),
    'grade': fields.Nested(grade_response_model, description='Updated grade with new total'),
    'message': fields.String(description='Response message', example='Grade adjustment added successfully'),
    'status': fields.String(description='Response status', example='success')
})

finalize_grade_model = api.model('FinalizeGrade', {
    'notes': fields.String(description='Final notes/comments from teacher', example='Good work overall')
})

review_queue_item_response = api.model('ReviewQueueItemResponse', {
    'id': fields.Integer(description='Review item ID', example=1),
    'submission_id': fields.Integer(description='Submission ID', example=1),
    'question_id': fields.Integer(description='Question ID', example=1),
    'submission_answer_id': fields.Integer(description='Submission answer ID', example=1),
    'review_status': fields.String(description='Status: pending, in_review, approved, rejected', example='pending'),
    'review_reason': fields.String(description='Reason for review (e.g., low_ocr_confidence, low_grading_confidence, requires_review)', example='low_ocr_confidence'),
    'priority': fields.String(description='Priority: high (must review before finalizing), low (suggested review)', example='high'),
    'reviewed_by': fields.Integer(description='Teacher user ID who reviewed', example=3),
    'reviewed_at': fields.String(description='Review date (ISO format)', example='2025-12-05T11:00:00.123456'),
    'review_notes': fields.String(description='Review notes/feedback', example='Answer is partially correct'),
    'created_at': fields.String(description='Creation date (ISO format)', example='2025-12-05T10:35:00.123456'),
    'updated_at': fields.String(description='Last update date (ISO format)', example='2025-12-05T11:00:00.123456')
})

review_queue_list_response = api.model('ReviewQueueListResponse', {
    'review_items': fields.List(fields.Nested(review_queue_item_response), description='List of review queue items'),
    'total': fields.Integer(description='Total number of items', example=10),
    'page': fields.Integer(description='Current page number', example=1),
    'per_page': fields.Integer(description='Items per page', example=10),
    'status': fields.String(description='Response status', example='success')
})

review_queue_detail_response = api.model('ReviewQueueDetailResponse', {
    'review_item': fields.Nested(review_queue_item_response, description='Review queue item'),
    'status': fields.String(description='Response status', example='success')
})

review_queue_update_model = api.model('ReviewQueueUpdate', {
    'review_status': fields.String(required=True, description='Status: approved or rejected', example='approved'),
    'review_notes': fields.String(description='Review notes/feedback', example='Answer is correct'),
    'adjusted_score': fields.Float(description='Adjusted score if different from auto-grade', example=5.0)
})

message_response = api.model('MessageResponse', {
    'message': fields.String(description='Response message', example='Operation completed successfully'),
    'status': fields.String(description='Response status', example='success')
})


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def can_access_grade(submission, user):
    """Check if user can access grade"""
    # Students can only access their own grades
    if user.has_role('student'):
        return submission.student_id == user.id
    # Teachers can access grades for their exams
    elif user.has_role('teacher'):
        return submission.exam.creator_id == user.id
    # Admins can access all grades
    elif user.has_role('admin'):
        return True
    return False


def require_teacher_or_admin(func):
    """Decorator to require teacher or admin role"""
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user or (not user.has_role('teacher') and not user.has_role('admin')):
            return {'message': 'Requires teacher or admin role', 'status': 'error'}, 403
        return func(*args, **kwargs)
    return wrapper


# ============================================================================
# GRADES ENDPOINTS
# ============================================================================

@grading_ns.route('/grades')
class GradeList(Resource):
    @jwt_required()
    @grading_ns.doc(
        description='Get list of grades with pagination. Students see only their own grades, teachers see grades for their exams, admins see all grades.',
        security='Bearer Auth',
        params={
            'page': {'description': 'Page number (default: 1)', 'type': 'integer', 'default': 1},
            'per_page': {'description': 'Items per page (default: 10, max: 100)', 'type': 'integer', 'default': 10},
            'exam_id': {'description': 'Filter by exam ID', 'type': 'integer'},
            'is_finalized': {'description': 'Filter by finalization status', 'type': 'boolean'}
        },
        responses={
            200: ('Grades retrieved successfully', grade_list_response),
            403: ('Invalid user role', message_response),
            404: ('User not found', message_response)
        }
    )
    @grading_ns.marshal_with(grade_list_response, code=200)
    def get(self):
        """Get list of grades"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user:
            return {'message': 'User not found', 'status': 'error'}, 404

        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        per_page = min(per_page, 100)

        # Filtering
        exam_id = request.args.get('exam_id', type=int)
        is_finalized = request.args.get('is_finalized', type=lambda v: v.lower() == 'true')

        # Build query based on user role
        if user.has_role('student'):
            # Students see only their own grades
            query = Grade.query.join(Submission).filter(Submission.student_id == user.id)
        elif user.has_role('teacher'):
            # Teachers see grades for their exams
            query = Grade.query.join(Submission).join(Exam).filter(Exam.creator_id == user.id)
        elif user.has_role('admin'):
            # Admins see all grades
            query = Grade.query
        else:
            return {'message': 'Invalid user role', 'status': 'error'}, 403

        # Apply filters
        if exam_id:
            query = query.join(Submission).filter(Submission.exam_id == exam_id)
        if is_finalized is not None:
            query = query.filter(Grade.is_finalized == is_finalized)

        # Execute query with pagination
        pagination = query.order_by(Grade.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return {
            'grades': [grade.to_dict() for grade in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'status': 'success'
        }, 200


@grading_ns.route('/grades/<int:grade_id>')
@grading_ns.param('grade_id', 'The grade identifier')
class GradeDetail(Resource):
    @jwt_required()
    @grading_ns.doc(
        description='Get grade details with all adjustments. Students can only view their own grades. Teachers can view grades for their exams. Admins can view all grades.',
        security='Bearer Auth',
        responses={
            200: ('Grade retrieved successfully', grade_detail_response),
            403: ('Access denied', message_response),
            404: ('Grade not found', message_response)
        }
    )
    @grading_ns.marshal_with(grade_detail_response, code=200)
    def get(self, grade_id):
        """Get grade by ID"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        grade = Grade.query.get_or_404(grade_id)

        # Check permissions
        if not can_access_grade(grade.submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        return {
            'grade': grade.to_dict(include_adjustments=True),
            'status': 'success'
        }, 200


@grading_ns.route('/grades/submission/<int:submission_id>')
@grading_ns.param('submission_id', 'The submission identifier')
class SubmissionGrade(Resource):
    @jwt_required()
    @grading_ns.doc(
        description='Get grade for a specific submission with adjustments. Students can only view their own grades. Teachers can view grades for their exams. Admins can view all grades.',
        security='Bearer Auth',
        responses={
            200: ('Grade retrieved successfully', grade_detail_response),
            403: ('Access denied', message_response),
            404: ('Submission not found or no grade found', message_response)
        }
    )
    @grading_ns.marshal_with(grade_detail_response, code=200)
    def get(self, submission_id):
        """Get grade for a submission"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        # Check permissions
        if not can_access_grade(submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        if not submission.grade:
            return {'message': 'No grade found for this submission', 'status': 'error'}, 404

        return {
            'grade': submission.grade.to_dict(include_adjustments=True),
            'status': 'success'
        }, 200


@grading_ns.route('/grades/<int:grade_id>/finalize')
@grading_ns.param('grade_id', 'The grade identifier')
class FinalizeGrade(Resource):
    @jwt_required()
    @grading_ns.expect(finalize_grade_model, validate=False)
    @grading_ns.doc(
        description='Finalize grade after teacher review (Teacher/Admin only). Marks the grade as final and locks it. Teachers can only finalize grades for their exams. Once finalized, the grade cannot be unfinal ized.',
        security='Bearer Auth',
        responses={
            200: ('Grade finalized successfully', grade_detail_response),
            400: ('Grade is already finalized', message_response),
            403: ('Access denied - Only exam creator or admin can finalize grades', message_response),
            404: ('Grade not found', message_response)
        }
    )
    @grading_ns.marshal_with(grade_detail_response, code=200)
    @require_teacher_or_admin
    def post(self, grade_id):
        """Finalize grade after teacher review"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        grade = Grade.query.get_or_404(grade_id)

        # Check if teacher owns the exam
        if user.has_role('teacher') and grade.submission.exam.creator_id != user.id:
            return {'message': 'Access denied. You can only finalize grades for your exams', 'status': 'error'}, 403

        # Check if already finalized
        if grade.is_finalized:
            return {'message': 'Grade is already finalized', 'status': 'error'}, 400

        data = request.get_json() or {}

        try:
            grade.is_finalized = True
            grade.finalized_at = datetime.utcnow()
            grade.finalized_by = user.id
            if data.get('notes'):
                grade.notes = data['notes']

            db.session.commit()

            return {
                'grade': grade.to_dict(include_adjustments=True),
                'message': 'Grade finalized successfully',
                'status': 'success'
            }, 200

        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to finalize grade: {str(e)}', 'status': 'error'}, 500


@grading_ns.route('/grades/<int:grade_id>/adjustments')
@grading_ns.param('grade_id', 'The grade identifier')
class GradeAdjustments(Resource):
    @jwt_required()
    @grading_ns.doc(
        description='Get all manual adjustments made to a grade (Teacher/Admin only). Shows all individual question score adjustments.',
        security='Bearer Auth',
        responses={
            200: ('Adjustments retrieved successfully', grade_adjustment_list_response),
            403: ('Access denied - Only exam creator or admin can view adjustments', message_response),
            404: ('Grade not found', message_response)
        }
    )
    @grading_ns.marshal_with(grade_adjustment_list_response, code=200)
    @require_teacher_or_admin
    def get(self, grade_id):
        """Get all adjustments for a grade"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        grade = Grade.query.get_or_404(grade_id)

        # Check permissions
        if user.has_role('teacher') and grade.submission.exam.creator_id != user.id:
            return {'message': 'Access denied', 'status': 'error'}, 403

        return {
            'adjustments': [adj.to_dict() for adj in grade.adjustments],
            'total': len(grade.adjustments),
            'status': 'success'
        }, 200

    @jwt_required()
    @grading_ns.expect(grade_adjustment_model, validate=True)
    @grading_ns.doc(
        description='Add a manual grade adjustment for a specific question (Teacher/Admin only). Adjustments override the auto-graded score for a question. The grade total_score and percentage are automatically recalculated.',
        security='Bearer Auth',
        responses={
            201: ('Grade adjustment added successfully', grade_adjustment_create_response),
            400: ('Validation error - Missing required fields or question not found in exam', message_response),
            403: ('Access denied - Only exam creator or admin can add adjustments', message_response),
            404: ('Grade or question not found', message_response)
        }
    )
    @require_teacher_or_admin
    def post(self, grade_id):
        """Add a grade adjustment"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        grade = Grade.query.get_or_404(grade_id)

        # Check permissions
        if user.has_role('teacher') and grade.submission.exam.creator_id != user.id:
            return {'message': 'Access denied', 'status': 'error'}, 403

        data = request.get_json()

        # Validate required fields
        if not data.get('question_id'):
            return {'message': 'question_id is required', 'status': 'error'}, 400
        if data.get('adjusted_score') is None:
            return {'message': 'adjusted_score is required', 'status': 'error'}, 400
        if not data.get('adjustment_reason'):
            return {'message': 'adjustment_reason is required', 'status': 'error'}, 400

        # Verify question belongs to exam
        from app.models.exam import Question
        question = Question.query.filter_by(
            id=data['question_id'],
            exam_id=grade.submission.exam_id
        ).first()

        if not question:
            return {'message': 'Question not found in this exam', 'status': 'error'}, 404

        # Get original score from submission answers
        from app.models.submission import SubmissionAnswer
        answer = SubmissionAnswer.query.filter_by(
            submission_id=grade.submission_id,
            question_id=data['question_id']
        ).first()

        original_score = answer.auto_grade_score if answer else 0.0

        try:
            # Create adjustment
            adjustment = GradeAdjustment(
                grade_id=grade_id,
                question_id=data['question_id'],
                original_score=original_score,
                adjusted_score=data['adjusted_score'],
                adjustment_reason=data['adjustment_reason'],
                adjusted_by=user.id
            )
            db.session.add(adjustment)

            # Recalculate total score
            # Sum all adjusted scores + non-adjusted scores
            adjusted_question_ids = [adj.question_id for adj in grade.adjustments] + [data['question_id']]
            adjusted_total = sum(adj.adjusted_score for adj in grade.adjustments) + data['adjusted_score']

            # Add scores from non-adjusted questions
            non_adjusted_answers = SubmissionAnswer.query.filter(
                SubmissionAnswer.submission_id == grade.submission_id,
                ~SubmissionAnswer.question_id.in_(adjusted_question_ids)
            ).all()
            non_adjusted_total = sum(ans.auto_grade_score or 0 for ans in non_adjusted_answers)

            grade.total_score = adjusted_total + non_adjusted_total
            grade.percentage = (grade.total_score / grade.max_score * 100) if grade.max_score > 0 else 0

            db.session.commit()

            return {
                'adjustment': adjustment.to_dict(),
                'grade': grade.to_dict(),
                'message': 'Grade adjustment added successfully',
                'status': 'success'
            }, 201

        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to add adjustment: {str(e)}', 'status': 'error'}, 500


# ============================================================================
# REVIEW QUEUE ENDPOINTS
# ============================================================================

@grading_ns.route('/review-queue')
class ReviewQueueList(Resource):
    @jwt_required()
    @grading_ns.doc(
        description='Get review queue items with pagination (Teacher/Admin only). Review queue contains answers flagged for manual review (e.g., low OCR confidence, questions marked as requiring review). Teachers see review items for their exams only.',
        security='Bearer Auth',
        params={
            'page': {'description': 'Page number (default: 1)', 'type': 'integer', 'default': 1},
            'per_page': {'description': 'Items per page (default: 10, max: 100)', 'type': 'integer', 'default': 10},
            'exam_id': {'description': 'Filter by exam ID', 'type': 'integer'},
            'status': {'description': 'Filter by review status (pending, in_review, approved, rejected)', 'type': 'string', 'default': 'pending'}
        },
        responses={
            200: ('Review items retrieved successfully', review_queue_list_response),
            403: ('Requires teacher or admin role', message_response)
        }
    )
    @grading_ns.marshal_with(review_queue_list_response, code=200)
    @require_teacher_or_admin
    def get(self):
        """Get review queue items"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        per_page = min(per_page, 100)

        # Filtering
        exam_id = request.args.get('exam_id', type=int)
        status = request.args.get('status', 'pending')

        # Build query based on user role
        if user.has_role('teacher'):
            # Teachers see review queue for their exams
            query = ReviewQueue.query.join(Submission).join(Exam).filter(Exam.creator_id == user.id)
        elif user.has_role('admin'):
            # Admins see all review queue items
            query = ReviewQueue.query
        else:
            return {'message': 'Requires teacher or admin role', 'status': 'error'}, 403

        # Apply filters
        if exam_id:
            query = query.join(Submission).filter(Submission.exam_id == exam_id)
        if status:
            query = query.filter(ReviewQueue.review_status == status)

        # Execute query with pagination
        pagination = query.order_by(ReviewQueue.created_at.asc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return {
            'review_items': [item.to_dict() for item in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'status': 'success'
        }, 200


@grading_ns.route('/review-queue/<int:review_id>')
@grading_ns.param('review_id', 'The review queue item identifier')
class ReviewQueueDetail(Resource):
    @jwt_required()
    @grading_ns.doc(
        description='Get review queue item details (Teacher/Admin only). Teachers can only view review items for their exams.',
        security='Bearer Auth',
        responses={
            200: ('Review item retrieved successfully', review_queue_detail_response),
            403: ('Access denied - Only exam creator or admin can view review items', message_response),
            404: ('Review item not found', message_response)
        }
    )
    @grading_ns.marshal_with(review_queue_detail_response, code=200)
    @require_teacher_or_admin
    def get(self, review_id):
        """Get review queue item by ID"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        review_item = ReviewQueue.query.get_or_404(review_id)

        # Check permissions
        if user.has_role('teacher') and review_item.submission.exam.creator_id != user.id:
            return {'message': 'Access denied', 'status': 'error'}, 403

        return {
            'review_item': review_item.to_dict(),
            'status': 'success'
        }, 200

    @jwt_required()
    @grading_ns.expect(review_queue_update_model, validate=True)
    @grading_ns.doc(
        description='Update review queue item - approve or reject (Teacher/Admin only). Optionally provide an adjusted_score to override the auto-graded score. The grade total is automatically recalculated.',
        security='Bearer Auth',
        responses={
            200: ('Review completed successfully', review_queue_detail_response),
            400: ('Validation error - review_status must be approved or rejected', message_response),
            403: ('Access denied - Only exam creator or admin can review items', message_response),
            404: ('Review item not found', message_response)
        }
    )
    @grading_ns.marshal_with(review_queue_detail_response, code=200)
    @require_teacher_or_admin
    def put(self, review_id):
        """Update review queue item (approve/reject)"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        review_item = ReviewQueue.query.get_or_404(review_id)

        # Check permissions
        if user.has_role('teacher') and review_item.submission.exam.creator_id != user.id:
            return {'message': 'Access denied', 'status': 'error'}, 403

        data = request.get_json()

        # Validate required fields
        if not data.get('review_status'):
            return {'message': 'review_status is required', 'status': 'error'}, 400
        if data['review_status'] not in ['approved', 'rejected']:
            return {'message': 'review_status must be approved or rejected', 'status': 'error'}, 400

        try:
            review_item.review_status = data['review_status']
            review_item.reviewed_by = user.id
            review_item.reviewed_at = datetime.utcnow()
            review_item.review_notes = data.get('review_notes')

            # If score is adjusted, update the submission answer
            if data.get('adjusted_score') is not None:
                from app.models.submission import SubmissionAnswer
                answer = SubmissionAnswer.query.get(review_item.submission_answer_id)
                if answer:
                    old_score = answer.auto_grade_score or 0
                    answer.auto_grade_score = data['adjusted_score']

                    # Update grade total
                    grade = review_item.submission.grade
                    if grade:
                        grade.total_score = grade.total_score - old_score + data['adjusted_score']
                        grade.percentage = (grade.total_score / grade.max_score * 100) if grade.max_score > 0 else 0

            db.session.commit()

            return {
                'review_item': review_item.to_dict(),
                'message': 'Review completed successfully',
                'status': 'success'
            }, 200

        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to update review: {str(e)}', 'status': 'error'}, 500


@grading_ns.route('/review-queue/exam/<int:exam_id>')
@grading_ns.param('exam_id', 'The exam identifier')
class ExamReviewQueue(Resource):
    @jwt_required()
    @grading_ns.doc(
        description='Get all review queue items for a specific exam (Teacher/Admin only). Teachers can only view review items for their exams.',
        security='Bearer Auth',
        responses={
            200: ('Review items retrieved successfully', review_queue_list_response),
            403: ('Access denied - Only exam creator or admin can view review items', message_response),
            404: ('Exam not found', message_response)
        }
    )
    @grading_ns.marshal_with(review_queue_list_response, code=200)
    @require_teacher_or_admin
    def get(self, exam_id):
        """Get review queue items for a specific exam"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check permissions
        if user.has_role('teacher') and exam.creator_id != user.id:
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Get review items for this exam
        review_items = ReviewQueue.query.join(Submission).filter(
            Submission.exam_id == exam_id
        ).all()

        return {
            'review_items': [item.to_dict() for item in review_items],
            'total': len(review_items),
            'status': 'success'
        }, 200


# ============================================================================
# GRADING TRIGGER ENDPOINTS
# ============================================================================

grading_result_response = api.model('GradingResultResponse', {
    'submission_id': fields.Integer(description='Submission ID', example=1),
    'total_score': fields.Float(description='Total score achieved', example=85.0),
    'max_score': fields.Float(description='Maximum possible score', example=100.0),
    'percentage': fields.Float(description='Percentage score', example=85.0),
    'graded_answers': fields.Integer(description='Number of answers graded', example=10),
    'review_queue_items': fields.Integer(description='Number of items in review queue', example=2),
    'high_priority_reviews': fields.Integer(description='Number of high priority reviews', example=1),
    'message': fields.String(description='Response message', example='Submission graded successfully'),
    'status': fields.String(description='Response status', example='success')
})

grading_summary_response = api.model('GradingSummaryResponse', {
    'submission_id': fields.Integer(description='Submission ID', example=1),
    'grade': fields.Nested(grade_response_model, description='Grade details'),
    'answers': fields.List(fields.Raw, description='Answer-by-answer breakdown with scores'),
    'review_queue': fields.List(fields.Nested(review_queue_item_response), description='Review queue items'),
    'high_priority_reviews': fields.Integer(description='Count of high priority reviews', example=1),
    'low_priority_reviews': fields.Integer(description='Count of low priority reviews', example=2),
    'status': fields.String(description='Response status', example='success')
})


@grading_ns.route('/grade-submission/<int:submission_id>')
@grading_ns.param('submission_id', 'The submission identifier')
class GradeSubmission(Resource):
    @jwt_required()
    @grading_ns.doc(
        description='Manually trigger grading for a submission (Teacher/Admin only). This will grade all answers based on answer keys and populate the review queue. Useful when automatic grading is disabled or for regrading after answer key updates.',
        security='Bearer Auth',
        responses={
            200: ('Submission graded successfully', grading_result_response),
            400: ('Submission has no answers or answer keys not found', message_response),
            403: ('Access denied - Only exam creator or admin can grade', message_response),
            404: ('Submission not found', message_response),
            500: ('Grading failed', message_response)
        }
    )
    @grading_ns.marshal_with(grading_result_response, code=200)
    @require_teacher_or_admin
    def post(self, submission_id):
        """Manually trigger grading for a submission"""
        from app.services.grading_service import GradingService

        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)
        exam = submission.exam

        # Check permissions
        if user.has_role('teacher') and exam.creator_id != user.id:
            return {'message': 'Access denied', 'status': 'error'}, 403

        try:
            # Grade the submission
            result = GradingService.grade_submission(submission_id)
            result['message'] = 'Submission graded successfully'
            return result, 200

        except ValueError as e:
            return {'message': str(e), 'status': 'error'}, 400
        except Exception as e:
            return {'message': f'Grading failed: {str(e)}', 'status': 'error'}, 500


@grading_ns.route('/regrade-submission/<int:submission_id>')
@grading_ns.param('submission_id', 'The submission identifier')
class RegradeSubmission(Resource):
    @jwt_required()
    @grading_ns.doc(
        description='Regrade a submission (Teacher/Admin only). This will delete the existing grade and review queue items, then regrade all answers. Useful after updating answer keys or grading rules.',
        security='Bearer Auth',
        responses={
            200: ('Submission regraded successfully', grading_result_response),
            400: ('Submission has no answers or answer keys not found', message_response),
            403: ('Access denied - Only exam creator or admin can regrade', message_response),
            404: ('Submission not found', message_response),
            500: ('Regrading failed', message_response)
        }
    )
    @grading_ns.marshal_with(grading_result_response, code=200)
    @require_teacher_or_admin
    def post(self, submission_id):
        """Regrade a submission"""
        from app.services.grading_service import GradingService

        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)
        exam = submission.exam

        # Check permissions
        if user.has_role('teacher') and exam.creator_id != user.id:
            return {'message': 'Access denied', 'status': 'error'}, 403

        try:
            # Regrade the submission
            result = GradingService.regrade_submission(submission_id)
            result['message'] = 'Submission regraded successfully'
            return result, 200

        except ValueError as e:
            return {'message': str(e), 'status': 'error'}, 400
        except Exception as e:
            return {'message': f'Regrading failed: {str(e)}', 'status': 'error'}, 500


@grading_ns.route('/submission/<int:submission_id>/summary')
@grading_ns.param('submission_id', 'The submission identifier')
class GradingSummary(Resource):
    @jwt_required()
    @grading_ns.doc(
        description='Get detailed grading summary for a submission including answer breakdown and review queue. Students can view their own summaries, teachers can view summaries for their exams.',
        security='Bearer Auth',
        responses={
            200: ('Grading summary retrieved successfully', grading_summary_response),
            403: ('Access denied', message_response),
            404: ('Submission not found or not yet graded', message_response),
            500: ('Failed to retrieve summary', message_response)
        }
    )
    @grading_ns.marshal_with(grading_summary_response, code=200)
    def get(self, submission_id):
        """Get detailed grading summary"""
        from app.services.grading_service import GradingService

        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        # Check permissions
        if not can_access_grade(submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        try:
            # Get grading summary
            summary = GradingService.get_grading_summary(submission_id)
            summary['submission_id'] = submission_id
            return summary, 200

        except ValueError as e:
            return {'message': str(e), 'status': 'error'}, 404
        except Exception as e:
            return {'message': f'Failed to retrieve summary: {str(e)}', 'status': 'error'}, 500
