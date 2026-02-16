from models import db
from datetime import datetime

class SecurityLog(db.Model):
    __tablename__ = "security_logs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    # Event Types: LOGIN, PWD_CHANGE, 2FA_TOGGLE, SESSION_REVOKE, UNIVERSAL_PURGE
    event_type = db.Column(db.String(50), nullable=False)
    ip_address = db.Column(db.String(45))
    metadata_json = db.Column(db.JSON)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    user = db.relationship("User", backref=db.backref("security_logs", lazy="dynamic"))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "event_type": self.event_type,
            "ip_address": self.ip_address,
            "metadata": self.metadata_json,
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None
        }
