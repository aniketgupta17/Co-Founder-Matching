from flask import jsonify, request, current_app
from . import bp
from ...services.supabase_service import SupabaseService
from ...services.auth_service import login_required
from ...services.matching_service import get_matching_service
from datetime import datetime

# Onboarding endpoints
@bp.route('/onboarding/profile', methods=['POST'])
@login_required
def create_user_profile():
    """Create or update a user profile after initial signup."""
    user = request.current_user
    user_id = user['id']
    data = request.json
    
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
    
    # Required fields for a complete profile
    required_fields = ['skills', 'interests', 'startup_stage', 'location', 'availability']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "missing_fields": missing_fields
        }), 400
    
    # Logging profile creation
    current_app.logger.info(f"Creating/updating profile for user {user_id}")
    
    # Handle test users with mock data
    if user.get('is_test_user', False):
        current_app.logger.info(f"Test user detected: {user_id}. Returning mock profile update.")
        
        # For test users, return a successful profile update
        mock_profile = {
            'id': user_id,
            'email': user.get('email'),
            'name': user.get('user_metadata', {}).get('name', 'Test User'),
            'bio': data.get('bio', ''),
            'location': data.get('location'),
            'availability': data.get('availability'),
            'startup_stage': data.get('startup_stage'),
            'seeking_skills': data.get('skills', []),
            'industry': data.get('interests', []),
            'time_commitment': data.get('availability'),
            'collab_style': 'Collaborative',
            'avatar_url': None,
            'created_at': datetime.now().isoformat()
        }
        
        return jsonify({
            "message": "Profile updated successfully",
            "profile": mock_profile,
            "next_steps": {
                "find_matches": "/api/v1/matches/recommend",
                "view_profile": "/api/v1/profiles/" + user_id
            }
        })
    
    # Update user profile in Supabase
    try:
        # Map user data to the profile schema in Supabase
        profile_data = {
            'id': user_id,  # The profile id is the same as the user id
            'email': user.get('email'),
            'name': user.get('user_metadata', {}).get('name', 'Aniket Testing'),
            'bio': data.get('bio', ''),
            'location': data.get('location'),
            'availability': data.get('availability'),
            'startup_stage': data.get('startup_stage'),
            'seeking_skills': data.get('skills', []),
            'industry': data.get('interests', []),
            'time_commitment': data.get('availability'),
            'collab_style': 'Collaborative',
            'avatar_url': None,
            'created_at': datetime.now().isoformat()
        }
        
        current_app.logger.info(f"Sending profile data to Supabase for user {user_id}")
        result = SupabaseService.update_user_profile(user_id, profile_data)
        
        if not result:
            current_app.logger.error(f"Failed to update profile for user {user_id}")
            return jsonify({"error": "Failed to update profile in database"}), 500
        
        current_app.logger.info(f"Profile updated successfully for user {user_id}")
        return jsonify({
            "message": "Profile updated successfully",
            "profile": result,
            "next_steps": {
                "find_matches": "/api/v1/matches/recommend",
                "view_profile": "/api/v1/profiles/" + user_id
            }
        })
    except Exception as e:
        current_app.logger.error(f"Error updating profile: {str(e)}")
        return jsonify({"error": f"Failed to update profile: {str(e)}"}), 500

@bp.route('/onboarding/profile', methods=['GET'])
@login_required
def get_onboarding_user_profile():
    """Get the current user's profile."""
    user = request.current_user
    user_id = user['id']
    
    # Handle test users with mock data
    if user.get('is_test_user', False):
        current_app.logger.info(f"Test user detected: {user_id}. Returning mock profile.")
        
        # For test users, return a not-found profile to trigger onboarding
        return jsonify({
            "message": "Profile not found. Please complete your profile.",
            "profile_exists": False,
            "profile_url": "/api/v1/onboarding/profile"
        }), 404
    
    profile = SupabaseService.get_user_profile(user_id)
    
    if not profile:
        return jsonify({
            "message": "Profile not found. Please complete your profile.",
            "profile_exists": False,
            "profile_url": "/api/v1/onboarding/profile"
        }), 404
    
    return jsonify({
        "profile": profile,
        "profile_exists": True,
        "profile_complete": profile.get('profile_complete', False)
    })

@bp.route('/onboarding/checklist', methods=['GET'])
@login_required
def get_onboarding_checklist():
    """Get the onboarding checklist for the user."""
    user = request.current_user
    user_id = user['id']
    
    profile = SupabaseService.get_user_profile(user_id)
    
    # Define the checklist items
    checklist = [
        {
            "id": "create_account",
            "title": "Create account",
            "description": "Sign up with email and password",
            "completed": True  # If they're authenticated, this is done
        },
        {
            "id": "complete_profile",
            "title": "Complete profile",
            "description": "Add your skills, interests, and preferences",
            "completed": profile is not None and profile.get('profile_complete', False)
        },
        {
            "id": "view_matches",
            "title": "View potential matches",
            "description": "See co-founders that match your profile",
            "completed": False,  # We'll set this based on whether they've checked matches
            "url": "/api/v1/matches/recommend" 
        },
        {
            "id": "connect_founders",
            "title": "Connect with co-founders",
            "description": "Reach out to potential co-founders",
            "completed": False  # This would be set based on connection history
        }
    ]
    
    # Check if they've viewed matches
    if profile and profile.get('profile_complete', False):
        # Query for any match history
        match_history = SupabaseService.get_user_match_history(user_id)
        if match_history and len(match_history) > 0:
            checklist[2]["completed"] = True
            
            # If they've connected with anyone
            connected = any(m.get('status') == 'connected' for m in match_history)
            if connected:
                checklist[3]["completed"] = True
    
    return jsonify({
        "checklist": checklist,
        "progress": sum(1 for item in checklist if item["completed"]) / len(checklist)
    })

@bp.route('/onboarding/next-steps', methods=['GET'])
@login_required
def get_next_steps():
    """Get the next steps for the user in the onboarding process."""
    user = request.current_user
    user_id = user['id']
    
    profile = SupabaseService.get_user_profile(user_id)
    
    if not profile:
        return jsonify({
            "next_step": "complete_profile",
            "action_url": "/api/v1/onboarding/profile",
            "message": "Complete your profile to get matched with co-founders"
        })
    
    if not profile.get('profile_complete', False):
        return jsonify({
            "next_step": "complete_profile",
            "action_url": "/api/v1/onboarding/profile",
            "message": "Your profile is incomplete. Add more information to improve matches."
        })
    
    # Check if they've viewed matches
    match_history = SupabaseService.get_user_match_history(user_id)
    if not match_history or len(match_history) == 0:
        return jsonify({
            "next_step": "view_matches",
            "action_url": "/api/v1/matches/recommend",
            "message": "View your potential co-founder matches"
        })
    
    # If they haven't connected with anyone
    connected = any(m.get('status') == 'connected' for m in match_history)
    if not connected:
        return jsonify({
            "next_step": "connect_founders",
            "action_url": "/api/v1/matches",
            "message": "Connect with your potential co-founder matches"
        })
    
    # All steps completed
    return jsonify({
        "next_step": "dashboard",
        "action_url": "/dashboard",
        "message": "Congratulations! You've completed all onboarding steps."
    }) 