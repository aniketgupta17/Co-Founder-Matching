from flask import current_app, request, jsonify
from functools import wraps
from .supabase_service import get_supabase_service
import jwt
from datetime import datetime, timedelta

class AuthService:
    """Service for handling authentication."""
    
    def __init__(self):
        self.supabase = get_supabase_service()
        self.secret_key = current_app.config.get('JWT_SECRET_KEY')
        self.token_expiry = current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)  # Default 1 hour
    
    def authenticate(self, email, password):
        """Authenticate a user with email and password."""
        # For testing purposes, we're just looking up the user by email
        # and not verifying the password
        user = self.supabase.get_user_by_email(email)
        
        if user:
            # Create JWT token
            token = self.generate_token(user)
            return {
                'user': user,
                'token': token
            }
        return None
    
    def generate_token(self, user):
        """Generate a JWT token for a user."""
        payload = {
            'user_id': user['id'],
            'email': user['email'],
            'exp': datetime.utcnow() + timedelta(seconds=self.token_expiry)
        }
        token = jwt.encode(payload, self.secret_key, algorithm='HS256')
        return token
    
    def decode_token(self, token):
        """Decode a JWT token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None  # Token expired
        except jwt.InvalidTokenError:
            return None  # Invalid token
    
    def get_current_user(self):
        """Get the current user from token in Authorization header."""
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        payload = self.decode_token(token)
        
        if not payload:
            return None
            
        user_id = payload.get('user_id')
        if not user_id:
            return None
            
        return self.supabase.get_user(user_id)

# Function to create a decorator for protected routes
def get_auth_service():
    """Get an instance of the auth service."""
    return AuthService()

def login_required(f):
    """Decorator to require login for routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_service = get_auth_service()
        current_user = auth_service.get_current_user()
        
        if not current_user:
            return jsonify({"error": "Authentication required"}), 401
            
        # Add user to request context
        request.current_user = current_user
        return f(*args, **kwargs)
    return decorated_function 