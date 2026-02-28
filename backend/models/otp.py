from models import db
from datetime import datetime, timedelta
import random

class OTP(db.Model):
    __tablename__ = "otps"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(150), nullable=False, index=True)
    code = db.Column(db.String(6), nullable=False)
    
    # Pre-registration data
    name = db.Column(db.String(100), nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)
    department_id = db.Column(db.Integer, nullable=True)
    attempts = db.Column(db.Integer, default=0)
    
    MAX_ATTEMPTS = 3  # Max wrong OTP attempts before invalidation

    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @staticmethod
    def generate_code():
        return "".join([str(random.randint(0, 9)) for _ in range(6)])

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "code": self.code,
            "expires_at": self.expires_at.isoformat(),
            "created_at": self.created_at.isoformat()
        }
