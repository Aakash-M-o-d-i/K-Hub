from models import db
from datetime import datetime


class Paper(db.Model):
    __tablename__ = "papers"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    subject_code = db.Column(db.String(20), nullable=False)
    year = db.Column(db.String(9), nullable=False)
    semester = db.Column(db.SmallInteger, nullable=False)
    exam_type = db.Column(db.String(50), default="End Semester")
    file_url = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(10), default="pdf")
    file_size = db.Column(db.Integer, default=0)
    professor = db.Column(db.String(100), default=None)
    status = db.Column(
        db.Enum("pending", "approved", "rejected"), default="pending"
    )
    rejection_reason = db.Column(db.Text, nullable=True)
    rating_avg = db.Column(db.Numeric(2, 1), default=0.0)
    rating_count = db.Column(db.Integer, default=0)
    download_count = db.Column(db.Integer, default=0)
    uploader_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    department_id = db.Column(
        db.Integer, db.ForeignKey("departments.id"), nullable=False
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    department = db.relationship("Department", backref="papers")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "subject_code": self.subject_code,
            "year": self.year,
            "semester": self.semester,
            "exam_type": self.exam_type,
            "file_url": self.file_url,
            "file_type": self.file_type,
            "file_size": self.file_size,
            "professor": self.professor,
            "status": self.status,
            "rejection_reason": self.rejection_reason,
            "rating_avg": float(self.rating_avg) if self.rating_avg else 0.0,
            "rating_count": self.rating_count,
            "download_count": self.download_count,
            "uploader_id": self.uploader_id,
            "uploader": self.uploader.to_dict() if self.uploader else None,
            "department_id": self.department_id,
            "department": self.department.to_dict() if self.department else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
