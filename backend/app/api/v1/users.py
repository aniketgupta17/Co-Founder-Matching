from flask import jsonify, request
from . import bp
from ...services.supabase_service import SupabaseService
from ...services.auth_service import login_required

# Users endpoints
@bp.route('/users', methods=['GET'])
def get_users():
    """Get a list of all users."""
    users = SupabaseService.get_users()
    return jsonify(users)

@bp.route('/users/<string:user_id>', methods=['GET'])
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

@bp.route('/users/me', methods=['GET'])
@login_required
def get_users_me():
    """Get the currently authenticated user."""
    return jsonify(request.current_user)

@bp.route('/users', methods=['POST'])
def create_user():
    """Create a new user."""
    data = request.json
    try:
        # Use Supabase auth service to create the user
        user = SupabaseService.get_client().auth.admin.create_user({
            'email': data.get('email'),
            'password': data.get('password'),
            'user_metadata': {
                'name': data.get('name')
            }
        })
        return jsonify(user.user), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@bp.route('/users/<string:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    """Update an existing user."""
    # Check if user has permission to update this user
    if request.current_user['id'] != user_id:
        return jsonify({"error": "You don't have permission to update this user"}), 403
    
    data = request.json
    try:
        # Use Supabase to update the user
        updated_data = {}
        if 'email' in data:
            updated_data['email'] = data['email']
        if 'name' in data:
            updated_data['user_metadata'] = {'name': data['name']}
            
        user = SupabaseService.get_client().auth.admin.update_user(user_id, updated_data)
        return jsonify(user.user)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@bp.route('/users/<string:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    """Delete a user."""
    # Check if user has permission to delete this user
    if request.current_user['id'] != user_id:
        return jsonify({"error": "You don't have permission to delete this user"}), 403
    
    try:
        # Use Supabase to delete the user
        SupabaseService.get_client().auth.admin.delete_user(user_id)
        return '', 204
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@bp.route('/users/search', methods=['GET'])
def search_users():
    """Search for users by query parameter."""
    query = request.args.get('q', '')
    if not query or len(query) < 2:
        return jsonify({"error": "Search query must be at least 2 characters"}), 400
        
    # This is a simplified implementation - in a real app, you'd likely use database full-text search
    users = SupabaseService.get_users()
    results = []
    
    for user in users:
        # Check name, email, skills, etc. based on the query
        name = user.get('name', '').lower()
        email = user.get('email', '').lower()
        
        if query.lower() in name or query.lower() in email:
            results.append(user)
            
    return jsonify(results)
