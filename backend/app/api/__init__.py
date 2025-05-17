# API package initialization
from flask import Blueprint
from .v1 import bp as v1_bp


def register_blueprints(app):
    """Register all API blueprints with the app."""
    # Create a parent 'api' blueprint
    api_bp = Blueprint("api", __name__, url_prefix="/api")

    # Register API version blueprints under the parent
    api_bp.register_blueprint(v1_bp)

    # Register the parent blueprint with the app
    app.register_blueprint(api_bp)

    return app
