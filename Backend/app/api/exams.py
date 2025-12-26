"""
Exam Management Routes
Handles CRUD operations for exams, questions, options, and answer keys
"""
from flask import Blueprint, request
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.user import User
from app.models.exam import Exam, Question, QuestionOption, AnswerKey
from app.api import api

exams_bp = Blueprint('exams', __name__)
exams_ns = Namespace('exams', description='Exam management operations')

# ============================================================================
# REQUEST/RESPONSE MODELS FOR SWAGGER
# ============================================================================

# Exam models
exam_create_model = api.model('ExamCreate', {
    'title': fields.String(required=True, description='Exam title', example='Mathematics Final Exam'),
    'description': fields.String(description='Exam description', example='Final exam covering chapters 1-10'),
    'duration_minutes': fields.Integer(description='Exam duration in minutes', example=120),
    'total_points': fields.Float(description='Total points for the exam (auto-calculated from questions if not specified)', example=100.0),
    'start_date': fields.DateTime(description='Exam start date (ISO format)', example='2025-12-15T09:00:00'),
    'end_date': fields.DateTime(description='Exam end date (ISO format)', example='2025-12-15T12:00:00'),
    # OCR-related fields
    'subject_type': fields.String(description='Subject type for OCR optimization: mathematics, arabic, english, science, mixed', example='mathematics'),
    'primary_language': fields.String(description='Primary language for OCR: en, ar, mixed', example='en'),
    'has_formulas': fields.Boolean(description='Whether exam contains mathematical formulas', example=True),
    'has_diagrams': fields.Boolean(description='Whether exam contains diagrams', example=False),
    'is_published': fields.Boolean(description='Publish the exam immediately', example=True),
})

exam_update_model = api.model('ExamUpdate', {
    'title': fields.String(description='Exam title', example='Mathematics Final Exam - Updated'),
    'description': fields.String(description='Exam description', example='Updated description'),
    'duration_minutes': fields.Integer(description='Exam duration in minutes', example=150),
    'is_published': fields.Boolean(description='Is exam published', example=True),
    'is_active': fields.Boolean(description='Is exam active', example=True),
    'start_date': fields.DateTime(description='Exam start date (ISO format)', example='2025-12-15T09:00:00'),
    'end_date': fields.DateTime(description='Exam end date (ISO format)', example='2025-12-15T12:00:00'),
})

exam_response_model = api.model('ExamResponse', {
    'id': fields.Integer(description='Exam ID', example=1),
    'title': fields.String(description='Exam title', example='Mathematics Final Exam'),
    'description': fields.String(description='Exam description', example='Final exam covering chapters 1-10'),
    'creator_id': fields.Integer(description='Creator user ID', example=3),
    'duration_minutes': fields.Integer(description='Duration in minutes', example=120),
    'total_points': fields.Float(description='Total points', example=100.0),
    'subject_type': fields.String(description='Subject type for OCR', example='mathematics'),
    'primary_language': fields.String(description='Primary language', example='en'),
    'has_formulas': fields.Boolean(description='Contains formulas', example=True),
    'has_diagrams': fields.Boolean(description='Contains diagrams', example=False),
    'is_published': fields.Boolean(description='Is published', example=True),
    'is_active': fields.Boolean(description='Is active', example=True),
    'start_date': fields.String(description='Start date (ISO format)', example='2025-12-15T09:00:00'),
    'end_date': fields.String(description='End date (ISO format)', example='2025-12-15T12:00:00'),
    'created_at': fields.String(description='Creation date (ISO format)', example='2025-12-05T10:30:00.123456'),
    'updated_at': fields.String(description='Last update date (ISO format)', example='2025-12-05T10:30:00.123456')
})

# List response with pagination
exam_list_response = api.model('ExamListResponse', {
    'exams': fields.List(fields.Nested(exam_response_model), description='List of exams'),
    'total': fields.Integer(description='Total number of exams', example=25),
    'page': fields.Integer(description='Current page number', example=1),
    'per_page': fields.Integer(description='Items per page', example=10),
    'status': fields.String(description='Response status', example='success')
})

# Single exam detail response
exam_detail_response = api.model('ExamDetailResponse', {
    'exam': fields.Nested(exam_response_model, description='Exam object'),
    'status': fields.String(description='Response status', example='success')
})

# Question models
question_option_model = api.model('QuestionOption', {
    'option_text': fields.String(required=True, description='Option text', example='Paris'),
    'order_number': fields.Integer(required=True, description='Display order (starting from 1)', example=1),
    'is_correct': fields.Boolean(description='Is this the correct answer (for answer key)', example=True)
})

question_option_response = api.model('QuestionOptionResponse', {
    'id': fields.Integer(description='Option ID', example=1),
    'question_id': fields.Integer(description='Question ID', example=1),
    'option_text': fields.String(description='Option text', example='Paris'),
    'order_number': fields.Integer(description='Display order', example=1),
    'is_correct': fields.Boolean(description='Is this the correct answer', example=True),
    'created_at': fields.String(description='Creation date (ISO format)', example='2025-12-05T10:30:00.123456')
})

question_response_model = api.model('QuestionResponse', {
    'id': fields.Integer(description='Question ID', example=1),
    'exam_id': fields.Integer(description='Exam ID', example=1),
    'question_text': fields.String(description='Question text', example='What is the capital of France?'),
    'question_type': fields.String(description='Question type: multiple_choice or open_ended', example='multiple_choice'),
    'points': fields.Float(description='Points for this question', example=5.0),
    'order_number': fields.Integer(description='Question order in exam', example=1),
    'requires_review': fields.Boolean(description='Requires manual review after auto-grading', example=False),
    'created_at': fields.String(description='Creation date (ISO format)', example='2025-12-05T10:30:00.123456'),
    'updated_at': fields.String(description='Last update date (ISO format)', example='2025-12-05T10:30:00.123456'),
    'options': fields.List(fields.Nested(question_option_response), description='Question options (for multiple choice)')
})

question_create_model = api.model('QuestionCreate', {
    'question_text': fields.String(required=True, description='Question text', example='What is the capital of France?'),
    'question_type': fields.String(required=True, description='Question type: multiple_choice or open_ended', example='multiple_choice'),
    'points': fields.Float(required=True, description='Points for this question', example=5.0),
    'order_number': fields.Integer(required=True, description='Question order in exam (starting from 1)', example=1),
    'requires_review': fields.Boolean(description='Requires manual review after auto-grading', example=False),
    'options': fields.List(fields.Nested(question_option_model), description='Options for multiple choice questions (minimum 2)',
                          example=[
                              {'option_text': 'Paris', 'order_number': 1, 'is_correct': True},
                              {'option_text': 'London', 'order_number': 2, 'is_correct': False},
                              {'option_text': 'Berlin', 'order_number': 3, 'is_correct': False}
                          ])
})

question_update_model = api.model('QuestionUpdate', {
    'question_text': fields.String(description='Question text', example='What is the capital of France? (Updated)'),
    'question_type': fields.String(description='Question type: multiple_choice or open_ended', example='multiple_choice'),
    'points': fields.Float(description='Points for this question', example=10.0),
    'order_number': fields.Integer(description='Question order in exam', example=1),
    'requires_review': fields.Boolean(description='Requires manual review after auto-grading', example=True),
})

question_list_response = api.model('QuestionListResponse', {
    'questions': fields.List(fields.Nested(question_response_model), description='List of questions'),
    'total': fields.Integer(description='Total number of questions', example=10),
    'status': fields.String(description='Response status', example='success')
})

question_detail_response = api.model('QuestionDetailResponse', {
    'question': fields.Nested(question_response_model, description='Question object'),
    'status': fields.String(description='Response status', example='success')
})

# Answer key models
answer_key_model = api.model('AnswerKey', {
    'question_id': fields.Integer(required=True, description='Question ID', example=1),
    'correct_answer': fields.String(required=True, description='Correct answer: For multiple choice, use option ID (e.g., "1"). For open-ended, use the text answer', example='1'),
    'answer_type': fields.String(required=True, description='Answer type: multiple_choice or open_ended', example='multiple_choice'),
    'points': fields.Float(required=True, description='Points for this answer', example=5.0),
    'strictness_level': fields.String(description='Grading strictness for open-ended questions: lenient, normal, or strict', example='normal'),
    'keywords': fields.List(fields.String, description='Keywords for open-ended grading (e.g., ["photosynthesis", "chlorophyll", "sunlight"])', example=['photosynthesis', 'chlorophyll']),
    'additional_notes': fields.String(description='Additional notes/hints for grading this answer', example='Accept variations of chlorophyll spelling')
})

answer_key_response = api.model('AnswerKeyResponse', {
    'id': fields.Integer(description='Answer key ID', example=1),
    'exam_id': fields.Integer(description='Exam ID', example=1),
    'question_id': fields.Integer(description='Question ID', example=1),
    'correct_answer': fields.String(description='Correct answer text or option ID', example='1'),
    'answer_type': fields.String(description='Answer type: multiple_choice or open_ended', example='multiple_choice'),
    'points': fields.Float(description='Points for this answer', example=5.0),
    'strictness_level': fields.String(description='Grading strictness', example='normal'),
    'keywords': fields.List(fields.String, description='Keywords for open-ended grading', example=['photosynthesis', 'chlorophyll']),
    'additional_notes': fields.String(description='Additional grading notes', example='Accept variations'),
    'created_at': fields.String(description='Creation date (ISO format)', example='2025-12-05T10:30:00.123456'),
    'updated_at': fields.String(description='Last update date (ISO format)', example='2025-12-05T10:30:00.123456')
})

answer_keys_bulk_model = api.model('AnswerKeysBulk', {
    'answer_keys': fields.List(fields.Nested(answer_key_model), required=True, description='List of answer keys',
                               example=[
                                   {'question_id': 1, 'correct_answer': '1', 'answer_type': 'multiple_choice', 'points': 5.0},
                                   {'question_id': 2, 'correct_answer': 'The Nile River', 'answer_type': 'open_ended', 'points': 10.0,
                                    'strictness_level': 'normal', 'keywords': ['Nile', 'Africa', 'longest'], 'additional_notes': 'Accept "Nile" alone'}
                               ])
})

answer_key_list_response = api.model('AnswerKeyListResponse', {
    'answer_keys': fields.List(fields.Nested(answer_key_response), description='List of answer keys'),
    'total': fields.Integer(description='Total number of answer keys', example=10),
    'status': fields.String(description='Response status', example='success')
})

answer_key_detail_response = api.model('AnswerKeyDetailResponse', {
    'answer_key': fields.Nested(answer_key_response, description='Answer key object'),
    'status': fields.String(description='Response status', example='success')
})

option_detail_response = api.model('OptionDetailResponse', {
    'option': fields.Nested(question_option_response, description='Option object'),
    'message': fields.String(description='Response message', example='Option added successfully'),
    'status': fields.String(description='Response status', example='success')
})

message_response = api.model('MessageResponse', {
    'message': fields.String(description='Response message', example='Operation completed successfully'),
    'status': fields.String(description='Response status', example='success')
})


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def require_teacher_or_admin(func):
    """Decorator to require teacher or admin role"""
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user or (not user.has_role('teacher') and not user.has_role('admin')):
            return {'message': 'Requires teacher or admin role', 'status': 'error'}, 403
        return func(*args, **kwargs)
    return wrapper


def is_exam_owner_or_admin(exam, user):
    """Check if user is exam owner or admin"""
    return exam.creator_id == user.id or user.has_role('admin')


# ============================================================================
# EXAM CRUD ENDPOINTS
# ============================================================================

@exams_ns.route('')
class ExamList(Resource):
    @jwt_required()
    @exams_ns.doc(
        description='Get list of exams with pagination. Students see only published and active exams, teachers see their own exams, admins see all exams.',
        security='Bearer Auth',
        params={
            'page': {'description': 'Page number (default: 1)', 'type': 'integer', 'default': 1},
            'per_page': {'description': 'Items per page (default: 10, max: 100)', 'type': 'integer', 'default': 10},
            'is_published': {'description': 'Filter by published status', 'type': 'boolean'},
            'is_active': {'description': 'Filter by active status', 'type': 'boolean'}
        }
    )
    @exams_ns.marshal_with(exam_list_response, code=200, description='List of exams retrieved successfully')
    def get(self):
        """Get list of exams"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user:
            return {'message': 'User not found', 'status': 'error'}, 404

        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        per_page = min(per_page, 100)

        # Filter by status
        is_published = request.args.get('is_published', type=lambda v: v.lower() == 'true')
        is_active = request.args.get('is_active', type=lambda v: v.lower() == 'true')

        # Build query based on user role
        if user.has_role('student'):
            # Students only see published and active exams
            query = Exam.query.filter_by(is_published=True, is_active=True)
        elif user.has_role('teacher'):
            # Teachers see their own exams
            query = Exam.query.filter_by(creator_id=user.id)
        elif user.has_role('admin'):
            # Admins see all exams
            query = Exam.query
        else:
            return {'message': 'Invalid user role', 'status': 'error'}, 403

        # Apply filters
        if is_published is not None:
            query = query.filter_by(is_published=is_published)
        if is_active is not None:
            query = query.filter_by(is_active=is_active)

        # Execute query with pagination
        pagination = query.order_by(Exam.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return {
            'exams': [exam.to_dict() for exam in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'status': 'success'
        }, 200

    @jwt_required()
    @exams_ns.expect(exam_create_model, validate=True)
    @exams_ns.doc(
        description='Create a new exam (Teacher/Admin only). New exams start as unpublished and active.',
        security='Bearer Auth',
        responses={
            201: ('Exam created successfully', exam_detail_response),
            400: ('Validation error', message_response),
            403: ('Requires teacher or admin role', message_response)
        }
    )
    @require_teacher_or_admin
    def post(self):
        """Create a new exam"""
        current_user_id = get_jwt_identity()
        data = request.get_json()

        # Validate required fields
        if not data.get('title'):
            return {'message': 'Title is required', 'status': 'error'}, 400

        # Parse dates if provided
        start_date = None
        end_date = None
        if data.get('start_date'):
            try:
                start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
            except ValueError:
                return {'message': 'Invalid start_date format. Use ISO format', 'status': 'error'}, 400

        if data.get('end_date'):
            try:
                end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
            except ValueError:
                return {'message': 'Invalid end_date format. Use ISO format', 'status': 'error'}, 400

        # Create exam
        exam = Exam(
            title=data['title'],
            description=data.get('description'),
            creator_id=int(current_user_id),
            duration_minutes=data.get('duration_minutes'),
            start_date=start_date,
            end_date=end_date,
            # OCR-related fields
            subject_type=data.get('subject_type'),
            primary_language=data.get('primary_language', 'en'),
            has_formulas=data.get('has_formulas', False),
            has_diagrams=data.get('has_diagrams', False),
            is_published=data.get('is_published', False),  # Allow setting is_published on create
            is_active=True
        )

        try:
            db.session.add(exam)
            db.session.commit()
            return {
                'exam': exam.to_dict(),
                'message': 'Exam created successfully',
                'status': 'success'
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to create exam: {str(e)}', 'status': 'error'}, 500


@exams_ns.route('/<int:exam_id>')
@exams_ns.param('exam_id', 'The exam identifier')
class ExamDetail(Resource):
    @jwt_required()
    @exams_ns.doc(
        description='Get exam details with questions and answer keys (if authorized). Students can only view published and active exams. Teachers can view their own exams. Admins can view all exams. Answer keys are only visible to teachers and admins.',
        security='Bearer Auth',
        responses={
            200: ('Exam retrieved successfully', exam_detail_response),
            403: ('Access denied', message_response),
            404: ('Exam not found or not available', message_response)
        }
    )
    @exams_ns.marshal_with(exam_detail_response, code=200)
    def get(self, exam_id):
        """Get exam by ID"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check permissions
        if user.has_role('student'):
            # Students can only view published exams
            if not exam.is_published or not exam.is_active:
                return {'message': 'Exam not found or not available', 'status': 'error'}, 404
        elif user.has_role('teacher'):
            # Teachers can only view their own exams
            if not is_exam_owner_or_admin(exam, user):
                return {'message': 'Access denied', 'status': 'error'}, 403

        # Include questions and answer keys based on role
        include_answer_keys = user.has_role('teacher') or user.has_role('admin')

        return {
            'exam': exam.to_dict(include_questions=True, include_answer_keys=include_answer_keys),
            'status': 'success'
        }, 200

    @jwt_required()
    @exams_ns.expect(exam_update_model, validate=False)
    @exams_ns.doc(
        description='Update exam details (Owner or Admin only). Only the exam creator or an admin can update the exam.',
        security='Bearer Auth',
        responses={
            200: ('Exam updated successfully', exam_detail_response),
            400: ('Validation error', message_response),
            403: ('Access denied - Only exam creator or admin can update', message_response),
            404: ('Exam not found', message_response)
        }
    )
    @require_teacher_or_admin
    def put(self, exam_id):
        """Update exam"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied. Only exam creator or admin can update', 'status': 'error'}, 403

        data = request.get_json()

        # Update fields
        if 'title' in data:
            exam.title = data['title']
        if 'description' in data:
            exam.description = data['description']
        if 'duration_minutes' in data:
            exam.duration_minutes = data['duration_minutes']
        if 'is_published' in data:
            exam.is_published = data['is_published']
        if 'is_active' in data:
            exam.is_active = data['is_active']

        # Update dates
        if 'start_date' in data and data['start_date']:
            try:
                exam.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00'))
            except ValueError:
                return {'message': 'Invalid start_date format', 'status': 'error'}, 400

        if 'end_date' in data and data['end_date']:
            try:
                exam.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00'))
            except ValueError:
                return {'message': 'Invalid end_date format', 'status': 'error'}, 400

        try:
            db.session.commit()
            return {
                'exam': exam.to_dict(),
                'message': 'Exam updated successfully',
                'status': 'success'
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to update exam: {str(e)}', 'status': 'error'}, 500

    @jwt_required()
    @exams_ns.doc(
        description='Delete exam (Owner or Admin only). This will cascade delete all questions, answer keys, and submissions for this exam.',
        security='Bearer Auth',
        responses={
            200: ('Exam deleted successfully', message_response),
            403: ('Access denied - Only exam creator or admin can delete', message_response),
            404: ('Exam not found', message_response)
        }
    )
    @exams_ns.marshal_with(message_response, code=200)
    @require_teacher_or_admin
    def delete(self, exam_id):
        """Delete exam"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied. Only exam creator or admin can delete', 'status': 'error'}, 403

        try:
            db.session.delete(exam)
            db.session.commit()
            return {'message': 'Exam deleted successfully', 'status': 'success'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to delete exam: {str(e)}', 'status': 'error'}, 500


@exams_ns.route('/<int:exam_id>/publish')
@exams_ns.param('exam_id', 'The exam identifier')
class ExamPublish(Resource):
    @jwt_required()
    @exams_ns.doc(
        description='Toggle exam published status (Owner or Admin only). Toggles between published and unpublished states.',
        security='Bearer Auth',
        responses={
            200: ('Exam publish status toggled successfully', exam_detail_response),
            403: ('Access denied', message_response),
            404: ('Exam not found', message_response)
        }
    )
    @exams_ns.marshal_with(exam_detail_response, code=200)
    @require_teacher_or_admin
    def post(self, exam_id):
        """Toggle exam published status"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Toggle published status
        exam.is_published = not exam.is_published
        status_text = 'published' if exam.is_published else 'unpublished'

        try:
            db.session.commit()
            return {
                'exam': exam.to_dict(),
                'message': f'Exam {status_text} successfully',
                'status': 'success'
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to update exam: {str(e)}', 'status': 'error'}, 500


# ============================================================================
# QUESTIONS MANAGEMENT ENDPOINTS
# ============================================================================

@exams_ns.route('/<int:exam_id>/questions')
@exams_ns.param('exam_id', 'The exam identifier')
class QuestionList(Resource):
    @jwt_required()
    @exams_ns.doc(
        description='Get all questions for an exam ordered by question number. Students can only view questions for published and active exams.',
        security='Bearer Auth',
        responses={
            200: ('Questions retrieved successfully', question_list_response),
            403: ('Access denied', message_response),
            404: ('Exam not found or not available', message_response)
        }
    )
    @exams_ns.marshal_with(question_list_response, code=200)
    def get(self, exam_id):
        """Get all questions for an exam"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check permissions
        if user.has_role('student'):
            if not exam.is_published or not exam.is_active:
                return {'message': 'Exam not found or not available', 'status': 'error'}, 404
        elif user.has_role('teacher'):
            if not is_exam_owner_or_admin(exam, user):
                return {'message': 'Access denied', 'status': 'error'}, 403

        questions = Question.query.filter_by(exam_id=exam_id).order_by(Question.order_number).all()

        return {
            'questions': [q.to_dict(include_options=True) for q in questions],
            'total': len(questions),
            'status': 'success'
        }, 200

    @jwt_required()
    @exams_ns.expect(question_create_model, validate=True)
    @exams_ns.doc(
        description='Add a question to an exam (Owner or Admin only). For multiple choice questions, include at least 2 options. The exam\'s total_points will be automatically updated.',
        security='Bearer Auth',
        responses={
            201: ('Question added successfully', question_detail_response),
            400: ('Validation error - Missing required fields or invalid question type', message_response),
            403: ('Access denied - Only exam creator or admin can add questions', message_response),
            404: ('Exam not found', message_response)
        }
    )
    @require_teacher_or_admin
    def post(self, exam_id):
        """Add a question to an exam"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        data = request.get_json()

        # Validate required fields
        if not data.get('question_text'):
            return {'message': 'question_text is required', 'status': 'error'}, 400
        if not data.get('question_type'):
            return {'message': 'question_type is required', 'status': 'error'}, 400
        if data['question_type'] not in ['multiple_choice', 'open_ended']:
            return {'message': 'question_type must be multiple_choice or open_ended', 'status': 'error'}, 400
        if data.get('points') is None:
            return {'message': 'points is required', 'status': 'error'}, 400
        if data.get('order_number') is None:
            return {'message': 'order_number is required', 'status': 'error'}, 400

        # Validate options for multiple choice questions
        if data['question_type'] == 'multiple_choice':
            if not data.get('options') or len(data['options']) < 2:
                return {'message': 'Multiple choice questions must have at least 2 options', 'status': 'error'}, 400

        try:
            # Create question
            question = Question(
                exam_id=exam_id,
                question_text=data['question_text'],
                question_type=data['question_type'],
                points=data['points'],
                order_number=data['order_number'],
                requires_review=data.get('requires_review', False)
            )
            db.session.add(question)
            db.session.flush()  # Get question ID

            # Add options if multiple choice
            if data['question_type'] == 'multiple_choice' and data.get('options'):
                for opt_data in data['options']:
                    option = QuestionOption(
                        question_id=question.id,
                        option_text=opt_data['option_text'],
                        order_number=opt_data['order_number'],
                        is_correct=opt_data.get('is_correct', False)
                    )
                    db.session.add(option)

            # Update exam total points
            exam.total_points = sum(q.points for q in exam.questions) + question.points

            db.session.commit()

            return {
                'question': question.to_dict(include_options=True),
                'message': 'Question added successfully',
                'status': 'success'
            }, 201

        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to add question: {str(e)}', 'status': 'error'}, 500


@exams_ns.route('/<int:exam_id>/questions/<int:question_id>')
@exams_ns.param('exam_id', 'The exam identifier')
@exams_ns.param('question_id', 'The question identifier')
class QuestionDetail(Resource):
    @jwt_required()
    @exams_ns.doc(
        description='Get question details with options. Students can only view questions for published and active exams.',
        security='Bearer Auth',
        responses={
            200: ('Question retrieved successfully', question_detail_response),
            403: ('Access denied', message_response),
            404: ('Question not found or not available', message_response)
        }
    )
    @exams_ns.marshal_with(question_detail_response, code=200)
    def get(self, exam_id, question_id):
        """Get question by ID"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)
        question = Question.query.filter_by(id=question_id, exam_id=exam_id).first_or_404()

        # Check permissions
        if user.has_role('student'):
            if not exam.is_published or not exam.is_active:
                return {'message': 'Question not found or not available', 'status': 'error'}, 404
        elif user.has_role('teacher'):
            if not is_exam_owner_or_admin(exam, user):
                return {'message': 'Access denied', 'status': 'error'}, 403

        return {
            'question': question.to_dict(include_options=True),
            'status': 'success'
        }, 200

    @jwt_required()
    @exams_ns.expect(question_update_model, validate=False)
    @exams_ns.doc(
        description='Update question (Owner or Admin only). If points are changed, the exam\'s total_points will be recalculated.',
        security='Bearer Auth',
        responses={
            200: ('Question updated successfully', question_detail_response),
            400: ('Validation error - Invalid question type', message_response),
            403: ('Access denied - Only exam creator or admin can update questions', message_response),
            404: ('Question not found', message_response)
        }
    )
    @require_teacher_or_admin
    def put(self, exam_id, question_id):
        """Update question"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)
        question = Question.query.filter_by(id=question_id, exam_id=exam_id).first_or_404()

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        data = request.get_json()

        # Update fields
        old_points = question.points
        if 'question_text' in data:
            question.question_text = data['question_text']
        if 'question_type' in data:
            if data['question_type'] not in ['multiple_choice', 'open_ended']:
                return {'message': 'Invalid question_type', 'status': 'error'}, 400
            question.question_type = data['question_type']
        if 'points' in data:
            question.points = data['points']
        if 'order_number' in data:
            question.order_number = data['order_number']
        if 'requires_review' in data:
            question.requires_review = data['requires_review']

        try:
            # Update exam total points if points changed
            if 'points' in data and old_points != question.points:
                exam.total_points = sum(q.points for q in exam.questions if q.id != question.id) + question.points

            db.session.commit()
            return {
                'question': question.to_dict(include_options=True),
                'message': 'Question updated successfully',
                'status': 'success'
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to update question: {str(e)}', 'status': 'error'}, 500

    @jwt_required()
    @exams_ns.doc(
        description='Delete question (Owner or Admin only). This will also delete all associated options and answer keys. The exam\'s total_points will be updated.',
        security='Bearer Auth',
        responses={
            200: ('Question deleted successfully', message_response),
            403: ('Access denied - Only exam creator or admin can delete questions', message_response),
            404: ('Question not found', message_response)
        }
    )
    @exams_ns.marshal_with(message_response, code=200)
    @require_teacher_or_admin
    def delete(self, exam_id, question_id):
        """Delete question"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)
        question = Question.query.filter_by(id=question_id, exam_id=exam_id).first_or_404()

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        try:
            # Update exam total points
            exam.total_points -= question.points

            db.session.delete(question)
            db.session.commit()
            return {'message': 'Question deleted successfully', 'status': 'success'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to delete question: {str(e)}', 'status': 'error'}, 500


@exams_ns.route('/<int:exam_id>/questions/<int:question_id>/options')
@exams_ns.param('exam_id', 'The exam identifier')
@exams_ns.param('question_id', 'The question identifier')
class QuestionOptionsList(Resource):
    @jwt_required()
    @exams_ns.expect(question_option_model, validate=True)
    @exams_ns.doc(
        description='Add option to multiple choice question (Owner or Admin only). Can only add options to multiple_choice type questions.',
        security='Bearer Auth',
        responses={
            201: ('Option added successfully', option_detail_response),
            400: ('Validation error - Can only add options to multiple choice questions', message_response),
            403: ('Access denied - Only exam creator or admin can add options', message_response),
            404: ('Question not found', message_response)
        }
    )
    @require_teacher_or_admin
    def post(self, exam_id, question_id):
        """Add option to multiple choice question"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)
        question = Question.query.filter_by(id=question_id, exam_id=exam_id).first_or_404()

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Validate question type
        if question.question_type != 'multiple_choice':
            return {'message': 'Can only add options to multiple choice questions', 'status': 'error'}, 400

        data = request.get_json()

        # Validate required fields
        if not data.get('option_text'):
            return {'message': 'option_text is required', 'status': 'error'}, 400
        if data.get('order_number') is None:
            return {'message': 'order_number is required', 'status': 'error'}, 400

        try:
            option = QuestionOption(
                question_id=question_id,
                option_text=data['option_text'],
                order_number=data['order_number'],
                is_correct=data.get('is_correct', False)
            )
            db.session.add(option)
            db.session.commit()

            return {
                'option': option.to_dict(),
                'message': 'Option added successfully',
                'status': 'success'
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to add option: {str(e)}', 'status': 'error'}, 500


@exams_ns.route('/<int:exam_id>/questions/<int:question_id>/options/<int:option_id>')
@exams_ns.param('exam_id', 'The exam identifier')
@exams_ns.param('question_id', 'The question identifier')
@exams_ns.param('option_id', 'The option identifier')
class QuestionOptionDetail(Resource):
    @jwt_required()
    @exams_ns.doc(
        description='Delete option from multiple choice question (Owner or Admin only). Multiple choice questions must have at least 2 options remaining.',
        security='Bearer Auth',
        responses={
            200: ('Option deleted successfully', message_response),
            400: ('Cannot delete - Multiple choice questions must have at least 2 options', message_response),
            403: ('Access denied - Only exam creator or admin can delete options', message_response),
            404: ('Option not found', message_response)
        }
    )
    @exams_ns.marshal_with(message_response, code=200)
    @require_teacher_or_admin
    def delete(self, exam_id, question_id, option_id):
        """Delete option from multiple choice question"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)
        question = Question.query.filter_by(id=question_id, exam_id=exam_id).first_or_404()
        option = QuestionOption.query.filter_by(id=option_id, question_id=question_id).first_or_404()

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Check if question has enough options remaining
        remaining_options = len(question.options) - 1
        if remaining_options < 2:
            return {'message': 'Multiple choice questions must have at least 2 options', 'status': 'error'}, 400

        try:
            db.session.delete(option)
            db.session.commit()
            return {'message': 'Option deleted successfully', 'status': 'success'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to delete option: {str(e)}', 'status': 'error'}, 500


# ============================================================================
# ANSWER KEYS MANAGEMENT ENDPOINTS
# ============================================================================

@exams_ns.route('/<int:exam_id>/answer-keys')
@exams_ns.param('exam_id', 'The exam identifier')
class AnswerKeyList(Resource):
    @jwt_required()
    @exams_ns.doc(
        description='Get all answer keys for an exam (Owner or Admin only). Answer keys are only accessible to the exam creator or administrators.',
        security='Bearer Auth',
        responses={
            200: ('Answer keys retrieved successfully', answer_key_list_response),
            403: ('Access denied - Only exam creator or admin can view answer keys', message_response),
            404: ('Exam not found', message_response)
        }
    )
    @exams_ns.marshal_with(answer_key_list_response, code=200)
    @require_teacher_or_admin
    def get(self, exam_id):
        """Get all answer keys for an exam"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        answer_keys = AnswerKey.query.filter_by(exam_id=exam_id).all()

        return {
            'answer_keys': [ak.to_dict() for ak in answer_keys],
            'total': len(answer_keys),
            'status': 'success'
        }, 200

    @jwt_required()
    @exams_ns.expect(answer_keys_bulk_model, validate=True)
    @exams_ns.doc(
        description='Add or update answer keys in bulk (Owner or Admin only). Provide an array of answer keys. If an answer key already exists for a question, it will be updated. For multiple choice questions, use the option ID as correct_answer. For open-ended questions, use the text answer.',
        security='Bearer Auth',
        responses={
            201: ('Answer keys saved successfully', answer_key_list_response),
            400: ('Validation error - Missing required fields or question not found in exam', message_response),
            403: ('Access denied - Only exam creator or admin can add answer keys', message_response),
            404: ('Exam not found or question not found in exam', message_response)
        }
    )
    @require_teacher_or_admin
    def post(self, exam_id):
        """Add answer keys in bulk (JSON format)"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        data = request.get_json()

        if not data.get('answer_keys') or not isinstance(data['answer_keys'], list):
            return {'message': 'answer_keys array is required', 'status': 'error'}, 400

        try:
            created_keys = []
            for key_data in data['answer_keys']:
                # Validate required fields
                if not key_data.get('question_id'):
                    return {'message': 'question_id is required for all answer keys', 'status': 'error'}, 400
                if not key_data.get('correct_answer'):
                    return {'message': 'correct_answer is required for all answer keys', 'status': 'error'}, 400
                if not key_data.get('answer_type'):
                    return {'message': 'answer_type is required for all answer keys', 'status': 'error'}, 400
                if key_data.get('points') is None:
                    return {'message': 'points is required for all answer keys', 'status': 'error'}, 400

                # Verify question belongs to this exam
                question = Question.query.filter_by(
                    id=key_data['question_id'],
                    exam_id=exam_id
                ).first()

                if not question:
                    return {
                        'message': f'Question {key_data["question_id"]} not found in this exam',
                        'status': 'error'
                    }, 404

                # Check if answer key already exists
                existing_key = AnswerKey.query.filter_by(
                    exam_id=exam_id,
                    question_id=key_data['question_id']
                ).first()

                if existing_key:
                    # Update existing
                    existing_key.correct_answer = key_data['correct_answer']
                    existing_key.answer_type = key_data['answer_type']
                    existing_key.points = key_data['points']
                    existing_key.strictness_level = key_data.get('strictness_level', 'normal')
                    existing_key.keywords = key_data.get('keywords')
                    existing_key.additional_notes = key_data.get('additional_notes')
                    created_keys.append(existing_key)
                else:
                    # Create new
                    answer_key = AnswerKey(
                        exam_id=exam_id,
                        question_id=key_data['question_id'],
                        correct_answer=key_data['correct_answer'],
                        answer_type=key_data['answer_type'],
                        points=key_data['points'],
                        strictness_level=key_data.get('strictness_level', 'normal'),
                        keywords=key_data.get('keywords'),
                        additional_notes=key_data.get('additional_notes')
                    )
                    db.session.add(answer_key)
                    created_keys.append(answer_key)

            db.session.commit()

            return {
                'answer_keys': [ak.to_dict() for ak in created_keys],
                'message': f'{len(created_keys)} answer keys saved successfully',
                'status': 'success'
            }, 201

        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to save answer keys: {str(e)}', 'status': 'error'}, 500


@exams_ns.route('/<int:exam_id>/answer-keys/upload')
@exams_ns.param('exam_id', 'The exam identifier')
class AnswerKeyUpload(Resource):
    @jwt_required()
    @exams_ns.doc(
        description='Upload answer keys from CSV or JSON file (Owner or Admin only). CSV format: question_id,correct_answer,answer_type,points. JSON format: {"answer_keys": [{"question_id": 1, "correct_answer": "1", "answer_type": "multiple_choice", "points": 5.0}]}. Existing answer keys will be updated.',
        security='Bearer Auth',
        params={
            'file': 'CSV or JSON file containing answer keys'
        },
        responses={
            201: ('Answer keys uploaded successfully', answer_key_list_response),
            400: ('No file uploaded or unsupported file format', message_response),
            403: ('Access denied - Only exam creator or admin can upload answer keys', message_response),
            404: ('Exam not found', message_response)
        }
    )
    @require_teacher_or_admin
    def post(self, exam_id):
        """Upload answer keys from file (CSV or JSON)"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Check if file was uploaded
        if 'file' not in request.files:
            return {'message': 'No file uploaded', 'status': 'error'}, 400

        file = request.files['file']

        if file.filename == '':
            return {'message': 'No file selected', 'status': 'error'}, 400

        # Get file extension
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''

        try:
            answer_keys_data = []

            if file_ext == 'json':
                # Parse JSON file
                import json
                content = file.read().decode('utf-8')
                json_data = json.loads(content)

                # Expect format: {"answer_keys": [...]}
                if 'answer_keys' in json_data:
                    answer_keys_data = json_data['answer_keys']
                elif isinstance(json_data, list):
                    answer_keys_data = json_data
                else:
                    return {
                        'message': 'Invalid JSON format. Expected {"answer_keys": [...]} or array',
                        'status': 'error'
                    }, 400

            elif file_ext == 'csv':
                # Parse CSV file
                import csv
                import io
                content = file.read().decode('utf-8')
                csv_reader = csv.DictReader(io.StringIO(content))

                for row in csv_reader:
                    answer_keys_data.append({
                        'question_id': int(row.get('question_id', 0)),
                        'correct_answer': row.get('correct_answer', ''),
                        'answer_type': row.get('answer_type', 'open_ended'),
                        'points': float(row.get('points', 0))
                    })

            else:
                return {
                    'message': 'Unsupported file format. Please upload JSON or CSV file',
                    'status': 'error'
                }, 400

            # Process answer keys
            created_keys = []
            for key_data in answer_keys_data:
                # Validate required fields
                if not key_data.get('question_id'):
                    continue
                if not key_data.get('correct_answer'):
                    continue

                # Verify question belongs to this exam
                question = Question.query.filter_by(
                    id=key_data['question_id'],
                    exam_id=exam_id
                ).first()

                if not question:
                    continue

                # Check if answer key already exists
                existing_key = AnswerKey.query.filter_by(
                    exam_id=exam_id,
                    question_id=key_data['question_id']
                ).first()

                if existing_key:
                    # Update existing
                    existing_key.correct_answer = key_data['correct_answer']
                    existing_key.answer_type = key_data.get('answer_type', 'open_ended')
                    existing_key.points = key_data.get('points', question.points)
                    created_keys.append(existing_key)
                else:
                    # Create new
                    answer_key = AnswerKey(
                        exam_id=exam_id,
                        question_id=key_data['question_id'],
                        correct_answer=key_data['correct_answer'],
                        answer_type=key_data.get('answer_type', 'open_ended'),
                        points=key_data.get('points', question.points)
                    )
                    db.session.add(answer_key)
                    created_keys.append(answer_key)

            db.session.commit()

            return {
                'answer_keys': [ak.to_dict() for ak in created_keys],
                'message': f'{len(created_keys)} answer keys uploaded successfully',
                'status': 'success'
            }, 201

        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to upload answer keys: {str(e)}', 'status': 'error'}, 500


@exams_ns.route('/<int:exam_id>/answer-keys/<int:question_id>')
@exams_ns.param('exam_id', 'The exam identifier')
@exams_ns.param('question_id', 'The question identifier')
class AnswerKeyDetail(Resource):
    @jwt_required()
    @exams_ns.doc(
        description='Get answer key for a specific question (Owner or Admin only). Retrieves the correct answer for a specific question in the exam.',
        security='Bearer Auth',
        responses={
            200: ('Answer key retrieved successfully', answer_key_detail_response),
            403: ('Access denied - Only exam creator or admin can view answer keys', message_response),
            404: ('Answer key not found', message_response)
        }
    )
    @exams_ns.marshal_with(answer_key_detail_response, code=200)
    @require_teacher_or_admin
    def get(self, exam_id, question_id):
        """Get answer key for a specific question"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        answer_key = AnswerKey.query.filter_by(
            exam_id=exam_id,
            question_id=question_id
        ).first_or_404()

        return {
            'answer_key': answer_key.to_dict(),
            'status': 'success'
        }, 200

    @jwt_required()
    @exams_ns.expect(answer_key_model, validate=False)
    @exams_ns.doc(
        description='Update answer key for a question (Owner or Admin only). Updates the correct answer for a specific question.',
        security='Bearer Auth',
        responses={
            200: ('Answer key updated successfully', answer_key_detail_response),
            403: ('Access denied - Only exam creator or admin can update answer keys', message_response),
            404: ('Answer key not found', message_response)
        }
    )
    @require_teacher_or_admin
    def put(self, exam_id, question_id):
        """Update answer key for a question"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        answer_key = AnswerKey.query.filter_by(
            exam_id=exam_id,
            question_id=question_id
        ).first_or_404()

        data = request.get_json()

        # Update fields
        if 'correct_answer' in data:
            answer_key.correct_answer = data['correct_answer']
        if 'answer_type' in data:
            answer_key.answer_type = data['answer_type']
        if 'points' in data:
            answer_key.points = data['points']

        try:
            db.session.commit()
            return {
                'answer_key': answer_key.to_dict(),
                'message': 'Answer key updated successfully',
                'status': 'success'
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to update answer key: {str(e)}', 'status': 'error'}, 500

    @jwt_required()
    @exams_ns.doc(
        description='Delete answer key for a question (Owner or Admin only). Removes the correct answer for a specific question.',
        security='Bearer Auth',
        responses={
            200: ('Answer key deleted successfully', message_response),
            403: ('Access denied - Only exam creator or admin can delete answer keys', message_response),
            404: ('Answer key not found', message_response)
        }
    )
    @exams_ns.marshal_with(message_response, code=200)
    @require_teacher_or_admin
    def delete(self, exam_id, question_id):
        """Delete answer key for a question"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check ownership
        if not is_exam_owner_or_admin(exam, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        answer_key = AnswerKey.query.filter_by(
            exam_id=exam_id,
            question_id=question_id
        ).first_or_404()

        try:
            db.session.delete(answer_key)
            db.session.commit()
            return {'message': 'Answer key deleted successfully', 'status': 'success'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to delete answer key: {str(e)}', 'status': 'error'}, 500
