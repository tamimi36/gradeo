"""
Submission Models for Student Exam Submissions
"""
from datetime import datetime
from app import db


class OCRStrategy(db.Model):
    """OCR Strategy definitions for different content types"""
    __tablename__ = 'ocr_strategies'

    id = db.Column(db.Integer, primary_key=True)
    strategy_name = db.Column(db.String(50), unique=True, nullable=False)  # 'general_text', 'handwriting', 'math_formulas', etc.
    ocr_method = db.Column(db.String(50), nullable=False)  # 'text_detection', 'document_text_detection', 'combined'
    language_hints = db.Column(db.JSON)  # ['ar', 'en'] for language hints
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<OCRStrategy {self.strategy_name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'strategy_name': self.strategy_name,
            'ocr_method': self.ocr_method,
            'language_hints': self.language_hints,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class QuestionOCRMetadata(db.Model):
    """OCR metadata for individual questions"""
    __tablename__ = 'question_ocr_metadata'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False)
    subject_type = db.Column(db.String(50))  # 'mathematics', 'english', 'arabic', 'science', etc.
    language = db.Column(db.String(10))  # 'ar', 'en', 'mixed'
    ocr_strategy_id = db.Column(db.Integer, db.ForeignKey('ocr_strategies.id', ondelete='SET NULL'))
    expected_answer_format = db.Column(db.String(50))  # 'numeric', 'text', 'equation', 'multiple_choice'
    has_formulas = db.Column(db.Boolean, default=False)
    has_diagrams = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    question = db.relationship('Question', backref='ocr_metadata')
    ocr_strategy = db.relationship('OCRStrategy')

    def __repr__(self):
        return f'<QuestionOCRMetadata question_id={self.question_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'question_id': self.question_id,
            'subject_type': self.subject_type,
            'language': self.language,
            'ocr_strategy_id': self.ocr_strategy_id,
            'expected_answer_format': self.expected_answer_format,
            'has_formulas': self.has_formulas,
            'has_diagrams': self.has_diagrams,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class OCRProcessingJob(db.Model):
    """Track OCR processing jobs in Celery queue"""
    __tablename__ = 'ocr_processing_jobs'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False)
    celery_task_id = db.Column(db.String(255), unique=True)  # Celery task UUID
    job_status = db.Column(db.String(20), default='queued', nullable=False)  # queued, processing, completed, failed, retrying
    retry_count = db.Column(db.Integer, default=0)
    max_retries = db.Column(db.Integer, default=3)
    error_details = db.Column(db.Text)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    submission = db.relationship('Submission', backref='ocr_jobs')

    def __repr__(self):
        return f'<OCRProcessingJob submission_id={self.submission_id} status={self.job_status}>'

    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'celery_task_id': self.celery_task_id,
            'job_status': self.job_status,
            'retry_count': self.retry_count,
            'max_retries': self.max_retries,
            'error_details': self.error_details,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Submission(db.Model):
    """Student exam submission"""
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    scanned_paper_path = db.Column(db.String(500))  # Path to scanned paper image
    scan_type = db.Column(db.String(20), default='full_page')  # 'full_page', 'per_question'
    page_count = db.Column(db.Integer, default=1)
    submission_status = db.Column(db.String(20), default='pending', nullable=False)  # pending, processing, completed, failed
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    processed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    exam = db.relationship('Exam', back_populates='submissions')
    student = db.relationship('User', back_populates='submissions')
    answers = db.relationship('SubmissionAnswer', back_populates='submission', cascade='all, delete-orphan')
    ocr_results = db.relationship('OCRResult', back_populates='submission', cascade='all, delete-orphan')
    grade = db.relationship('Grade', back_populates='submission', uselist=False, cascade='all, delete-orphan')

    # Unique constraint: one submission per student per exam
    __table_args__ = (db.UniqueConstraint('exam_id', 'student_id', name='_exam_student_submission_uc'),)

    def __repr__(self):
        return f'<Submission exam_id={self.exam_id} student_id={self.student_id}>'

    def to_dict(self, include_answers=False, include_grade=False):
        """Convert submission to dictionary"""
        data = {
            'id': self.id,
            'exam_id': self.exam_id,
            'student_id': self.student_id,
            'scanned_paper_path': self.scanned_paper_path,
            'scan_type': self.scan_type,
            'page_count': self.page_count,
            'submission_status': self.submission_status,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_answers:
            data['answers'] = [ans.to_dict() for ans in self.answers]
        if include_grade and self.grade:
            data['grade'] = self.grade.to_dict()
        return data


class SubmissionAnswer(db.Model):
    """Individual answers extracted from student submission"""
    __tablename__ = 'submission_answers'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False)
    answer_text = db.Column(db.Text)  # Extracted answer text from OCR
    answer_option_id = db.Column(db.Integer, db.ForeignKey('question_options.id', ondelete='SET NULL'))  # For multiple choice
    confidence_score = db.Column(db.Float)  # OCR confidence score (0-1)
    grading_confidence = db.Column(db.Float)  # Grading algorithm confidence (0-1)
    similarity_score = db.Column(db.Float)  # Text similarity score for open-ended (0-1)
    ocr_result_id = db.Column(db.Integer, db.ForeignKey('ocr_results.id', ondelete='SET NULL'))  # Link to OCR result
    extracted_bounding_box = db.Column(db.JSON)  # Location where answer was found in image
    extraction_method = db.Column(db.String(50))  # 'pattern_match', 'coordinate_based', 'ml_based'
    is_auto_graded = db.Column(db.Boolean, default=False)
    auto_grade_score = db.Column(db.Float)  # Score from automated grading
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    submission = db.relationship('Submission', back_populates='answers')
    question = db.relationship('Question', back_populates='submission_answers')
    answer_option = db.relationship('QuestionOption')

    # Unique constraint: one answer per question per submission
    __table_args__ = (db.UniqueConstraint('submission_id', 'question_id', name='_submission_question_answer_uc'),)

    def __repr__(self):
        return f'<SubmissionAnswer submission_id={self.submission_id} question_id={self.question_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'question_id': self.question_id,
            'answer_text': self.answer_text,
            'answer_option_id': self.answer_option_id,
            'confidence_score': self.confidence_score,
            'grading_confidence': self.grading_confidence,
            'similarity_score': self.similarity_score,
            'ocr_result_id': self.ocr_result_id,
            'extracted_bounding_box': self.extracted_bounding_box,
            'extraction_method': self.extraction_method,
            'is_auto_graded': self.is_auto_graded,
            'auto_grade_score': self.auto_grade_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class OCRResult(db.Model):
    """OCR processing results for submissions"""
    __tablename__ = 'ocr_results'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False)
    ocr_service = db.Column(db.String(50))  # OCR service used (e.g., 'tesseract', 'google_vision')
    ocr_strategy_id = db.Column(db.Integer, db.ForeignKey('ocr_strategies.id', ondelete='SET NULL'))
    raw_text = db.Column(db.Text)  # Raw OCR output
    processed_text = db.Column(db.Text)  # Processed/cleaned text
    confidence_score = db.Column(db.Float)  # Overall confidence (0-1)
    raw_response = db.Column(db.JSON)  # Full Google Vision API response
    bounding_boxes = db.Column(db.JSON)  # Text bounding box coordinates
    detected_language = db.Column(db.String(10))  # Detected language code
    detected_breaks = db.Column(db.JSON)  # Paragraph/line breaks
    page_number = db.Column(db.Integer, default=1)
    retry_count = db.Column(db.Integer, default=0)
    processing_status = db.Column(db.String(20), default='pending')  # pending, processing, completed, failed
    error_message = db.Column(db.Text)
    processing_time_seconds = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    submission = db.relationship('Submission', back_populates='ocr_results')
    ocr_strategy = db.relationship('OCRStrategy')
    submission_answers = db.relationship('SubmissionAnswer', backref='ocr_result')

    def __repr__(self):
        return f'<OCRResult submission_id={self.submission_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'ocr_service': self.ocr_service,
            'ocr_strategy_id': self.ocr_strategy_id,
            'raw_text': self.raw_text,
            'processed_text': self.processed_text,
            'confidence_score': self.confidence_score,
            'raw_response': self.raw_response,
            'bounding_boxes': self.bounding_boxes,
            'detected_language': self.detected_language,
            'detected_breaks': self.detected_breaks,
            'page_number': self.page_number,
            'retry_count': self.retry_count,
            'processing_status': self.processing_status,
            'error_message': self.error_message,
            'processing_time_seconds': self.processing_time_seconds,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

