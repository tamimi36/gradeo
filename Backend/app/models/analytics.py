"""
Analytics Database Models
Tracks student progress, question difficulty, cohorts, and misconceptions
"""

from app import db
from datetime import datetime
from sqlalchemy import Index


class QuestionTopic(db.Model):
    """Topics/Skills associated with questions (auto-detected or manual)"""
    __tablename__ = 'question_topics'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    topic_name = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, default=1.0)  # 0-1, if AI-detected
    detection_method = db.Column(db.String(20), default='manual')  # manual, ai_detected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    question = db.relationship('Question', backref=db.backref('topics', lazy='dynamic'))

    # Indexes for fast queries
    __table_args__ = (
        Index('ix_question_topics_question_id', 'question_id'),
        Index('ix_question_topics_topic_name', 'topic_name'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'question_id': self.question_id,
            'topic_name': self.topic_name,
            'confidence': self.confidence,
            'detection_method': self.detection_method
        }


class QuestionDifficulty(db.Model):
    """
    Tracks question difficulty based on student performance
    Updated after each grading session
    """
    __tablename__ = 'question_difficulties'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False, unique=True)

    # Performance metrics
    total_attempts = db.Column(db.Integer, default=0)
    correct_count = db.Column(db.Integer, default=0)
    partial_count = db.Column(db.Integer, default=0)
    incorrect_count = db.Column(db.Integer, default=0)

    # Calculated metrics
    success_rate = db.Column(db.Float, default=0.0)  # 0-1
    difficulty_score = db.Column(db.Float, default=0.5)  # 0=easy, 1=very hard
    difficulty_level = db.Column(db.String(20), default='medium')  # easy, medium, hard, very_hard

    # Time metrics
    avg_time_seconds = db.Column(db.Float)  # Average time spent on this question
    median_score = db.Column(db.Float)  # Median score percentage

    # AI analysis (cached)
    ai_difficulty_estimate = db.Column(db.String(20))  # AI's initial estimate
    ai_reasoning = db.Column(db.Text)  # Why AI thinks it's hard/easy

    # Metadata
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    question = db.relationship('Question', backref=db.backref('difficulty_stats', uselist=False))

    def recalculate(self):
        """Recalculate difficulty metrics"""
        if self.total_attempts > 0:
            self.success_rate = self.correct_count / self.total_attempts

            # Difficulty score: 0 = everyone got it right, 1 = everyone got it wrong
            self.difficulty_score = 1 - self.success_rate

            # Categorize difficulty
            if self.success_rate >= 0.8:
                self.difficulty_level = 'easy'
            elif self.success_rate >= 0.6:
                self.difficulty_level = 'medium'
            elif self.success_rate >= 0.3:
                self.difficulty_level = 'hard'
            else:
                self.difficulty_level = 'very_hard'

        self.last_updated = datetime.utcnow()

    def to_dict(self):
        return {
            'id': self.id,
            'question_id': self.question_id,
            'total_attempts': self.total_attempts,
            'correct_count': self.correct_count,
            'success_rate': round(self.success_rate * 100, 1),
            'difficulty_level': self.difficulty_level,
            'difficulty_score': round(self.difficulty_score, 2),
            'avg_time_seconds': self.avg_time_seconds,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }


class Cohort(db.Model):
    """
    Student cohorts/groups for comparison
    Can be: class sections, year groups, subject groups, custom groups
    """
    __tablename__ = 'cohorts'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    cohort_type = db.Column(db.String(50), nullable=False)  # class, year, subject, custom
    description = db.Column(db.Text)

    # Ownership
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Metadata
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', foreign_keys=[created_by])
    members = db.relationship('CohortMember', back_populates='cohort', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'cohort_type': self.cohort_type,
            'description': self.description,
            'member_count': len(self.members),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }


class CohortMember(db.Model):
    """Students belonging to cohorts"""
    __tablename__ = 'cohort_members'

    id = db.Column(db.Integer, primary_key=True)
    cohort_id = db.Column(db.Integer, db.ForeignKey('cohorts.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    cohort = db.relationship('Cohort', back_populates='members')
    student = db.relationship('User', foreign_keys=[student_id])

    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('cohort_id', 'student_id', name='uq_cohort_student'),
        Index('ix_cohort_members_cohort_id', 'cohort_id'),
        Index('ix_cohort_members_student_id', 'student_id'),
    )


class StudentProgress(db.Model):
    """
    Tracks individual student progress over time
    One record per student per topic/skill
    """
    __tablename__ = 'student_progress'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic_name = db.Column(db.String(100), nullable=False)

    # Performance metrics
    total_attempts = db.Column(db.Integer, default=0)
    correct_count = db.Column(db.Integer, default=0)
    mastery_level = db.Column(db.Float, default=0.0)  # 0-1, how well they know this topic

    # Trend analysis
    improvement_rate = db.Column(db.Float, default=0.0)  # Positive = improving, Negative = declining
    first_attempt_date = db.Column(db.DateTime)
    last_attempt_date = db.Column(db.DateTime)

    # Weakness detection
    is_weakness = db.Column(db.Boolean, default=False)  # Flagged as student weakness
    weakness_severity = db.Column(db.String(20))  # minor, moderate, major

    # Metadata
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    student = db.relationship('User', foreign_keys=[student_id])

    # Indexes
    __table_args__ = (
        db.UniqueConstraint('student_id', 'topic_name', name='uq_student_topic'),
        Index('ix_student_progress_student_id', 'student_id'),
        Index('ix_student_progress_topic_name', 'topic_name'),
    )

    def recalculate(self):
        """Recalculate mastery and weakness status"""
        if self.total_attempts > 0:
            success_rate = self.correct_count / self.total_attempts
            self.mastery_level = success_rate

            # Flag as weakness if success rate < 60%
            if success_rate < 0.4:
                self.is_weakness = True
                self.weakness_severity = 'major'
            elif success_rate < 0.6:
                self.is_weakness = True
                self.weakness_severity = 'moderate'
            elif success_rate < 0.7:
                self.is_weakness = True
                self.weakness_severity = 'minor'
            else:
                self.is_weakness = False
                self.weakness_severity = None

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'topic_name': self.topic_name,
            'total_attempts': self.total_attempts,
            'correct_count': self.correct_count,
            'mastery_level': round(self.mastery_level * 100, 1),
            'is_weakness': self.is_weakness,
            'weakness_severity': self.weakness_severity,
            'improvement_rate': round(self.improvement_rate, 2),
            'last_attempt': self.last_attempt_date.isoformat() if self.last_attempt_date else None
        }


class Misconception(db.Model):
    """
    Tracks common misconceptions detected across students
    Groups students with similar wrong answers
    """
    __tablename__ = 'misconceptions'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'))

    # Misconception details
    common_wrong_answer = db.Column(db.Text, nullable=False)  # The common wrong answer pattern
    student_count = db.Column(db.Integer, default=1)  # How many students made this mistake
    affected_student_ids = db.Column(db.JSON)  # List of student IDs

    # AI Analysis (cached)
    misconception_type = db.Column(db.String(100))  # e.g., "algebraic sign error", "formula confusion"
    why_students_think_this = db.Column(db.Text)  # AI explanation
    how_to_correct = db.Column(db.Text)  # Teaching advice
    severity = db.Column(db.String(20))  # minor, moderate, major

    # Status
    is_resolved = db.Column(db.Boolean, default=False)  # Teacher marked as addressed
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    resolved_at = db.Column(db.DateTime)
    resolution_notes = db.Column(db.Text)

    # Metadata
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    question = db.relationship('Question', backref=db.backref('misconceptions', lazy='dynamic'))
    exam = db.relationship('Exam')
    resolver = db.relationship('User', foreign_keys=[resolved_by])

    # Indexes
    __table_args__ = (
        Index('ix_misconceptions_question_id', 'question_id'),
        Index('ix_misconceptions_exam_id', 'exam_id'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'question_id': self.question_id,
            'exam_id': self.exam_id,
            'common_wrong_answer': self.common_wrong_answer,
            'student_count': self.student_count,
            'misconception_type': self.misconception_type,
            'why_students_think_this': self.why_students_think_this,
            'how_to_correct': self.how_to_correct,
            'severity': self.severity,
            'is_resolved': self.is_resolved,
            'detected_at': self.detected_at.isoformat()
        }


class AIAnalysisCache(db.Model):
    """
    Cache AI analysis results to avoid re-analyzing same content
    Saves API costs and improves performance
    """
    __tablename__ = 'ai_analysis_cache'

    id = db.Column(db.Integer, primary_key=True)
    analysis_type = db.Column(db.String(50), nullable=False)  # explanation, proofread, reasoning, etc.
    content_hash = db.Column(db.String(64), nullable=False, unique=True)  # SHA256 hash of input
    input_data = db.Column(db.JSON)  # Original input for reference
    output_data = db.Column(db.JSON, nullable=False)  # AI response
    ai_provider = db.Column(db.String(20))  # gemini, openai, anthropic

    # Usage tracking
    hit_count = db.Column(db.Integer, default=1)  # How many times this was reused
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index('ix_ai_cache_content_hash', 'content_hash'),
        Index('ix_ai_cache_type', 'analysis_type'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'analysis_type': self.analysis_type,
            'output_data': self.output_data,
            'hit_count': self.hit_count,
            'created_at': self.created_at.isoformat()
        }
