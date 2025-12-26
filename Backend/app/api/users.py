"""
User Management Routes
"""
import os
from flask import Blueprint, request, current_app
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models.user import User, Role, UserRole
from app.api import api

users_bp = Blueprint('users', __name__)
users_ns = Namespace('users', description='User management operations')

# Request/Response models
user_model = api.model('User', {
    'id': fields.Integer(description='User ID'),
    'username': fields.String(description='Username'),
    'email': fields.String(description='Email'),
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name'),
    'is_active': fields.Boolean(description='Is user active'),
    'is_verified': fields.Boolean(description='Is user verified'),
    'roles': fields.List(fields.String, description='User roles'),
    'created_at': fields.String(description='Creation date'),
    'last_login': fields.String(description='Last login date')
})

update_user_model = api.model('UpdateUser', {
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name'),
    'email': fields.String(description='Email'),
    'is_active': fields.Boolean(description='Is user active'),
    'is_verified': fields.Boolean(description='Is user verified'),
    'avatar_url': fields.String(description='URL to user avatar')
})

user_list_response = api.model('UserListResponse', {
    'users': fields.List(fields.Nested(user_model)),
    'total': fields.Integer(description='Total number of users'),
    'page': fields.Integer(description='Current page'),
    'per_page': fields.Integer(description='Items per page')
})

# Request models
update_profile_model = api.model('UpdateProfile', {
    'username': fields.String(description='New username'),
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name'),
    'avatar_url': fields.String(description='URL to user avatar')
})

change_password_model = api.model('ChangePassword', {
    'current_password': fields.String(required=True, description='Current password'),
    'new_password': fields.String(required=True, description='New password')
})

# Allowed extensions for avatar uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def require_role(role_name):
    """Decorator to require specific role"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            # Convert string identity back to integer for database query
            user = User.query.get(int(current_user_id))
            
            if not user or not user.has_role(role_name):
                return {'message': f'Requires {role_name} role', 'status': 'error'}, 403
            return func(*args, **kwargs)
        return wrapper
    return decorator


@users_ns.route('')
class UserList(Resource):
    @jwt_required()
    @users_ns.marshal_with(user_list_response)
    @users_ns.doc(
        description='Get list of users (Admin/Teacher only)',
        security='Bearer Auth'
    )
    def get(self):
        """Get list of all users"""
        current_user_id = get_jwt_identity()
        # Convert string identity back to integer for database query
        current_user = User.query.get(int(current_user_id))
        
        # Only admin and teacher can view all users
        if not current_user or (not current_user.has_role('admin') and not current_user.has_role('teacher')):
            return {'message': 'Insufficient permissions', 'status': 'error'}, 403
        
        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        per_page = min(per_page, 100)  # Max 100 per page
        
        # Filtering
        role_filter = request.args.get('role')
        search = request.args.get('search')
        
        query = User.query
        
        if role_filter:
            query = query.join(UserRole).join(Role).filter(Role.name == role_filter)
        
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                (User.username.like(search_term)) |
                (User.email.like(search_term)) |
                (User.first_name.like(search_term)) |
                (User.last_name.like(search_term))
            )
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'users': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'status': 'success'
        }, 200


@users_ns.route('/<int:user_id>')
class UserDetail(Resource):
    @jwt_required()
    @users_ns.marshal_with(user_model)
    @users_ns.doc(
        description='Get user by ID',
        security='Bearer Auth'
    )
    def get(self, user_id):
        """Get user details"""
        current_user_id = get_jwt_identity()
        # Convert string identity back to integer for database query
        current_user = User.query.get(int(current_user_id))
        user = User.query.get_or_404(user_id)
        
        # Users can only view their own profile unless they're admin/teacher
        if int(current_user_id) != user_id:
            if not current_user or (not current_user.has_role('admin') and not current_user.has_role('teacher')):
                return {'message': 'Insufficient permissions', 'status': 'error'}, 403
        
        return {
            'user': user.to_dict(),
            'status': 'success'
        }, 200
    
    @jwt_required()
    @users_ns.expect(update_user_model)
    @users_ns.marshal_with(user_model)
    @users_ns.doc(
        description='Update user (Admin or own profile)',
        security='Bearer Auth'
    )
    def put(self, user_id):
        """Update user"""
        current_user_id = get_jwt_identity()
        # Convert string identity back to integer for database query
        current_user = User.query.get(int(current_user_id))
        user = User.query.get_or_404(user_id)
        
        # Only admin can update other users, or users can update themselves
        if int(current_user_id) != user_id:
            if not current_user or not current_user.has_role('admin'):
                return {'message': 'Insufficient permissions', 'status': 'error'}, 403
        
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            # Check if email is already taken
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return {'message': 'Email already exists', 'status': 'error'}, 400
            user.email = data['email']
        
        # Only admin can change these fields
        if current_user and current_user.has_role('admin'):
            if 'is_active' in data:
                user.is_active = data['is_active']
            if 'is_verified' in data:
                user.is_verified = data['is_verified']
        
        try:
            db.session.commit()
            return {
                'user': user.to_dict(),
                'status': 'success'
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Update failed: {str(e)}', 'status': 'error'}, 500
    
    @jwt_required()
    @users_ns.doc(
        description='Delete user (Admin only)',
        security='Bearer Auth'
    )
    def delete(self, user_id):
        """Delete user (Admin only)"""
        current_user_id = get_jwt_identity()
        # Convert string identity back to integer for database query
        current_user = User.query.get(int(current_user_id))
        
        if not current_user or not current_user.has_role('admin'):
            return {'message': 'Requires admin role', 'status': 'error'}, 403
        
        user = User.query.get_or_404(user_id)
        
        # Prevent self-deletion
        if user_id == int(current_user_id):
            return {'message': 'Cannot delete your own account', 'status': 'error'}, 400
        
        try:
            db.session.delete(user)
            db.session.commit()
            return {'message': 'User deleted successfully', 'status': 'success'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to delete user: {str(e)}', 'status': 'error'}, 500


@users_ns.route('/<int:user_id>/roles')
@users_ns.param('user_id', 'The user identifier')
class UserRoles(Resource):
    @jwt_required()
    @users_ns.doc(
        description='Get user roles (Admin only)',
        security='Bearer Auth'
    )
    def get(self, user_id):
        """Get user roles"""
        current_user_id = get_jwt_identity()
        # Convert string identity back to integer for database query
        current_user = User.query.get(int(current_user_id))
        
        if not current_user or not current_user.has_role('admin'):
            return {'message': 'Requires admin role', 'status': 'error'}, 403
        
        user = User.query.get_or_404(user_id)
        
        return {
            'user_id': user_id,
            'roles': user.get_roles(),
            'status': 'success'
        }, 200
    
    @jwt_required()
    @users_ns.doc(
        description='Assign role to user (Admin only)',
        security='Bearer Auth'
    )
    def post(self, user_id):
        """Assign role to user"""
        current_user_id = get_jwt_identity()
        # Convert string identity back to integer for database query
        current_user = User.query.get(int(current_user_id))
        
        if not current_user or not current_user.has_role('admin'):
            return {'message': 'Requires admin role', 'status': 'error'}, 403
        
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        role_name = data.get('role')
        
        if not role_name:
            return {'message': 'Role name is required', 'status': 'error'}, 400
        
        # Check if user already has this role
        if user.has_role(role_name):
            return {'message': 'User already has this role', 'status': 'error'}, 400
        
        # Get or create role
        role = Role.query.filter_by(name=role_name.lower()).first()
        if not role:
            role = Role(name=role_name.lower(), description=f'{role_name.capitalize()} role')
            db.session.add(role)
        
        # Assign role
        user_role = UserRole(user=user, role=role)
        db.session.add(user_role)
        
        try:
            db.session.commit()
            return {'message': 'Role assigned successfully', 'status': 'success'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to assign role: {str(e)}', 'status': 'error'}, 500
    
    @jwt_required()
    @users_ns.doc(
        description='Remove role from user (Admin only)',
        security='Bearer Auth'
    )
    def delete(self, user_id):
        """Remove role from user"""
        current_user_id = get_jwt_identity()
        # Convert string identity back to integer for database query
        current_user = User.query.get(int(current_user_id))
        
        if not current_user or not current_user.has_role('admin'):
            return {'message': 'Requires admin role', 'status': 'error'}, 403
        
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        role_name = data.get('role')
        
        if not role_name:
            return {'message': 'Role name is required', 'status': 'error'}, 400
        
        # Find and remove role
        user_role = UserRole.query.join(Role).filter(
            UserRole.user_id == user_id,
            Role.name == role_name.lower()
        ).first()
        
        if not user_role:
            return {'message': 'User does not have this role', 'status': 'error'}, 404
        
        try:
            db.session.delete(user_role)
            db.session.commit()
            return {'message': 'Role removed successfully', 'status': 'success'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to remove role: {str(e)}', 'status': 'error'}, 500

