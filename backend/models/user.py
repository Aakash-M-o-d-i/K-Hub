from models import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    oauth_provider = db.Column(db.String(20), default=None)
    oauth_id = db.Column(db.String(255), default=None)
    role = db.Column(db.Enum("student", "admin", "super_admin"), default="student")
    avatar_url = db.Column(db.String(500), default=None)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id"), default=None)
    
    # New Profile Fields
    roll_no = db.Column(db.String(50), default=None)
    year = db.Column(db.Integer, default=None)
    semester = db.Column(db.Integer, default=None)
    phone_number = db.Column(db.String(20), default=None)
    bio = db.Column(db.Text, default=None)
    
    # Security Fields
    password_changed_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_2fa_enabled = db.Column(db.Boolean, default=False)
    
    # Workspace Preferences
    interface_mode = db.Column(db.String(20), default="system")
    accent_color = db.Column(db.String(20), default="blue")
    paper_alerts = db.Column(db.Boolean, default=True)
    leaderboard_updates = db.Column(db.Boolean, default=True)
    system_announcements = db.Column(db.Boolean, default=False)
    default_department_id = db.Column(db.Integer, db.ForeignKey("departments.id"), default=None)
    download_behavior = db.Column(db.String(20), default="direct")
    is_verified = db.Column(db.Boolean, default=False)
    is_banned = db.Column(db.Boolean, default=False)

    # Badge System
    is_top_contributor = db.Column(db.Boolean, default=False)
    is_beta_tester = db.Column(db.Boolean, default=False)

    total_points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    department = db.relationship("Department", foreign_keys=[department_id], backref="users_by_dept")
    def_dept = db.relationship("Department", foreign_keys=[default_department_id])
    papers = db.relationship("Paper", backref="uploader", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "avatar_url": self.avatar_url,
            "department_id": self.department_id,
            "department": self.department.to_dict() if self.department else None,
            "roll_no": self.roll_no,
            "year": self.year,
            "semester": self.semester,
            "phone_number": self.phone_number,
            "bio": self.bio,
            "security": {
                "password_changed_at": self.password_changed_at.isoformat() + "Z" if self.password_changed_at else None,
                "is_2fa_enabled": self.is_2fa_enabled
            },
            "preferences": {
                "interface_mode": self.interface_mode,
                "accent_color": self.accent_color,
                "paper_alerts": self.paper_alerts,
                "leaderboard_updates": self.leaderboard_updates,
                "system_announcements": self.system_announcements,
                "default_department_id": self.default_department_id,
                "download_behavior": self.download_behavior
            },
            "total_points": self.total_points,
            "is_verified": self.is_verified,
            "is_banned": self.is_banned,
            "is_top_contributor": self.is_top_contributor,
            "is_beta_tester": self.is_beta_tester,
            "oauth_provider": self.oauth_provider,
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None,
            "updated_at": self.updated_at.isoformat() + "Z" if self.updated_at else None,
        }
