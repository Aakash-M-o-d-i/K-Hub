import os
import csv
import io
import traceback
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, Response
from models import db
from models.paper import Paper
from models.department import Department
from models.user import User
from models.notification import Notification
from models.leaderboard import AuditLog, LeaderboardPoints, SystemSetting
from middleware.auth import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/v1/internal")


@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_stats(**kwargs):
    total_papers = Paper.query.count()
    pending = Paper.query.filter_by(status="pending").count()
    approved = Paper.query.filter_by(status="approved").count()
    rejected = Paper.query.filter_by(status="rejected").count()
    total_users = User.query.count()
    contributors = (
        db.session.query(db.func.count(db.distinct(Paper.uploader_id))).scalar()
    )

    return jsonify({
        "total_papers": total_papers,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "total_users": total_users,
        "contributors": contributors,
    }), 200


@admin_bp.route("/papers/pending", methods=["GET"])
@admin_required
def get_pending_papers(**kwargs):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    status_filter = request.args.get("status", "all")
    search = request.args.get("search", "").strip()

    query = Paper.query.join(Department, Paper.department_id == Department.id)
    
    if status_filter == "pending":
        query = query.filter(Paper.status == "pending")
    elif status_filter == "flagged":
        query = query.filter(Paper.status == "rejected")
    elif status_filter != "all":
        query = query.filter(Paper.status == status_filter)

    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(
                Paper.title.ilike(like),
                Paper.subject_code.ilike(like),
                Paper.professor.ilike(like),
                Department.name.ilike(like),
                Department.code.ilike(like),
            )
        )

    query = query.order_by(Paper.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "papers": [p.to_dict() for p in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
    }), 200


@admin_bp.route("/papers/<int:paper_id>/approve", methods=["PUT"])
@admin_required
def approve_paper(paper_id, **kwargs):
    try:
        current_user = kwargs["current_user"]
        paper = Paper.query.get_or_404(paper_id)

        if paper.status == "approved":
            return jsonify({"error": "Paper already approved"}), 400

        paper.status = "approved"

        # Move file to approved folder
        upload_dir = current_app.config["UPLOAD_FOLDER"]
        pending_path = os.path.join(upload_dir, "pending", paper.file_url)
        approved_dir = os.path.join(upload_dir, "approved")
        os.makedirs(approved_dir, exist_ok=True)
        approved_path = os.path.join(approved_dir, paper.file_url)

        if os.path.exists(pending_path):
            os.rename(pending_path, approved_path)

        # Award uploader approval bonus
        uploader = User.query.get(paper.uploader_id)
        if uploader:
            bonus = LeaderboardPoints(
                user_id=uploader.id,
                points=15,
                action_type="approved",
                reference_id=paper.id,
            )
            db.session.add(bonus)
            uploader.total_points += 15
            
        # Add Notification for uploader
        notification = Notification(
            user_id=paper.uploader_id,
            type="success",
            title="Submission Approved",
            message=f"Success! Archive Entry '{paper.title}' has been verified and added to the official repository.",
            link=f"/dashboard?tab=uploads"
        )
        db.session.add(notification)

        # Audit log
        log = AuditLog(
            admin_id=current_user.id,
            action="approve",
            target_paper_id=paper.id,
            target_user_id=paper.uploader_id,
            ip_address=request.remote_addr,
        )
        db.session.add(log)
        db.session.commit()

        return jsonify({"message": "Paper approved", "paper": paper.to_dict()}), 200
    except Exception as e:
        current_app.logger.error(
            f"Approve Error ({datetime.utcnow()}): {traceback.format_exc()}"
        )
        return jsonify({"error": "Internal server error"}), 500


@admin_bp.route("/papers/<int:paper_id>/reject", methods=["PUT"])
@admin_required
def reject_paper(paper_id, **kwargs):
    try:
        current_user = kwargs["current_user"]
        paper = Paper.query.get_or_404(paper_id)

        reason = request.get_json().get("reason", "") if request.is_json else ""
        paper.status = "rejected"
        paper.rejection_reason = reason

        # Add Notification for uploader
        notification = Notification(
            user_id=paper.uploader_id,
            type="danger",
            title="Submission Rejected",
            message=f"Archive Entry '{paper.title}' was rejected by moderation protocol. Reason: {reason or 'Inconsistent metadata/illegible content.'}",
            link=f"/dashboard?tab=uploads" # Directing to their uploads tab
        )
        db.session.add(notification)

        log = AuditLog(
            admin_id=current_user.id,
            action="reject",
            target_paper_id=paper.id,
            target_user_id=paper.uploader_id,
            reason=reason,
            ip_address=request.remote_addr,
        )
        db.session.add(log)
        db.session.commit()

        return jsonify({"message": "Paper rejected and uploader notified", "paper": paper.to_dict()}), 200
    except Exception as e:
        current_app.logger.error(
            f"Reject Error ({datetime.utcnow()}): {traceback.format_exc()}"
        )
        return jsonify({"error": "Internal server error"}), 500


@admin_bp.route("/papers/<int:paper_id>/metadata", methods=["PUT"])
@admin_required
def update_paper_metadata(paper_id, **kwargs):
    current_user = kwargs["current_user"]
    if current_user.role != "super_admin":
        return jsonify({"error": "Unauthorized: Super Admin access required"}), 403

    paper = Paper.query.get_or_404(paper_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Fields to update
    paper.title = data.get("title", paper.title)
    paper.subject_code = data.get("subject_code", paper.subject_code)
    paper.semester = data.get("semester", paper.semester)
    paper.year = data.get("year", paper.year)
    paper.exam_type = data.get("exam_type", paper.exam_type)
    
    if "department_id" in data:
        paper.department_id = data["department_id"]

    # Audit log
    log = AuditLog(
        admin_id=current_user.id,
        action="update_paper_metadata",
        target_paper_id=paper.id,
        target_user_id=paper.uploader_id,
        reason=f"Metadata updated by super admin: {paper.title} ({paper.subject_code})",
        ip_address=request.remote_addr,
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Metadata updated successfully", "paper": paper.to_dict()}), 200


@admin_bp.route("/audit-logs", methods=["GET"])
@admin_required
def get_audit_logs(**kwargs):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    action_filter = request.args.get("action", "")
    search = request.args.get("search", "").strip()

    query = AuditLog.query.join(User, AuditLog.admin_id == User.id)
    
    if action_filter:
        query = query.filter(AuditLog.action == action_filter)
    
    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(
                User.name.ilike(like),
                AuditLog.action.ilike(like),
                AuditLog.reason.ilike(like),
                AuditLog.ip_address.ilike(like),
                db.cast(AuditLog.created_at, db.String).ilike(like)
            )
        )

    query = query.order_by(AuditLog.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "logs": [l.to_dict() for l in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
    }), 200


@admin_bp.route("/users/stats", methods=["GET"])
@admin_required
def get_user_stats(**kwargs):
    total = User.query.count()
    pending = (
        db.session.query(db.func.count(db.distinct(Paper.uploader_id)))
        .filter(Paper.status == "pending")
        .scalar()
    )
    moderators = User.query.filter(
        User.role.in_(["admin", "super_admin"])
    ).count()

    return jsonify({
        "total_users": total,
        "pending_approvals": pending,
        "active_moderators": moderators,
    }), 200


@admin_bp.route("/users/<int:user_id>", methods=["GET"])
@admin_required
def get_user_detail(user_id, **kwargs):
    u = User.query.get_or_404(user_id)
    # Count uploads and downloads
    upload_count = Paper.query.filter_by(uploader_id=u.id).count()
    total_downloads = (
        db.session.query(db.func.coalesce(db.func.sum(Paper.download_count), 0))
        .filter(Paper.uploader_id == u.id)
        .scalar()
    )
    avg_rating = (
        db.session.query(db.func.coalesce(db.func.avg(Paper.rating_avg), 0))
        .filter(Paper.uploader_id == u.id, Paper.rating_avg > 0)
        .scalar()
    )
    data = u.to_dict()
    data["upload_count"] = upload_count
    data["total_downloads"] = int(total_downloads)
    data["avg_rating"] = round(float(avg_rating), 1)
    return jsonify(data), 200


@admin_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@admin_required
def update_user_role(user_id, **kwargs):
    u = User.query.get_or_404(user_id)
    body = request.get_json()
    new_role = body.get("role", "student")
    if new_role not in ("student", "admin", "super_admin"):
        return jsonify({"error": "Invalid role"}), 400
    
    # ✅ SECURITY: Only super_admin can promote to admin or super_admin
    current_user = kwargs.get("current_user")
    if new_role in ("admin", "super_admin") and current_user.role != "super_admin":
        return jsonify({"error": "Only super admin can assign admin roles"}), 403
    
    u.role = new_role
    
    # Audit log
    current_user = kwargs.get("current_user")
    if current_user:
        log = AuditLog(
            admin_id=current_user.id,
            action="update_role",
            target_user_id=u.id,
            reason=f"Changed to {new_role}",
            ip_address=request.remote_addr,
        )
        db.session.add(log)
    
    db.session.commit()
    return jsonify({"message": "Role updated", "user": u.to_dict()}), 200


@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users(**kwargs):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", "").strip()

    query = User.query
    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(User.name.ilike(like), User.email.ilike(like))
        )

    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        "users": [u.to_dict() for u in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
    }), 200


@admin_bp.route("/users/export", methods=["GET"])
@admin_required
def export_users(**kwargs):
    search = request.args.get("search", "").strip()

    query = User.query
    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(User.name.ilike(like), User.email.ilike(like))
        )

    users = query.order_by(User.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Email", "Role", "Points", "Joined At"])

    for u in users:
        writer.writerow([
            u.id,
            u.name,
            u.email,
            u.role,
            u.total_points,
            u.created_at.strftime("%Y-%m-%d %H:%M:%S") if u.created_at else ""
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=users_export.csv"}
    )


@admin_bp.route("/settings", methods=["GET"])
@admin_required
def get_settings(**kwargs):
    # Retrieve all settings or provide defaults
    defaults = {
        "auto_approval": True,
        "mod_assignment": "round-robin",
        "spam_sensitivity": "Medium",
        "max_file_size": 50,
        "allowed_extensions": [".pdf", ".docx", ".jpg", ".png"]
    }
    
    settings = SystemSetting.query.all()
    result = {s.key: s.value for s in settings}
    
    # Merge defaults for any missing keys
    for k, v in defaults.items():
        if k not in result:
            result[k] = v
            
    return jsonify(result), 200


@admin_bp.route("/settings", methods=["POST"])
@admin_required
def update_settings(**kwargs):
    body = request.get_json()
    if not body:
        return jsonify({"error": "No data provided"}), 400
        
    for key, value in body.items():
        setting = SystemSetting.query.get(key)
        if not setting:
            setting = SystemSetting(key=key, value=value)
            db.session.add(setting)
        else:
            setting.value = value
            
    # Audit log
    current_user = kwargs.get("current_user")
    if current_user:
        log = AuditLog(
            admin_id=current_user.id,
            action="update_settings",
            reason=f"Updated system configuration: {', '.join(body.keys())}",
            ip_address=request.remote_addr,
        )
        db.session.add(log)
            
    db.session.commit()
    return jsonify({"message": "Settings updated successfully"}), 200


@admin_bp.route("/papers/<int:paper_id>", methods=["DELETE"])
@admin_required
def delete_paper(paper_id, **kwargs):
    try:
        current_user = kwargs["current_user"]
        paper = Paper.query.get_or_404(paper_id)
        
        # Capture info before deletion to avoid relationship issues
        uploader_name = paper.uploader.name if paper.uploader else 'Unknown'
        paper_title = paper.title
        subject_code = paper.subject_code
        paper_year = paper.year
        uploader_id = paper.uploader_id

        # Physical file deletion
        upload_dir = current_app.config["UPLOAD_FOLDER"]
        for subdir in ["pending", "approved"]:
            file_path = os.path.join(upload_dir, subdir, paper.file_url)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    current_app.logger.error(f"Error deleting file {file_path}: {e}")

        # Database deletion
        db.session.delete(paper)

        # Audit log
        log = AuditLog(
            admin_id=current_user.id,
            action="delete_paper",
            target_paper_id=None,  # Paper is gone, but we track it in reason
            reason=f"Deleted paper: {paper_title} ({subject_code} - {paper_year}) by {uploader_name}",
            ip_address=request.remote_addr,
        )
        db.session.add(log)
        db.session.commit()

        return jsonify({"message": "Paper record purged successfully"}), 200
    except Exception as e:
        current_app.logger.error(
            f"Delete Error ({datetime.utcnow()}): {traceback.format_exc()}"
        )
        return jsonify({"error": "Internal server error"}), 500
