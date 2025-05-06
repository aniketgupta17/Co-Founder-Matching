import os
from supabase import create_client, Client
from flask import current_app

supabase_client = None

def init_supabase(app):
    global supabase_client
    url = app.config.get('SUPABASE_URL')
    key = app.config.get('SUPABASE_KEY')
    if not url or not key:
        app.logger.error("Supabase URL or key is missing")
        raise ValueError("Supabase URL or key is missing")
    supabase_client = create_client(url, key)
    app.logger.info("Supabase client initialized")

class SupabaseService:
    """Service for interacting with Supabase."""
    
    @staticmethod
    def get_client():
        if supabase_client is None:
            raise RuntimeError("Supabase client is not initialized")
        return supabase_client
    
    # User methods
    @staticmethod
    def get_users():
        """Get all users from Supabase with complete profile data for matching."""
        try:
            response = SupabaseService.get_client().table('users').select('*').execute()
            current_app.logger.info(f"Retrieved {len(response.data)} users")
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving users: {str(e)}")
            raise

    @staticmethod
    def get_user(user_id):
        """Get a specific user by ID with complete profile for matching."""
        try:
            response = SupabaseService.get_client().table('users').select('*').eq('id', user_id).single().execute()
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving user {user_id}: {str(e)}")
            raise

    @staticmethod
    def get_user_by_email(email):
        """Get a user by email."""
        try:
            response = SupabaseService.get_client().table('users').select('*').eq('email', email).single().execute()
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving user by email {email}: {str(e)}")
            raise
    
    # Profile methods
    @staticmethod
    def get_profiles():
        """Get all profiles from Supabase."""
        try:
            response = SupabaseService.get_client().table('profiles').select('*').execute()
            current_app.logger.info(f"Retrieved {len(response.data)} profiles")
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving profiles: {str(e)}")
            raise

    @staticmethod
    def get_profile(profile_id):
        """Get a specific profile by ID."""
        try:
            response = SupabaseService.get_client().table('profiles').select('*').eq('id', profile_id).single().execute()
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving profile {profile_id}: {str(e)}")
            raise

    @staticmethod
    def get_profile_by_user_id(user_id):
        """Get profile for a specific user."""
        try:
            response = SupabaseService.get_client().table('profiles').select('*').eq('user_id', user_id).single().execute()
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving profile for user {user_id}: {str(e)}")
            raise

    @staticmethod
    def create_profile(profile_data):
        """Create a new profile."""
        try:
            response = SupabaseService.get_client().table('profiles').insert(profile_data).execute()
            current_app.logger.info(f"Created new profile for user: {profile_data.get('user_id')}")
            return response.data[0] if response.data else None
        except Exception as e:
            current_app.logger.error(f"Error creating profile: {str(e)}")
            raise

    @staticmethod
    def update_profile(profile_id, profile_data):
        """Update an existing profile."""
        try:
            response = SupabaseService.get_client().table('profiles').update(profile_data).eq('id', profile_id).execute()
            current_app.logger.info(f"Updated profile {profile_id}")
            return response.data[0] if response.data else None
        except Exception as e:
            current_app.logger.error(f"Error updating profile {profile_id}: {str(e)}")
            raise

    @staticmethod
    def delete_profile(profile_id):
        """Delete a profile."""
        try:
            response = SupabaseService.get_client().table('profiles').delete().eq('id', profile_id).execute()
            current_app.logger.info(f"Deleted profile {profile_id}")
            return len(response.data) > 0
        except Exception as e:
            current_app.logger.error(f"Error deleting profile {profile_id}: {str(e)}")
            raise
    
    # Matching methods
    @staticmethod
    def get_matches(user_id):
        """Get all matches for a user."""
        response = SupabaseService.get_client().table('matches').select('*').eq('user_id', user_id).execute()
        return response.data

    @staticmethod
    def get_match(match_id):
        """Get a specific match by ID."""
        response = SupabaseService.get_client().table('matches').select('*').eq('id', match_id).single().execute()
        return response.data

    @staticmethod
    def store_match(user_id, match_user_id, score, explanation):
        """Store a match in the database."""
        match_data = {
            'user_id': user_id,
            'matched_user_id': match_user_id,
            'compatibility_score': score,
            'explanation': explanation,
            'status': 'pending',
        }
        
        response = SupabaseService.get_client().table('matches').insert(match_data).execute()
        return response.data[0] if response.data else None
    
    @staticmethod
    def get_recommended_matches(user_id):
        """
        Get recommended matches for a user.
        This is a simplified version and should be replaced with a more sophisticated matching algorithm.
        """
        # Get all users except the current user
        response = SupabaseService.get_client().table('users').select('*').neq('id', user_id).execute()
        all_users = response.data

        # Get existing matches for the user
        existing_matches = SupabaseService.get_matches(user_id)
        matched_ids = [match['matched_user_id'] for match in existing_matches]

        # Filter out already matched users
        recommended = [user for user in all_users if user['id'] not in matched_ids]

        # In a real-world scenario, you would implement a more sophisticated matching algorithm here
        # For now, we'll just return the first 10 users (or less if there are fewer than 10)
        return recommended[:10]

    @staticmethod
    def update_match_status(match_id, status):
        """Update a match status."""
        response = SupabaseService.get_client().table('matches').update({'status': status}).eq('id', match_id).execute()
        return response.data[0] if response.data else None
