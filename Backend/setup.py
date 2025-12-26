"""
Setup script for Exam Scanner Backend
Initializes database and creates default roles
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User, Role, UserRole
from config import config


def setup_database():
    """Initialize database and create default roles"""
    app = create_app(config.get('development', config['default']))
    
    with app.app_context():
        print("=" * 50)
        print("Exam Scanner Backend - Database Setup")
        print("=" * 50)
        
        # Create all tables
        print("\n[1/2] Creating database tables...")
        db.create_all()
        print("✓ Database tables created successfully")
        
        # Create default roles
        print("\n[2/2] Creating default roles...")
        roles = [
            {'name': 'admin', 'description': 'Administrator with full access'},
            {'name': 'teacher', 'description': 'Teacher can create exams and review submissions'},
            {'name': 'student', 'description': 'Student can submit exams'}
        ]
        
        created_roles = []
        for role_data in roles:
            role = Role.query.filter_by(name=role_data['name']).first()
            if not role:
                role = Role(**role_data)
                db.session.add(role)
                created_roles.append(role_data['name'])
        
        if created_roles:
            db.session.commit()
            print(f"✓ Created roles: {', '.join(created_roles)}")
        else:
            print("✓ All roles already exist")
        
        print("\n" + "=" * 50)
        print("Setup complete!")
        print("=" * 50)
        print("\nNext steps:")
        print("1. Run the application: python run.py")
        print("2. Access Swagger UI: http://localhost:5001/api/swagger/")
        print("3. Register a user or create admin:")
        print("   python scripts/init_db.py --create-admin admin admin@example.com password123 Admin User")
        print("=" * 50)


if __name__ == '__main__':
    try:
        setup_database()
    except Exception as e:
        print(f"\n✗ Error during setup: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

