from flask import request, jsonify, g
from functools import wraps
import jwt
from app.core.config import get_config
from app.services.supabase import get_supabase_service
import logging


def protected_route(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Authorization code is missing"}), 401

        try:
            config = get_config()
            secret = config.JWT_SECRET_KEY
            algorithm = config.JWT_ALGORITHM

            payload = jwt.decode(
                token, secret, algorithms=[algorithm], audience="authenticated"
            )

            user_id = payload.get("sub")

            if not user_id:
                return jsonify({"error": "Invalid token: missing user ID"}), 401

            supabase = get_supabase_service()
            user = supabase.get_user_by_id(user_id)

            if not user:
                return jsonify({"error": "User not found"}), 401

            g.user = user
            g.user_id = user.get("id", None)

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401

        except jwt.InvalidTokenError as e:
            logging.error(f"Invalid token error: {e}", exc_info=True)
            return jsonify({"error": "Invalid token"}), 401

        except Exception as e:
            logging.error(f"Unknown error: {e}", exc_info=True)
            return jsonify({"error": "Authentication error"}), 500

        return f(*args, **kwargs)

    return decorated
