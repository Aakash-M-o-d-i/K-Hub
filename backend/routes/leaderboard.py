from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from models.paper import Paper
from models.department import Department

leaderboard_bp = Blueprint("leaderboard", __name__, url_prefix="/api/leaderboard")


@leaderboard_bp.route("/scholars", methods=["GET"])
def scholar_leaderboard():
    """Top contributors by total points."""
    limit = request.args.get("limit", 20, type=int)
    period = request.args.get("period", "all")  # all / weekly

    scholars = (
        User.query
        .filter(User.total_points > 0)
        .order_by(User.total_points.desc())
        .limit(limit)
        .all()
    )

    result = []
    for rank, user in enumerate(scholars, 1):
        upload_count = Paper.query.filter_by(
            uploader_id=user.id, status="approved"
        ).count()
        result.append({
            "rank": rank,
            "user": user.to_dict(),
            "points": user.total_points,
            "uploads": upload_count,
        })

    return jsonify({"scholars": result}), 200


@leaderboard_bp.route("/departments", methods=["GET"])
def department_leaderboard():
    """Rankings by department total contributions."""
    departments = Department.query.all()
    dept_stats = []

    for dept in departments:
        total_papers = Paper.query.filter_by(
            department_id=dept.id, status="approved"
        ).count()
        total_downloads = (
            db.session.query(db.func.coalesce(db.func.sum(Paper.download_count), 0))
            .filter(Paper.department_id == dept.id, Paper.status == "approved")
            .scalar()
        )
        contributor_count = (
            db.session.query(db.func.count(db.distinct(Paper.uploader_id)))
            .filter(Paper.department_id == dept.id, Paper.status == "approved")
            .scalar()
        )
        total_points = (
            db.session.query(db.func.coalesce(db.func.sum(User.total_points), 0))
            .filter(User.department_id == dept.id)
            .scalar()
        )

        dept_stats.append({
            "department": dept.to_dict(),
            "total_papers": total_papers,
            "total_downloads": int(total_downloads),
            "contributors": contributor_count,
            "total_points": int(total_points),
        })

    dept_stats.sort(key=lambda x: x["total_points"], reverse=True)

    for rank, d in enumerate(dept_stats, 1):
        d["rank"] = rank

    return jsonify({"departments": dept_stats}), 200


@leaderboard_bp.route("/gamified", methods=["GET"])
def gamified_leaderboard():
    """Gamified with streaks, badges, and tier info."""
    limit = request.args.get("limit", 20, type=int)

    scholars = (
        User.query
        .filter(User.total_points > 0)
        .order_by(User.total_points.desc())
        .limit(limit)
        .all()
    )

    def get_tier(points):
        if points >= 1000:
            return {"name": "Grand Scholar", "color": "#FFC107", "icon": "military_tech"}
        elif points >= 500:
            return {"name": "Expert", "color": "#9CA3AF", "icon": "workspace_premium"}
        elif points >= 200:
            return {"name": "Contributor", "color": "#B45309", "icon": "stars"}
        else:
            return {"name": "Beginner", "color": "#64748b", "icon": "school"}

    result = []
    for rank, user in enumerate(scholars, 1):
        upload_count = Paper.query.filter_by(
            uploader_id=user.id, status="approved"
        ).count()
        result.append({
            "rank": rank,
            "user": user.to_dict(),
            "points": user.total_points,
            "uploads": upload_count,
            "tier": get_tier(user.total_points),
            "streak": min(upload_count, 7),  # Simplified streak
        })

    return jsonify({"leaderboard": result}), 200
