from flask import request, jsonify, current_app
from . import bp
from ...services.chatbot_service import ChatbotService
from ...services.supabase_service import SupabaseService
from .auth_middleware import auth_required


@bp.route("/chatbot", methods=["POST"])
@auth_required
def chat_with_bot():
    """
    Endpoint for chatting with the business advisor chatbot.

    Request body:
    {
        "message": "string" // The user's message to the chatbot
    }

    Returns:
    {
        "success": boolean,
        "message": "string" // The chatbot's response
    }
    """
    try:
        data = request.get_json()
        current_app.logger.error("here main")

        if not data or "message" not in data or "chat_id" not in data:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Missing required fields: message or chat_id",
                    }
                ),
                400,
            )

        message = data["message"]
        chat_id = data["chat_id"]

        # Initialize the chatbot service
        chatbot_service = ChatbotService()

        # Get response from the chatbot
        response = chatbot_service.get_response(message)

        # Update messages table
        SupabaseService.send_ai_message(message=response["message"], chat_id=chat_id)

        return jsonify(response)

    except Exception as e:
        current_app.logger.error(f"Failed to send AI chat: {str(e)}")
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Failed to process request",
                    "message": str(e),
                }
            ),
            500,
        )


@bp.route("/public/chatbot", methods=["POST"])
def public_chat_with_bot():
    """
    Public endpoint for chatting with the business advisor chatbot.
    Does not require authentication.

    Request body:
    {
        "message": "string" // The user's message to the chatbot
    }

    Returns:
    {
        "success": boolean,
        "message": "string" // The chatbot's response
    }
    """
    try:
        data = request.get_json()

        if not data or "message" not in data or "chat_id" not in data:
            current_app.logger.error("Missing request fields")
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Missing required fields: message or chat_id",
                    }
                ),
                400,
            )

        message = data["message"]
        chat_id = data["chat_id"]

        # Initialize the chatbot service
        chatbot_service = ChatbotService()

        # Get response from the chatbot
        response = chatbot_service.get_response(message)

        # Update messages table
        SupabaseService.send_ai_message(message=response.message, chat_id=chat_id)

        return jsonify(response)

    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Failed to process request",
                    "message": str(e),
                }
            ),
            500,
        )
