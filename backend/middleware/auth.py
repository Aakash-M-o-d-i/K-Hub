from functools import wraps
from flask import jsonify, request, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from models.user import User
from models.session import UserSession


def jwt_required_with_user(fn):
    """Decorator: validates JWT and injects current_user into kwargs."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        jwt_data = get_jwt()
        jti = jwt_data.get("jti")
        
        # Check if session is revoked
        session = UserSession.query.filter_by(jti=jti).first()
        if session and session.is_revoked:
            return jsonify({"error": "Session has been revoked"}), 401
            
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404
        kwargs["current_user"] = user
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    """Decorator: ensures user is admin or super_admin."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404
        if user.role not in ("admin", "super_admin"):
            current_app.logger.warning(
                f"403 Forbidden - User ID: {user_id}, Role: {user.role}, "
                f"Endpoint: {request.path}"
            )
            return jsonify({"error": "Admin access required"}), 403
        kwargs["current_user"] = user
        return fn(*args, **kwargs)
    return wrapper


def super_admin_required(fn):
    """Decorator: ensures user is super_admin."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404
        if user.role != "super_admin":
            return jsonify({"error": "Super admin access required"}), 403
        kwargs["current_user"] = user
        return fn(*args, **kwargs)
    return wrapper
