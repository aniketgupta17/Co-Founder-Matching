from flask import current_app, request, jsonify
from functools import wraps
from .supabase_service import SupabaseService
import jwt
from datetime import datetime, timedelta
import uuid


class AuthService:
    """Service for handling authentication."""

    def __init__(self):
        self.secret_key = current_app.config.get("JWT_SECRET_KEY")
        self.token_expiry = current_app.config.get(
            "JWT_ACCESS_TOKEN_EXPIRES", 3600
        )  # Default 1 hour
        self.supabase = SupabaseService.get_client()

    def register(self, email, password, name=None):
        """Register a new user with email and password."""
        try:
            current_app.logger.info(f"Attempting to register user: {email}")

            # Generate a user ID deterministically based on email
            # This ensures the same email always gets the same ID
            user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, email))

            # Create user object with metadata
            user = {
                "id": user_id,
                "email": email,
                "user_metadata": {"name": name} if name else {},
            }

            current_app.logger.info(f"Created user with ID: {user_id}")

            # Generate token
            token = self.generate_token(user)

            # For real Supabase integration, you'd use:
            # auth_response = self.supabase.auth.sign_up({
            #    "email": email,
            #    "password": password,
            #    "options": { "data": user_metadata }
            # })

            return {"user": user, "token": token, "supabase_token": None}

        except Exception as e:
            current_app.logger.error(f"Registration error: {str(e)}")
            return {"error": f"Registration failed: {str(e)}"}

    def authenticate(self, email, password):
        """Authenticate a user with email and password."""
        try:
            current_app.logger.info(f"Attempting to authenticate user: {email}")

            # For testing, we'll allow any valid email/password combination
            # In production, this would validate against Supabase

            # Generate a user ID deterministically based on email
            # This ensures the same email always gets the same ID
            user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, email))

            # Create a user object
            user = {"id": user_id, "email": email, "user_metadata": {}}

            current_app.logger.info(f"User authenticated: {user_id}")

            # Generate our JWT token
            token = self.generate_token(user)

            return {"user": user, "token": token, "supabase_token": None}

        except Exception as e:
            current_app.logger.error(f"Authentication error: {str(e)}")
            return None

    def generate_token(self, user):
        """Generate a JWT token for a user."""
        payload = {
            "user_id": user["id"],
            "email": user["email"],
            "exp": datetime.utcnow() + timedelta(seconds=self.token_expiry),
        }
        token = jwt.encode(payload, self.secret_key, algorithm="HS256")
        return token

    def decode_token(self, token):
        """Decode a JWT token."""
        try:
            payload = jwt.decode(
                token, self.secret_key, algorithms=["HS256"], audience="authenticated"
            )
            return payload
        except jwt.ExpiredSignatureError:
            current_app.logger.error("Token expired")
            return None  # Token expired
        except jwt.InvalidTokenError as e:
            current_app.logger.error(f"Invalid token: {e}")
            return None  # Invalid token

    def get_current_user(self):
        """Get the current user from token in Authorization header."""
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            current_app.logger.error("No valid Authorization header")
            return None

        token = auth_header.split(" ")[1]
        payload = self.decode_token(token)

        if not payload:
            current_app.logger.error("Token decode failed")
            return None

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id or not email:
            current_app.logger.error("Missing user_id or email in token payload")
            return None

        try:
            # For testing, we'll construct a user object directly from the token
            # In production, this would query Supabase

            # In a real app, you'd do:
            # user = SupabaseService.get_user(user_id)
            # if not user: return None

            user = {"id": user_id, "email": email, "user_metadata": {}}

            current_app.logger.info(f"Retrieved user from token: {user_id}")
            return user

        except Exception as e:
            current_app.logger.error(f"Error retrieving user: {str(e)}")
            return None


# Helper function to get auth service instance
def get_auth_service():
    """Get the auth service instance."""
    return AuthService()


# Authentication decorator
def login_required(f):
    """Decorator for routes that require authentication."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_service = get_auth_service()
        current_user = auth_service.get_current_user()

        if not current_user:
            return jsonify({"error": "Authentication required"}), 401

        # Set current user in request context
        request.current_user = current_user

        return f(*args, **kwargs)

    return decorated_function
