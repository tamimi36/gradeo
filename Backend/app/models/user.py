"""
User and Role Models
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


class Role(db.Model):
    """User roles (Admin, Teacher, Student)"""
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = db.relationship('UserRole', back_populates='role', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Role {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class User(db.Model):
    """User model for authentication and user management"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=True, index=True)  # Nullable for OAuth users
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for OAuth users
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    last_login = db.Column(db.DateTime)
    
    # OAuth fields
    provider = db.Column(db.String(50), nullable=True, index=True)  # 'google', 'local', etc.
    provider_id = db.Column(db.String(255), nullable=True, index=True)  # Google user ID
    provider_data = db.Column(db.Text, nullable=True)  # JSON data from provider
    avatar_url = db.Column(db.String(500), nullable=True)  # Profile picture URL
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint for provider + provider_id
    __table_args__ = (db.UniqueConstraint('provider', 'provider_id', name='_provider_provider_id_uc'),)

    # Relationships
    roles = db.relationship('UserRole', back_populates='user', cascade='all, delete-orphan')
    created_exams = db.relationship('Exam', back_populates='creator', foreign_keys='Exam.creator_id')
    submissions = db.relationship('Submission', back_populates='student')

    def set_password(self, password):
        """Hash and set password"""
        if password:
            # Use pbkdf2:sha256 for compatibility (scrypt requires OpenSSL 1.1+)
            self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        """Check if password matches"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def is_oauth_user(self):
        """Check if user is OAuth user"""
        return self.provider is not None and self.provider != 'local'

    def has_role(self, role_name):
        """Check if user has a specific role"""
        return any(user_role.role.name == role_name for user_role in self.roles)

    def get_roles(self):
        """Get list of role names"""
        return [user_role.role.name for user_role in self.roles]

    def get_role(self):
        """Return the primary role name for this user.

        This is a convenience helper used by some analytics/AI endpoints
        which expect a single role string (e.g. 'teacher', 'admin', 'student').
        If the user has multiple roles, the first one is returned.
        If the user has no roles, 'student' is returned by default.
        """
        roles = self.get_roles()
        return roles[0] if roles else 'student'

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self, include_roles=True):
        """Convert user to dictionary"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'provider': self.provider,
            'avatar_url': self.avatar_url,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_roles:
            data['roles'] = self.get_roles()
        return data


class UserRole(db.Model):
    """Many-to-many relationship between Users and Roles"""
    __tablename__ = 'user_roles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id', ondelete='CASCADE'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='roles')
    role = db.relationship('Role', back_populates='users')

    # Unique constraint
    __table_args__ = (db.UniqueConstraint('user_id', 'role_id', name='_user_role_uc'),)

    def __repr__(self):
        return f'<UserRole user_id={self.user_id} role_id={self.role_id}>'

