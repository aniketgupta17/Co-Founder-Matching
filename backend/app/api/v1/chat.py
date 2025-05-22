from flask import jsonify, request, current_app
from . import bp
from ...services.supabase_service import SupabaseService
from ...services.models import CreateChat
from ...services.auth_service import login_required
from datetime import datetime
import uuid
import json


# Chat endpoints
@bp.route("/conversations", methods=["GET"])
@login_required
def get_conversations():
    """Get all conversations for the current user."""
    try:
        user_id = request.current_user["id"]
        current_app.logger.info(f"Getting conversations for user: {user_id}")

        # Get conversations where the user is either participant
        conversations = SupabaseService.get_conversations(user_id)

        if not conversations:
            return jsonify([])

        # Enhance conversations with the latest message and other user info
        enhanced_conversations = []
        for conversation in conversations:
            # Get the other user's ID
            other_user_id = (
                conversation["user_id_1"]
                if conversation["user_id_2"] == user_id
                else conversation["user_id_2"]
            )

            # Get the other user's profile
            try:
                other_user_profile = SupabaseService.get_profile(other_user_id)
                other_user_name = (
                    other_user_profile.get("name", "Unknown User")
                    if other_user_profile
                    else "Unknown User"
                )
                other_user_avatar = (
                    other_user_profile.get("avatar_url") if other_user_profile else None
                )
            except Exception:
                other_user_name = "Unknown User"
                other_user_avatar = None

            # Get the latest message
            latest_message = SupabaseService.get_latest_message(conversation["id"])

            enhanced_conversations.append(
                {
                    "id": conversation["id"],
                    "created_at": conversation["created_at"],
                    "other_user_id": other_user_id,
                    "other_user_name": other_user_name,
                    "other_user_avatar": other_user_avatar,
                    "latest_message": (
                        latest_message.get("content") if latest_message else None
                    ),
                    "latest_message_time": (
                        latest_message.get("created_at") if latest_message else None
                    ),
                    "unread_count": SupabaseService.get_unread_count(
                        conversation["id"], user_id
                    ),
                }
            )

        # Sort by latest message time
        enhanced_conversations.sort(
            key=lambda x: x.get("latest_message_time", x.get("created_at")),
            reverse=True,
        )

        return jsonify(enhanced_conversations)
    except Exception as e:
        current_app.logger.error(f"Error getting conversations: {str(e)}")
        return jsonify({"error": f"Failed to get conversations: {str(e)}"}), 500


@bp.route("/conversations/<string:conversation_id>/messages", methods=["GET"])
@login_required
def get_messages(conversation_id):
    """Get all messages for a specific conversation."""
    try:
        user_id = request.current_user["id"]
        current_app.logger.info(f"Getting messages for conversation: {conversation_id}")

        # First, verify the user is part of this conversation
        conversation = SupabaseService.get_conversation(conversation_id)
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404

        if (
            conversation["user_id_1"] != user_id
            and conversation["user_id_2"] != user_id
        ):
            return jsonify({"error": "Unauthorized access to conversation"}), 403

        # Get messages
        messages = SupabaseService.get_messages(conversation_id)

        # Mark messages as read
        SupabaseService.mark_messages_as_read(conversation_id, user_id)

        return jsonify(messages)
    except Exception as e:
        current_app.logger.error(f"Error getting messages: {str(e)}")
        return jsonify({"error": f"Failed to get messages: {str(e)}"}), 500


@bp.route("/conversations", methods=["POST"])
@login_required
def create_conversation():
    """Create a new conversation with another user."""
    try:
        user_id = request.current_user["id"]
        data = request.json

        if not data:
            return jsonify({"error": "Request body must be JSON"}), 400

        other_user_id = data.get("user_id")
        if not other_user_id:
            return jsonify({"error": "Other user ID is required"}), 400

        # Can't create a conversation with yourself
        if other_user_id == user_id:
            return jsonify({"error": "Cannot create a conversation with yourself"}), 400

        # Check if conversation already exists
        existing_conversation = SupabaseService.find_conversation(
            user_id, other_user_id
        )
        if existing_conversation:
            return jsonify(existing_conversation)

        # Create new conversation with minimal required fields
        conversation_id = str(uuid.uuid4())
        conversation_data = {
            "id": conversation_id,
            "user_id_1": user_id,
            "user_id_2": other_user_id,
        }

        # Only add created_at if needed
        try:
            current_app.logger.info(
                f"Creating conversation between {user_id} and {other_user_id}"
            )
            conversation = SupabaseService.create_conversation(conversation_data)

            if not conversation:
                # Try again with created_at field
                conversation_data["created_at"] = datetime.now().isoformat()
                conversation = SupabaseService.create_conversation(conversation_data)

                if not conversation:
                    return jsonify({"error": "Failed to create conversation"}), 500
        except Exception as e:
            current_app.logger.error(
                f"Error in first attempt to create conversation: {str(e)}"
            )

            # Try one more time with a different format
            try:
                # Add created_at field which might be required
                conversation_data["created_at"] = datetime.now().isoformat()
                conversation = SupabaseService.create_conversation(conversation_data)

                if not conversation:
                    return (
                        jsonify(
                            {
                                "error": "Failed to create conversation",
                                "details": str(e),
                                "message": "The conversations table may not exist or has a different schema.",
                            }
                        ),
                        500,
                    )
            except Exception as e2:
                return (
                    jsonify(
                        {
                            "error": "Failed to create conversation after multiple attempts",
                            "details": str(e2),
                            "original_error": str(e),
                        }
                    ),
                    500,
                )

        return jsonify(conversation), 201
    except Exception as e:
        current_app.logger.error(f"Error creating conversation: {str(e)}")
        return jsonify({"error": f"Failed to create conversation: {str(e)}"}), 500


@bp.route("/conversations/<string:conversation_id>/messages", methods=["POST"])
@login_required
def send_message(conversation_id):
    """Send a message in a conversation."""
    try:
        user_id = request.current_user["id"]
        data = request.json

        if not data:
            return jsonify({"error": "Request body must be JSON"}), 400

        # Validate message content
        content = data.get("content")
        if not content or content.strip() == "":
            return jsonify({"error": "Message content is required"}), 400

        # First, verify the user is part of this conversation
        conversation = SupabaseService.get_conversation(conversation_id)
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404

        if (
            conversation["user_id_1"] != user_id
            and conversation["user_id_2"] != user_id
        ):
            return jsonify({"error": "Unauthorized access to conversation"}), 403

        # Get other user ID for receiver
        receiver_id = (
            conversation["user_id_1"]
            if conversation["user_id_2"] == user_id
            else conversation["user_id_2"]
        )

        # Create message with minimal required fields first
        message_data = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "sender_id": user_id,
            "receiver_id": receiver_id,
            "content": content,
        }

        try:
            current_app.logger.info(
                f"Sending message in conversation: {conversation_id}"
            )
            message = SupabaseService.create_message(message_data)

            if not message:
                # Try with additional fields that might be required
                message_data["is_read"] = False
                message_data["created_at"] = datetime.now().isoformat()

                message = SupabaseService.create_message(message_data)
                if not message:
                    return jsonify({"error": "Failed to send message"}), 500
        except Exception as e:
            current_app.logger.error(
                f"Error in first attempt to create message: {str(e)}"
            )

            # Try with required timestamp
            try:
                message_data["is_read"] = False
                message_data["created_at"] = datetime.now().isoformat()

                message = SupabaseService.create_message(message_data)
                if not message:
                    return (
                        jsonify(
                            {
                                "error": "Failed to send message",
                                "details": str(e),
                                "message": "The conversation_messages table may not exist or has a different schema.",
                            }
                        ),
                        500,
                    )
            except Exception as e2:
                return (
                    jsonify(
                        {
                            "error": "Failed to send message after multiple attempts",
                            "details": str(e2),
                            "original_error": str(e),
                        }
                    ),
                    500,
                )

        return jsonify(message), 201
    except Exception as e:
        current_app.logger.error(f"Error sending message: {str(e)}")
        return jsonify({"error": f"Failed to send message: {str(e)}"}), 500


# Add a helper endpoint to ensure tables exist
@bp.route("/chat/ensure-tables", methods=["POST"])
@login_required
def ensure_chat_tables():
    """Ensure that chat-related tables exist in the database."""
    try:
        user_id = request.current_user["id"]
        current_app.logger.info(f"Ensuring chat tables exist for user: {user_id}")

        # Only admins can create tables
        # Add proper admin check here if needed

        # Create conversations table if it doesn't exist
        create_conversations_table = """
        CREATE TABLE IF NOT EXISTS conversations (
            id UUID PRIMARY KEY,
            user_id_1 UUID NOT NULL,
            user_id_2 UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """

        # Create conversation_messages table if it doesn't exist
        create_messages_table = """
        CREATE TABLE IF NOT EXISTS conversation_messages (
            id UUID PRIMARY KEY,
            conversation_id UUID NOT NULL,
            sender_id UUID NOT NULL,
            receiver_id UUID NOT NULL,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """

        # Execute the SQL queries
        client = SupabaseService.get_client()

        try:
            client.postgrest.rpc(
                "exec_sql", {"sql": create_conversations_table}
            ).execute()
            client.postgrest.rpc("exec_sql", {"sql": create_messages_table}).execute()
            return jsonify({"message": "Chat tables created successfully"})
        except Exception as e:
            current_app.logger.error(f"Error creating chat tables: {str(e)}")
            return (
                jsonify(
                    {
                        "error": "Failed to create chat tables. This likely means you don't have permission to create tables or the RPC function doesn't exist.",
                        "message": "Please ensure the chat tables are created in your Supabase project using migrations or the Supabase dashboard.",
                    }
                ),
                500,
            )
    except Exception as e:
        current_app.logger.error(f"Error ensuring chat tables: {str(e)}")
        return jsonify({"error": f"Failed to ensure chat tables: {str(e)}"}), 500


@bp.route("/chats/create", methods=["POST"])
@login_required
def create_chat():
    try:
        body = json.loads(request.data)
        create_chat = CreateChat.model_validate(body)

        chat_row = SupabaseService.create_chat(create_chat)

        return jsonify({"data": chat_row, "error": None})

    except Exception as e:
        current_app.logger.error(f"Error creating chat: {str(e)}")
        return jsonify({"data": None, "error": "Failed to create chat"}), 500


@bp.route("/chats/create/ai", methods=["POST"])
@login_required
def create_ai_chat():
    try:
        user_id = request.current_user["id"]
        chat_row = SupabaseService.create_ai_chat(user_id)

        return jsonify({"data": chat_row, "error": None})

    except Exception as e:
        current_app.logger.error(f"Error creating chat: {str(e)}")
        return jsonify({"data": None, "error": "Failed to create chat"}), 500
