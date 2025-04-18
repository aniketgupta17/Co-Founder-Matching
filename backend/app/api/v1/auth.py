from flask import jsonify, request
from . import bp
from ...services.auth_service import get_auth_service, login_required

# Auth endpoints
@bp.route('/auth/login', methods=['POST'])
def login():
    """Authenticate a user and return a JWT token."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    auth_service = get_auth_service()
    result = auth_service.authenticate(email, password)
    
    if not result:
        return jsonify({"error": "Invalid credentials"}), 401
    
    return jsonify(result)

@bp.route('/auth/me', methods=['GET'])
@login_required
def get_authenticated_user():
    """Get the authenticated user's information."""
    # request.current_user is set by the login_required decorator
    return jsonify(request.current_user)

@bp.route('/auth/refresh', methods=['POST'])
def refresh_token():
    """Refresh the JWT token."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization header required"}), 401
    
    token = auth_header.split(' ')[1]
    auth_service = get_auth_service()
    payload = auth_service.decode_token(token)
    
    if not payload:
        return jsonify({"error": "Invalid or expired token"}), 401
    
    user_id = payload.get('user_id')
    if not user_id:
        return jsonify({"error": "Invalid token payload"}), 401
    
    # Get user from Supabase
    supabase = auth_service.supabase
    user = supabase.get_user(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Generate new token
    new_token = auth_service.generate_token(user)
    
    return jsonify({
        "token": new_token,
        "user": user
    }) 