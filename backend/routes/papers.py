import os
import shutil
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
from models import db
from models.paper import Paper
from models.department import Department
from models.leaderboard import Download, LeaderboardPoints, SystemSetting, Bookmark
from models.user import User
from models.notification import Notification
from middleware.auth import jwt_required_with_user

papers_bp = Blueprint("papers", __name__, url_prefix="/api/papers")


def allowed_file(filename):
    allowed = SystemSetting.get_val("allowed_extensions", current_app.config["ALLOWED_EXTENSIONS"])
    if "*" in allowed:
        return "." in filename
    # Convert all to lowercase without leading dot for comparison
    allowed_cleaned = [ext.lower().lstrip(".") for ext in allowed]
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in allowed_cleaned
    )


@papers_bp.route("", methods=["GET"])
def list_papers():
    """Public: list approved papers with optional filters."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 12, type=int)
    search = request.args.get("search", "").strip()
    department_id = request.args.get("department_id", type=int)
    semester = request.args.get("semester", type=int)
    exam_type = request.args.get("exam_type", "").strip()
    year = request.args.get("year", "").strip()
    sort_by = request.args.get("sort", "newest")

    query = Paper.query.filter_by(status="approved")

    if search:
        like = f"%{search}%"
        query = query.join(Department, Paper.department_id == Department.id).filter(
            db.or_(
                Paper.title.ilike(like),
                Paper.subject_code.ilike(like),
                Paper.professor.ilike(like),
                Department.name.ilike(like),
                Department.code.ilike(like),
            )
        )
    if department_id:
        query = query.filter_by(department_id=department_id)
    if semester:
        query = query.filter_by(semester=semester)
    if exam_type:
        query = query.filter_by(exam_type=exam_type)
    if year:
        query = query.filter_by(year=year)

    if sort_by == "oldest":
        query = query.order_by(Paper.created_at.asc())
    elif sort_by == "downloads":
        query = query.order_by(Paper.download_count.desc())
    elif sort_by == "rating":
        query = query.order_by(Paper.rating_avg.desc())
    else:
        query = query.order_by(Paper.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "papers": [p.to_dict() for p in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": per_page,
    }), 200


@papers_bp.route("/<int:paper_id>", methods=["GET"])
def get_paper(paper_id):
    paper = Paper.query.get_or_404(paper_id)
    return jsonify({"paper": paper.to_dict()}), 200


@papers_bp.route("/upload", methods=["POST"])
@jwt_required_with_user
def upload_paper(**kwargs):
    current_user = kwargs["current_user"]

    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Max File Size Check
    max_mb = SystemSetting.get_val("max_file_size", 128)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    if file_size > max_mb * 1024 * 1024:
        current_app.logger.warning(f"File size rejection: {file_size} > {max_mb}MB")
        return jsonify({"error": f"File too large. Maximum allowed is {max_mb}MB"}), 400

    if not allowed_file(file.filename):
        current_app.logger.warning(f"Extension rejection: {file.filename}")
        return jsonify({"error": "File type not allowed"}), 400

    title = request.form.get("title", "").strip()
    subject_code = request.form.get("subject_code", "").strip()
    year = request.form.get("year", "").strip()
    semester = request.form.get("semester", type=int)
    exam_type = request.form.get("exam_type", "End Semester").strip()
    department_id = request.form.get("department_id", type=int)
    professor = request.form.get("professor", "").strip() or None

    if not title or not subject_code or not year or not semester or not department_id:
        return jsonify({"error": "All required fields must be filled"}), 400

    # Validate department exists
    dept = Department.query.get(department_id)
    if not dept:
        return jsonify({"error": "Invalid department"}), 400

    # Save file
    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower()
    safe_name = f"{current_user.id}_{paper_id_counter()}_{filename}"
    
    # Auto-approval check
    auto_approve = SystemSetting.get_val("auto_approval", True)
    target_status = "approved" if auto_approve else "pending"
    target_dir_name = "approved" if auto_approve else "pending"
    
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    target_dir = os.path.join(upload_dir, target_dir_name)
    os.makedirs(target_dir, exist_ok=True)
    
    filepath = os.path.join(target_dir, safe_name)
    file.save(filepath)

    paper = Paper(
        title=title,
        subject_code=subject_code.upper(),
        year=year,
        semester=semester,
        exam_type=exam_type,
        file_url=safe_name,
        file_type=ext,
        file_size=file_size,
        professor=professor,
        uploader_id=current_user.id,
        department_id=department_id,
        status=target_status,
    )
    db.session.add(paper)

    # Award upload points
    pts = 5 if target_status == "pending" else 15 # Bonus for auto-approved
    points = LeaderboardPoints(
        user_id=current_user.id,
        points=pts,
        action_type="upload" if target_status == "pending" else "approved",
    )
    db.session.add(points)
    current_user.total_points += pts

    db.session.commit()

    # Notify Admins
    if not auto_approve:
        admins = User.query.filter(User.role.in_(['admin', 'super_admin'])).all()
        for admin in admins:
            n = Notification(
                user_id=admin.id,
                type='warning',
                title='New Pending Paper',
                message=f'User {current_user.name} uploaded "{title}". Approval required.',
                link='/admin/moderation'
            )
            db.session.add(n)
        db.session.commit()

    return jsonify({"message": f"Paper uploaded and {target_status} successfully", "paper": paper.to_dict()}), 201


@papers_bp.route("/<int:paper_id>/download", methods=["GET"])
@jwt_required_with_user
def download_paper(paper_id, **kwargs):
    current_user = kwargs["current_user"]
    paper = Paper.query.get_or_404(paper_id)

    if paper.status != "approved":
        return jsonify({"error": "Paper not available for download"}), 403

    # Track download
    dl = Download(user_id=current_user.id, paper_id=paper.id)
    db.session.add(dl)
    paper.download_count += 1
    db.session.commit()

    # Determine folder
    folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "approved")
    if not os.path.exists(os.path.join(folder, paper.file_url)):
        folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "pending")

    return send_from_directory(folder, paper.file_url, as_attachment=True)


@papers_bp.route("/<int:paper_id>/preview", methods=["GET"])
def preview_paper(paper_id):
    """Serve the paper file inline for preview (no auth needed for approved papers)."""
    paper = Paper.query.get_or_404(paper_id)

    # Try approved folder first, then pending
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    folder = os.path.join(upload_dir, "approved")
    if not os.path.exists(os.path.join(folder, paper.file_url)):
        folder = os.path.join(upload_dir, "pending")
    if not os.path.exists(os.path.join(folder, paper.file_url)):
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(folder, paper.file_url, as_attachment=False)


@papers_bp.route("/me/downloads", methods=["GET"])
@jwt_required_with_user
def get_my_downloads(**kwargs):
    current_user = kwargs["current_user"]
    downloads = (
        Download.query.filter_by(user_id=current_user.id)
        .order_by(Download.downloaded_at.desc())
        .all()
    )
    paper_ids = [d.paper_id for d in downloads]
    # Keep the order of downloads
    papers = []
    for pid in paper_ids:
        p = Paper.query.get(pid)
        if p:
            papers.append(p.to_dict())
    
    return jsonify({"papers": papers}), 200


@papers_bp.route("/me/uploads", methods=["GET"])
@jwt_required_with_user
def get_my_uploads(**kwargs):
    current_user = kwargs["current_user"]
    papers = (
        Paper.query.filter_by(uploader_id=current_user.id)
        .order_by(Paper.created_at.desc())
        .all()
    )
    return jsonify({"papers": [p.to_dict() for p in papers]}), 200


@papers_bp.route("/me/bookmarks", methods=["GET"])
@jwt_required_with_user
def get_my_bookmarks(**kwargs):
    current_user = kwargs["current_user"]
    bookmarks = (
        Bookmark.query.filter_by(user_id=current_user.id)
        .order_by(Bookmark.created_at.desc())
        .all()
    )
    paper_ids = [b.paper_id for b in bookmarks]
    papers = []
    for pid in paper_ids:
        p = Paper.query.get(pid)
        if p:
            papers.append(p.to_dict())
            
    return jsonify({"papers": papers}), 200


@papers_bp.route("/<int:paper_id>/bookmark", methods=["POST"])
@jwt_required_with_user
def toggle_bookmark(paper_id, **kwargs):
    current_user = kwargs["current_user"]
    paper = Paper.query.get_or_404(paper_id)
    
    bookmark = Bookmark.query.filter_by(user_id=current_user.id, paper_id=paper.id).first()
    if bookmark:
        db.session.delete(bookmark)
        db.session.commit()
        return jsonify({"message": "Bookmark removed", "isBookmarked": False}), 200
    else:
        new_bookmark = Bookmark(user_id=current_user.id, paper_id=paper.id)
        db.session.add(new_bookmark)
        db.session.commit()
        return jsonify({"message": "Bookmark added", "isBookmarked": True}), 200


@papers_bp.route("/departments", methods=["GET"])
def list_departments():
    departments = Department.query.order_by(Department.name).all()
    return jsonify({"departments": [d.to_dict() for d in departments]}), 200


@papers_bp.route("/stats/public", methods=["GET"])
def get_public_stats():
    """Get summarized counts and popular tags for the landing page (public)."""
    try:
        paper_count = Paper.query.filter_by(status="approved").count()
        dept_count = Department.query.count()
        user_count = User.query.count()

        # Get popular tags based on downloads
        popular_papers = (
            db.session.query(
                Paper.subject_code,
                db.func.sum(Paper.download_count).label("total_downloads")
            )
            .filter(Paper.status == "approved")
            .group_by(Paper.subject_code)
            .order_by(db.desc("total_downloads"))
            .limit(5)
            .all()
        )
        popular_tags = [p[0] for p in popular_papers]

        return jsonify({
            "papers": paper_count,
            "departments": dept_count,
            "users": user_count,
            "popular_tags": popular_tags if popular_tags else ["Data Structures", "Operating Systems", "Mathematics"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def paper_id_counter():
    """Simple counter based on existing papers count."""
    import time
    return int(time.time() * 1000) % 1000000
