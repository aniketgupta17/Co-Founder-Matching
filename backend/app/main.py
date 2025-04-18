from flask import Flask
from flask_cors import CORS
from .api import register_blueprints
from .core.config import Config
from .models import db

def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    
    # Register API blueprints
    register_blueprints(app)
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}
    
    # Create database tables on app creation
    with app.app_context():
        db.create_all()
    
    return app
