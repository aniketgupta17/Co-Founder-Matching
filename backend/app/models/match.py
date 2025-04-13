from datetime import datetime
from . import db

class Match(db.Model):
    """Match model for co-founder matching."""
    __tablename__ = 'matches'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    matched_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    compatibility_score = db.Column(db.Float)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected, connected
    initiated_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define relationships
    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('matches_as_user', lazy='dynamic'))
    matched_user = db.relationship('User', foreign_keys=[matched_user_id], backref=db.backref('matches_as_matched', lazy='dynamic'))
    initiator = db.relationship('User', foreign_keys=[initiated_by], backref=db.backref('matches_initiated', lazy='dynamic'))
    
    def __repr__(self):
        return f'<Match {self.user_id} - {self.matched_user_id}>'
    
    def to_dict(self):
        """Convert match to dictionary for API responses."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'matched_user_id': self.matched_user_id,
            'compatibility_score': self.compatibility_score,
            'status': self.status,
            'initiated_by': self.initiated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 