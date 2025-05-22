from flask import Flask
from flask_cors import CORS
from .api import register_blueprints
from .core.config import Config
from .services.supabase_service import init_supabase

def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Check configuration
    try:
        config_class.check_config()
        app.logger.info("Configuration loaded successfully")
    except Exception as e:
        app.logger.error(f"Configuration error: {str(e)}")
        raise
    
    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize Supabase
    try:
        init_supabase(app)
        app.logger.info("Supabase initialized successfully")
    except Exception as e:
        app.logger.error(f"Supabase initialization error: {str(e)}")
        raise
    
    # Register API blueprints
    register_blueprints(app)
    app.logger.info("API blueprints registered")
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Server is running correctly'}
    
    # Add error handling
    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"Unhandled exception: {str(e)}")
        return {"error": "An unexpected error occurred", "message": str(e)}, 500
    
    app.logger.info("Application setup complete")
    return app
