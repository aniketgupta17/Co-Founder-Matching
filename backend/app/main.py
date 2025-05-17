from flask import Flask, g, jsonify
from flask_cors import CORS
from .api import register_blueprints
from .core.config import Config
from .models import db
from app.services.auth import protected_route
from app.services.supabase import get_supabase_service


def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(
        app,
        supports_credentials=True,
        expose_headers=["Authorization"],
        resources={r"/*": {"origins": "*"}},
    )
    db.init_app(app)

    # Register API blueprints
    register_blueprints(app)

    @app.route("/health")
    def health_check():
        return {"status": "healthy"}

    # Create database tables on app creation
    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    config = Config()
    create_app(config)
