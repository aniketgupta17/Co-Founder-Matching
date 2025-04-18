from flask import jsonify, request
from . import bp
from ...services.supabase_service import get_supabase_service

# Profiles endpoints
@bp.route('/profiles', methods=['GET'])
def get_profiles():
    """Get a list of all profiles."""
    supabase = get_supabase_service()
    profiles = supabase.get_profiles()
    return jsonify(profiles)

@bp.route('/profiles/<int:profile_id>', methods=['GET'])
def get_profile(profile_id):
    """Get a specific profile by ID."""
    supabase = get_supabase_service()
    profile = supabase.get_profile(profile_id)
    if profile is None:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(profile)

@bp.route('/users/<int:user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    """Get profile for a specific user."""
    supabase = get_supabase_service()
    profile = supabase.get_profile_by_user_id(user_id)
    if profile is None:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(profile)

@bp.route('/me/profile', methods=['GET'])
def get_my_profile():
    """Get profile for the currently authenticated user."""
    # In a real app, this would use JWT token to identify the user
    # For demo, we'll use a header
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    
    supabase = get_supabase_service()
    profile = supabase.get_profile_by_user_id(int(user_id))
    if profile is None:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(profile)

@bp.route('/profiles', methods=['POST'])
def create_profile():
    """Create a new profile."""
    data = request.json
    # This would typically insert into a database
    profile = {
        'id': 999,  # Placeholder ID
        'user_id': data.get('user_id'),
        'skills': data.get('skills', []),
        'interests': data.get('interests', []),
        'bio': data.get('bio', '')
    }
    return jsonify(profile), 201

@bp.route('/profiles/<int:profile_id>', methods=['PUT'])
def update_profile(profile_id):
    """Update an existing profile."""
    data = request.json
    # This would typically update a database
    profile = {
        'id': profile_id,
        'user_id': data.get('user_id'),
        'skills': data.get('skills', []),
        'interests': data.get('interests', []),
        'bio': data.get('bio', '')
    }
    return jsonify(profile)

@bp.route('/profiles/<int:profile_id>', methods=['DELETE'])
def delete_profile(profile_id):
    """Delete a profile."""
    # This would typically delete from a database
    return '', 204 