from flask import jsonify, request
from . import bp
from ...services.supabase_service import SupabaseService

# Users endpoints
@bp.route('/users', methods=['GET'])
def get_users():
    """Get a list of all users."""
    users = SupabaseService.get_users()
    return jsonify(users)

@bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user by ID."""
    user = SupabaseService.get_user(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

@bp.route('/users/email/<string:email>', methods=['GET'])
def get_user_by_email(email):
    """Get a user by their email address."""
    user = SupabaseService.get_user_by_email(email)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

@bp.route('/me', methods=['GET'])
def get_current_user():
    """Get the currently authenticated user."""
    # In a real app, this would use JWT token to identify the user
    # For demo, we'll use a header
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    
    user = SupabaseService.get_user(int(user_id))
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

@bp.route('/users', methods=['POST'])
def create_user():
    """Create a new user."""
    data = request.json
    # This would typically insert into a database
    # For now, just return the data with a fake ID
    user = {
        'id': 999,  # Placeholder ID
        'name': data.get('name'),
        'email': data.get('email')
    }
    return jsonify(user), 201

@bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update an existing user."""
    data = request.json
    # This would typically update a database
    user = {
        'id': user_id,
        'name': data.get('name'),
        'email': data.get('email')
    }
    return jsonify(user)

@bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user."""
    # This would typically delete from a database
    return '', 204
