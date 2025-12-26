"""
Flask Application Factory
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
mail = Mail()

# Celery instance (will be initialized in create_app)
celery = None


def create_app(config_class=Config):
    """Application factory pattern"""
    global celery

    app = Flask(__name__, static_folder='static')
    app.config.from_object(config_class)

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)
    mail.init_app(app)

    # Initialize Celery
    from app.services.tasks.celery_config import make_celery
    celery = make_celery(app)

    # Set celery instance for tasks
    from app.services.tasks import ocr_tasks
    ocr_tasks.set_celery(celery)

    # Register API blueprint (includes all namespaces)
    from app.api import api_bp
    from app.api.oauth import oauth_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(oauth_bp, url_prefix='/api/auth')

    # Create tables
    with app.app_context():
        db.create_all()

    return app

