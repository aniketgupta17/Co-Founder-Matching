# Models package initialization
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models to register them with SQLAlchemy
from .user import User
from .profile import Profile
from .match import Match 