from flask import g, jsonify, request
from app.services.auth import protected_route
from app.services.supabase import get_supabase_service, ChatMessage
import logging

from . import bp


@bp.route("/chats/single", methods=["GET"])
@protected_route
def get_user_chats():
    if not g.user_id:
        logging.error(f"No user set")
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
        logging.error("Failed to get user private chats", exc_info=True)
        return jsonify({"data": None, "error": "Failed to fetch user chats"}), 500


@bp.route("/chats/group", methods=["GET"])
@protected_route
def get_user_group_chats():
    if not g.user_id:
        return jsonify({"data": None, "error": "Unauthorized request"}), 401

    try:
        supabase = get_supabase_service()
        user_chats = supabase.get_user_group_chats(user_id=g.user_id)

        return jsonify(
            {
                "data": user_chats,
                "error": None,
            }
        )

    except Exception:
        logging.error("Failed to get user group chats", exc_info=True)
        return jsonify({"data": None, "error": "Failed to fetch user chats"}), 500


@bp.route("/chats/messages/<int:chat_id>", methods=["GET"])
@protected_route
def get_chat_messages(chat_id):
    if not g.user_id:
        return jsonify({"data": None, "error": "Unauthorized request"}), 401

    try:
        logging.error(f"Fetching messages for chat: {chat_id}")
        supabase = get_supabase_service()
        messages = supabase.get_chat_messages(user_id=g.user_id, chat_id=chat_id)
        logging.error(f"Messages: {messages}")

        return jsonify({"data": messages, "error": None})

    except Exception:
        return jsonify({"data": None, "error": "Failed to fetch chat messages"}), 500


@bp.route("/chats/messages/<int:chat_id>", methods=["POST"])
@protected_route
def create_chat_message(chat_id: str):
    if not g.user_id:
        return jsonify({"data": None, "error": "Unauthorized request"}), 401

    try:
        supabase = get_supabase_service()
        body = request.get_json()
        message = ChatMessage.model_validate(body)

        status = supabase.create_chat_message(
            user_id=g.user_id, chat_id=chat_id, message=message
        )

        return jsonify({"success": status, "error": None})

    except Exception:
        logging.error("Failed to create chat message", exc_info=True)

        return jsonify({"data": None, "error": "Failed to create chat message"}), 500
