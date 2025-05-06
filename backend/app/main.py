from flask import Flask
from flask_cors import CORS
from .api import register_blueprints
from .core.config import Config
from .services.supabase_service import init_supabase

def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize Supabase
    init_supabase(app)
    
    # Register API blueprints
    register_blueprints(app)
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}
    
    # Add error handling
    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"Unhandled exception: {str(e)}")
        return {"error": "An unexpected error occurred"}, 500
    
    return app
