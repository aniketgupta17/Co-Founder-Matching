from functools import wraps
from flask import request, jsonify
from ...services.supabase_service import SupabaseService

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header is missing"}), 401
        
        token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
        if not token:
            return jsonify({"error": "Invalid Authorization header format"}), 401

        try:
            user = SupabaseService.get_client().auth.get_user(token)
            if not user:
                return jsonify({"error": "Invalid token"}), 401
            request.user = user
        except Exception as e:
            return jsonify({"error": str(e)}), 401

        return f(*args, **kwargs)
    return decorated
