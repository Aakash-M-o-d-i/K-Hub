from models import db
from datetime import datetime


class Rating(db.Model):
    __tablename__ = "ratings"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    paper_id = db.Column(db.Integer, db.ForeignKey("papers.id"), nullable=False)
    score = db.Column(db.SmallInteger, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Enforce one rating per user per paper
    __table_args__ = (
        db.UniqueConstraint("user_id", "paper_id", name="uniq_rating"),
    )

    # Relationships
    user = db.relationship("User", backref="ratings")
    paper = db.relationship("Paper", backref="ratings")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "paper_id": self.paper_id,
            "score": self.score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
