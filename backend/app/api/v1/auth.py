from flask import jsonify, request, current_app
from . import bp
from ...services.auth_service import get_auth_service, login_required
from ...services.supabase_service import SupabaseService
import uuid

@bp.route('/auth/ping', methods=['GET'])
def ping():
    """Simple ping endpoint to check if the API is running."""
    return jsonify({"status": "ok", "message": "API is running"}), 200

# Auth endpoints
@bp.route('/auth/signup', methods=['POST'])
def signup():
    """Register a new user and return a JWT token."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
        
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    # Log the registration attempt with extra details
    current_app.logger.info(f"Attempting to register user: {email} with name: {name}")
    
    auth_service = get_auth_service()
    result = auth_service.register(email, password, name)
    
    if not result:
        current_app.logger.error(f"Registration failed for email: {email}")
        return jsonify({"error": "Registration failed. Please check logs for details."}), 400
        
    # If the result contains an error message, return it
    if isinstance(result, dict) and 'error' in result:
        current_app.logger.warning(f"Registration warning: {result['error']}")
        return jsonify(result), 400
    
    # Create a default profile for the new user
    try:
        user_id = result['user']['id']
        DEFAULT_AVATAR_URL = 'https://bivbvzynoxlcfbvdkfol.supabase.co/storage/v1/object/sign/avatars/Default_Avatar.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2EyNDEwYTYxLTBjYjctNDY4NS04OTM0LWM3MjgwNzBhMDBjMSJ9.eyJ1cmwiOiJhdmF0YXJzL0RlZmF1bHRfQXZhdGFyLnBuZyIsImlhdCI6MTc0NjA4OTcwMCwiZXhwIjoxNzc3NjI1NzAwfQ.KJ2R0b0T462nmPmzZLpM7ibQF9Jvc3J_UCmJ7KX3Odo'
        
        profile_data = {
            'id': user_id,  # In Supabase, profile ID is the same as user ID
            'user_id': user_id,
            'skills': [],
            'interests': [],
            'bio': '',
            'avatar_url': DEFAULT_AVATAR_URL,
            'name': name or '',
            'email': email,
            'location': '',
            'industry': '',
            'collab_style': '',
            'startup_stage': '',
            'time_commitment': '',
            'availability': '',
            'seeking_skills': []
        }
        
        profile = SupabaseService.create_profile(profile_data)
        current_app.logger.info(f"Created default profile for new user: {user_id}")
        
        # Augment the result with profile info
        result['profile'] = profile
    except Exception as e:
        current_app.logger.error(f"Error creating default profile for new user: {str(e)}")
        # Continue with registration even if profile creation fails
        # The profile can be created later
    
    current_app.logger.info(f"User registered successfully: {email}")
    return jsonify(result), 201

@bp.route('/auth/login', methods=['POST'])
def login():
    """Authenticate a user and return a JWT token."""
    data = request.json
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    auth_service = get_auth_service()
    result = auth_service.authenticate(email, password)
    
    if not result:
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Try to get the user's profile
    try:
        user_id = result['user']['id']
        profile = SupabaseService.get_profile(user_id)
        if profile:
            result['profile'] = profile
    except Exception as e:
        current_app.logger.error(f"Error fetching profile for user {user_id}: {str(e)}")
        # Continue login flow even if profile fetch fails
    
    current_app.logger.info(f"User logged in: {email}")
    return jsonify(result)

# Keeping this alias for backward compatibility
@bp.route('/login', methods=['POST'])
def login_user():
    """Alias for the /auth/login endpoint."""
    return login()

@bp.route('/auth/me', methods=['GET'])
@login_required
def get_authenticated_user():
    """Get the authenticated user's information."""
    try:
        # request.current_user is set by the login_required decorator
        user_id = request.current_user['id']
        user = request.current_user
        
        # Add profile information if available
        try:
            profile = SupabaseService.get_profile(user_id)
            if profile:
                user['profile'] = profile
        except Exception as e:
            current_app.logger.error(f"Error getting profile for user {user_id}: {str(e)}")
            # Continue without profile info
        
        current_app.logger.info(f"Retrieved authenticated user info for ID: {user_id}")
        return jsonify(user)
    except Exception as e:
        current_app.logger.error(f"Error in get_authenticated_user: {str(e)}")
        return jsonify({"error": "Failed to retrieve user information"}), 500

@bp.route('/auth/refresh', methods=['POST'])
@login_required
def refresh_token():
    """Refresh the JWT token."""
    try:
        user = request.current_user
        
        auth_service = get_auth_service()
        new_token = auth_service.generate_token(user)
        
        current_app.logger.info(f"Token refreshed for user ID: {user['id']}")
        return jsonify({
            "token": new_token,
            "user": user
        })
    except Exception as e:
        current_app.logger.error(f"Error in refresh_token: {str(e)}")
        return jsonify({"error": "Failed to refresh token"}), 500

@bp.route('/auth/schema', methods=['GET'])
@login_required
def get_schema_info():
    """Get information about the database schema."""
    try:
        client = SupabaseService.get_client()
        
        # Try to get a list of tables
        tables_info = []
        try:
            response = client.rpc('get_schema').execute()
            if response.data:
                tables_info = response.data
        except Exception as e:
            current_app.logger.error(f"Error getting schema via RPC: {str(e)}")
            tables_info = [{"message": f"Error getting schema: {str(e)}"}]
        
        # Try to query for specific tables we care about
        tables_status = {}
        for table in ['profiles', 'conversations', 'messages', 'users']:
            try:
                response = client.table(table).select('count').limit(1).execute()
                tables_status[table] = {
                    "exists": True,
                    "count": response.data[0]['count'] if response.data else 0
                }
            except Exception as e:
                tables_status[table] = {
                    "exists": False,
                    "error": str(e)
                }
        
        # Try to get column info for profiles table
        profile_columns = []
        try:
            response = client.rpc('list_columns', {'table_name': 'profiles'}).execute()
            if response.data:
                profile_columns = response.data
        except Exception as e:
            current_app.logger.error(f"Error getting profile columns: {str(e)}")
            profile_columns = [{"message": f"Error getting profile columns: {str(e)}"}]
        
        return jsonify({
            "tables_info": tables_info,
            "tables_status": tables_status,
            "profile_columns": profile_columns
        })
    except Exception as e:
        current_app.logger.error(f"Error getting schema info: {str(e)}")
        return jsonify({"error": f"Failed to get schema info: {str(e)}"}), 500 