import requests
import json
import os
from flask import current_app

class ChatbotService:
    """Service for handling chatbot interactions using HuggingFace's API."""
    
    def __init__(self):
        """Initialize the chatbot service."""
        self.api_token = current_app.config.get('HUGGINGFACE_API_TOKEN')
        
        # Define the model to use - Mistral 7B Instruct
        self.model_id = "mistralai/Mistral-7B-Instruct-v0.3"
        
        # Define the system prompt for business/finance guidance
        # Optimized for concise, mobile-friendly responses
        self.system_prompt = """
        You are a specialized business advisor chatbot for a mobile app that helps aspiring co-founders.
        
        Your expertise includes business model development, startup funding, financial planning, pitch creation, investor relations, and UQ Ventures resources.
        
        IMPORTANT INSTRUCTIONS:
        1. Keep responses VERY CONCISE (under 100 words when possible)
        2. Use bullet points and short paragraphs
        3. Focus on 2-3 key points maximum per response
        4. Avoid lengthy explanations or theoretical discussions
        5. Be direct, practical and actionable
        6. Use simple language, avoid jargon
        7. Format for small mobile screens
        8. Mention UQ Ventures resources only when directly relevant
        
        Remember you're on a mobile app where users expect quick, scannable advice they can implement immediately.
        """
    
    def get_response(self, user_message):
        """
        Get a response from the chatbot based on the user's message.
        
        Args:
            user_message (str): The user's message to the chatbot
            
        Returns:
            dict: Response containing the chatbot's message
        """
        try:
            # Prepare the API request
            api_url = f"https://api-inference.huggingface.co/models/{self.model_id}"
            
            headers = {
                "Content-Type": "application/json"
            }
            
            # Add authorization header - this is required for Mistral
            if self.api_token:
                headers["Authorization"] = f"Bearer {self.api_token}"
            else:
                current_app.logger.error("No HuggingFace API token provided")
                return self._get_fallback_response(user_message, "No API token provided")
            
            # Format the prompt in Mistral's expected format with additional instructions for conciseness
            prompt = f"""<s>[INST] {self.system_prompt}

The user's question is: {user_message}

Remember to be extremely concise (under 100 words when possible), use bullet points, and focus on 2-3 key actionable points. [/INST]"""
            
            # Prepare the payload with parameters to encourage conciseness
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 300,  # Reduced from 500
                    "temperature": 0.6,     # Reduced from 0.7 for more focused responses
                    "top_p": 0.9,           # Slightly reduced from 0.95
                    "do_sample": True,
                    "return_full_text": False
                }
            }
            
            current_app.logger.info(f"Sending request to HuggingFace API for model: {self.model_id}")
            
            # Make the API request
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
            # Process the response
            result = response.json()
            current_app.logger.info(f"Received response: {str(result)[:100]}...")
            
            if isinstance(result, list) and len(result) > 0:
                # Extract the generated text
                generated_text = result[0].get("generated_text", "")
                
                current_app.logger.info("Response received successfully from HuggingFace API")
                
                return {
                    "success": True,
                    "message": generated_text.strip()
                }
            else:
                current_app.logger.error(f"Unexpected response format from HuggingFace API: {result}")
                raise ValueError("Unexpected response format")
                
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"HuggingFace API request error: {str(e)}")
            
            # If we get a 503 error, it means the model is loading
            if hasattr(e, 'response') and e.response is not None and e.response.status_code == 503:
                return {
                    "success": True,
                    "message": "The business advisor is currently thinking. Please try again in a moment as the model is being loaded. This is normal for the first request or after a period of inactivity."
                }
                
            return self._get_fallback_response(user_message, str(e))
            
        except Exception as e:
            current_app.logger.error(f"Chatbot error: {str(e)}")
            return self._get_fallback_response(user_message, str(e))
    
    def _get_fallback_response(self, user_message, error_message):
        """Get a fallback response if the API fails."""
        # Fallback responses if the API fails - updated to be more concise
        fallback_responses = {
            "business plan": """
            Key business plan components:
            
            • Executive Summary: Brief overview
            • Problem & Solution: What you're solving
            • Market Analysis: Target customers & competitors
            • Business Model: How you'll make money
            • Team: Key people and their skills
            • Financial Projections: Revenue, costs, funding needs
            
            UQ Ventures' "Startup Roadmap" workshops can help you develop these elements.
            """,
            "funding": """
            Early-stage funding options:
            
            • Bootstrapping: Using personal funds & revenue
            • Angel Investors: Individual wealthy investors
            • Accelerators: Programs offering mentorship + seed funding
            • Grants: Government support like Advance Queensland
            
            UQ Ventures' ilab Accelerator provides up to $20k in equity-free funding plus mentorship.
            """,
            "pitch": """
            Essential pitch deck elements:
            
            • Problem & Solution (1-2 slides)
            • Market Size & Business Model (1-2 slides)
            • Traction & Team (1-2 slides)
            • Competition & Financials (1-2 slides)
            
            Keep it under 10 slides. UQ Ventures runs "Pitch Perfect" workshops to help refine your presentation.
            """,
            "default": """
            I can help with:
            
            • Business models
            • Funding strategies
            • Financial planning
            • Pitch preparation
            
            What specific aspect of your startup are you working on right now?
            """
        }
        
        # Try to find a relevant fallback response
        response_text = None
        for key, text in fallback_responses.items():
            if key in user_message.lower():
                response_text = text
                break
        
        # Use default if no specific match found
        if not response_text:
            response_text = fallback_responses["default"]
            
        current_app.logger.info("Using fallback response due to API error")
        
        return {
            "success": True,
            "message": response_text,
            "note": f"Using fallback response due to API error: {error_message}"
        } 