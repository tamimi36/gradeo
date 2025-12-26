"""
Authentication Routes
"""
from flask import Blueprint, request
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User, Role, UserRole
from app.models.otp import OTP
from app.services.email_service import send_otp_email, send_welcome_email, send_password_reset_email
from app.api import api
import json

auth_bp = Blueprint('auth', __name__)
auth_ns = Namespace('auth', description='Authentication operations')

# Request/Response models for Swagger
register_model = api.model('Register', {
    'username': fields.String(required=True, description='Username'),
    'email': fields.String(required=True, description='Email address'),
    'password': fields.String(required=True, description='Password'),
    'first_name': fields.String(required=True, description='First name'),
    'last_name': fields.String(required=True, description='Last name'),
    'role': fields.String(required=False, description='Role (student, teacher, admin)', default='student')
})

login_model = api.model('Login', {
    'username': fields.String(required=True, description='Username or email'),
    'password': fields.String(required=True, description='Password')
})

token_response = api.model('TokenResponse', {
    'access_token': fields.String(description='JWT access token'),
    'refresh_token': fields.String(description='JWT refresh token'),
    'user': fields.Raw(description='User information')
})

message_response = api.model('MessageResponse', {
    'message': fields.String(description='Response message'),
    'status': fields.String(description='Status code')
})

verify_otp_model = api.model('VerifyOTP', {
    'email': fields.String(required=True, description='Email address'),
    'otp_code': fields.String(required=True, description='6-digit OTP code'),
    'otp_type': fields.String(required=True, description='OTP type: registration or login')
})

resend_otp_model = api.model('ResendOTP', {
    'email': fields.String(required=True, description='Email address'),
    'otp_type': fields.String(required=True, description='OTP type: registration or login')
})

request_password_reset_model = api.model('RequestPasswordReset', {
    'email': fields.String(required=True, description='Email address')
})

reset_password_model = api.model('ResetPassword', {
    'email': fields.String(required=True, description='Email address'),
    'reset_token': fields.String(required=True, description='6-digit password reset token'),
    'new_password': fields.String(required=True, description='New password (minimum 8 characters)')
})


@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(register_model)
    @auth_ns.marshal_with(message_response, code=201)
    @auth_ns.doc(
        description='Register a new user - Sends OTP to email for verification',
        security=None  # Registration doesn't require authentication
    )
    def post(self):
        """Register a new user - Step 1: Send OTP"""
        data = request.get_json()

        # Validate required fields
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return {'message': f'{field} is required', 'status': 'error'}, 400

        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return {'message': 'Username already exists', 'status': 'error'}, 400

        # Check if email exists and get provider info
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            provider = existing_user.provider
            provider_display = 'Google' if provider == 'google' else 'Microsoft' if provider == 'microsoft' else 'email/password'
            return {
                'message': f'This email is already registered with {provider_display}. Please use {provider_display} login or use a different email.',
                'status': 'error',
                'provider': provider
            }, 409

        # Store registration data temporarily in OTP table
        user_data = {
            'username': data['username'],
            'email': data['email'],
            'password': data['password'],  # Will be hashed when user is created
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'role': data.get('role', 'student').lower()
        }

        try:
            # Create OTP
            otp = OTP.create_otp(
                email=data['email'],
                otp_type='registration',
                user_data=json.dumps(user_data),
                expires_in_minutes=10
            )

            # Send OTP email
            email_sent = send_otp_email(data['email'], otp.otp_code, 'registration')

            if not email_sent:
                return {
                    'message': 'Failed to send verification email. Please try again.',
                    'status': 'error'
                }, 500

            return {
                'message': f'Verification code sent to {data["email"]}. Please check your email and verify to complete registration.',
                'status': 'success',
                'email': data['email']
            }, 201

        except Exception as e:
            db.session.rollback()
            return {'message': f'Registration failed: {str(e)}', 'status': 'error'}, 500


@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    @auth_ns.doc(
        description='Login and get JWT tokens. OTP required if: (1) account not verified, or (2) no login in past 7 days.',
        security=None  # Login doesn't require authentication
    )
    def post(self):
        """Login user and get JWT tokens"""
        data = request.get_json()

        username_or_email = data.get('username')
        password = data.get('password')

        if not username_or_email or not password:
            return {'message': 'Username/email and password are required', 'status': 'error'}, 400

        # Find user by username or email
        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()

        if not user or not user.check_password(password):
            return {'message': 'Invalid credentials', 'status': 'error'}, 401

        if not user.is_active:
            return {'message': 'Account is deactivated', 'status': 'error'}, 403

        # Check if user is verified (only for local users)
        if user.provider == 'local' and not user.is_verified:
            try:
                # Send OTP for verification
                otp = OTP.create_otp(
                    email=user.email,
                    otp_type='login',
                    expires_in_minutes=10
                )

                # Send OTP email
                email_sent = send_otp_email(user.email, otp.otp_code, 'login')

                if not email_sent:
                    return {
                        'message': 'Failed to send verification email. Please try again.',
                        'status': 'error'
                    }, 500

                return {
                    'message': f'Account not verified. Verification code sent to {user.email}. Please verify to complete login.',
                    'status': 'verification_required',
                    'email': user.email,
                    'requires_otp': True
                }, 200

            except Exception as e:
                return {'message': f'Failed to send OTP: {str(e)}', 'status': 'error'}, 500

        # Check if user hasn't logged in for more than a week (only for local users)
        from datetime import datetime, timedelta
        if user.provider == 'local':
            # If user has never logged in or hasn't logged in for more than 7 days
            if user.last_login is None or (datetime.utcnow() - user.last_login) > timedelta(days=7):
                try:
                    # Send OTP for security verification
                    otp = OTP.create_otp(
                        email=user.email,
                        otp_type='login',
                        expires_in_minutes=10
                    )

                    # Send OTP to user's email (not username)
                    email_sent = send_otp_email(user.email, otp.otp_code, 'login')

                    if not email_sent:
                        return {
                            'message': 'Failed to send verification email. Please try again.',
                            'status': 'error'
                        }, 500

                    return {
                        'message': f'For security reasons, a verification code has been sent to {user.email}. Please verify to complete login.',
                        'status': 'verification_required',
                        'email': user.email,
                        'requires_otp': True,
                        'reason': 'inactive_account'
                    }, 200

                except Exception as e:
                    return {'message': f'Failed to send OTP: {str(e)}', 'status': 'error'}, 500

        # User is verified or OAuth user - proceed with normal login
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()

        # Create tokens (identity must be a string)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'status': 'success'
        }, 200


@auth_ns.route('/refresh')
class Refresh(Resource):
    @jwt_required(refresh=True)
    @auth_ns.marshal_with(token_response)
    @auth_ns.doc(
        description='Refresh access token using refresh_token. Use this when your access token expires.',
        security='Bearer Auth'
    )
    def post(self):
        """Refresh access token"""
        current_user_id = get_jwt_identity()
        # Convert string identity back to integer for database query
        user = User.query.get(int(current_user_id))
        
        if not user or not user.is_active:
            return {'message': 'User not found or inactive', 'status': 'error'}, 401
        
        new_token = create_access_token(identity=str(current_user_id))
        
        return {
            'access_token': new_token,
            'user': user.to_dict(),
            'status': 'success'
        }, 200


@auth_ns.route('/logout')
class Logout(Resource):
    @jwt_required()
    @auth_ns.marshal_with(message_response)
    @auth_ns.doc(
        description='Logout user (token blacklisting can be added)',
        security='Bearer Auth'
    )
    def post(self):
        """Logout user"""
        # In production, you would add token to blacklist here
        jti = get_jwt()['jti']
        # Token blacklist implementation can be added here
        return {'message': 'Successfully logged out', 'status': 'success'}, 200


@auth_ns.route('/verify-otp')
class VerifyOTP(Resource):
    @auth_ns.expect(verify_otp_model)
    @auth_ns.doc(
        description='Verify OTP code for registration or login',
        security=None
    )
    def post(self):
        """Verify OTP and complete registration or login"""
        data = request.get_json()

        email = data.get('email')
        otp_code = data.get('otp_code')
        otp_type = data.get('otp_type')

        if not email or not otp_code or not otp_type:
            return {'message': 'Email, OTP code, and OTP type are required', 'status': 'error'}, 400

        if otp_type not in ['registration', 'login']:
            return {'message': 'Invalid OTP type. Must be "registration" or "login"', 'status': 'error'}, 400

        # Verify OTP
        otp = OTP.verify_otp(email, otp_code, otp_type)

        if not otp:
            return {'message': 'Invalid or expired OTP code', 'status': 'error'}, 400

        try:
            if otp_type == 'registration':
                # Create the user account
                user_data = json.loads(otp.temp_user_data)

                # Double-check user doesn't exist
                if User.query.filter_by(username=user_data['username']).first():
                    return {'message': 'Username already exists', 'status': 'error'}, 400

                if User.query.filter_by(email=user_data['email']).first():
                    return {'message': 'Email already exists', 'status': 'error'}, 400

                # Create new user
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    provider='local',
                    is_verified=True  # Mark as verified since OTP was confirmed
                )
                user.set_password(user_data['password'])

                db.session.add(user)

                # Assign role
                role_name = user_data.get('role', 'student').lower()
                role = Role.query.filter_by(name=role_name).first()

                if not role:
                    role = Role(name=role_name, description=f'{role_name.capitalize()} role')
                    db.session.add(role)

                user_role = UserRole(user=user, role=role)
                db.session.add(user_role)

                # Mark OTP as used
                otp.mark_as_used()

                db.session.commit()

                # Send welcome email (optional, non-blocking)
                try:
                    send_welcome_email(user.email, user.first_name)
                except:
                    pass  # Don't fail registration if welcome email fails

                # Create tokens
                access_token = create_access_token(identity=str(user.id))
                refresh_token = create_refresh_token(identity=str(user.id))

                return {
                    'message': 'Registration successful! You are now logged in.',
                    'status': 'success',
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'user': user.to_dict()
                }, 201

            elif otp_type == 'login':
                # Find the user
                user = User.query.filter_by(email=email).first()

                if not user:
                    return {'message': 'User not found', 'status': 'error'}, 404

                # Mark user as verified and OTP as used
                user.is_verified = True
                otp.mark_as_used()

                # Update last login
                from datetime import datetime
                user.last_login = datetime.utcnow()

                db.session.commit()

                # Create tokens
                access_token = create_access_token(identity=str(user.id))
                refresh_token = create_refresh_token(identity=str(user.id))

                return {
                    'message': 'Login successful!',
                    'status': 'success',
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'user': user.to_dict()
                }, 200

        except Exception as e:
            db.session.rollback()
            return {'message': f'Verification failed: {str(e)}', 'status': 'error'}, 500


@auth_ns.route('/resend-otp')
class ResendOTP(Resource):
    @auth_ns.expect(resend_otp_model)
    @auth_ns.marshal_with(message_response)
    @auth_ns.doc(
        description='Resend OTP code if previous one expired or was not received',
        security=None
    )
    def post(self):
        """Resend OTP code"""
        data = request.get_json()

        email = data.get('email')
        otp_type = data.get('otp_type')

        if not email or not otp_type:
            return {'message': 'Email and OTP type are required', 'status': 'error'}, 400

        if otp_type not in ['registration', 'login']:
            return {'message': 'Invalid OTP type. Must be "registration" or "login"', 'status': 'error'}, 400

        try:
            if otp_type == 'registration':
                # Check if there's a pending registration OTP
                existing_otp = OTP.query.filter_by(
                    email=email,
                    otp_type='registration'
                ).order_by(OTP.created_at.desc()).first()

                if not existing_otp or not existing_otp.temp_user_data:
                    return {
                        'message': 'No pending registration found for this email. Please register again.',
                        'status': 'error'
                    }, 404

                # Create new OTP with same registration data
                otp = OTP.create_otp(
                    email=email,
                    otp_type='registration',
                    user_data=existing_otp.temp_user_data,
                    expires_in_minutes=10
                )

            elif otp_type == 'login':
                # Verify user exists and is not verified
                user = User.query.filter_by(email=email).first()

                if not user:
                    return {'message': 'User not found', 'status': 'error'}, 404

                if user.is_verified:
                    return {
                        'message': 'Account is already verified. Please login normally.',
                        'status': 'error'
                    }, 400

                # Create new OTP
                otp = OTP.create_otp(
                    email=email,
                    otp_type='login',
                    expires_in_minutes=10
                )

            # Send OTP email
            email_sent = send_otp_email(email, otp.otp_code, otp_type)

            if not email_sent:
                return {
                    'message': 'Failed to send verification email. Please try again.',
                    'status': 'error'
                }, 500

            return {
                'message': f'New verification code sent to {email}. Please check your email.',
                'status': 'success'
            }, 200

        except Exception as e:
            db.session.rollback()
            return {'message': f'Failed to resend OTP: {str(e)}', 'status': 'error'}, 500


@auth_ns.route('/me')
class CurrentUser(Resource):
    @jwt_required()
    @auth_ns.doc(
        description='Get current user information',
        security='Bearer Auth'
    )
    def get(self):
        """Get current authenticated user"""
        current_user_id = get_jwt_identity()
        # Convert string identity back to integer for database query
        user = User.query.get(int(current_user_id))
        
        if not user:
            return {'message': 'User not found', 'status': 'error'}, 404
        
        return {
            'user': user.to_dict(),
            'status': 'success'
        }, 200


@auth_ns.route('/request-password-reset')
class RequestPasswordReset(Resource):
    @auth_ns.expect(request_password_reset_model)
    @auth_ns.marshal_with(message_response)
    @auth_ns.doc(
        description='Request password reset - Sends reset token to email',
        security=None  # Password reset doesn't require authentication
    )
    def post(self):
        """Request password reset - Step 1: Send reset token"""
        data = request.get_json()

        email = data.get('email')

        if not email:
            return {'message': 'Email is required', 'status': 'error'}, 400

        # Check if user exists
        user = User.query.filter_by(email=email).first()

        if not user:
            return {
                'message': 'No account found with this email address.',
                'status': 'error'
            }, 404

        # Check if user is OAuth user
        if user.provider != 'local':
            return {
                'message': f'This account uses {user.provider} login. Please use {user.provider} to reset your password.',
                'status': 'error'
            }, 400

        try:
            from flask import current_app
            
            # Create password reset token
            reset_token = OTP.create_otp(
                email=email,
                otp_type='password_reset',
                expires_in_minutes=current_app.config.get('PASSWORD_RESET_EXPIRY_MINUTES', 5)
            )

            # Send reset token via email
            email_sent = send_password_reset_email(email, reset_token.otp_code)

            if not email_sent:
                return {
                    'message': 'Failed to send password reset email. Please try again later.',
                    'status': 'error'
                }, 500

            return {
                'message': f'Password reset code has been sent to {email}. Please check your email.',
                'status': 'success'
            }, 200

        except Exception as e:
            db.session.rollback()
            import logging
            logging.error(f'Error in password reset request: {str(e)}')
            return {
                'message': f'Failed to send password reset code: {str(e)}',
                'status': 'error'
            }, 500


@auth_ns.route('/reset-password')
class ResetPassword(Resource):
    @auth_ns.expect(reset_password_model)
    @auth_ns.marshal_with(message_response)
    @auth_ns.doc(
        description='Reset password using reset token received via email',
        security=None  # Password reset doesn't require authentication
    )
    def post(self):
        """Reset password - Step 2: Verify token and update password"""
        data = request.get_json()

        email = data.get('email')
        reset_token = data.get('reset_token')
        new_password = data.get('new_password')

        # Validate required fields
        if not email or not reset_token or not new_password:
            return {
                'message': 'Email, reset token, and new password are required',
                'status': 'error'
            }, 400

        # Validate password strength
        if len(new_password) < 8:
            return {
                'message': 'Password must be at least 8 characters long',
                'status': 'error'
            }, 400

        # Verify the reset token
        otp = OTP.verify_otp(email, reset_token, 'password_reset')

        if not otp:
            return {
                'message': 'Invalid or expired reset token',
                'status': 'error'
            }, 400

        # Find the user
        user = User.query.filter_by(email=email).first()

        if not user:
            return {
                'message': 'User not found',
                'status': 'error'
            }, 404

        # Ensure user is a local user (not OAuth)
        if user.provider != 'local':
            return {
                'message': 'Cannot reset password for OAuth accounts. Please use your OAuth provider.',
                'status': 'error'
            }, 400

        try:
            # Update password
            user.set_password(new_password)

            # Mark token as used
            otp.mark_as_used()

            db.session.commit()

            # Optional: Send confirmation email
            try:
                from app.services.email_service import send_email
                send_email(
                    subject='Password Changed Successfully - Gradeo',
                    recipient=email,
                    body_text=f'Hello {user.first_name},\n\nYour password has been successfully changed. If you did not make this change, please contact us immediately at help.gradeo@outlook.com.\n\nBest regards,\nThe Gradeo Team',
                    body_html=f'<p>Hello {user.first_name},</p><p>Your password has been successfully changed. If you did not make this change, please contact us immediately at <a href="mailto:help.gradeo@outlook.com">help.gradeo@outlook.com</a>.</p><p>Best regards,<br>The Gradeo Team</p>'
                )
            except:
                pass  # Don't fail password reset if confirmation email fails

            return {
                'message': 'Password reset successful! You can now login with your new password.',
                'status': 'success'
            }, 200

        except Exception as e:
            db.session.rollback()
            return {
                'message': f'Password reset failed: {str(e)}',
                'status': 'error'
            }, 500

