"""
API Blueprint with Swagger UI
"""
from flask import Blueprint
from flask_restx import Api

api_bp = Blueprint('api', __name__)

# JWT Authorization configuration for Swagger UI
authorizations = {
    'Bearer Auth': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': 'Enter your JWT token in the format: Bearer &lt;token&gt;'
    }
}

api = Api(
    api_bp,
    version='1.0',
    title='Exam Scanner API',
    description='API for automated exam paper scanning and grading system. '
                '**🚀 Quick Start:**\n'
                '1. Login using POST /api/auth/login - Token will be saved automatically!\n'
                '2. Click the "Authorize" button (🔒) at the top right if needed\n'
                '3. Use the "🔄 Refresh Token" button to refresh expired tokens\n'
                '4. All protected endpoints will automatically use your token',
    doc='/swagger/',
    prefix='/v1',
    authorizations=authorizations,
    security='Bearer Auth'
)

# Import namespaces to register them
from app.api.auth import auth_ns
from app.api.oauth import oauth_ns
from app.api.users import users_ns
from app.api.exams import exams_ns
from app.api.submissions import submissions_ns
from app.api.grading import grading_ns
from app.api.ocr import ocr_ns
from app.api.ocr_management import ocr_management_ns
from app.api.analytics import analytics_ns
from app.api.ai_features import ai_ns

# The order here determines the order in Swagger UI
# Authentication & User Management
api.add_namespace(auth_ns)
api.add_namespace(oauth_ns)
api.add_namespace(users_ns)

# Exam Management
api.add_namespace(exams_ns)

# Submissions & Grading
api.add_namespace(submissions_ns)
api.add_namespace(grading_ns)

# OCR Management (Admin)
api.add_namespace(ocr_ns)
api.add_namespace(ocr_management_ns)

# Analytics & AI Features
api.add_namespace(analytics_ns)
api.add_namespace(ai_ns)

