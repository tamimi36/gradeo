"""
Application Configuration
"""
import os
from datetime import timedelta


class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///exam_scanner.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
    
    # Google Cloud Vision OCR Configuration
    GOOGLE_VISION_API_KEY = os.environ.get('GOOGLE_VISION_API_KEY')
    GOOGLE_VISION_API_QUOTA_PER_MINUTE = int(os.environ.get('GOOGLE_VISION_API_QUOTA_PER_MINUTE', 60))

    # Celery Configuration
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

    # OCR Processing Configuration
    OCR_CONFIDENCE_THRESHOLD = float(os.environ.get('OCR_CONFIDENCE_THRESHOLD', 0.7))
    OCR_MAX_RETRIES = int(os.environ.get('OCR_MAX_RETRIES', 3))
    OCR_RETRY_DELAY_SECONDS = int(os.environ.get('OCR_RETRY_DELAY_SECONDS', 60))

    # Grading Configuration
    GRADING_OCR_CONFIDENCE_THRESHOLD = float(os.environ.get('GRADING_OCR_CONFIDENCE_THRESHOLD', 0.70))
    GRADING_CONFIDENCE_LOW_THRESHOLD = float(os.environ.get('GRADING_CONFIDENCE_LOW_THRESHOLD', 0.40))
    GRADING_CONFIDENCE_MID_THRESHOLD = float(os.environ.get('GRADING_CONFIDENCE_MID_THRESHOLD', 0.70))
    AUTO_GRADE_ON_OCR_COMPLETE = os.environ.get('AUTO_GRADE_ON_OCR_COMPLETE', 'True').lower() in ['true', '1', 't']

    # Google OAuth Configuration
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID') or None
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET') or None
    GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI') or 'http://localhost:5001/api/auth/google/callback'
    
    # Microsoft OAuth Configuration
    MICROSOFT_CLIENT_ID = os.environ.get('MICROSOFT_CLIENT_ID') or None
    MICROSOFT_CLIENT_SECRET = os.environ.get('MICROSOFT_CLIENT_SECRET') or None
    MICROSOFT_TENANT_ID = os.environ.get('MICROSOFT_TENANT_ID') or 'common'  # 'common' for multi-tenant
    MICROSOFT_REDIRECT_URI = os.environ.get('MICROSOFT_REDIRECT_URI') or 'http://localhost:5001/api/auth/microsoft/callback'

    # Email Configuration (Flask-Mail) - SendGrid SMTP
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.sendgrid.net'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() in ['true', '1', 't']
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'False').lower() in ['true', '1', 't']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    MAIL_MAX_EMAILS = os.environ.get('MAIL_MAX_EMAILS') or None

    # OTP Configuration
    OTP_EXPIRY_MINUTES = int(os.environ.get('OTP_EXPIRY_MINUTES') or 5)
    OTP_LENGTH = int(os.environ.get('OTP_LENGTH') or 6)

    # Password Reset Configuration
    PASSWORD_RESET_EXPIRY_MINUTES = int(os.environ.get('PASSWORD_RESET_EXPIRY_MINUTES') or 5)


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test_exam_scanner.db'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

