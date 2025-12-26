"""
Exam and Question Models
"""
from datetime import datetime
from app import db


class Exam(db.Model):
    """Exam model"""
    __tablename__ = 'exams'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=False)
    duration_minutes = db.Column(db.Integer)  # Exam duration in minutes
    total_points = db.Column(db.Float, default=0.0)
    subject_type = db.Column(db.String(50))  # 'mathematics', 'english', 'arabic', 'science', 'mixed'
    primary_language = db.Column(db.String(10), default='en')  # 'ar', 'en', 'mixed'
    has_formulas = db.Column(db.Boolean, default=False)
    has_diagrams = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', back_populates='created_exams', foreign_keys=[creator_id])
    questions = db.relationship('Question', back_populates='exam', cascade='all, delete-orphan', order_by='Question.order_number')
    answer_keys = db.relationship('AnswerKey', back_populates='exam', cascade='all, delete-orphan')
    submissions = db.relationship('Submission', back_populates='exam', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Exam {self.title}>'

    def to_dict(self, include_questions=False, include_answer_keys=False):
        """Convert exam to dictionary"""
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'creator_id': self.creator_id,
            'duration_minutes': self.duration_minutes,
            'total_points': self.total_points,
            'subject_type': self.subject_type,
            'primary_language': self.primary_language,
            'has_formulas': self.has_formulas,
            'has_diagrams': self.has_diagrams,
            'is_published': self.is_published,
            'is_active': self.is_active,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_questions:
            data['questions'] = [q.to_dict() for q in self.questions]
        if include_answer_keys:
            data['answer_keys'] = [ak.to_dict() for ak in self.answer_keys]
        return data


class Question(db.Model):
    """Question model for exams"""
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), nullable=False)  # 'multiple_choice' or 'open_ended'
    points = db.Column(db.Float, default=1.0, nullable=False)
    order_number = db.Column(db.Integer, nullable=False)  # Order in exam
    requires_review = db.Column(db.Boolean, default=False)  # Flag for teacher review after auto-grading
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    exam = db.relationship('Exam', back_populates='questions')
    options = db.relationship('QuestionOption', back_populates='question', cascade='all, delete-orphan', order_by='QuestionOption.order_number')
    answer_keys = db.relationship('AnswerKey', back_populates='question', cascade='all, delete-orphan')
    submission_answers = db.relationship('SubmissionAnswer', back_populates='question', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Question {self.id} - {self.question_type}>'

    def to_dict(self, include_options=False, include_answer_keys=False):
        """Convert question to dictionary"""
        data = {
            'id': self.id,
            'exam_id': self.exam_id,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'points': self.points,
            'order_number': self.order_number,
            'requires_review': self.requires_review,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_options:
            data['options'] = [opt.to_dict() for opt in self.options]
        if include_answer_keys:
            data['answer_keys'] = [ak.to_dict() for ak in self.answer_keys]
        return data


class QuestionOption(db.Model):
    """Options for multiple choice questions"""
    __tablename__ = 'question_options'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False)
    option_text = db.Column(db.String(500), nullable=False)
    order_number = db.Column(db.Integer, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)  # For multiple choice correct answer
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    question = db.relationship('Question', back_populates='options')

    def __repr__(self):
        return f'<QuestionOption {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'question_id': self.question_id,
            'option_text': self.option_text,
            'order_number': self.order_number,
            'is_correct': self.is_correct,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AnswerKey(db.Model):
    """Answer keys submitted by teachers"""
    __tablename__ = 'answer_keys'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False)
    correct_answer = db.Column(db.Text, nullable=False)  # For multiple choice: option_id, for open: text answer
    answer_type = db.Column(db.String(20), nullable=False)  # 'multiple_choice' or 'open_ended'
    points = db.Column(db.Float, nullable=False)  # Points for this answer
    strictness_level = db.Column(db.String(20), default='normal', nullable=False)  # 'lenient', 'normal', 'strict'
    keywords = db.Column(db.JSON)  # Array of keywords for open-ended grading (e.g., ['photosynthesis', 'chlorophyll', 'sunlight'])
    additional_notes = db.Column(db.Text)  # Teacher notes/hints for grading this answer
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    exam = db.relationship('Exam', back_populates='answer_keys')
    question = db.relationship('Question', back_populates='answer_keys')

    # Unique constraint: one answer key per question per exam
    __table_args__ = (db.UniqueConstraint('exam_id', 'question_id', name='_exam_question_answer_key_uc'),)

    def __repr__(self):
        return f'<AnswerKey question_id={self.question_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'exam_id': self.exam_id,
            'question_id': self.question_id,
            'correct_answer': self.correct_answer,
            'answer_type': self.answer_type,
            'points': self.points,
            'strictness_level': self.strictness_level,
            'keywords': self.keywords,
            'additional_notes': self.additional_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

