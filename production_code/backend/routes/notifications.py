from flask import Blueprint, jsonify, request
from models import db
from models.notification import Notification
from middleware.auth import jwt_required_with_user

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


@notifications_bp.route('', methods=['GET'])
@jwt_required_with_user
def get_notifications(**kwargs):
    current_user = kwargs["current_user"]

    limit = request.args.get('limit', 20, type=int)
    limit = min(max(limit, 1), 100)  # Clamp between 1-100

    notifications = Notification.query.filter_by(user_id=current_user.id)\
        .order_by(Notification.created_at.desc())\
        .limit(limit).all()
    
    unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()

    return jsonify({
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count
    }), 200


@notifications_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required_with_user
def mark_read(notif_id, **kwargs):
    current_user = kwargs["current_user"]
    notification = Notification.query.filter_by(id=notif_id, user_id=current_user.id).first()
    
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify({"message": "Marked as read"}), 200


@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required_with_user
def mark_all_read(**kwargs):
    current_user = kwargs["current_user"]
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({Notification.is_read: True})
    db.session.commit()
    
    return jsonify({"message": "All marked as read"}), 200
