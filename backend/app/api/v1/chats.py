from flask import g, jsonify
from app.services.auth import protected_route
from app.services.supabase import get_supabase_service
import logging

from . import bp


@bp.route("/chats/single", methods=["GET"])
@protected_route
def get_user_chats():
    if not g.user_id:
        return jsonify({"data": None, "error": "Unauthorized request"}), 401

    try:
        supabase = get_supabase_service()
        user_chats = supabase.get_user_chats(user_id=g.user_id)

        return jsonify(
            {
                "data": user_chats,
                "error": None,
            }
        )

    except Exception:
        return jsonify({"data": None, "error": "Failed to fetch user chats"}), 500


@bp.route("/chats/group", methods=["GET"])
@protected_route
def get_user_group_chats():
    if not g.user_id:
        return jsonify({"data": None, "error": "Unauthorized request"}), 401

    try:
        supabase = get_supabase_service()
        user_chats = supabase.get_user_group_chats(user_id=g.user_id)

        logging.info(user_chats)

        return jsonify(
            {
                "data": user_chats,
                "error": None,
            }
        )

    except Exception as e:
        return jsonify({"data": None, "error": "Failed to fetch user chats"}), 500
