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
from models.rating import Rating
from middleware.auth import jwt_required_with_user
from utils.security import (
    FileSecurityValidator, InputValidator, AccessControl, 
    AuditLogger, EncryptionUtils, limiter
)

papers_bp = Blueprint("papers", __name__, url_prefix="/api/papers")


def allowed_file(filename):
    allowed = SystemSetting.get_val("allowed_extensions", current_app.config["ALLOWED_EXTENSIONS"])
    # ✅ SECURITY: Reject wildcard — never allow all extensions
    allowed_cleaned = [ext.lower().lstrip(".") for ext in allowed if ext.strip() != "*"]
    if not allowed_cleaned:
        # Fallback to hardcoded whitelist if DB config is empty/wildcard-only
        allowed_cleaned = [ext.lower() for ext in current_app.config["ALLOWED_EXTENSIONS"]]
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in allowed_cleaned
    )


@papers_bp.route("", methods=["GET"])
def list_papers():
    """Public: list approved papers with optional filters."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 12, type=int)
    
    # ✅ INPUT VALIDATION: Sanitize search terms
    search = InputValidator.sanitize_text(request.args.get("search", ""), max_length=100)
    
    department_id = request.args.get("department_id", type=int)
    semester = request.args.get("semester", type=int)
    exam_type = InputValidator.sanitize_text(request.args.get("exam_type", ""), max_length=50)
    year = InputValidator.sanitize_text(request.args.get("year", ""), max_length=4)
    sort_by = request.args.get("sort", "newest")
    
    # ✅ VALIDATION: Limit pagination
    per_page = min(max(per_page, 1), 100)  # Between 1 and 100

    query = Paper.query.filter_by(status="approved")

    if search:
        # ✅ SECURITY: Escape LIKE wildcards to prevent pattern injection
        safe_search = search.replace('%', '\\%').replace('_', '\\_')
        like = f"%{safe_search}%"
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
@limiter.limit("10 per hour")  # Rate limit uploads
def upload_paper(**kwargs):
    current_user = kwargs["current_user"]

    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # ✅ FILE SECURITY: Validate file size first
    is_valid, error = FileSecurityValidator.validate_file_size(file)
    if not is_valid:
        AuditLogger.log_event('FILE_UPLOAD_REJECTED', user_id=current_user.id, details=error)
        return jsonify({"error": error}), 400

    # ✅ FILE SECURITY: Validate extension
    is_valid, error = FileSecurityValidator.validate_file_extension(file.filename)
    if not is_valid:
        AuditLogger.log_event('FILE_UPLOAD_REJECTED', user_id=current_user.id, details=f"Invalid extension: {error}")
        return jsonify({"error": error}), 400

    # ✅ INPUT VALIDATION: Sanitize form inputs
    title = InputValidator.sanitize_text(request.form.get("title", ""), max_length=200)
    subject_code = InputValidator.sanitize_text(request.form.get("subject_code", ""), max_length=50)
    year = InputValidator.sanitize_text(request.form.get("year", ""), max_length=4)
    semester = request.form.get("semester", type=int)
    exam_type = InputValidator.sanitize_text(request.form.get("exam_type", "End Semester"), max_length=50)
    department_id = request.form.get("department_id", type=int)
    professor = InputValidator.sanitize_text(request.form.get("professor", ""), max_length=100) or None

    if not title or not subject_code or not year or not semester or not department_id:
        return jsonify({"error": "All required fields must be filled"}), 400

    # ✅ ACCESS CONTROL: Validate department exists
    dept = Department.query.get(department_id)
    if not dept:
        return jsonify({"error": "Invalid department"}), 400

    # ✅ FILE SECURITY: Save file temporarily for validation
    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower()
    
    # Generate random filename to prevent directory traversal
    random_id = EncryptionUtils.generate_secure_token(16)
    temp_filename = f"{current_user.id}_{random_id}_{filename}"
    
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    temp_dir = os.path.join(upload_dir, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    
    temp_filepath = os.path.join(temp_dir, temp_filename)
    file.save(temp_filepath)
    
    try:
        # ✅ FILE SECURITY: Validate file content (magic bytes)
        is_valid, error = FileSecurityValidator.validate_file_content(temp_filepath)
        if not is_valid:
            os.remove(temp_filepath)
            AuditLogger.log_event('FILE_UPLOAD_REJECTED', user_id=current_user.id, details=f"Malicious content: {error}")
            return jsonify({"error": "File validation failed"}), 400
        
        # ✅ FILE SECURITY: Validate MIME type
        is_valid, error = FileSecurityValidator.validate_mime_type(temp_filepath, filename)
        if not is_valid:
            os.remove(temp_filepath)
            AuditLogger.log_event('FILE_UPLOAD_REJECTED', user_id=current_user.id, details=f"Invalid MIME: {error}")
            return jsonify({"error": error}), 400
        
        # ✅ FILE SECURITY: Additional PDF validation
        if ext == 'pdf':
            is_valid, error = FileSecurityValidator.validate_pdf_safety(temp_filepath)
            if not is_valid:
                os.remove(temp_filepath)
                AuditLogger.log_event('FILE_UPLOAD_REJECTED', user_id=current_user.id, details=f"PDF validation failed: {error}")
                return jsonify({"error": error}), 400
        
        # ✅ SECURITY: Generate file hash for integrity verification
        file_hash = EncryptionUtils.generate_file_hash(temp_filepath)
        
        # Move file to final location
        auto_approve = SystemSetting.get_val("auto_approval", True)
        target_status = "approved" if auto_approve else "pending"
        target_dir_name = "approved" if auto_approve else "pending"
        
        target_dir = os.path.join(upload_dir, target_dir_name)
        os.makedirs(target_dir, exist_ok=True)
        
        final_filepath = os.path.join(target_dir, temp_filename)
        shutil.move(temp_filepath, final_filepath)
        
        # Get file size after validation
        file_size = os.path.getsize(final_filepath)
        
        paper = Paper(
            title=title,
            subject_code=subject_code.upper(),
            year=year,
            semester=semester,
            exam_type=exam_type,
            file_url=temp_filename,  # Use random filename
            file_type=ext,
            file_size=file_size,
            professor=professor,
            uploader_id=current_user.id,
            department_id=department_id,
            status=target_status,
        )
        db.session.add(paper)

        # Award upload points
        pts = 5 if target_status == "pending" else 15
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
                    link='/nituganesh/moderation'
                )
                db.session.add(n)
            db.session.commit()

        # ✅ AUDIT: Log successful upload
        AuditLogger.log_event('FILE_UPLOADED', user_id=current_user.id, details=f"Title: {title}, Hash: {file_hash}")

        return jsonify({
            "message": f"Paper uploaded and {target_status} successfully",
            "paper": paper.to_dict()
        }), 201
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
        AuditLogger.log_event('FILE_UPLOAD_ERROR', user_id=current_user.id, details=str(e), severity='ERROR')
        return jsonify({"error": "Failed to process file"}), 500


@papers_bp.route("/<int:paper_id>/download", methods=["GET"])
@jwt_required_with_user
def download_paper(paper_id, **kwargs):
    current_user = kwargs["current_user"]
    paper = Paper.query.get_or_404(paper_id)

    # ✅ ACCESS CONTROL: Check if paper is approved
    if paper.status != "approved":
        AuditLogger.log_event(
            'UNAUTHORIZED_DOWNLOAD_ATTEMPT',
            user_id=current_user.id,
            details=f"Paper {paper_id} not approved"
        )
        return jsonify({"error": "Paper not available for download"}), 403

    # ✅ SECURITY: Deduplicate downloads (same user + paper within 1 hour)
    from datetime import datetime, timedelta
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_download = Download.query.filter(
        Download.user_id == current_user.id,
        Download.paper_id == paper.id,
        Download.downloaded_at >= one_hour_ago
    ).first()
    
    if not recent_download:
        dl = Download(user_id=current_user.id, paper_id=paper.id)
        db.session.add(dl)
        paper.download_count += 1
        db.session.commit()

    # ✅ SECURITY: Validate file path (prevent directory traversal)
    folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "approved")
    filepath = os.path.join(folder, paper.file_url)
    
    # Ensure the resolved path is within the upload folder
    if not os.path.abspath(filepath).startswith(os.path.abspath(folder)):
        AuditLogger.log_event('PATH_TRAVERSAL_ATTEMPT', user_id=current_user.id, details=f"Paper {paper_id}")
        return jsonify({"error": "Invalid file path"}), 400
    
    if not os.path.exists(filepath):
        folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "pending")
        filepath = os.path.join(folder, paper.file_url)
        if not os.path.abspath(filepath).startswith(os.path.abspath(folder)):
            return jsonify({"error": "Invalid file path"}), 400

    # ✅ AUDIT: Log download
    AuditLogger.log_event('FILE_DOWNLOADED', user_id=current_user.id, details=f"Paper: {paper.title}")

    return send_from_directory(folder, paper.file_url, as_attachment=True)


@papers_bp.route("/<int:paper_id>/preview", methods=["GET"])
def preview_paper(paper_id):
    """Serve the paper file inline for preview (no auth needed for approved papers)."""
    paper = Paper.query.get_or_404(paper_id)

    # ✅ SECURITY: Only allow previewing approved papers
    if paper.status != "approved":
        return jsonify({"error": "Paper not available"}), 404

    # Try approved folder first
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    folder = os.path.join(upload_dir, "approved")
    filepath = os.path.join(folder, paper.file_url)
    
    # ✅ SECURITY: Validate file path (prevent directory traversal)
    if not os.path.abspath(filepath).startswith(os.path.abspath(folder)):
        return jsonify({"error": "Invalid file path"}), 400
    
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(folder, paper.file_url, as_attachment=False)


@papers_bp.route("/me/downloads", methods=["GET"])
@jwt_required_with_user
def get_my_downloads(**kwargs):
    current_user = kwargs["current_user"]
    
    # ✅ ACCESS CONTROL: User can only see their own downloads
    downloads = (
        Download.query.filter_by(user_id=current_user.id)
        .order_by(Download.downloaded_at.desc())
        .all()
    )
    
    seen_ids = set()
    papers = []
    for d in downloads:
        if d.paper_id not in seen_ids:
            p = Paper.query.get(d.paper_id)
            if p:
                papers.append(p.to_dict())
                seen_ids.add(d.paper_id)
    
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
    
    seen_ids = set()
    papers = []
    for b in bookmarks:
        if b.paper_id not in seen_ids:
            p = Paper.query.get(b.paper_id)
            if p:
                papers.append(p.to_dict())
                seen_ids.add(b.paper_id)
            
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
        current_app.logger.error(f"Public stats error: {e}")
        return jsonify({"error": "Failed to load stats"}), 500


@papers_bp.route("/<int:paper_id>/rate", methods=["POST"])
@jwt_required_with_user
def rate_paper(paper_id, **kwargs):
    """Submit or update a rating for a paper (1-5 stars).
    Optimized for 1000+ ratings per paper using incremental avg updates.
    """
    current_user = kwargs["current_user"]
    paper = Paper.query.get_or_404(paper_id)

    if paper.status != "approved":
        return jsonify({"error": "Can only rate approved papers"}), 403

    data = request.get_json() or {}
    score = data.get("score")

    if not score or not isinstance(score, int) or score < 1 or score > 5:
        return jsonify({"error": "Score must be an integer between 1 and 5"}), 400

    # Check for existing rating (indexed lookup)
    rating = Rating.query.filter_by(
        user_id=current_user.id, paper_id=paper.id
    ).first()

    if rating:
        # Skip if same score — no DB write needed
        if rating.score == score:
            return jsonify({
                "message": "Rating unchanged",
                "score": score,
                "rating_avg": float(paper.rating_avg),
                "rating_count": paper.rating_count,
            }), 200

        # Incremental avg update: O(1) instead of re-aggregating all rows
        # new_avg = old_avg + (new_score - old_score) / count
        old_score = rating.score
        count = paper.rating_count or 1
        old_avg = float(paper.rating_avg) if paper.rating_avg else 0.0
        new_avg = old_avg + (score - old_score) / count
        rating.score = score
        paper.rating_avg = round(new_avg, 1)
    else:
        # New rating: update avg with simple weighted formula
        # new_avg = (old_avg * old_count + new_score) / (old_count + 1)
        old_count = paper.rating_count or 0
        old_avg = float(paper.rating_avg) if paper.rating_avg else 0.0
        new_count = old_count + 1
        new_avg = (old_avg * old_count + score) / new_count

        rating = Rating(
            user_id=current_user.id,
            paper_id=paper.id,
            score=score,
        )
        db.session.add(rating)
        paper.rating_count = new_count
        paper.rating_avg = round(new_avg, 1)

    db.session.commit()

    return jsonify({
        "message": "Rating submitted",
        "score": score,
        "rating_avg": float(paper.rating_avg),
        "rating_count": paper.rating_count,
    }), 200


@papers_bp.route("/<int:paper_id>/rating", methods=["GET"])
@jwt_required_with_user
def get_my_rating(paper_id, **kwargs):
    """Get the current user's rating for a paper."""
    current_user = kwargs["current_user"]
    Paper.query.get_or_404(paper_id)

    rating = Rating.query.filter_by(
        user_id=current_user.id, paper_id=paper_id
    ).first()

    return jsonify({
        "score": rating.score if rating else None,
    }), 200

