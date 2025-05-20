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

@bp.route('/profiles/<string:profile_id>', methods=['GET'])
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
    current_app.logger.info("Received request to create_profile")
    data = request.json
    
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    
    try:
        # Use the current authenticated user ID
        user_id = request.current_user['id']
        
        # Check if user already has a profile
        existing_profile = SupabaseService.get_profile(user_id)
        if existing_profile:
            return jsonify({"error": "User already has a profile"}), 400
        
        # Create profile data based on confirmed schema fields
        profile_data = {
            'id': user_id,  # In Supabase, profile ID is the same as user ID
            'user_id': user_id,
            'name': data.get('name', request.current_user.get('user_metadata', {}).get('name', '')),
            'email': data.get('email', request.current_user.get('email', ''))
        }
        
        # Add optional fields if provided
        for field in ['bio', 'avatar_url', 'location', 'industry', 'collab_style', 
                     'startup_stage', 'time_commitment', 'availability']:
            if field in data:
                profile_data[field] = data.get(field)
        
        # Explicitly set created_at field
        profile_data['created_at'] = datetime.now().isoformat()
        
        # Try to create profile
        try:
            profile = SupabaseService.create_profile(profile_data)
            if profile:
                current_app.logger.info(f"Created profile for user: {user_id}")
                return jsonify(profile), 201
            else:
                return jsonify({"error": "Failed to create profile"}), 500
        except Exception as e:
            current_app.logger.error(f"Error creating profile: {str(e)}")
            return jsonify({
                "error": "Failed to create profile",
                "details": str(e)
            }), 500
    except Exception as e:
        current_app.logger.error(f"Error in create_profile: {str(e)}")
        return jsonify({"error": f"An error occurred while creating the profile: {str(e)}"}), 500

@bp.route('/profiles/<string:profile_id>', methods=['PUT'])
@login_required
def update_profile(profile_id):
    """Update an existing profile."""
    current_app.logger.info(f"Received request to update_profile with id: {profile_id}")
    data = request.json
    
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    
    try:
        # Get the profile to check ownership
        current_profile = SupabaseService.get_profile(profile_id)
        if not current_profile:
            return jsonify({"error": "Profile not found"}), 404
            
        # Check if user is updating their own profile
        if current_profile.get('user_id') != request.current_user['id']:
            return jsonify({"error": "You don't have permission to update this profile"}), 403
        
        # Create update data with only fields that exist in the schema
        update_data = {}
        for field in ['name', 'bio', 'avatar_url', 'location', 'industry', 
                     'collab_style', 'startup_stage', 'time_commitment', 'availability', 'email']:
            if field in data:
                update_data[field] = data[field]
        
        # Add updated_at timestamp
        update_data['updated_at'] = datetime.now().isoformat()
        
        # Perform the update
        profile = SupabaseService.update_profile(profile_id, update_data)
        if profile is None:
            current_app.logger.warning(f"Failed to update profile for id: {profile_id}")
            return jsonify({"error": "Failed to update profile"}), 500
            
        current_app.logger.info(f"Updated profile for id: {profile_id}")
        return jsonify(profile)
    except Exception as e:
        current_app.logger.error(f"Error in update_profile: {str(e)}")
        return jsonify({"error": f"An error occurred while updating the profile: {str(e)}"}), 500

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

# Helper endpoint to ensure profile table exists
@bp.route('/profiles/ensure-table', methods=['POST'])
@login_required
def ensure_profiles_table():
    """Ensure that profiles table exists in the database."""
    try:
        user_id = request.current_user['id']
        current_app.logger.info(f"Ensuring profiles table exists for user: {user_id}")
        
        # Create profiles table if it doesn't exist
        create_profiles_table = """
        CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL,
            name TEXT,
            email TEXT,
            bio TEXT,
            avatar_url TEXT,
            location TEXT,
            industry TEXT,
            skills JSONB,
            interests JSONB,
            collab_style TEXT,
            startup_stage TEXT,
            time_commitment TEXT,
            availability TEXT,
            seeking_skills JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Execute the SQL query
        client = SupabaseService.get_client()
        
        try:
            client.postgrest.rpc('exec_sql', {'sql': create_profiles_table}).execute()
            return jsonify({"message": "Profiles table created successfully"})
        except Exception as e:
            current_app.logger.error(f"Error creating profiles table: {str(e)}")
            return jsonify({
                "error": "Failed to create profiles table. This likely means you don't have permission to create tables or the RPC function doesn't exist.",
                "message": "Please ensure the profiles table is created in your Supabase project using migrations or the Supabase dashboard."
            }), 500
    except Exception as e:
        current_app.logger.error(f"Error ensuring profiles table: {str(e)}")
        return jsonify({"error": f"Failed to ensure profiles table: {str(e)}"}), 500
