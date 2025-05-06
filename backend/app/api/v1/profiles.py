from flask import jsonify, request, current_app
from . import bp
from ...services.supabase_service import SupabaseService
# Removed auth_required import

# Profiles endpoints
@bp.route('/profiles', methods=['GET'])
def get_profiles():
    """Get a list of all profiles."""
    current_app.logger.info("Received request for get_profiles")
    try:
        profiles = SupabaseService.get_profiles()
        current_app.logger.info(f"Retrieved {len(profiles)} profiles")
        return jsonify(profiles)
    except Exception as e:
        current_app.logger.error(f"Error in get_profiles: {str(e)}")
        return jsonify({"error": "An error occurred while fetching profiles"}), 500

@bp.route('/profiles/<int:profile_id>', methods=['GET'])
def get_profile(profile_id):
    """Get a specific profile by ID."""
    current_app.logger.info(f"Received request for get_profile with id: {profile_id}")
    try:
        profile = SupabaseService.get_profile(profile_id)
        if profile is None:
            current_app.logger.warning(f"Profile not found for id: {profile_id}")
            return jsonify({"error": "Profile not found"}), 404
        current_app.logger.info(f"Retrieved profile for id: {profile_id}")
        return jsonify(profile)
    except Exception as e:
        current_app.logger.error(f"Error in get_profile: {str(e)}")
        return jsonify({"error": "An error occurred while fetching the profile"}), 500

@bp.route('/users/<int:user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    """Get profile for a specific user."""
    current_app.logger.info(f"Received request for get_user_profile with user_id: {user_id}")
    profile = SupabaseService.get_profile_by_user_id(user_id)
    if profile is None:
        current_app.logger.warning(f"Profile not found for user_id: {user_id}")
        return jsonify({"error": "Profile not found"}), 404
    current_app.logger.info(f"Retrieved profile for user_id: {user_id}")
    return jsonify(profile)

@bp.route('/me/profile', methods=['GET'])
def get_my_profile():
    """Get profile for the currently authenticated user."""
    current_app.logger.info("Received request for get_my_profile")
    # Note: This endpoint might not work without authentication
    user_id = request.headers.get('X-User-Id')  # You might need to adjust this based on your frontend
    if not user_id:
        current_app.logger.warning("No user ID provided for get_my_profile")
        return jsonify({"error": "User ID is required"}), 400
    profile = SupabaseService.get_profile_by_user_id(user_id)
    if profile is None:
        current_app.logger.warning(f"Profile not found for user ID: {user_id}")
        return jsonify({"error": "Profile not found"}), 404
    current_app.logger.info(f"Retrieved profile for user ID: {user_id}")
    return jsonify(profile)

@bp.route('/profiles', methods=['POST'])
def create_profile():
    """Create a new profile."""
    current_app.logger.info("Received request to create_profile")
    data = request.json
    DEFAULT_AVATAR_URL = 'https://bivbvzynoxlcfbvdkfol.supabase.co/storage/v1/object/sign/avatars/Default_Avatar.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2EyNDEwYTYxLTBjYjctNDY4NS04OTM0LWM3MjgwNzBhMDBjMSJ9.eyJ1cmwiOiJhdmF0YXJzL0RlZmF1bHRfQXZhdGFyLnBuZyIsImlhdCI6MTc0NjA4OTcwMCwiZXhwIjoxNzc3NjI1NzAwfQ.KJ2R0b0T462nmPmzZLpM7ibQF9Jvc3J_UCmJ7KX3Odo'
    
    profile = SupabaseService.create_profile({
        'user_id': data.get('user_id'),  # You might need to adjust this
        'skills': data.get('skills', []),
        'interests': data.get('interests', []),
        'bio': data.get('bio', ''),
        'avatar_url': data.get('avatar_url', DEFAULT_AVATAR_URL) 
    })
    current_app.logger.info(f"Created new profile for user: {data.get('user_id')}")
    return jsonify(profile), 201

@bp.route('/profiles/<int:profile_id>', methods=['PUT'])
def update_profile(profile_id):
    """Update an existing profile."""
    current_app.logger.info(f"Received request to update_profile with id: {profile_id}")
    data = request.json
    profile = SupabaseService.update_profile(profile_id, {
        'skills': data.get('skills'),
        'interests': data.get('interests'),
        'bio': data.get('bio'),
        'avatar_url': data.get('avatar_url')
    })
    if profile is None:
        current_app.logger.warning(f"Failed to update profile for id: {profile_id}")
        return jsonify({"error": "Profile not found or you don't have permission to update it"}), 404
    current_app.logger.info(f"Updated profile for id: {profile_id}")
    return jsonify(profile)

@bp.route('/profiles/<int:profile_id>', methods=['DELETE'])
def delete_profile(profile_id):
    """Delete a profile."""
    current_app.logger.info(f"Received request to delete_profile with id: {profile_id}")
    result = SupabaseService.delete_profile(profile_id)
    if not result:
        current_app.logger.warning(f"Failed to delete profile for id: {profile_id}")
        return jsonify({"error": "Profile not found or you don't have permission to delete it"}), 404
    current_app.logger.info(f"Deleted profile for id: {profile_id}")
    return '', 204
