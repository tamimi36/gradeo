"""
Grading Models
"""
from datetime import datetime
from app import db


class Grade(db.Model):
    """Final grade for a submission"""
    __tablename__ = 'grades'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False, unique=True)
    total_score = db.Column(db.Float, default=0.0, nullable=False)
    max_score = db.Column(db.Float, nullable=False)
    percentage = db.Column(db.Float, default=0.0)  # (total_score / max_score) * 100
    is_finalized = db.Column(db.Boolean, default=False)  # True after teacher review
    auto_graded_at = db.Column(db.DateTime, default=datetime.utcnow)
    finalized_at = db.Column(db.DateTime)
    finalized_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))  # Teacher who finalized
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    submission = db.relationship('Submission', back_populates='grade')
    finalizer = db.relationship('User', foreign_keys=[finalized_by])
    adjustments = db.relationship('GradeAdjustment', back_populates='grade', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Grade submission_id={self.submission_id} score={self.total_score}/{self.max_score}>'

    def to_dict(self, include_adjustments=False):
        """Convert grade to dictionary"""
        data = {
            'id': self.id,
            'submission_id': self.submission_id,
            'total_score': self.total_score,
            'max_score': self.max_score,
            'percentage': self.percentage,
            'is_finalized': self.is_finalized,
            'auto_graded_at': self.auto_graded_at.isoformat() if self.auto_graded_at else None,
            'finalized_at': self.finalized_at.isoformat() if self.finalized_at else None,
            'finalized_by': self.finalized_by,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_adjustments:
            data['adjustments'] = [adj.to_dict() for adj in self.adjustments]
        return data


class ReviewQueue(db.Model):
    """Questions flagged for teacher review after auto-grading"""
    __tablename__ = 'review_queue'

    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False)
    submission_answer_id = db.Column(db.Integer, db.ForeignKey('submission_answers.id', ondelete='CASCADE'), nullable=False)
    review_status = db.Column(db.String(20), default='pending', nullable=False)  # pending, in_review, approved, rejected
    review_reason = db.Column(db.String(100))  # low_ocr_confidence, low_grading_confidence, requires_review, etc.
    priority = db.Column(db.String(10), default='low', nullable=False)  # 'high' (must review), 'low' (suggested review)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    reviewed_at = db.Column(db.DateTime)
    review_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    submission = db.relationship('Submission')
    question = db.relationship('Question')
    submission_answer = db.relationship('SubmissionAnswer')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])

    def __repr__(self):
        return f'<ReviewQueue submission_id={self.submission_id} question_id={self.question_id} status={self.review_status}>'

    def to_dict(self):
        return {
            'id': self.id,
            'submission_id': self.submission_id,
            'question_id': self.question_id,
            'submission_answer_id': self.submission_answer_id,
            'review_status': self.review_status,
            'review_reason': self.review_reason,
            'priority': self.priority,
            'reviewed_by': self.reviewed_by,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'review_notes': self.review_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class GradeAdjustment(db.Model):
    """Manual grade adjustments made by teachers"""
    __tablename__ = 'grade_adjustments'

    id = db.Column(db.Integer, primary_key=True)
    grade_id = db.Column(db.Integer, db.ForeignKey('grades.id', ondelete='CASCADE'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False)
    original_score = db.Column(db.Float, nullable=False)
    adjusted_score = db.Column(db.Float, nullable=False)
    adjustment_reason = db.Column(db.Text, nullable=False)
    adjusted_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=False)
    adjusted_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    grade = db.relationship('Grade', back_populates='adjustments')
    question = db.relationship('Question')
    adjuster = db.relationship('User', foreign_keys=[adjusted_by])

    def __repr__(self):
        return f'<GradeAdjustment grade_id={self.grade_id} {self.original_score} -> {self.adjusted_score}>'

    def to_dict(self):
        return {
            'id': self.id,
            'grade_id': self.grade_id,
            'question_id': self.question_id,
            'original_score': self.original_score,
            'adjusted_score': self.adjusted_score,
            'adjustment_reason': self.adjustment_reason,
            'adjusted_by': self.adjusted_by,
            'adjusted_at': self.adjusted_at.isoformat() if self.adjusted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

