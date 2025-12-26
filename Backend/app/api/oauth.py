"""
Google OAuth Authentication Routes
"""
from flask import Blueprint, request, current_app, jsonify
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import create_access_token, create_refresh_token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests
import json
import jwt
from jwt import PyJWKClient
from app import db
from app.models.user import User, Role, UserRole
from app.api import api

oauth_bp = Blueprint('oauth', __name__)
oauth_ns = Namespace('oauth', description='OAuth authentication operations (Google and Microsoft)')

# Request/Response models
google_token_model = api.model('GoogleToken', {
    'token': fields.String(required=True, description='Google ID token from frontend')
})

microsoft_token_model = api.model('MicrosoftToken', {
    'token': fields.String(required=True, description='Microsoft ID token from frontend')
})

oauth_response = api.model('OAuthResponse', {
    'access_token': fields.String(description='JWT access token'),
    'refresh_token': fields.String(description='JWT refresh token'),
    'user': fields.Raw(description='User information'),
    'is_new_user': fields.Boolean(description='True if user was just created')
})


def verify_google_token(token):
    """Verify Google ID token and return user info"""
    try:
        # Verify the token
        client_id = current_app.config.get('GOOGLE_CLIENT_ID')
        if not client_id:
            raise ValueError('Google OAuth not configured')
        
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            client_id
        )
        
        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        return idinfo
    except ValueError as e:
        raise ValueError(f'Invalid token: {str(e)}')


def get_or_create_google_user(google_user_info):
    """Get existing user or create new user from Google info"""
    google_id = google_user_info.get('sub')
    email = google_user_info.get('email')
    
    if not email:
        raise ValueError('Email not provided by Google')
    
    # Check if user exists by provider_id
    user = User.query.filter(
        (User.provider == 'google') & (User.provider_id == google_id)
    ).first()
    
    if not user:
        # Check if user exists with same email but different provider
        existing_user = User.query.filter_by(email=email).first()
        
        if existing_user:
            # Check if the existing user is using the same provider
            if existing_user.provider == 'google':
                # This shouldn't normally happen as we already checked by provider_id
                user = existing_user
            else:
                # Email exists with a different provider, return error
                return None, False, {
                    'message': f'This email is already registered with {existing_user.provider}. Please use {existing_user.provider} login or use a different email.',
                    'status': 'error',
                    'provider': existing_user.provider
                }
        else:
            # Create new user
            name = google_user_info.get('name', '').split(' ', 1)
            first_name = name[0] if name else google_user_info.get('given_name', 'User')
            last_name = name[1] if len(name) > 1 else google_user_info.get('family_name', '')
            
            # Generate username from email if not provided
            username = email.split('@')[0]
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.query.filter_by(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                provider='google',
                provider_id=google_id,
                provider_data=json.dumps(google_user_info),
                avatar_url=google_user_info.get('picture'),
                is_verified=True,  # Google emails are verified
                is_active=True
            )
            db.session.add(user)
            
            # Assign default role (student)
            role = Role.query.filter_by(name='student').first()
            if role:
                user_role = UserRole(user=user, role=role)
                db.session.add(user_role)
                
                db.session.commit()
                return user, True, None  # is_new_user = True, no error
    
    if not user:
        return None, False, {'message': 'User not found', 'status': 'error'}
        
    # Update last login and avatar if changed
    from datetime import datetime
    user.last_login = datetime.utcnow()
    if google_user_info.get('picture') and user.avatar_url != google_user_info.get('picture'):
        user.avatar_url = google_user_info.get('picture')
    db.session.commit()
    
    return user, False, None  # is_new_user = False, no error


def verify_microsoft_token(token):
    """Verify Microsoft ID token and return user info"""
    try:
        current_app.logger.info("Starting Microsoft token verification...")
        client_id = current_app.config.get('MICROSOFT_CLIENT_ID')
        tenant_id = current_app.config.get('MICROSOFT_TENANT_ID', 'common')
        
        current_app.logger.info(f"Client ID: {'Set' if client_id else 'NOT SET'}")
        current_app.logger.info(f"Tenant ID: {tenant_id}")
        
        if not client_id:
            current_app.logger.error("Microsoft OAuth not configured - Missing CLIENT_ID")
            raise ValueError('Microsoft OAuth not configured')
        
        # Get Microsoft's public keys for token verification
        # Microsoft uses different endpoints based on tenant
        if tenant_id == 'common':
            jwks_uri = 'https://login.microsoftonline.com/common/discovery/v2.0/keys'
            issuer = 'https://login.microsoftonline.com/{tid}/v2.0'
        else:
            jwks_uri = f'https://login.microsoftonline.com/{tenant_id}/discovery/v2.0/keys'
            issuer = f'https://login.microsoftonline.com/{tenant_id}/v2.0'
        
        current_app.logger.info(f"Using JWKS URI: {jwks_uri}")
        current_app.logger.info(f"Issuer template: {issuer}")
        
        try:
            # Decode token without verification first to get the kid (key ID)
            unverified = jwt.decode(token, options={"verify_signature": False})
            current_app.logger.info("Successfully decoded unverified token")
            current_app.logger.debug(f"Unverified token claims: {unverified}")
            
            # Get the signing key
            current_app.logger.info("Fetching signing key from Microsoft...")
            jwks_client = PyJWKClient(jwks_uri)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            current_app.logger.info("Successfully retrieved signing key")
            
            # Get the actual tenant ID from token if available
            token_tenant_id = unverified.get('tid', tenant_id)
            current_app.logger.info(f"Using tenant ID from token: {token_tenant_id}")
            
            # Build the expected issuer
            expected_issuer = issuer.format(tid=token_tenant_id)
            current_app.logger.info(f"Expected issuer: {expected_issuer}")
            
            # Verify and decode the token
            current_app.logger.info("Verifying token...")
            decoded_token = jwt.decode(
                token,
                signing_key.key,
                algorithms=['RS256'],
                audience=client_id,
                issuer=expected_issuer
            )
            
            current_app.logger.info("Token verified successfully")
            current_app.logger.debug(f"Decoded token: {decoded_token}")
            
            return decoded_token
            
        except jwt.ExpiredSignatureError as e:
            current_app.logger.error("Token has expired")
            raise ValueError('Token has expired') from e
            
        except jwt.InvalidTokenError as e:
            current_app.logger.error(f"Invalid token: {str(e)}")
            current_app.logger.error(f"Token: {token}")
            raise ValueError(f'Invalid token: {str(e)}') from e
            
    except Exception as e:
        current_app.logger.error(f"Token verification failed: {str(e)}", exc_info=True)
        raise ValueError(f'Token verification failed: {str(e)}') from e


def get_or_create_microsoft_user(microsoft_user_info):
    """Get existing user or create new user from Microsoft info"""
    microsoft_id = microsoft_user_info.get('sub') or microsoft_user_info.get('oid')
    email = microsoft_user_info.get('email') or microsoft_user_info.get('preferred_username')
    
    if not email:
        raise ValueError('Email not provided by Microsoft')
    
    if not microsoft_id:
        raise ValueError('User ID not provided by Microsoft')
    
    # Check if user exists by provider_id
    user = User.query.filter(
        (User.provider == 'microsoft') & (User.provider_id == microsoft_id)
    ).first()
    
    if not user:
        # Check if user exists with same email but different provider
        existing_user = User.query.filter_by(email=email).first()
        
        if existing_user:
            # Check if the existing user is using the same provider
            if existing_user.provider == 'microsoft':
                # This shouldn't normally happen as we already checked by provider_id
                user = existing_user
            else:
                # Email exists with a different provider, return error
                return None, False, {
                    'message': f'This email is already registered with {existing_user.provider}. Please use {existing_user.provider} login or use a different email.',
                    'status': 'error',
                    'provider': existing_user.provider
                }
        else:
            # Create new user
            first_name = microsoft_user_info.get('given_name', '')
            last_name = microsoft_user_info.get('family_name', '')
            name = microsoft_user_info.get('name', '')
            
            # If name is provided but not split, try to split it
            if name and not first_name:
                name_parts = name.split(' ', 1)
                first_name = name_parts[0] if name_parts else 'User'
                last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            if not first_name:
                first_name = 'User'
            
            # Generate username from email if not provided
            username = email.split('@')[0]
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.query.filter_by(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                provider='microsoft',
                provider_id=microsoft_id,
                provider_data=json.dumps(microsoft_user_info),
                avatar_url=None,  # Microsoft doesn't provide picture in ID token
                is_verified=True,  # Microsoft emails are verified
                is_active=True
            )
            db.session.add(user)
            
            # Assign default role (student)
            role = Role.query.filter_by(name='student').first()
            if role:
                user_role = UserRole(user=user, role=role)
                db.session.add(user_role)
            
            db.session.commit()
            return user, True  # is_new_user = True
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    return user, False  # is_new_user = False


@oauth_ns.route('/google')
class GoogleAuth(Resource):
    @oauth_ns.doc(
        description='Get Google OAuth authorization URL. Redirect user to this URL to start OAuth flow.',
        security=None
    )
    def get(self):
        """Get Google OAuth authorization URL"""
        client_id = current_app.config.get('GOOGLE_CLIENT_ID')
        redirect_uri = current_app.config.get('GOOGLE_REDIRECT_URI', 'http://localhost:5001/api/auth/google/callback')
        
        if not client_id:
            return {'message': 'Google OAuth not configured', 'status': 'error'}, 500
        
        # Google OAuth URL
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
            f"scope=openid email profile&"
            f"access_type=offline&"
            f"prompt=consent"
        )
        
        return {
            'auth_url': auth_url,
            'status': 'success'
        }, 200


# Callback route must be on the blueprint, not namespace, to match the redirect URI
@oauth_bp.route('/google/callback')
def google_callback():
    """Handle Google OAuth callback"""
    
    code = request.args.get('code')
    error = request.args.get('error')
    
    if error:
        return jsonify({
            'message': f'OAuth error: {error}',
            'status': 'error'
        }), 400
    
    if not code:
        return jsonify({
            'message': 'Authorization code not provided',
            'status': 'error'
        }), 400
    
    try:
        # Exchange authorization code for tokens
        client_id = current_app.config.get('GOOGLE_CLIENT_ID')
        client_secret = current_app.config.get('GOOGLE_CLIENT_SECRET')
        redirect_uri = current_app.config.get('GOOGLE_REDIRECT_URI', 'http://localhost:5001/api/auth/google/callback')
        
        if not client_id or not client_secret:
            return jsonify({
                'message': 'Google OAuth not configured',
                'status': 'error'
            }), 500
        
        token_url = 'https://oauth2.googleapis.com/token'
        token_data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        tokens = token_response.json()
        
        id_token_str = tokens.get('id_token')
        if not id_token_str:
            return jsonify({
                'message': 'ID token not received from Google',
                'status': 'error'
            }), 400
        
        # Verify and decode ID token
        idinfo = verify_google_token(id_token_str)
        result = get_or_create_google_user(idinfo)
        
        # Check if there was an error (like email already in use)
        if len(result) == 3 and result[2]:
            return result[2], 409
            
        user, is_new_user = result[:2]
        
        # Create JWT tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        # Return tokens (in production, you might want to redirect to frontend with tokens)
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'is_new_user': is_new_user,
            'status': 'success'
        }), 200
        
    except ValueError as e:
        return jsonify({
            'message': f'Token verification failed: {str(e)}',
            'status': 'error'
        }), 400
    except Exception as e:
        return jsonify({
            'message': f'OAuth error: {str(e)}',
            'status': 'error'
        }), 500


@oauth_ns.route('/google/token')
class GoogleTokenAuth(Resource):
    @oauth_ns.expect(google_token_model)
    @oauth_ns.marshal_with(oauth_response)
    @oauth_ns.doc(
        description='Authenticate using Google ID token (for frontend apps). Send the Google ID token from frontend.',
        security=None
    )
    def post(self):
        """Authenticate with Google ID token (for frontend)"""
        data = request.get_json()
        google_token = data.get('token')
        
        if not google_token:
            return {
                'message': 'Google token is required',
                'status': 'error'
            }, 400
        
        try:
            # Verify Google token
            idinfo = verify_google_token(google_token)
            result = get_or_create_google_user(idinfo)
            
            # Check if there was an error (like email already in use)
            if len(result) == 3 and result[2]:
                return result[2], 409
                
            user, is_new_user = result[:2]
            
            # Create JWT tokens
            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))
            
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict(),
                'is_new_user': is_new_user,
                'status': 'success'
            }, 200
            
        except ValueError as e:
            return {
                'message': f'Token verification failed: {str(e)}',
                'status': 'error'
            }, 400
        except Exception as e:
            db.session.rollback()
            return {
                'message': f'Authentication error: {str(e)}',
                'status': 'error'
            }, 500


# Microsoft OAuth Routes
@oauth_ns.route('/microsoft')
class MicrosoftAuth(Resource):
    @oauth_ns.doc(
        description='Get Microsoft OAuth authorization URL. Redirect user to this URL to start OAuth flow.',
        security=None
    )
    def get(self):
        """Get Microsoft OAuth authorization URL"""
        client_id = current_app.config.get('MICROSOFT_CLIENT_ID')
        tenant_id = current_app.config.get('MICROSOFT_TENANT_ID', 'common')
        redirect_uri = current_app.config.get('MICROSOFT_REDIRECT_URI', 'http://localhost:5001/api/auth/microsoft/callback')
        
        if not client_id:
            return {'message': 'Microsoft OAuth not configured', 'status': 'error'}, 500
        
        # Microsoft OAuth URL
        auth_url = (
            f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize?"
            f"client_id={client_id}&"
            f"response_type=code&"
            f"redirect_uri={redirect_uri}&"
            f"response_mode=query&"
            f"scope=openid profile email&"
            f"state=12345"  # Should be random in production
        )
        
        return {
            'auth_url': auth_url,
            'status': 'success'
        }, 200


# Microsoft callback route must be on the blueprint, not namespace
@oauth_bp.route('/microsoft/callback')
def microsoft_callback():
    """Handle Microsoft OAuth callback"""
    code = request.args.get('code')
    error = request.args.get('error')
    error_description = request.args.get('error_description')
    
    if error:
        return jsonify({
            'message': f'OAuth error: {error} - {error_description}',
            'status': 'error'
        }), 400
    
    if not code:
        return jsonify({
            'message': 'Authorization code not provided',
            'status': 'error'
        }), 400
    
    try:
        # Exchange authorization code for tokens
        client_id = current_app.config.get('MICROSOFT_CLIENT_ID')
        client_secret = current_app.config.get('MICROSOFT_CLIENT_SECRET')
        tenant_id = current_app.config.get('MICROSOFT_TENANT_ID', 'common')
        redirect_uri = current_app.config.get('MICROSOFT_REDIRECT_URI', 'http://localhost:5001/api/auth/microsoft/callback')
        
        if not client_id or not client_secret:
            return jsonify({
                'message': 'Microsoft OAuth not configured',
                'status': 'error'
            }), 500
        
        token_url = f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token'
        token_data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
            'scope': 'openid profile email'
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        tokens = token_response.json()
        
        id_token_str = tokens.get('id_token')
        if not id_token_str:
            return jsonify({
                'message': 'ID token not received from Microsoft',
                'status': 'error'
            }), 400
        
        # Verify and decode ID token
        decoded_token = verify_microsoft_token(id_token_str)
        result = get_or_create_microsoft_user(decoded_token)
        
        # Check if there was an error (like email already in use)
        if len(result) == 3 and result[2]:
            return result[2], 409
            
        user, is_new_user = result[:2]
        
        # Create JWT tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        # Return tokens
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'is_new_user': is_new_user,
            'status': 'success'
        }), 200
        
    except ValueError as e:
        return jsonify({
            'message': f'Token verification failed: {str(e)}',
            'status': 'error'
        }), 400
    except Exception as e:
        return jsonify({
            'message': f'OAuth error: {str(e)}',
            'status': 'error'
        }), 500


@oauth_ns.route('/microsoft/token')
class MicrosoftTokenAuth(Resource):
    @oauth_ns.expect(microsoft_token_model)
    @oauth_ns.marshal_with(oauth_response)
    @oauth_ns.doc(
        description='Authenticate using Microsoft ID token (for frontend apps). Send the Microsoft ID token from frontend.',
        security=None
    )
    def post(self):
        """Authenticate with Microsoft ID token (for frontend)"""
        data = request.get_json()
        microsoft_token = data.get('token')
        
        if not microsoft_token:
            return {
                'message': 'Microsoft token is required',
                'status': 'error'
            }, 400
        
        try:
            # Verify Microsoft token
            decoded_token = verify_microsoft_token(microsoft_token)
            result = get_or_create_microsoft_user(decoded_token)
            
            # Check if there was an error (like email already in use)
            if len(result) == 3 and result[2]:
                return result[2], 409
                
            user, is_new_user = result[:2]
            
            # Create JWT tokens
            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))
            
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict(),
                'is_new_user': is_new_user,
                'status': 'success'
            }, 200
            
        except ValueError as e:
            return {
                'message': f'Token verification failed: {str(e)}',
                'status': 'error'
            }, 400
        except Exception as e:
            db.session.rollback()
            return {
                'message': f'Authentication error: {str(e)}',
                'status': 'error'
            }, 500

