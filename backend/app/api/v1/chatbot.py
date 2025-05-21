from flask import request, jsonify
from . import bp
from ...services.chatbot_service import ChatbotService
from .auth_middleware import auth_required

@bp.route('/chatbot', methods=['POST'])
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
        
        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: message"
            }), 400
            
        user_message = data['message']
        
        # Initialize the chatbot service
        chatbot_service = ChatbotService()
        
        # Get response from the chatbot
        response = chatbot_service.get_response(user_message)
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to process request",
            "message": str(e)
        }), 500

@bp.route('/public/chatbot', methods=['POST'])
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
        
        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: message"
            }), 400
            
        user_message = data['message']
        
        # Initialize the chatbot service
        chatbot_service = ChatbotService()
        
        # Get response from the chatbot
        response = chatbot_service.get_response(user_message)
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to process request",
            "message": str(e)
        }), 500 