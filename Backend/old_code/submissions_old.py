"""
Submissions Management Routes
Handles student exam paper uploads and submission management
"""
import os
from flask import Blueprint, request, current_app
from flask_restx import Resource, Namespace, fields, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from werkzeug.datastructures import FileStorage
from app import db
from app.models.user import User
from app.models.exam import Exam
from app.models.submission import Submission, SubmissionAnswer, OCRResult
from app.utils.file_upload import save_uploaded_file, delete_file, allowed_file
from app.api import api

submissions_bp = Blueprint('submissions', __name__)
submissions_ns = Namespace('submissions', description='Student submission operations')

# File upload parser for Swagger UI
upload_parser = reqparse.RequestParser()
upload_parser.add_argument('file', type=FileStorage, location='files', required=True, help='Scanned exam paper (PNG, JPG, JPEG, or PDF)')
upload_parser.add_argument('exam_id', type=int, required=False, help='Exam ID (required - can be provided as query parameter or form data)')
upload_parser.add_argument('student_id', type=int, required=False, help='Student ID (optional, for teachers/admins only - can be query parameter or form data)')

# Multi-image upload parser
multi_image_upload_parser = reqparse.RequestParser()
multi_image_upload_parser.add_argument('images', type=FileStorage, location='files', required=True, action='append', help='Multiple scanned exam paper images (PNG, JPG, JPEG)')
multi_image_upload_parser.add_argument('exam_id', type=int, required=False, help='Exam ID (required - can be provided as query parameter or form data)')
multi_image_upload_parser.add_argument('student_id', type=int, required=False, help='Student ID (optional, for teachers/admins only - can be query parameter or form data)')

# ============================================================================
# REQUEST/RESPONSE MODELS FOR SWAGGER
# ============================================================================

submission_answer_model = api.model('SubmissionAnswer', {
    'id': fields.Integer(description='Answer ID', example=1),
    'submission_id': fields.Integer(description='Submission ID', example=1),
    'question_id': fields.Integer(description='Question ID', example=1),
    'answer_text': fields.String(description='Extracted answer text from OCR', example='Paris'),
    'answer_option_id': fields.Integer(description='Selected option ID (for multiple choice)', example=1),
    'confidence_score': fields.Float(description='OCR confidence score (0-1)', example=0.95),
    'is_auto_graded': fields.Boolean(description='Whether answer was auto-graded', example=True),
    'auto_grade_score': fields.Float(description='Score from automated grading', example=5.0),
    'created_at': fields.String(description='Creation date (ISO format)', example='2025-12-05T10:30:00.123456'),
    'updated_at': fields.String(description='Last update date (ISO format)', example='2025-12-05T10:30:00.123456')
})

grade_summary_model = api.model('GradeSummary', {
    'id': fields.Integer(description='Grade ID', example=1),
    'total_score': fields.Float(description='Total score', example=85.0),
    'max_score': fields.Float(description='Maximum possible score', example=100.0),
    'percentage': fields.Float(description='Percentage score', example=85.0),
    'is_finalized': fields.Boolean(description='Is grade finalized by teacher', example=False)
})

submission_response_model = api.model('SubmissionResponse', {
    'id': fields.Integer(description='Submission ID', example=1),
    'exam_id': fields.Integer(description='Exam ID', example=1),
    'student_id': fields.Integer(description='Student ID', example=5),
    'scanned_paper_path': fields.String(description='Path to scanned paper file', example='uploads/submissions/exam1_student5_20251205.pdf'),
    'submission_status': fields.String(description='Status: pending, processing, completed, failed', example='completed'),
    'submitted_at': fields.String(description='Submission date (ISO format)', example='2025-12-05T10:30:00.123456'),
    'processed_at': fields.String(description='Processing completion date (ISO format)', example='2025-12-05T10:35:00.123456'),
    'created_at': fields.String(description='Creation date (ISO format)', example='2025-12-05T10:30:00.123456'),
    'updated_at': fields.String(description='Last update date (ISO format)', example='2025-12-05T10:35:00.123456')
})

submission_detail_model = api.model('SubmissionDetail', {
    'id': fields.Integer(description='Submission ID', example=1),
    'exam_id': fields.Integer(description='Exam ID', example=1),
    'student_id': fields.Integer(description='Student ID', example=5),
    'scanned_paper_path': fields.String(description='Path to scanned paper file', example='uploads/submissions/exam1_student5_20251205.pdf'),
    'submission_status': fields.String(description='Status: pending, processing, completed, failed', example='completed'),
    'submitted_at': fields.String(description='Submission date (ISO format)', example='2025-12-05T10:30:00.123456'),
    'processed_at': fields.String(description='Processing completion date (ISO format)', example='2025-12-05T10:35:00.123456'),
    'created_at': fields.String(description='Creation date (ISO format)', example='2025-12-05T10:30:00.123456'),
    'updated_at': fields.String(description='Last update date (ISO format)', example='2025-12-05T10:35:00.123456'),
    'answers': fields.List(fields.Nested(submission_answer_model), description='Submission answers'),
    'grade': fields.Nested(grade_summary_model, description='Grade information')
})

submission_list_response = api.model('SubmissionListResponse', {
    'submissions': fields.List(fields.Nested(submission_response_model), description='List of submissions'),
    'total': fields.Integer(description='Total number of submissions', example=25),
    'page': fields.Integer(description='Current page number', example=1),
    'per_page': fields.Integer(description='Items per page', example=10),
    'status': fields.String(description='Response status', example='success')
})

submission_detail_response = api.model('SubmissionDetailResponse', {
    'submission': fields.Nested(submission_detail_model, description='Submission object with answers and grade'),
    'status': fields.String(description='Response status', example='success')
})

submission_create_response = api.model('SubmissionCreateResponse', {
    'submission': fields.Nested(submission_response_model, description='Created submission object'),
    'message': fields.String(description='Response message', example='Exam paper uploaded successfully. Processing will begin shortly.'),
    'status': fields.String(description='Response status', example='success')
})

message_response = api.model('MessageResponse', {
    'message': fields.String(description='Response message', example='Operation completed successfully'),
    'status': fields.String(description='Response status', example='success')
})


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def can_access_submission(submission, user):
    """Check if user can access submission"""
    # Students can only access their own submissions
    if user.has_role('student'):
        return submission.student_id == user.id
    # Teachers can access submissions for their exams
    elif user.has_role('teacher'):
        return submission.exam.creator_id == user.id
    # Admins can access all submissions
    elif user.has_role('admin'):
        return True
    return False


# ============================================================================
# SUBMISSIONS ENDPOINTS
# ============================================================================

@submissions_ns.route('')
class SubmissionList(Resource):
    @jwt_required()
    @submissions_ns.doc(
        description='Get list of submissions with pagination. Students see only their own submissions, teachers see submissions for their exams, admins see all submissions.',
        security='Bearer Auth',
        params={
            'page': {'description': 'Page number (default: 1)', 'type': 'integer', 'default': 1},
            'per_page': {'description': 'Items per page (default: 10, max: 100)', 'type': 'integer', 'default': 10},
            'exam_id': {'description': 'Filter by exam ID', 'type': 'integer'},
            'status': {'description': 'Filter by submission status (pending, processing, completed, failed)', 'type': 'string'}
        },
        responses={
            200: ('Submissions retrieved successfully', submission_list_response),
            403: ('Invalid user role', message_response),
            404: ('User not found', message_response)
        }
    )
    @submissions_ns.marshal_with(submission_list_response, code=200)
    def get(self):
        """Get list of submissions"""
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
        status = request.args.get('status')

        # Build query based on user role
        if user.has_role('student'):
            # Students see only their own submissions
            query = Submission.query.filter_by(student_id=user.id)
        elif user.has_role('teacher'):
            # Teachers see submissions for their exams
            query = Submission.query.join(Exam).filter(Exam.creator_id == user.id)
        elif user.has_role('admin'):
            # Admins see all submissions
            query = Submission.query
        else:
            return {'message': 'Invalid user role', 'status': 'error'}, 403

        # Apply filters
        if exam_id:
            query = query.filter(Submission.exam_id == exam_id)
        if status:
            query = query.filter(Submission.submission_status == status)

        # Execute query with pagination
        pagination = query.order_by(Submission.submitted_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return {
            'submissions': [sub.to_dict() for sub in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'status': 'success'
        }, 200

    @jwt_required()
    @submissions_ns.expect(upload_parser)
    @submissions_ns.doc(
        description='Upload scanned exam paper. Students can submit their own papers. Teachers/Admins can submit on behalf of students by providing student_id. Supported formats: PNG, JPG, JPEG, PDF. Only one submission per student per exam is allowed.',
        security='Bearer Auth',
        responses={
            201: ('Exam paper uploaded successfully', submission_create_response),
            400: ('Validation error - Missing file or invalid exam', message_response),
            403: ('Insufficient permissions or exam not available for submission', message_response),
            404: ('User or exam not found', message_response),
            409: ('Submission already exists for this exam', submission_create_response)
        }
    )
    def post(self):
        """Upload scanned exam paper"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user:
            return {'message': 'User not found', 'status': 'error'}, 404

        # Students can submit, teachers/admins can submit on behalf of students
        if not (user.has_role('student') or user.has_role('teacher') or user.has_role('admin')):
            return {'message': 'Insufficient permissions', 'status': 'error'}, 403

        # Get exam_id from either form data or query parameters (for flexibility)
        exam_id = request.form.get('exam_id', type=int) or request.args.get('exam_id', type=int)
        if not exam_id:
            return {'message': 'exam_id is required', 'status': 'error'}, 400

        # Verify exam exists and is published
        exam = Exam.query.get_or_404(exam_id)

        # Check if exam is published and active (students only)
        if user.has_role('student'):
            if not exam.is_published or not exam.is_active:
                return {'message': 'Exam not available for submission', 'status': 'error'}, 403

            # Check if within exam timeframe
            now = datetime.utcnow()
            if exam.start_date and now < exam.start_date:
                return {'message': 'Exam has not started yet', 'status': 'error'}, 403
            if exam.end_date and now > exam.end_date:
                return {'message': 'Exam submission period has ended', 'status': 'error'}, 403

        # Get student_id (teachers/admins can specify, otherwise use their own ID for testing)
        if user.has_role('teacher') or user.has_role('admin'):
            student_id = request.form.get('student_id', type=int) or request.args.get('student_id', type=int)

            if student_id:
                # Verify student exists if provided (skip validation for now due to date parsing issues)
                # TODO: Fix User model date parsing
                pass
            else:
                # Default to current user for testing purposes
                student_id = user.id
        else:
            student_id = user.id

        # Check if submission already exists
        existing_submission = Submission.query.filter_by(
            exam_id=exam_id,
            student_id=student_id
        ).first()

        if existing_submission:
            return {
                'message': 'Submission already exists for this exam',
                'status': 'error',
                'submission': existing_submission.to_dict()
            }, 409

        # Check if file was uploaded
        if 'file' not in request.files:
            return {'message': 'No file uploaded', 'status': 'error'}, 400

        file = request.files['file']

        if file.filename == '':
            return {'message': 'No file selected', 'status': 'error'}, 400

        # Save file
        upload_result = save_uploaded_file(
            file,
            subfolder='submissions',
            prefix=f'exam{exam_id}_student{student_id}_'
        )

        if not upload_result['success']:
            return {'message': upload_result['error'], 'status': 'error'}, 400

        try:
            # Create submission record
            submission = Submission(
                exam_id=exam_id,
                student_id=student_id,
                scanned_paper_path=upload_result['filepath'],
                submission_status='pending'  # Will be processed by OCR service
            )

            db.session.add(submission)
            db.session.commit()

            # Trigger OCR processing (async with Celery)
            from app.services.tasks.ocr_tasks import process_submission_ocr
            from app.models.submission import OCRProcessingJob
            from app import celery

            # Dispatch Celery task
            task = celery.send_task(
                'app.services.tasks.ocr_tasks.process_submission_ocr',
                args=[submission.id]
            )

            # Create OCR processing job record
            ocr_job = OCRProcessingJob(
                submission_id=submission.id,
                celery_task_id=task.id,
                job_status='queued'
            )
            db.session.add(ocr_job)
            db.session.commit()

            return {
                'submission': submission.to_dict(),
                'task_id': task.id,
                'message': 'Exam paper uploaded successfully. OCR processing has been queued.',
                'status': 'success'
            }, 201

        except Exception as e:
            db.session.rollback()
            # Delete uploaded file if database operation failed
            delete_file(upload_result['filepath'])
            return {'message': f'Failed to create submission: {str(e)}', 'status': 'error'}, 500


@submissions_ns.route('/<int:submission_id>')
@submissions_ns.param('submission_id', 'The submission identifier')
class SubmissionDetail(Resource):
    @jwt_required()
    @submissions_ns.doc(
        description='Get submission details with answers and grade. Students can only view their own submissions. Teachers can view submissions for their exams. Admins can view all submissions.',
        security='Bearer Auth',
        responses={
            200: ('Submission retrieved successfully', submission_detail_response),
            403: ('Access denied', message_response),
            404: ('Submission not found', message_response)
        }
    )
    @submissions_ns.marshal_with(submission_detail_response, code=200)
    def get(self, submission_id):
        """Get submission by ID"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        # Check permissions
        if not can_access_submission(submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        return {
            'submission': submission.to_dict(include_answers=True, include_grade=True),
            'status': 'success'
        }, 200

    @jwt_required()
    @submissions_ns.doc(
        description='Delete submission (Student owner, exam creator, or admin only). Completed submissions can only be deleted by admins. The associated scanned paper file will also be deleted.',
        security='Bearer Auth',
        responses={
            200: ('Submission deleted successfully', message_response),
            403: ('Access denied or cannot delete completed submission', message_response),
            404: ('Submission not found', message_response)
        }
    )
    @submissions_ns.marshal_with(message_response, code=200)
    def delete(self, submission_id):
        """Delete submission"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        # Check permissions
        if not can_access_submission(submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Only allow deletion if not yet processed or by admin
        if submission.submission_status == 'completed' and not user.has_role('admin'):
            return {'message': 'Cannot delete completed submission', 'status': 'error'}, 403

        try:
            # Delete associated file
            if submission.scanned_paper_path:
                delete_file(submission.scanned_paper_path)

            db.session.delete(submission)
            db.session.commit()
            return {'message': 'Submission deleted successfully', 'status': 'success'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to delete submission: {str(e)}', 'status': 'error'}, 500


@submissions_ns.route('/<int:submission_id>/reprocess')
@submissions_ns.param('submission_id', 'The submission identifier')
class SubmissionReprocess(Resource):
    @jwt_required()
    @submissions_ns.doc(
        description='Trigger reprocessing of submission (Teacher or Admin only). Resets submission status to pending and queues it for OCR and grading. Teachers can only reprocess submissions for their exams.',
        security='Bearer Auth',
        responses={
            200: ('Submission queued for reprocessing', submission_detail_response),
            403: ('Requires teacher or admin role or access denied', message_response),
            404: ('Submission not found', message_response)
        }
    )
    @submissions_ns.marshal_with(submission_detail_response, code=200)
    def post(self, submission_id):
        """Reprocess submission (re-run OCR and grading)"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        # Only teachers/admins can reprocess
        if not (user.has_role('teacher') or user.has_role('admin')):
            return {'message': 'Requires teacher or admin role', 'status': 'error'}, 403

        # Check if user has access (teachers can only reprocess their exam submissions)
        if user.has_role('teacher') and submission.exam.creator_id != user.id:
            return {'message': 'Access denied', 'status': 'error'}, 403

        try:
            # Reset submission status
            submission.submission_status = 'pending'
            submission.processed_at = None

            # Cancel any existing OCR jobs for this submission
            from app.models.submission import OCRProcessingJob
            from app import celery

            existing_jobs = OCRProcessingJob.query.filter_by(
                submission_id=submission.id
            ).filter(OCRProcessingJob.job_status.in_(['queued', 'processing'])).all()

            for job in existing_jobs:
                # Revoke Celery task
                if job.celery_task_id:
                    celery.control.revoke(job.celery_task_id, terminate=True)
                job.job_status = 'cancelled'

            # Trigger new OCR processing
            from app.services.tasks.ocr_tasks import process_submission_ocr

            task = celery.send_task(
                'app.services.tasks.ocr_tasks.process_submission_ocr',
                args=[submission.id]
            )

            # Create new OCR processing job
            ocr_job = OCRProcessingJob(
                submission_id=submission.id,
                celery_task_id=task.id,
                job_status='queued'
            )
            db.session.add(ocr_job)
            db.session.commit()

            return {
                'submission': submission.to_dict(),
                'task_id': task.id,
                'message': 'Submission queued for reprocessing',
                'status': 'success'
            }, 200

        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to reprocess submission: {str(e)}', 'status': 'error'}, 500


@submissions_ns.route('/exam/<int:exam_id>')
@submissions_ns.param('exam_id', 'The exam identifier')
class ExamSubmissionsList(Resource):
    @jwt_required()
    @submissions_ns.doc(
        description='Get all submissions for a specific exam. Students see only their own submission. Teachers see all submissions for their exams. Admins see all submissions.',
        security='Bearer Auth',
        responses={
            200: ('Submissions retrieved successfully', submission_list_response),
            403: ('Access denied - Teachers can only view submissions for their exams', message_response),
            404: ('Exam not found', message_response)
        }
    )
    @submissions_ns.marshal_with(submission_list_response, code=200)
    def get(self, exam_id):
        """Get all submissions for a specific exam"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check permissions
        if user.has_role('student'):
            # Students can only see their own submission
            submission = Submission.query.filter_by(
                exam_id=exam_id,
                student_id=user.id
            ).first()

            if not submission:
                return {'submissions': [], 'total': 0, 'status': 'success'}, 200

            return {
                'submissions': [submission.to_dict()],
                'total': 1,
                'status': 'success'
            }, 200

        elif user.has_role('teacher'):
            # Teachers can only see submissions for their exams
            if exam.creator_id != user.id:
                return {'message': 'Access denied', 'status': 'error'}, 403

        # Teachers and admins see all submissions for the exam
        submissions = Submission.query.filter_by(exam_id=exam_id).all()

        return {
            'submissions': [sub.to_dict() for sub in submissions],
            'total': len(submissions),
            'status': 'success'
        }, 200


@submissions_ns.route('/student/<int:student_id>')
@submissions_ns.param('student_id', 'The student user identifier')
class StudentSubmissionsList(Resource):
    @jwt_required()
    @submissions_ns.doc(
        description='Get all submissions for a specific student. Students can only view their own submissions. Teachers can view submissions for their exams. Admins can view all submissions for any student.',
        security='Bearer Auth',
        responses={
            200: ('Submissions retrieved successfully', submission_list_response),
            400: ('User is not a student', message_response),
            403: ('Access denied', message_response),
            404: ('Student not found', message_response)
        }
    )
    @submissions_ns.marshal_with(submission_list_response, code=200)
    def get(self, student_id):
        """Get all submissions for a specific student"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        # Check permissions
        if user.has_role('student'):
            # Students can only view their own submissions
            if int(current_user_id) != student_id:
                return {'message': 'Access denied', 'status': 'error'}, 403
        elif user.has_role('teacher'):
            # Teachers can only see submissions for their exams
            # We'll filter the results below
            pass
        elif not user.has_role('admin'):
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Verify student exists
        student = User.query.get_or_404(student_id)
        if not student.has_role('student'):
            return {'message': 'User is not a student', 'status': 'error'}, 400

        # Get submissions
        query = Submission.query.filter_by(student_id=student_id)

        # Filter for teachers to only show submissions for their exams
        if user.has_role('teacher'):
            query = query.join(Exam).filter(Exam.creator_id == user.id)

        submissions = query.all()

        return {
            'submissions': [sub.to_dict() for sub in submissions],
            'total': len(submissions),
            'status': 'success'
        }, 200


@submissions_ns.route('/<int:submission_id>/ocr-status')
@submissions_ns.param('submission_id', 'The submission identifier')
class SubmissionOCRStatus(Resource):
    @jwt_required()
    @submissions_ns.doc(
        description='Get OCR processing status for a submission',
        security='Bearer Auth',
        responses={
            200: ('OCR status retrieved successfully', message_response),
            403: ('Access denied', message_response),
            404: ('Submission not found', message_response)
        }
    )
    def get(self, submission_id):
        """Get OCR job status"""
        from app.models.submission import OCRProcessingJob

        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        if not can_access_submission(submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Get latest OCR job
        job = OCRProcessingJob.query.filter_by(
            submission_id=submission_id
        ).order_by(OCRProcessingJob.created_at.desc()).first()

        if not job:
            return {
                'status': 'no_job',
                'message': 'No OCR processing job found'
            }, 200

        # Check Celery task status if job is processing
        if job.job_status in ['queued', 'processing']:
            from app import celery
            try:
                task = celery.AsyncResult(job.celery_task_id)
                if task.state:
                    job.job_status = task.state.lower()
            except Exception:
                pass  # Keep current status if we can't check

        return {
            'status': 'success',
            'job': job.to_dict()
        }, 200


@submissions_ns.route('/<int:submission_id>/ocr-results')
@submissions_ns.param('submission_id', 'The submission identifier')
class SubmissionOCRResults(Resource):
    @jwt_required()
    @submissions_ns.doc(
        description='Get detailed OCR results for a submission',
        security='Bearer Auth',
        responses={
            200: ('OCR results retrieved successfully', message_response),
            403: ('Access denied', message_response),
            404: ('Submission not found', message_response)
        }
    )
    def get(self, submission_id):
        """Get OCR results"""
        from app.models.submission import OCRResult

        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        if not can_access_submission(submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        ocr_results = OCRResult.query.filter_by(
            submission_id=submission_id
        ).all()

        return {
            'status': 'success',
            'ocr_results': [result.to_dict() for result in ocr_results]
        }, 200


@submissions_ns.route('/create-from-images')
class SubmissionFromImages(Resource):
    @jwt_required()
    @submissions_ns.expect(multi_image_upload_parser)
    @submissions_ns.doc(
        description='Upload multiple scanned exam paper images and create a single PDF. Students can submit their own papers. Teachers/Admins can submit on behalf of students by providing student_id. Supported formats: PNG, JPG, JPEG. Only one submission per student per exam is allowed. The images will be combined into a single PDF in the order provided.',
        security='Bearer Auth',
        responses={
            201: ('PDF created and exam paper uploaded successfully', submission_create_response),
            400: ('Validation error - Missing images or invalid exam', message_response),
            403: ('Insufficient permissions or exam not available for submission', message_response),
            404: ('User or exam not found', message_response),
            409: ('Submission already exists for this exam', submission_create_response)
        }
    )
    def post(self):
        """Create PDF from multiple images and upload as exam submission"""
        import tempfile
        import uuid as uuid_lib
        from app.utils.pdf_utils import images_to_pdf, allowed_file

        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user:
            return {'message': 'User not found', 'status': 'error'}, 404

        # Students can submit, teachers/admins can submit on behalf of students
        if not (user.has_role('student') or user.has_role('teacher') or user.has_role('admin')):
            return {'message': 'Insufficient permissions', 'status': 'error'}, 403

        # Get exam_id from either form data or query parameters
        exam_id = request.form.get('exam_id', type=int) or request.args.get('exam_id', type=int)
        if not exam_id:
            return {'message': 'exam_id is required', 'status': 'error'}, 400

        # Verify exam exists and is published
        exam = Exam.query.get_or_404(exam_id)

        # Check if exam is published and active (students only)
        if user.has_role('student'):
            if not exam.is_published or not exam.is_active:
                return {'message': 'Exam not available for submission', 'status': 'error'}, 403

            # Check if within exam timeframe
            now = datetime.utcnow()
            if exam.start_date and now < exam.start_date:
                return {'message': 'Exam has not started yet', 'status': 'error'}, 403
            if exam.end_date and now > exam.end_date:
                return {'message': 'Exam submission period has ended', 'status': 'error'}, 403

        # Get student_id
        if user.has_role('teacher') or user.has_role('admin'):
            student_id = request.form.get('student_id', type=int) or request.args.get('student_id', type=int)
            if not student_id:
                student_id = user.id
        else:
            student_id = user.id

        # Check if submission already exists
        existing_submission = Submission.query.filter_by(
            exam_id=exam_id,
            student_id=student_id
        ).first()

        if existing_submission:
            return {
                'message': 'Submission already exists for this exam',
                'status': 'error',
                'submission': existing_submission.to_dict()
            }, 409

        # Get uploaded images
        images = request.files.getlist('images')

        if not images or len(images) == 0:
            return {'message': 'No images uploaded. Please provide at least one image.', 'status': 'error'}, 400

        # Validate all images
        temp_image_paths = []
        allowed_image_extensions = {'png', 'jpg', 'jpeg'}

        try:
            for i, image_file in enumerate(images):
                if image_file.filename == '':
                    return {'message': f'Image {i+1} has no filename', 'status': 'error'}, 400

                # Check file extension
                if not allowed_file(image_file.filename, allowed_image_extensions):
                    return {
                        'success': False,
                        'error': f'Image {i+1} has invalid type. Only PNG, JPG, and JPEG are allowed for multi-image upload.'
                    }, 400

                # Save to temporary location
                temp_dir = tempfile.gettempdir()
                temp_filename = f"temp_upload_{uuid_lib.uuid4().hex}_{image_file.filename}"
                temp_path = os.path.join(temp_dir, temp_filename)
                image_file.save(temp_path)
                temp_image_paths.append(temp_path)

            # Create PDF from images
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            unique_id = str(uuid_lib.uuid4())[:8]
            pdf_filename = f"exam{exam_id}_student{student_id}_{timestamp}_{unique_id}.pdf"

            # Determine output path
            upload_base = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            pdf_dir = os.path.join(upload_base, 'submissions')
            os.makedirs(pdf_dir, exist_ok=True)
            pdf_path = os.path.join(pdf_dir, pdf_filename)

            # Convert images to PDF
            pdf_result = images_to_pdf(temp_image_paths, pdf_path)

            if not pdf_result['success']:
                return {'message': pdf_result['error'], 'status': 'error'}, 400

            # Clean up temporary image files
            for temp_path in temp_image_paths:
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

            # Create submission record
            relative_pdf_path = os.path.join('submissions', pdf_filename).replace('\\', '/')

            submission = Submission(
                exam_id=exam_id,
                student_id=student_id,
                scanned_paper_path=relative_pdf_path,
                submission_status='pending',
                page_count=pdf_result['page_count']
            )

            db.session.add(submission)
            db.session.commit()

            # Trigger OCR processing (async with Celery)
            from app.services.tasks.ocr_tasks import process_submission_ocr
            from app.models.submission import OCRProcessingJob
            from app import celery

            # Dispatch Celery task
            task = celery.send_task(
                'app.services.tasks.ocr_tasks.process_submission_ocr',
                args=[submission.id]
            )

            # Create OCR processing job record
            ocr_job = OCRProcessingJob(
                submission_id=submission.id,
                celery_task_id=task.id,
                job_status='queued'
            )
            db.session.add(ocr_job)
            db.session.commit()

            return {
                'submission': submission.to_dict(),
                'task_id': task.id,
                'message': f'PDF created from {len(images)} image(s) and uploaded successfully. OCR processing has been queued.',
                'status': 'success',
                'page_count': pdf_result['page_count']
            }, 201

        except Exception as e:
            db.session.rollback()

            # Clean up temporary files
            for temp_path in temp_image_paths:
                try:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                except Exception:
                    pass

            # Delete PDF if it was created
            try:
                if 'pdf_path' in locals() and os.path.exists(pdf_path):
                    os.remove(pdf_path)
            except Exception:
                pass

            return {'message': f'Failed to create submission: {str(e)}', 'status': 'error'}, 500
