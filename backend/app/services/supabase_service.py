import os
# Comment out the real supabase import since we're using mock data
# from supabase import create_client
from flask import current_app
import random
import time
import copy
from .mock_data import MOCK_USERS, MOCK_PROFILES, MOCK_MATCHES

class SupabaseService:
    """Service for interacting with Supabase."""
    
    def __init__(self):
        # For testing, we'll use mock data instead of connecting to Supabase
        self.use_mock = True
        
        # Only try to connect to Supabase if we're not using mock data
        if not self.use_mock:
            self.url = current_app.config.get('SUPABASE_URL')
            self.key = current_app.config.get('SUPABASE_KEY')
            # Commented out to avoid the need for supabase library
            # self.client = create_client(self.url, self.key)
        
        # Make a deep copy of mock data to avoid modifying the original
        self.mock_users = copy.deepcopy(MOCK_USERS)
        self.mock_profiles = copy.deepcopy(MOCK_PROFILES)
        self.mock_matches = copy.deepcopy(MOCK_MATCHES)
    
    # User methods
    def get_users(self):
        """Get all users from Supabase with complete profile data for matching."""
        if self.use_mock:
            return self.mock_users
            
        # Real Supabase implementation would normally be here
        return []
    
    def get_user(self, user_id):
        """Get a specific user by ID with complete profile for matching."""
        if self.use_mock:
            user = next((u for u in self.mock_users if u['id'] == user_id), None)
            return user
            
        # Real Supabase implementation would normally be here
        return None
    
    def get_user_by_email(self, email):
        """Get a user by email."""
        if self.use_mock:
            user = next((u for u in self.mock_users if u['email'] == email), None)
            return user
            
        # Real Supabase implementation would normally be here
        return None
    
    # Profile methods
    def get_profiles(self):
        """Get all profiles from Supabase."""
        if self.use_mock:
            return self.mock_profiles
            
        # Real Supabase implementation would normally be here
        return []
    
    def get_profile(self, profile_id):
        """Get a specific profile by ID."""
        if self.use_mock:
            profile = next((p for p in self.mock_profiles if p['id'] == profile_id), None)
            return profile
            
        # Real Supabase implementation would normally be here
        return None
    
    def get_profile_by_user_id(self, user_id):
        """Get profile for a specific user."""
        if self.use_mock:
            profile = next((p for p in self.mock_profiles if p['user_id'] == user_id), None)
            return profile
            
        # Real Supabase implementation would normally be here
        return None
    
    # Matching methods
    def get_matches(self, user_id):
        """Get all matches for a user."""
        if self.use_mock:
            matches = [m for m in self.mock_matches if m['user_id'] == user_id]
            return matches
            
        # Real Supabase implementation would normally be here
        return []
    
    def get_match(self, match_id):
        """Get a specific match by ID."""
        if self.use_mock:
            match = next((m for m in self.mock_matches if m['id'] == match_id), None)
            return match
            
        # Real Supabase implementation would normally be here
        return None
    
    def store_match(self, user_id, match_user_id, score, explanation):
        """Store a match in the database."""
        match_data = {
            'id': len(self.mock_matches) + 1,
            'user_id': user_id,
            'matched_user_id': match_user_id,
            'compatibility_score': score,
            'explanation': explanation,
            'status': 'pending',
            'created_at': time.strftime('%Y-%m-%dT%H:%M:%SZ')
        }
        
        if self.use_mock:
            # Check if a match already exists
            existing_match = next((m for m in self.mock_matches 
                                if m['user_id'] == user_id and m['matched_user_id'] == match_user_id), None)
            if existing_match:
                existing_match.update(match_data)
                return existing_match
            
            # Add new match
            self.mock_matches.append(match_data)
            return match_data
            
        # Real Supabase implementation would normally be here
        return None
    
    def get_recommended_matches(self, user_id):
        """
        Get recommended matches for a user.
        In a real implementation, this would call the matching service.
        """
        # This will be replaced by the actual matching service
        all_users = self.get_users()
        existing_matches = self.get_matches(user_id)
        
        # Get IDs of already matched users
        matched_ids = [match['matched_user_id'] for match in existing_matches]
        
        # Filter out already matched users and the user themselves
        recommended = [user for user in all_users if user['id'] != user_id and user['id'] not in matched_ids]
        
        # Add a fake compatibility score for demo purposes
        for user in recommended:
            user['compatibility_score'] = round(random.uniform(0.7, 1.0), 2)
        
        # Sort by compatibility score
        recommended.sort(key=lambda x: x['compatibility_score'], reverse=True)
        
        return recommended[:10]  # Return top 10 matches
    
    def update_match_status(self, match_id, status):
        """Update a match status."""
        if self.use_mock:
            match = next((m for m in self.mock_matches if m['id'] == match_id), None)
            if match:
                match['status'] = status
                return match
            return None
            
        # Real Supabase implementation would normally be here
        return None

# Initialize service
def get_supabase_service():
    """Get an instance of the Supabase service."""
    return SupabaseService() 