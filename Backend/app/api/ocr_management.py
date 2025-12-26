"""
Advanced OCR Management Routes
Handles PDF generation, missing question detection, bulk operations, and reports
"""
from flask import Blueprint, request, send_file, current_app
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from io import BytesIO
import os
from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from app import db
from app.models.user import User
from app.models.exam import Exam, Question
from app.models.submission import Submission, SubmissionAnswer, OCRResult
from app.api import api

ocr_management_bp = Blueprint('ocr_management', __name__)
ocr_management_ns = Namespace('ocr-management', description='Advanced OCR operations and reports')

# ============================================================================
# REQUEST/RESPONSE MODELS FOR SWAGGER
# ============================================================================

missing_question_model = api.model('MissingQuestion', {
    'question_id': fields.Integer(description='Question ID', example=5),
    'question_text': fields.String(description='Question text', example='What is the capital of France?'),
    'question_number': fields.Integer(description='Question order number', example=5),
    'points': fields.Float(description='Points for this question', example=10.0),
    'detected': fields.Boolean(description='Whether question was detected in OCR', example=False),
    'possible_matches': fields.List(fields.String, description='Possible text matches found in OCR', example=[])
})

missing_questions_response = api.model('MissingQuestionsResponse', {
    'submission_id': fields.Integer(description='Submission ID', example=1),
    'exam_id': fields.Integer(description='Exam ID', example=3),
    'total_questions': fields.Integer(description='Total questions in exam', example=10),
    'detected_questions': fields.Integer(description='Number of questions detected', example=8),
    'missing_questions': fields.List(fields.Nested(missing_question_model), description='Questions not detected'),
    'detection_rate': fields.Float(description='Percentage of questions detected', example=80.0),
    'status': fields.String(description='Response status', example='success')
})

pdf_generation_response = api.model('PDFGenerationResponse', {
    'submission_id': fields.Integer(description='Submission ID', example=1),
    'pdf_path': fields.String(description='Path to generated PDF', example='/uploads/pdfs/submission_1.pdf'),
    'pdf_url': fields.String(description='URL to download PDF', example='/api/v1/ocr-management/download-pdf/1'),
    'page_count': fields.Integer(description='Number of pages in PDF', example=3),
    'file_size': fields.Integer(description='PDF file size in bytes', example=1024000),
    'generated_at': fields.String(description='Generation timestamp', example='2025-12-11T10:00:00'),
    'message': fields.String(description='Response message', example='PDF generated successfully'),
    'status': fields.String(description='Response status', example='success')
})

bulk_pdf_response = api.model('BulkPDFResponse', {
    'exam_id': fields.Integer(description='Exam ID', example=3),
    'total_submissions': fields.Integer(description='Total submissions processed', example=25),
    'successful': fields.Integer(description='Successfully generated PDFs', example=24),
    'failed': fields.Integer(description='Failed PDF generations', example=1),
    'pdf_urls': fields.List(fields.String, description='URLs to download PDFs'),
    'zip_url': fields.String(description='URL to download all PDFs as ZIP', example='/api/v1/ocr-management/download-exam-pdfs/3'),
    'message': fields.String(description='Response message', example='Bulk PDF generation completed'),
    'status': fields.String(description='Response status', example='success')
})

ocr_quality_report = api.model('OCRQualityReport', {
    'submission_id': fields.Integer(description='Submission ID', example=1),
    'average_confidence': fields.Float(description='Average OCR confidence score', example=0.92),
    'low_confidence_areas': fields.List(fields.Raw, description='Areas with low OCR confidence'),
    'text_clarity_score': fields.Float(description='Overall text clarity (0-1)', example=0.88),
    'image_quality_score': fields.Float(description='Image quality score (0-1)', example=0.95),
    'recommendations': fields.List(fields.String, description='Recommendations for improvement'),
    'status': fields.String(description='Response status', example='success')
})

exam_ocr_statistics = api.model('ExamOCRStatistics', {
    'exam_id': fields.Integer(description='Exam ID', example=3),
    'total_submissions': fields.Integer(description='Total submissions', example=25),
    'processed_submissions': fields.Integer(description='OCR processed submissions', example=23),
    'pending_submissions': fields.Integer(description='Pending OCR', example=2),
    'failed_submissions': fields.Integer(description='Failed OCR', example=0),
    'average_confidence': fields.Float(description='Average OCR confidence', example=0.91),
    'average_processing_time': fields.Float(description='Average OCR time (seconds)', example=2.5),
    'questions_missing_rate': fields.Float(description='Average missing questions rate', example=5.0),
    'status': fields.String(description='Response status', example='success')
})

message_response = api.model('MessageResponse', {
    'message': fields.String(description='Response message'),
    'status': fields.String(description='Response status')
})


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def can_access_submission(submission, user):
    """Check if user can access submission"""
    if user.has_role('student'):
        return submission.student_id == user.id
    elif user.has_role('teacher'):
        return submission.exam.creator_id == user.id
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


def generate_pdf_from_images(submission):
    """Generate PDF from submission images"""
    try:
        # Create uploads/pdfs directory if it doesn't exist
        pdf_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'pdfs')
        os.makedirs(pdf_dir, exist_ok=True)

        # PDF output path
        pdf_filename = f"submission_{submission.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        pdf_path = os.path.join(pdf_dir, pdf_filename)

        # Get image path
        image_path = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), submission.scanned_paper_path)

        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        # Open image
        img = Image.open(image_path)

        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')

        # Calculate PDF page size based on image
        img_width, img_height = img.size
        aspect_ratio = img_height / img_width

        # Use letter size as base
        page_width, page_height = letter
        if aspect_ratio > (page_height / page_width):
            # Portrait image - fit to height
            new_height = page_height
            new_width = page_height / aspect_ratio
        else:
            # Landscape image - fit to width
            new_width = page_width
            new_height = page_width * aspect_ratio

        # Create PDF
        c = canvas.Canvas(pdf_path, pagesize=letter)

        # Add image to PDF
        c.drawImage(image_path,
                    (page_width - new_width) / 2,  # Center horizontally
                    (page_height - new_height) / 2,  # Center vertically
                    width=new_width,
                    height=new_height)

        # Add metadata
        c.setTitle(f"Submission {submission.id}")
        c.setAuthor(f"Student ID: {submission.student_id}")
        c.setSubject(f"Exam ID: {submission.exam_id}")

        c.save()

        return pdf_path, pdf_filename

    except Exception as e:
        raise Exception(f"PDF generation failed: {str(e)}")


def detect_missing_questions(submission):
    """Detect which exam questions are missing from OCR results"""
    # Get all questions for the exam
    questions = Question.query.filter_by(exam_id=submission.exam_id).order_by(Question.order_number).all()

    # Get all detected answers
    detected_answers = SubmissionAnswer.query.filter_by(submission_id=submission.id).all()
    detected_question_ids = {answer.question_id for answer in detected_answers}

    # Get OCR text
    ocr_results = OCRResult.query.filter_by(submission_id=submission.id).all()
    ocr_text = " ".join([result.raw_text or "" for result in ocr_results]).lower()

    missing_questions = []
    for question in questions:
        if question.id not in detected_question_ids:
            # Check if question text appears in OCR (possible matches)
            question_text_lower = question.question_text.lower()
            words = question_text_lower.split()[:5]  # First 5 words
            possible_matches = []

            for word in words:
                if len(word) > 3 and word in ocr_text:
                    possible_matches.append(word)

            missing_questions.append({
                'question_id': question.id,
                'question_text': question.question_text,
                'question_number': question.order_number,
                'points': question.points,
                'detected': False,
                'possible_matches': possible_matches
            })

    return {
        'total_questions': len(questions),
        'detected_questions': len(detected_question_ids),
        'missing_questions': missing_questions,
        'detection_rate': (len(detected_question_ids) / len(questions) * 100) if questions else 0
    }


# ============================================================================
# MISSING QUESTION DETECTION ENDPOINTS
# ============================================================================

@ocr_management_ns.route('/submissions/<int:submission_id>/missing-questions')
@ocr_management_ns.param('submission_id', 'The submission identifier')
class MissingQuestionsDetection(Resource):
    @jwt_required()
    @ocr_management_ns.doc(
        description='Detect questions from the exam that were not found in the OCR results. This helps identify incomplete submissions or OCR detection issues. Returns list of missing questions with possible text matches.',
        security='Bearer Auth',
        responses={
            200: ('Missing questions detected', missing_questions_response),
            403: ('Access denied', message_response),
            404: ('Submission not found or OCR not processed', message_response)
        }
    )
    @ocr_management_ns.marshal_with(missing_questions_response, code=200)
    def get(self, submission_id):
        """Detect missing questions in submission"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        # Check permissions
        if not can_access_submission(submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Check if OCR is processed
        if submission.submission_status not in ['completed', 'failed']:
            return {'message': 'OCR not yet processed', 'status': 'error'}, 404

        try:
            result = detect_missing_questions(submission)
            result['submission_id'] = submission_id
            result['exam_id'] = submission.exam_id
            result['status'] = 'success'
            return result, 200

        except Exception as e:
            return {'message': f'Failed to detect missing questions: {str(e)}', 'status': 'error'}, 500


# ============================================================================
# PDF GENERATION ENDPOINTS
# ============================================================================

@ocr_management_ns.route('/submissions/<int:submission_id>/generate-pdf')
@ocr_management_ns.param('submission_id', 'The submission identifier')
class GeneratePDF(Resource):
    @jwt_required()
    @ocr_management_ns.doc(
        description='Generate PDF from scanned exam paper images. Converts the uploaded image(s) to a single PDF document with proper formatting. Teachers can generate PDFs for all submissions in their exams.',
        security='Bearer Auth',
        responses={
            200: ('PDF generated successfully', pdf_generation_response),
            403: ('Access denied', message_response),
            404: ('Submission not found or image missing', message_response),
            500: ('PDF generation failed', message_response)
        }
    )
    @ocr_management_ns.marshal_with(pdf_generation_response, code=200)
    def post(self, submission_id):
        """Generate PDF from submission images"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        # Check permissions
        if not can_access_submission(submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        try:
            pdf_path, pdf_filename = generate_pdf_from_images(submission)

            # Get file size
            file_size = os.path.getsize(pdf_path)

            return {
                'submission_id': submission_id,
                'pdf_path': f"pdfs/{pdf_filename}",
                'pdf_url': f"/api/v1/ocr-management/download-pdf/{submission_id}",
                'page_count': submission.page_count or 1,
                'file_size': file_size,
                'generated_at': datetime.utcnow().isoformat(),
                'message': 'PDF generated successfully',
                'status': 'success'
            }, 200

        except FileNotFoundError as e:
            return {'message': str(e), 'status': 'error'}, 404
        except Exception as e:
            return {'message': f'PDF generation failed: {str(e)}', 'status': 'error'}, 500


@ocr_management_ns.route('/download-pdf/<int:submission_id>')
@ocr_management_ns.param('submission_id', 'The submission identifier')
class DownloadPDF(Resource):
    @jwt_required()
    @ocr_management_ns.doc(
        description='Download generated PDF for a submission. Returns the PDF file for download.',
        security='Bearer Auth',
        responses={
            200: 'PDF file',
            403: ('Access denied', message_response),
            404: ('PDF not found', message_response)
        }
    )
    def get(self, submission_id):
        """Download PDF"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        # Check permissions
        if not can_access_submission(submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Find PDF file
        pdf_dir = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'pdfs')
        pdf_files = [f for f in os.listdir(pdf_dir) if f.startswith(f"submission_{submission_id}_")]

        if not pdf_files:
            return {'message': 'PDF not found. Generate it first.', 'status': 'error'}, 404

        # Get most recent PDF
        pdf_file = sorted(pdf_files)[-1]
        pdf_path = os.path.join(pdf_dir, pdf_file)

        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"submission_{submission_id}.pdf"
        )


@ocr_management_ns.route('/exams/<int:exam_id>/generate-all-pdfs')
@ocr_management_ns.param('exam_id', 'The exam identifier')
class BulkGeneratePDFs(Resource):
    @jwt_required()
    @ocr_management_ns.doc(
        description='Bulk generate PDFs for all submissions in an exam (Teacher/Admin only). Creates individual PDFs for each submission. Useful for archiving or printing all submissions.',
        security='Bearer Auth',
        responses={
            200: ('PDFs generated successfully', bulk_pdf_response),
            403: ('Access denied - Only exam creator or admin', message_response),
            404: ('Exam not found or no submissions', message_response),
            500: ('Bulk PDF generation failed', message_response)
        }
    )
    @ocr_management_ns.marshal_with(bulk_pdf_response, code=200)
    @require_teacher_or_admin
    def post(self, exam_id):
        """Bulk generate PDFs for all exam submissions"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check permissions
        if user.has_role('teacher') and exam.creator_id != user.id:
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Get all submissions
        submissions = Submission.query.filter_by(exam_id=exam_id).all()

        if not submissions:
            return {'message': 'No submissions found for this exam', 'status': 'error'}, 404

        successful = 0
        failed = 0
        pdf_urls = []

        for submission in submissions:
            try:
                generate_pdf_from_images(submission)
                pdf_urls.append(f"/api/v1/ocr-management/download-pdf/{submission.id}")
                successful += 1
            except:
                failed += 1

        return {
            'exam_id': exam_id,
            'total_submissions': len(submissions),
            'successful': successful,
            'failed': failed,
            'pdf_urls': pdf_urls,
            'zip_url': f"/api/v1/ocr-management/download-exam-pdfs/{exam_id}",
            'message': f'Bulk PDF generation completed: {successful} successful, {failed} failed',
            'status': 'success'
        }, 200


# ============================================================================
# OCR QUALITY & STATISTICS ENDPOINTS
# ============================================================================

@ocr_management_ns.route('/submissions/<int:submission_id>/ocr-quality')
@ocr_management_ns.param('submission_id', 'The submission identifier')
class OCRQualityReport(Resource):
    @jwt_required()
    @ocr_management_ns.doc(
        description='Get OCR quality report for a submission. Analyzes confidence scores, text clarity, and provides recommendations for improvement.',
        security='Bearer Auth',
        responses={
            200: ('OCR quality report', ocr_quality_report),
            403: ('Access denied', message_response),
            404: ('Submission not found or OCR not processed', message_response)
        }
    )
    @ocr_management_ns.marshal_with(ocr_quality_report, code=200)
    def get(self, submission_id):
        """Get OCR quality report"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        submission = Submission.query.get_or_404(submission_id)

        # Check permissions
        if not can_access_submission(submission, user):
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Get OCR results
        ocr_results = OCRResult.query.filter_by(submission_id=submission_id).all()

        if not ocr_results:
            return {'message': 'OCR not yet processed', 'status': 'error'}, 404

        # Calculate average confidence
        confidences = [result.confidence_score for result in ocr_results if result.confidence_score]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0

        # Find low confidence areas
        low_confidence_areas = []
        for result in ocr_results:
            if result.confidence_score and result.confidence_score < 0.7:
                low_confidence_areas.append({
                    'confidence': result.confidence_score,
                    'text_sample': result.raw_text[:100] if result.raw_text else ""
                })

        # Generate recommendations
        recommendations = []
        if avg_confidence < 0.8:
            recommendations.append("Overall OCR confidence is low. Consider rescanning with better image quality.")
        if len(low_confidence_areas) > 0:
            recommendations.append(f"{len(low_confidence_areas)} areas have low confidence. Manual review recommended.")
        if not recommendations:
            recommendations.append("OCR quality is good. No major issues detected.")

        return {
            'submission_id': submission_id,
            'average_confidence': avg_confidence,
            'low_confidence_areas': low_confidence_areas[:5],  # Top 5
            'text_clarity_score': min(avg_confidence + 0.05, 1.0),  # Estimate
            'image_quality_score': min(avg_confidence + 0.1, 1.0),  # Estimate
            'recommendations': recommendations,
            'status': 'success'
        }, 200


@ocr_management_ns.route('/exams/<int:exam_id>/ocr-statistics')
@ocr_management_ns.param('exam_id', 'The exam identifier')
class ExamOCRStatistics(Resource):
    @jwt_required()
    @ocr_management_ns.doc(
        description='Get OCR statistics for an exam (Teacher/Admin only). Provides overview of OCR processing status, confidence scores, and missing question rates across all submissions.',
        security='Bearer Auth',
        responses={
            200: ('OCR statistics retrieved', exam_ocr_statistics),
            403: ('Access denied - Only exam creator or admin', message_response),
            404: ('Exam not found', message_response)
        }
    )
    @ocr_management_ns.marshal_with(exam_ocr_statistics, code=200)
    @require_teacher_or_admin
    def get(self, exam_id):
        """Get OCR statistics for exam"""
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        exam = Exam.query.get_or_404(exam_id)

        # Check permissions
        if user.has_role('teacher') and exam.creator_id != user.id:
            return {'message': 'Access denied', 'status': 'error'}, 403

        # Get all submissions
        submissions = Submission.query.filter_by(exam_id=exam_id).all()

        # Calculate statistics
        total = len(submissions)
        processed = len([s for s in submissions if s.submission_status == 'completed'])
        pending = len([s for s in submissions if s.submission_status == 'pending'])
        failed = len([s for s in submissions if s.submission_status == 'failed'])

        # Average confidence
        ocr_results = OCRResult.query.join(Submission).filter(Submission.exam_id == exam_id).all()
        confidences = [r.confidence_score for r in ocr_results if r.confidence_score]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0

        # Average processing time (mock - would need to track in DB)
        avg_processing_time = 2.5  # Placeholder

        # Missing questions rate
        missing_rates = []
        for submission in submissions:
            if submission.submission_status == 'completed':
                detection_data = detect_missing_questions(submission)
                missing_rate = 100 - detection_data['detection_rate']
                missing_rates.append(missing_rate)

        avg_missing_rate = sum(missing_rates) / len(missing_rates) if missing_rates else 0

        return {
            'exam_id': exam_id,
            'total_submissions': total,
            'processed_submissions': processed,
            'pending_submissions': pending,
            'failed_submissions': failed,
            'average_confidence': avg_confidence,
            'average_processing_time': avg_processing_time,
            'questions_missing_rate': avg_missing_rate,
            'status': 'success'
        }, 200
