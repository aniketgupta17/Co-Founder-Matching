from datetime import datetime
from . import db

class Profile(db.Model):
    """Profile model for user profile information."""
    __tablename__ = 'profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bio = db.Column(db.Text)
    skills = db.Column(db.JSON)  # Stored as JSON array
    interests = db.Column(db.JSON)  # Stored as JSON array
    looking_for = db.Column(db.Text)
    linkedin_url = db.Column(db.String(255))
    github_url = db.Column(db.String(255))
    avatar_url = db.Column(db.String(255))
    location = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Profile {self.user_id}>'
    
    def to_dict(self):
        """Convert profile to dictionary for API responses."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bio': self.bio,
            'skills': self.skills,
            'interests': self.interests,
            'looking_for': self.looking_for,
            'linkedin_url': self.linkedin_url,
            'github_url': self.github_url,
            'avatar_url': self.avatar_url,
            'location': self.location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 