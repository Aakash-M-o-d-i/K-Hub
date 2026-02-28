from models import db
from datetime import datetime

class UserSession(db.Model):
    __tablename__ = "user_sessions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    jti = db.Column(db.String(36), nullable=False, unique=True, index=True)
    
    # Device Metadata
    browser = db.Column(db.String(255))
    os = db.Column(db.String(255))
    device_type = db.Column(db.String(512))
    ip_address = db.Column(db.String(45))
    location = db.Column(db.String(255))
    
    is_revoked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship("User", backref=db.backref("sessions", lazy="dynamic"))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "jti": self.jti,
            "browser": self.browser,
            "os": self.os,
            "device_type": self.device_type,
            "ip_address": self.ip_address,
            "location": self.location,
            "is_revoked": self.is_revoked,
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None,
            "last_active": self.last_active.isoformat() + "Z" if self.last_active else None
        }
