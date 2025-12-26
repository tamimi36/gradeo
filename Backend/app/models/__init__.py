"""
Database Models
"""
from app.models.user import User, Role, UserRole
from app.models.exam import Exam, Question, QuestionOption, AnswerKey
from app.models.submission import Submission, SubmissionAnswer, OCRResult
from app.models.grade import Grade, ReviewQueue, GradeAdjustment
from app.models.otp import OTP
from app.models.analytics import (
    QuestionTopic, QuestionDifficulty, Cohort, CohortMember,
    StudentProgress, Misconception, AIAnalysisCache
)

__all__ = [
    'User', 'Role', 'UserRole',
    'Exam', 'Question', 'QuestionOption', 'AnswerKey',
    'Submission', 'SubmissionAnswer', 'OCRResult',
    'Grade', 'ReviewQueue', 'GradeAdjustment',
    'OTP',
    'QuestionTopic', 'QuestionDifficulty', 'Cohort', 'CohortMember',
    'StudentProgress', 'Misconception', 'AIAnalysisCache'
]

