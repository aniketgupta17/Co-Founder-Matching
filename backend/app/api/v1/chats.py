from flask import g, jsonify, request
from app.services.auth import protected_route
from app.services.supabase import get_supabase_service, CreateMessage, CreateChat
import logging
import json

from . import bp


@bp.route("/chats/create", methods=["POST"])
@protected_route
def create_chat():
    if not g.user_id:
        logging.error(f"No user set")
        return jsonify({"data": None, "error": "Unauthorized request"}), 401

    try:
        logging.error(f"Request: {request}")
        body = json.loads(request.data)
        logging.error(f"Request body: {request.data}")
        create_chat = CreateChat.model_validate(body)

        supabase = get_supabase_service()
        chat_row = supabase.create_chat(create_chat)

        return jsonify({"data": chat_row, "error": None})

    except Exception as e:
        logging.error("Failed to create chat", exc_info=True)
        return jsonify({"data": None, "error": "Failed to create private chat"}), 500


@bp.route("/chats/create/private", methods=["PUT"])
@protected_route
def create_private_chat():
    if not g.user_id:
        logging.error(f"No user set")
        return jsonify({"data": None, "error": "Unauthorized request"}), 401

    try:
        supabase = get_supabase_service()
        body = request.json()
        create_chat = CreateChat.model_validate(body)
        chat_id = supabase.create_private_chat(create_chat)

        if not chat_id:
            raise Exception

        return jsonify({"data": {"chat_id": chat_id}, "error": None})

    except Exception:
        logging.error("Failed to create private chat", exc_info=True)
        return jsonify({"data": None, "error": "Failed to create private chat"}), 500


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
