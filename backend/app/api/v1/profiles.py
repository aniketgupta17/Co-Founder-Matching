from flask import jsonify, request, current_app
from . import bp
from ...services.supabase_service import SupabaseService
from ...services.auth_service import login_required
from datetime import datetime

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

@bp.route('/profiles/<string:user_id>', methods=['GET'])
def get_profile(user_id):
    """Get a specific profile by user ID."""
    current_app.logger.info(f"Received request for get_profile with id: {user_id}")
    try:
        profile = SupabaseService.get_profile(user_id)
        if profile is None:
            current_app.logger.warning(f"Profile not found for id: {user_id}")
            return jsonify({"error": "Profile not found"}), 404
        current_app.logger.info(f"Retrieved profile for id: {user_id}")
        return jsonify(profile)
    except Exception as e:
        current_app.logger.error(f"Error in get_profile: {str(e)}")
        return jsonify({"error": "An error occurred while fetching the profile"}), 500

@bp.route('/users/<string:user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    """Get profile for a specific user."""
    current_app.logger.info(f"Received request for get_user_profile with user_id: {user_id}")
    try:
        # In Supabase, the profile ID is the same as the user ID
        profile = SupabaseService.get_profile(user_id)
        if profile is None:
            current_app.logger.warning(f"Profile not found for user_id: {user_id}")
            return jsonify({"error": "Profile not found"}), 404
        current_app.logger.info(f"Retrieved profile for user_id: {user_id}")
        return jsonify(profile)
    except Exception as e:
        current_app.logger.error(f"Error in get_user_profile: {str(e)}")
        return jsonify({"error": "An error occurred while fetching the profile"}), 500

@bp.route('/me/profile', methods=['GET'])
@login_required
def get_my_profile():
    """Get profile for the currently authenticated user."""
    current_app.logger.info("Received request for get_my_profile")
    try:
        # Get user ID from the current user
        user_id = request.current_user['id']
        current_app.logger.info(f"Looking up profile for user ID: {user_id}")
        
        # In Supabase, the profile id is the same as the user id
        profile = SupabaseService.get_profile(user_id)
        
        # Check if profile exists
        if profile is None:
            current_app.logger.warning(f"Profile not found for user ID: {user_id}")
            return jsonify({"error": "Profile not found", "message": "No profile exists for this user"}), 404
        
        current_app.logger.info(f"Retrieved profile for user ID: {user_id}")
        return jsonify(profile)
    except Exception as e:
        current_app.logger.error(f"Error in get_my_profile: {str(e)}")
        return jsonify({"error": f"An error occurred while fetching your profile: {str(e)}"}), 500

@bp.route('/profiles', methods=['POST'])
@login_required
def create_profile():
    """Create a new profile."""
    try:
        data = request.json
        user_id = request.current_user['id']
        
        current_app.logger.info(f"Creating profile for user {user_id}")
        
        # Add user_id to the profile data
        data['user_id'] = user_id
        data['id'] = user_id  # Set both id and user_id to the same value
        
        # Check for required fields for a complete profile
        required_fields = [
            'name', 'bio', 'location', 'industry', 'skills', 'interests', 
            'collab_style', 'startup_stage', 'time_commitment', 'availability'
        ]
        
        # Check which fields are missing
        missing_fields = []
        for field in required_fields:
            if field not in data or not data[field]:
                missing_fields.append(field)
            elif field in ['skills', 'interests'] and isinstance(data[field], list) and len(data[field]) == 0:
                missing_fields.append(field)
        
        # Set is_complete based on missing fields
        is_complete = len(missing_fields) == 0
        data['is_complete'] = is_complete
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = datetime.now().isoformat()
        
        # Check if profile already exists
        existing_profile = SupabaseService.get_profile_by_user_id(user_id)
        if existing_profile:
            # Update existing profile
            current_app.logger.info(f"Profile already exists for user {user_id}, updating it")
            profile = SupabaseService.update_profile(existing_profile['id'], data)
            if profile:
                response_data = {
                    "profile": profile,
                    "is_complete": is_complete
                }
                
                # If profile is not complete, add guidance
                if not is_complete:
                    response_data["missing_fields"] = missing_fields
                    response_data["completion_percentage"] = int(100 * (len(required_fields) - len(missing_fields)) / len(required_fields))
                    response_data["message"] = "Your profile is incomplete. Please complete the missing fields to get better matches."
                else:
                    response_data["message"] = "Your profile is complete! You're ready to find co-founder matches."
                
                return jsonify(response_data)
            else:
                return jsonify({"error": "Failed to update existing profile"}), 500
        else:
            # Create new profile
            current_app.logger.info(f"Creating new profile for user {user_id}")
            profile = SupabaseService.create_profile(data)
            
            if profile:
                response_data = {
                    "profile": profile,
                    "is_complete": is_complete
                }
                
                # If profile is not complete, add guidance
                if not is_complete:
                    response_data["missing_fields"] = missing_fields
                    response_data["completion_percentage"] = int(100 * (len(required_fields) - len(missing_fields)) / len(required_fields))
                    response_data["message"] = "Your profile is incomplete. Please complete the missing fields to get better matches."
                else:
                    response_data["message"] = "Your profile is complete! You're ready to find co-founder matches."
                
                return jsonify(response_data)
            else:
                # Try checking if there's an issue with the database schema
                table_check = SupabaseService.ensure_profiles_table()
                if "error" in table_check:
                    return jsonify({
                        "error": "Failed to create profile due to database schema issues",
                        "details": table_check,
                        "message": "Please ensure your Supabase database has all required tables and columns"
                    }), 500
                
                return jsonify({"error": "Failed to create profile"}), 500
    except Exception as e:
        current_app.logger.error(f"An error occurred while creating the profile: {str(e)}")
        return jsonify({"error": f"An error occurred while creating the profile: {str(e)}"}), 500

@bp.route('/profiles/<string:user_id>', methods=['PUT'])
@login_required
def update_profile(user_id):
    """Update a profile."""
    # Check if the user is updating their own profile
    if request.current_user["id"] != user_id:
        return jsonify({"error": "You can only update your own profile"}), 403
    
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    
    # Check for required fields for a complete profile
    required_fields = [
        'name', 'bio', 'location', 'industry', 'skills', 'interests', 
        'collab_style', 'startup_stage', 'time_commitment', 'availability'
    ]
    
    # Check which fields are missing
    missing_fields = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
        elif field in ['skills', 'interests'] and isinstance(data[field], list) and len(data[field]) == 0:
            missing_fields.append(field)
    
    # Set is_complete based on missing fields
    is_complete = len(missing_fields) == 0
    data['is_complete'] = is_complete
    data['updated_at'] = datetime.now().isoformat()
    
    try:
        current_app.logger.info(f"Updating profile for user {user_id} (complete: {is_complete})")
        profile = SupabaseService.update_profile(user_id, data)
        
        if not profile:
            return jsonify({"error": "Failed to update profile"}), 500
        
        response_data = {
            "profile": profile,
            "is_complete": is_complete
        }
        
        # If profile is not complete, add guidance
        if not is_complete:
            response_data["missing_fields"] = missing_fields
            response_data["completion_percentage"] = int(100 * (len(required_fields) - len(missing_fields)) / len(required_fields))
            response_data["message"] = "Your profile is incomplete. Please complete the missing fields to get better matches."
        else:
            response_data["message"] = "Your profile is complete! You're ready to find co-founder matches."
        
        return jsonify(response_data)
    except Exception as e:
        current_app.logger.error(f"Error updating profile: {str(e)}")
        return jsonify({"error": str(e)}), 400

@bp.route('/profiles/<string:profile_id>', methods=['DELETE'])
@login_required
def delete_profile(profile_id):
    """Delete a profile."""
    current_app.logger.info(f"Received request to delete_profile with id: {profile_id}")
    
    try:
        # Get the profile to check ownership
        current_profile = SupabaseService.get_profile(profile_id)
        if not current_profile:
            return jsonify({"error": "Profile not found"}), 404
            
        # Check if user is deleting their own profile
        if current_profile.get('user_id') != request.current_user['id']:
            return jsonify({"error": "You don't have permission to delete this profile"}), 403
        
        # Perform the delete
        result = SupabaseService.delete_profile(profile_id)
        if not result:
            current_app.logger.warning(f"Failed to delete profile for id: {profile_id}")
            return jsonify({"error": "Failed to delete profile"}), 500
            
        current_app.logger.info(f"Deleted profile for id: {profile_id}")
        return '', 204
    except Exception as e:
        current_app.logger.error(f"Error in delete_profile: {str(e)}")
        return jsonify({"error": f"An error occurred while deleting the profile: {str(e)}"}), 500

@bp.route('/profiles/ensure-table', methods=['POST'])
@login_required
def ensure_profiles_table():
    """Ensure the profiles table exists with all required columns."""
    try:
        result = SupabaseService.ensure_profiles_table()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Failed to create profiles table. This likely means you don't have permission to create tables or the RPC function doesn't exist.",
            "message": "Please ensure the profiles table is created in your Supabase project using migrations or the Supabase dashboard."
        }), 500
