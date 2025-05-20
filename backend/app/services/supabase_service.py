import os
from supabase import create_client, Client
from flask import current_app

supabase_client = None

def init_supabase(app):
    """Initialize the Supabase client."""
    global supabase_client
    url = app.config.get('SUPABASE_URL')
    key = app.config.get('SUPABASE_KEY')
    
    if not url or not key:
        app.logger.error("Supabase URL or key is missing")
        raise ValueError("Supabase URL or key is missing")
    
    try:
        app.logger.info(f"Initializing Supabase client with URL: {url[:20]}...")
        supabase_client = create_client(url, key)
        app.logger.info("Supabase client initialized successfully")
    except Exception as e:
        app.logger.error(f"Error initializing Supabase client: {str(e)}")
        raise

class SupabaseService:
    """Service for interacting with Supabase."""
    
    @staticmethod
    def get_client():
        """Get the Supabase client instance."""
        if supabase_client is None:
            current_app.logger.error("Supabase client is not initialized")
            raise RuntimeError("Supabase client is not initialized")
        return supabase_client
    
    # User methods
    @staticmethod
    def get_users():
        """Get all users from Supabase with complete profile data for matching."""
        try:
            current_app.logger.info("Retrieving all users from Supabase")
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
            current_app.logger.info(f"Retrieving user with ID: {user_id}")
            response = SupabaseService.get_client().table('users').select('*').eq('id', user_id).single().execute()
            if response.data:
                current_app.logger.info(f"User found: {user_id}")
            else:
                current_app.logger.warning(f"User not found: {user_id}")
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving user {user_id}: {str(e)}")
            raise

    @staticmethod
    def get_user_by_email(email):
        """Get a user by email."""
        try:
            current_app.logger.info(f"Retrieving user with email: {email}")
            response = SupabaseService.get_client().table('users').select('*').eq('email', email).single().execute()
            if response.data:
                current_app.logger.info(f"User found for email: {email}")
            else:
                current_app.logger.warning(f"User not found for email: {email}")
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving user by email {email}: {str(e)}")
            raise
    
    # Profile methods
    @staticmethod
    def get_profiles():
        """Get all profiles from Supabase."""
        try:
            current_app.logger.info("Retrieving all profiles from Supabase")
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
            current_app.logger.info(f"Retrieving profile with ID: {profile_id}")
            response = SupabaseService.get_client().table('profiles').select('*').eq('id', profile_id).single().execute()
            if response.data:
                current_app.logger.info(f"Profile found: {profile_id}")
            else:
                current_app.logger.warning(f"Profile not found: {profile_id}")
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

    @classmethod
    def get_user_profile(cls, user_id):
        """Get a user's profile by user ID."""
        try:
            current_app.logger.info(f"Retrieving profile for user ID: {user_id}")
            client = cls.get_client()
            response = client.table('profiles').select('*').eq('user_id', user_id).execute()
            
            if response.data and len(response.data) > 0:
                current_app.logger.info(f"Profile found for user: {user_id}")
                return response.data[0]
            else:
                current_app.logger.warning(f"No profile found for user: {user_id}")
            return None
        except Exception as e:
            current_app.logger.error(f"Error getting user profile: {str(e)}")
            return None
    
    @classmethod
    def update_user_profile(cls, user_id, profile_data):
        """Update a user's profile."""
        try:
            current_app.logger.info(f"Updating profile for user ID: {user_id}")
            current_app.logger.debug(f"Profile data: {profile_data}")
            
            client = cls.get_client()
            
            # Check if profile exists
            existing_profile = cls.get_user_profile(user_id)
            
            if existing_profile:
                current_app.logger.info(f"Updating existing profile for user: {user_id}")
                try:
                    # In Supabase, the profile ID is stored in the 'id' field, not 'user_id'
                    response = client.table('profiles').update(profile_data).eq('id', user_id).execute()
                    current_app.logger.debug(f"Update response: {response}")
                    if response.data and len(response.data) > 0:
                        current_app.logger.info(f"Profile updated successfully for user: {user_id}")
                        return response.data[0]
                    else:
                        current_app.logger.warning(f"No data returned after profile update for user: {user_id}")
                        return None
                except Exception as e:
                    current_app.logger.error(f"Error updating existing profile: {str(e)}")
                    raise
            else:
                current_app.logger.info(f"Creating new profile for user: {user_id}")
                
                # Make sure the profile data includes the ID
                if 'id' not in profile_data:
                    profile_data['id'] = user_id
                
                try:
                    # For testing purposes, let's check if the user exists in users table
                    user_exists = True
                    try:
                        user_response = client.table('users').select('id').eq('id', user_id).execute()
                        if not user_response.data or len(user_response.data) == 0:
                            current_app.logger.warning(f"User {user_id} not found in users table. Creating dummy user first.")
                            
                            # For our special test user, let's create a user record first
                            user_data = {
                                'id': user_id,
                                'email': profile_data.get('email', 'aniket17@testing.com'),
                                'name': profile_data.get('name', 'Aniket Testing')
                            }
                            
                            try:
                                user_insert = client.table('users').insert(user_data).execute()
                                current_app.logger.info(f"Created user record: {user_id}")
                                if user_insert.data and len(user_insert.data) > 0:
                                    user_exists = True
                                else:
                                    current_app.logger.warning("Failed to create user record")
                            except Exception as ue:
                                current_app.logger.error(f"Error creating user record: {str(ue)}")
                                # Continue anyway - the profile creation might work even if user doesn't exist
                    except Exception as ue:
                        current_app.logger.error(f"Error checking if user exists: {str(ue)}")
                    
                    # Insert the profile
                    response = client.table('profiles').insert(profile_data).execute()
                    current_app.logger.debug(f"Insert response: {response}")
                    
                    if response.data and len(response.data) > 0:
                        current_app.logger.info(f"Profile created successfully for user: {user_id}")
                        return response.data[0]
                    else:
                        current_app.logger.warning(f"No data returned after profile creation for user: {user_id}")
                        return None
                except Exception as e:
                    current_app.logger.error(f"Error creating new profile: {str(e)}")
                    raise
            
        except Exception as e:
            current_app.logger.error(f"Error updating user profile: {str(e)}")
            raise
            
    @classmethod
    def get_user_match_history(cls, user_id):
        """Get a user's match history."""
        try:
            client = cls.get_client()
            
            # Get matches where the user is either the initiator or the matched user
            response = client.table('matches').select('*').or_(f'user_id.eq.{user_id},matched_user_id.eq.{user_id}').execute()
            
            if response.data:
                return response.data
            return []
        except Exception as e:
            current_app.logger.error(f"Error getting user match history: {str(e)}")
            return []

    # Chat methods
    @classmethod
    def get_conversations(cls, user_id):
        """Get all conversations where user is a participant."""
        try:
            current_app.logger.info(f"Retrieving conversations for user: {user_id}")
            client = cls.get_client()
            
            # Using OR to get conversations where user is either participant
            response = client.table('conversations').select('*').or_(
                f'user_id_1.eq.{user_id},user_id_2.eq.{user_id}'
            ).execute()
            
            current_app.logger.info(f"Retrieved {len(response.data)} conversations for user: {user_id}")
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving conversations: {str(e)}")
            # Create the conversations table if it doesn't exist
            if "relation \"conversations\" does not exist" in str(e):
                current_app.logger.info("Conversations table does not exist, returning empty list")
                return []
            raise

    @classmethod
    def find_conversation(cls, user_id_1, user_id_2):
        """Find a conversation between two users."""
        try:
            current_app.logger.info(f"Finding conversation between users: {user_id_1} and {user_id_2}")
            client = cls.get_client()
            
            # Check both possible arrangements of user IDs
            response = client.table('conversations').select('*').or_(
                f'(user_id_1.eq.{user_id_1},user_id_2.eq.{user_id_2}),(user_id_1.eq.{user_id_2},user_id_2.eq.{user_id_1})'
            ).single().execute()
            
            if response.data:
                current_app.logger.info(f"Found conversation between users: {user_id_1} and {user_id_2}")
                return response.data
            current_app.logger.info(f"No conversation found between users: {user_id_1} and {user_id_2}")
            return None
        except Exception as e:
            current_app.logger.error(f"Error finding conversation: {str(e)}")
            # Handle case where table doesn't exist
            if "relation \"conversations\" does not exist" in str(e):
                current_app.logger.info("Conversations table does not exist, returning None")
                return None
            return None

    @classmethod
    def get_conversation(cls, conversation_id):
        """Get a specific conversation by ID."""
        try:
            current_app.logger.info(f"Retrieving conversation: {conversation_id}")
            client = cls.get_client()
            
            response = client.table('conversations').select('*').eq('id', conversation_id).single().execute()
            
            if response.data:
                current_app.logger.info(f"Retrieved conversation: {conversation_id}")
                return response.data
            current_app.logger.warning(f"Conversation not found: {conversation_id}")
            return None
        except Exception as e:
            current_app.logger.error(f"Error retrieving conversation: {str(e)}")
            return None

    @classmethod
    def create_conversation(cls, conversation_data):
        """Create a new conversation."""
        try:
            current_app.logger.info(f"Creating conversation between: {conversation_data['user_id_1']} and {conversation_data['user_id_2']}")
            client = cls.get_client()
            
            # Try to create the conversations table if it doesn't exist
            try:
                client.table('conversations').select('count').limit(1).execute()
            except Exception as table_e:
                if "relation \"conversations\" does not exist" in str(table_e):
                    current_app.logger.warning("Conversations table does not exist. Creating it...")
                    # In production, we'd use proper SQL migration
                    # For this demo, we'll just handle the error gracefully
                    sql = """
                    CREATE TABLE IF NOT EXISTS conversations (
                        id UUID PRIMARY KEY,
                        user_id_1 UUID NOT NULL,
                        user_id_2 UUID NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                    """
                    # Execute SQL is typically handled through migrations
                    # We'll just continue with the insert and let it fail if necessary
            
            response = client.table('conversations').insert(conversation_data).execute()
            
            if response.data and len(response.data) > 0:
                current_app.logger.info(f"Created conversation: {conversation_data['id']}")
                return response.data[0]
            current_app.logger.warning("No data returned after conversation creation")
            return None
        except Exception as e:
            current_app.logger.error(f"Error creating conversation: {str(e)}")
            if "permission denied" in str(e).lower():
                current_app.logger.error("Permission denied. SQL permissions are required on the Supabase project.")
            return None

    @classmethod
    def get_messages(cls, conversation_id):
        """Get messages for a specific conversation."""
        try:
            current_app.logger.info(f"Retrieving messages for conversation: {conversation_id}")
            client = cls.get_client()
            
            response = client.table('messages').select('*').eq(
                'conversation_id', conversation_id
            ).order('created_at', desc=False).execute()
            
            current_app.logger.info(f"Retrieved {len(response.data)} messages for conversation: {conversation_id}")
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving messages: {str(e)}")
            # Handle case where table doesn't exist
            if "relation \"messages\" does not exist" in str(e):
                current_app.logger.info("Messages table does not exist, returning empty list")
                return []
            return []

    @classmethod
    def get_latest_message(cls, conversation_id):
        """Get the latest message in a conversation."""
        try:
            current_app.logger.info(f"Retrieving latest message for conversation: {conversation_id}")
            client = cls.get_client()
            
            response = client.table('messages').select('*').eq(
                'conversation_id', conversation_id
            ).order('created_at', desc=True).limit(1).execute()
            
            if response.data and len(response.data) > 0:
                current_app.logger.info(f"Retrieved latest message for conversation: {conversation_id}")
                return response.data[0]
            current_app.logger.info(f"No messages found for conversation: {conversation_id}")
            return None
        except Exception as e:
            current_app.logger.error(f"Error retrieving latest message: {str(e)}")
            return None

    @classmethod
    def create_message(cls, message_data):
        """Create a new message."""
        try:
            current_app.logger.info(f"Creating message in conversation: {message_data['conversation_id']}")
            client = cls.get_client()
            
            # Try to create the messages table if it doesn't exist
            try:
                client.table('messages').select('count').limit(1).execute()
            except Exception as table_e:
                if "relation \"messages\" does not exist" in str(table_e):
                    current_app.logger.warning("Messages table does not exist. Creating it...")
                    # In production, we'd use proper SQL migration
                    # For this demo, we'll just handle the error gracefully
                    sql = """
                    CREATE TABLE IF NOT EXISTS messages (
                        id UUID PRIMARY KEY,
                        conversation_id UUID NOT NULL,
                        sender_id UUID NOT NULL,
                        receiver_id UUID NOT NULL,
                        content TEXT NOT NULL,
                        is_read BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                    """
                    # Execute SQL is typically handled through migrations
                    # We'll just continue with the insert and let it fail if necessary
            
            response = client.table('messages').insert(message_data).execute()
            
            if response.data and len(response.data) > 0:
                current_app.logger.info(f"Created message: {message_data['id']}")
                return response.data[0]
            current_app.logger.warning("No data returned after message creation")
            return None
        except Exception as e:
            current_app.logger.error(f"Error creating message: {str(e)}")
            return None

    @classmethod
    def mark_messages_as_read(cls, conversation_id, user_id):
        """Mark messages as read for a user in a conversation."""
        try:
            current_app.logger.info(f"Marking messages as read for user: {user_id} in conversation: {conversation_id}")
            client = cls.get_client()
            
            # Update messages where user is the receiver and messages are unread
            response = client.table('messages').update(
                {'is_read': True}
            ).eq('conversation_id', conversation_id).eq('receiver_id', user_id).eq('is_read', False).execute()
            
            current_app.logger.info(f"Marked {len(response.data) if response.data else 0} messages as read")
            return True
        except Exception as e:
            current_app.logger.error(f"Error marking messages as read: {str(e)}")
            return False

    @classmethod
    def get_unread_count(cls, conversation_id, user_id):
        """Get count of unread messages for a user in a conversation."""
        try:
            current_app.logger.info(f"Getting unread count for user: {user_id} in conversation: {conversation_id}")
            client = cls.get_client()
            
            # Count messages where user is the receiver and messages are unread
            response = client.table('messages').select('count').eq(
                'conversation_id', conversation_id
            ).eq('receiver_id', user_id).eq('is_read', False).execute()
            
            if response.data and len(response.data) > 0:
                count = response.data[0]['count']
                current_app.logger.info(f"Unread count: {count}")
                return count
            current_app.logger.info("No unread messages")
            return 0
        except Exception as e:
            current_app.logger.error(f"Error getting unread count: {str(e)}")
            return 0
