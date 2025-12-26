"""
OCR Management API Routes (Admin Only)
"""
from flask import Blueprint
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.submission import OCRStrategy, OCRProcessingJob

# Create blueprint
ocr_bp = Blueprint('ocr', __name__)

# Create namespace
ocr_ns = Namespace('ocr', description='OCR management operations (Admin only)')

# Response models
message_response = ocr_ns.model('Message', {
    'message': fields.String,
    'status': fields.String
})

ocr_strategy_model = ocr_ns.model('OCRStrategy', {
    'id': fields.Integer,
    'strategy_name': fields.String,
    'ocr_method': fields.String,
    'language_hints': fields.List(fields.String),
    'description': fields.String,
    'is_active': fields.Boolean,
    'created_at': fields.String
})

ocr_job_model = ocr_ns.model('OCRProcessingJob', {
    'id': fields.Integer,
    'submission_id': fields.Integer,
    'celery_task_id': fields.String,
    'job_status': fields.String,
    'retry_count': fields.Integer,
    'max_retries': fields.Integer,
    'error_details': fields.String,
    'started_at': fields.String,
    'completed_at': fields.String,
    'created_at': fields.String,
    'updated_at': fields.String
})


@ocr_ns.route('/strategies')
class OCRStrategyList(Resource):
    @jwt_required()
    @ocr_ns.doc(
        description='Get list of available OCR strategies',
        security='Bearer Auth',
        responses={
            200: ('Success', [ocr_strategy_model]),
            403: ('Admin access required', message_response)
        }
    )
    def get(self):
        """List all OCR strategies (Admin only)"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user.has_role('admin'):
            return {'message': 'Admin access required', 'status': 'error'}, 403

        strategies = OCRStrategy.query.all()

        return {
            'status': 'success',
            'strategies': [s.to_dict() for s in strategies]
        }, 200

    @jwt_required()
    @ocr_ns.doc(
        description='Create a new OCR strategy',
        security='Bearer Auth',
        responses={
            201: ('Strategy created successfully', ocr_strategy_model),
            403: ('Admin access required', message_response)
        }
    )
    @ocr_ns.expect(ocr_strategy_model)
    def post(self):
        """Create new OCR strategy (Admin only)"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user.has_role('admin'):
            return {'message': 'Admin access required', 'status': 'error'}, 403

        data = ocr_ns.payload

        try:
            strategy = OCRStrategy(
                strategy_name=data.get('strategy_name'),
                ocr_method=data.get('ocr_method'),
                language_hints=data.get('language_hints'),
                description=data.get('description'),
                is_active=data.get('is_active', True)
            )
            db.session.add(strategy)
            db.session.commit()

            return {
                'status': 'success',
                'strategy': strategy.to_dict()
            }, 201

        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to create strategy: {str(e)}', 'status': 'error'}, 500


@ocr_ns.route('/jobs')
class OCRJobList(Resource):
    @jwt_required()
    @ocr_ns.doc(
        description='Get list of OCR processing jobs (for monitoring)',
        security='Bearer Auth',
        responses={
            200: ('Success', [ocr_job_model]),
            403: ('Admin access required', message_response)
        }
    )
    def get(self):
        """List OCR jobs (Admin only)"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user.has_role('admin'):
            return {'message': 'Admin access required', 'status': 'error'}, 403

        # Get recent jobs (last 100)
        jobs = OCRProcessingJob.query.order_by(
            OCRProcessingJob.created_at.desc()
        ).limit(100).all()

        return {
            'status': 'success',
            'jobs': [job.to_dict() for job in jobs],
            'total': len(jobs)
        }, 200


@ocr_ns.route('/jobs/<int:job_id>')
@ocr_ns.param('job_id', 'The OCR job identifier')
class OCRJobDetail(Resource):
    @jwt_required()
    @ocr_ns.doc(
        description='Get OCR job details',
        security='Bearer Auth',
        responses={
            200: ('Success', ocr_job_model),
            403: ('Admin access required', message_response),
            404: ('Job not found', message_response)
        }
    )
    def get(self, job_id):
        """Get OCR job by ID (Admin only)"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user.has_role('admin'):
            return {'message': 'Admin access required', 'status': 'error'}, 403

        job = OCRProcessingJob.query.get_or_404(job_id)

        # Check Celery task status if job is processing
        if job.job_status in ['queued', 'processing']:
            from app import celery
            try:
                task = celery.AsyncResult(job.celery_task_id)
                if task.state:
                    job.job_status = task.state.lower()
                    db.session.commit()
            except Exception:
                pass

        return {
            'status': 'success',
            'job': job.to_dict()
        }, 200


@ocr_ns.route('/stats')
class OCRStats(Resource):
    @jwt_required()
    @ocr_ns.doc(
        description='Get OCR processing statistics',
        security='Bearer Auth',
        responses={
            200: ('Success', message_response),
            403: ('Admin access required', message_response)
        }
    )
    def get(self):
        """Get OCR statistics (Admin only)"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user.has_role('admin'):
            return {'message': 'Admin access required', 'status': 'error'}, 403

        # Calculate statistics
        total_jobs = OCRProcessingJob.query.count()
        completed_jobs = OCRProcessingJob.query.filter_by(job_status='completed').count()
        failed_jobs = OCRProcessingJob.query.filter_by(job_status='failed').count()
        queued_jobs = OCRProcessingJob.query.filter_by(job_status='queued').count()
        processing_jobs = OCRProcessingJob.query.filter_by(job_status='processing').count()

        return {
            'status': 'success',
            'stats': {
                'total_jobs': total_jobs,
                'completed': completed_jobs,
                'failed': failed_jobs,
                'queued': queued_jobs,
                'processing': processing_jobs,
                'success_rate': (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0
            }
        }, 200
