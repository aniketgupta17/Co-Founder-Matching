# API v1 package initialization
from flask import Blueprint

bp = Blueprint('v1', __name__, url_prefix='/v1')

# Import and register endpoints with the blueprint
from . import users, matching, profiles, auth, onboarding, chat 