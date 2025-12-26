"""
Database Initialization Script
Creates default roles and optionally an admin user
"""
import sys
import os

# Add parent directory to path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User, Role, UserRole
from config import config


def init_roles():
    """Create default roles if they don't exist"""
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
        else:
            print(f"Role '{role_data['name']}' already exists")
    
    if created_roles:
        db.session.commit()
        print(f"Created roles: {', '.join(created_roles)}")
    else:
        print("All roles already exist")
    
    return created_roles


def create_admin(username, email, password, first_name, last_name):
    """Create an admin user"""
    # Check if user exists
    user = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if user:
        print(f"User '{username}' or email '{email}' already exists")
        return None
    
    # Create user
    user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        is_active=True,
        is_verified=True
    )
    user.set_password(password)
    db.session.add(user)
    
    # Assign admin role
    admin_role = Role.query.filter_by(name='admin').first()
    if not admin_role:
        print("Admin role not found. Please run init_roles() first.")
        return None
    
    user_role = UserRole(user=user, role=admin_role)
    db.session.add(user_role)
    
    try:
        db.session.commit()
        print(f"Admin user '{username}' created successfully")
        return user
    except Exception as e:
        db.session.rollback()
        print(f"Error creating admin user: {str(e)}")
        return None


if __name__ == '__main__':
    app = create_app(config.get('development', config['default']))
    
    with app.app_context():
        print("Initializing database...")
        
        # Create roles
        init_roles()
        
        # Optionally create admin user
        if len(sys.argv) > 1 and sys.argv[1] == '--create-admin':
            if len(sys.argv) < 6:
                print("Usage: python init_db.py --create-admin <username> <email> <password> <first_name> <last_name>")
                sys.exit(1)
            
            username = sys.argv[2]
            email = sys.argv[3]
            password = sys.argv[4]
            first_name = sys.argv[5]
            last_name = sys.argv[6] if len(sys.argv) > 6 else ""
            
            create_admin(username, email, password, first_name, last_name)
        
        print("Database initialization complete!")

