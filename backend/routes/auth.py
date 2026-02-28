from flask import Blueprint, request, jsonify
from datetime import datetime
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jti
from models import db
from models.user import User
from models.paper import Paper
from models.session import UserSession
from models.security_log import SecurityLog
from models.notification import Notification
from models.otp import OTP
from utils.email_utils import send_otp_email, send_password_reset_email
from middleware.auth import jwt_required_with_user, get_jwt
from sqlalchemy import func
from datetime import datetime, timedelta

bcrypt = Bcrypt()
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def log_security_event(user_id, event_type, metadata=None):
    log = SecurityLog(
        user_id=user_id,
        event_type=event_type,
        ip_address=request.remote_addr,
        metadata_json=metadata
    )
    db.session.add(log)
    db.session.commit()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    department_id = data.get("department_id")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    
    # Generate OTP and store pending registration data
    otp_code = OTP.generate_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Check if there's already a pending registration for this email and update it, or create new
    otp = OTP.query.filter_by(email=email).first()
    if otp:
        otp.code = otp_code
        otp.expires_at = expires_at
        otp.name = name
        otp.password_hash = password_hash
        otp.department_id = department_id
    else:
        otp = OTP(
            email=email, 
            code=otp_code, 
            expires_at=expires_at,
            name=name,
            password_hash=password_hash,
            department_id=department_id
        )
        db.session.add(otp)
    
    db.session.commit()

    email_sent = send_otp_email(email, name, otp_code)

    return jsonify({
        "message": "Verification email sent. Please verify your email to complete registration.",
        "verification_email_sent": email_sent
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    jti = get_jti(access_token)
    
    # Track Session
    ua = request.user_agent
    new_session = UserSession(
        user_id=user.id,
        jti=jti,
        browser=getattr(ua, "browser", "Unknown"),
        os=getattr(ua, "platform", "Unknown"),
        device_type=getattr(ua, "string", "Unknown"),
        ip_address=request.remote_addr
    )
    db.session.add(new_session)
    db.session.commit()

    log_security_event(user.id, "LOGIN", metadata={"browser": getattr(ua, "browser", "Unknown"), "os": getattr(ua, "platform", "Unknown")})
    return jsonify({"token": access_token, "user": user.to_dict()}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required_with_user
def get_me(**kwargs):
    current_user = kwargs["current_user"]
    
    # Calculate stats
    total_uploads = Paper.query.filter_by(uploader_id=current_user.id).count()
    
    # Total downloads received on their papers
    total_downloads = db.session.query(func.sum(Paper.download_count)).filter(Paper.uploader_id == current_user.id).scalar() or 0
    
    # Global Rank based on total_points
    rank = User.query.filter(User.total_points > current_user.total_points).count() + 1
    
    user_data = current_user.to_dict()
    user_data.update({
        "total_uploads": total_uploads,
        "total_downloads": total_downloads,
        "rank": rank
    })
    
    return jsonify({"user": user_data}), 200


@auth_bp.route("/me", methods=["PUT"])
@jwt_required_with_user
def update_profile(**kwargs):
    current_user = kwargs["current_user"]
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400
        
    # Allowed fields to update
    current_user.name = data.get("name", current_user.name)
    if "department_id" in data:
        try:
            current_user.department_id = int(data["department_id"]) if data["department_id"] else None
        except (ValueError, TypeError):
            pass
            
    current_user.roll_no = data.get("roll_no", current_user.roll_no)
    
    if "year" in data:
        try:
            current_user.year = int(data["year"]) if data["year"] else None
        except (ValueError, TypeError):
            pass
            
    current_user.bio = data.get("bio", current_user.bio)
    
    # Handle avatar separately if needed, but for now just text fields
    if "avatar_url" in data:
        current_user.avatar_url = data["avatar_url"]
        
    db.session.commit()
    return jsonify({"message": "Profile updated successfully", "user": current_user.to_dict()}), 200
@auth_bp.route("/preferences", methods=["PUT"])
@jwt_required_with_user
def update_preferences(**kwargs):
    current_user = kwargs["current_user"]
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400
        
    # Update preference fields
    current_user.interface_mode = data.get("interface_mode", current_user.interface_mode)
    current_user.accent_color = data.get("accent_color", current_user.accent_color)
    
    if "paper_alerts" in data:
        current_user.paper_alerts = bool(data["paper_alerts"])
    if "leaderboard_updates" in data:
        current_user.leaderboard_updates = bool(data["leaderboard_updates"])
    if "system_announcements" in data:
        current_user.system_announcements = bool(data["system_announcements"])
        
    if "default_department_id" in data:
        try:
            current_user.default_department_id = int(data["default_department_id"]) if data["default_department_id"] else None
        except (ValueError, TypeError):
            pass
            
    current_user.download_behavior = data.get("download_behavior", current_user.download_behavior)
    
    db.session.commit()
    return jsonify({"message": "Preferences updated successfully", "preferences": current_user.to_dict()["preferences"]}), 200


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required_with_user
def change_password(**kwargs):
    current_user = kwargs["current_user"]
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"error": "Current and new password are required"}), 400

    if not bcrypt.check_password_hash(current_user.password_hash, current_password):
        return jsonify({"error": "Incorrect current password"}), 401

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    current_user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    current_user.password_changed_at = datetime.utcnow()
    db.session.commit()

    log_security_event(current_user.id, "PWD_CHANGE")
    return jsonify({"message": "Password changed successfully"}), 200


@auth_bp.route("/toggle-2fa", methods=["POST"])
@jwt_required_with_user
def toggle_2fa(**kwargs):
    current_user = kwargs["current_user"]
    data = request.get_json()
    
    # In a real app, this would involve more steps (OTP verification etc.)
    # For now, we'll implement a simple toggle to demonstrate the backend connection.
    current_user.is_2fa_enabled = not current_user.is_2fa_enabled
    db.session.commit()
    
    log_security_event(current_user.id, "2FA_TOGGLE", metadata={"enabled": current_user.is_2fa_enabled})
    return jsonify({
        "message": f"2FA {'enabled' if current_user.is_2fa_enabled else 'disabled'} successfully",
        "is_2fa_enabled": current_user.is_2fa_enabled
    }), 200


@auth_bp.route("/sessions", methods=["GET"])
@jwt_required_with_user
def get_sessions(**kwargs):
    current_user = kwargs["current_user"]
    jwt_data = get_jwt()
    current_jti = jwt_data.get("jti")
    
    sessions = UserSession.query.filter_by(user_id=current_user.id, is_revoked=False).all()
    
    session_list = []
    for s in sessions:
        s_dict = s.to_dict()
        s_dict["is_current"] = (s.jti == current_jti)
        session_list.append(s_dict)
        
    return jsonify({"sessions": session_list}), 200


@auth_bp.route("/sessions/<int:session_id>", methods=["DELETE"])
@jwt_required_with_user
def revoke_session(session_id, **kwargs):
    current_user = kwargs["current_user"]
    session = UserSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    
    if not session:
        return jsonify({"error": "Session not found"}), 404
        
    session.is_revoked = True
    db.session.commit()
    
    log_security_event(current_user.id, "SESSION_REVOKE", metadata={"session_id": session_id, "browser": session.browser, "os": session.os})
    return jsonify({"message": "Session revoked successfully"}), 200


@auth_bp.route("/sessions/purge", methods=["DELETE"])
@jwt_required_with_user
def purge_secondary_sessions(**kwargs):
    current_user = kwargs["current_user"]
    jwt_data = get_jwt()
    current_jti = jwt_data.get("jti")

    # Revoke all other sessions
    sessions_to_revoke = UserSession.query.filter(
        UserSession.user_id == current_user.id,
        UserSession.jti != current_jti,
        UserSession.is_revoked == False
    ).all()

    for s in sessions_to_revoke:
        s.is_revoked = True
    
    db.session.commit()
    
    log_security_event(current_user.id, "UNIVERSAL_PURGE", metadata={"revoked_count": len(sessions_to_revoke)})
    return jsonify({"message": f"Successfully purged {len(sessions_to_revoke)} secondary sessions"}), 200


@auth_bp.route("/security-history", methods=["GET"])
@jwt_required_with_user
def get_security_history(**kwargs):
    current_user = kwargs["current_user"]
    logs = SecurityLog.query.filter_by(user_id=current_user.id).order_by(SecurityLog.created_at.desc()).limit(50).all()
    
    return jsonify({"history": [log.to_dict() for log in logs]}), 200


@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body required"}), 400
            
        email = data.get("email", "").strip().lower()
        code = data.get("code", "").strip()
        
        if not email or not code:
            return jsonify({"error": "Email and code are required"}), 400
            
        otp = OTP.query.filter_by(email=email, code=code).order_by(OTP.created_at.desc()).first()
        
        if not otp:
            print(f"VERIFY_DEBUG: No OTP found for {email} with code {code}")
            return jsonify({"error": "Invalid verification code"}), 400
            
        if otp.is_expired():
            print(f"VERIFY_DEBUG: OTP expired for {email}. Expires: {otp.expires_at}, Now: {datetime.utcnow()}")
            return jsonify({"error": "Verification code has expired"}), 400
            
        # Check if user already exists
        user = User.query.filter_by(email=email).first()
        if user:
            print(f"VERIFY_DEBUG: Updating existing user {email}")
            user.is_verified = True
        else:
            print(f"VERIFY_DEBUG: Creating new user {email}")
            if not otp.name or not otp.password_hash:
                return jsonify({"error": "Incomplete registration data. Please register again."}), 400
                
            user = User(
                name=otp.name,
                email=otp.email,
                password_hash=otp.password_hash,
                department_id=otp.department_id,
                role="student",
                is_verified=True
            )
            db.session.add(user)
        
        # Delete all OTP records for this email
        OTP.query.filter_by(email=email).delete()
        db.session.commit()
        
        # Ensure user.id is populated
        if not user.id:
            db.session.refresh(user)
            
        # Now create session and return token
        access_token = create_access_token(identity=str(user.id))
        jti = get_jti(access_token)
        
        ua = request.user_agent
        new_session = UserSession(
            user_id=user.id,
            jti=jti,
            browser=getattr(ua, "browser", "Unknown"),
            os=getattr(ua, "platform", "Unknown"),
            device_type=getattr(ua, "string", "Unknown"),
            ip_address=request.remote_addr
        )
        db.session.add(new_session)
        db.session.commit()
        
        log_security_event(user.id, "REGISTER_COMPLETED")
        log_security_event(user.id, "EMAIL_VERIFIED")

        # Notify Admins
        admins = User.query.filter(User.role.in_(['admin', 'super_admin'])).all()
        for admin in admins:
            n = Notification(
                user_id=admin.id,
                type='success',
                title='New User Registered',
                message=f'User {user.name} ({user.email}) has joined and verified their account.',
                link='/sector-delta/users'
            )
            db.session.add(n)
        db.session.commit()
        
        return jsonify({
            "message": "Email verified and registration complete", 
            "token": access_token,
            "user": user.to_dict()
        }), 200
    except Exception as e:
        import traceback
        error_msg = f"--- Verify Email Traceback ({datetime.now()}) ---\n{traceback.format_exc()}\n"
        with open("backend_error.txt", "a") as f:
            f.write(error_msg)
        print(error_msg)
        return jsonify({"error": "Internal server error during verification"}), 500


@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400
        
    email = data.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
        
    # Find pending OTP or existing user
    otp = OTP.query.filter_by(email=email).order_by(OTP.created_at.desc()).first()
    user = User.query.filter_by(email=email).first()
    
    if user and user.is_verified:
        return jsonify({"error": "Email is already verified"}), 400
        
    if not otp and not user:
        return jsonify({"error": "Registration not found. Please register first."}), 404
        
    # Name for the email
    user_name = user.name if user else (otp.name if otp else "User")
    
    # Generate and Send OTP
    otp_code = OTP.generate_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    if otp:
        otp.code = otp_code
        otp.expires_at = expires_at
    else:
        # User exists but no OTP record found? (Shouldn't happen in the new flow but for safety)
        otp = OTP(email=email, code=otp_code, expires_at=expires_at)
        db.session.add(otp)
        
    db.session.commit()

    email_sent = send_otp_email(email, user_name, otp_code)
    
    if not email_sent:
        return jsonify({"error": "Failed to send verification email"}), 500
        
    return jsonify({"message": "Verification code resent successfully"}), 200


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Step 1: Send OTP to the registered email for password reset."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    email = data.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Don't reveal whether the email exists — always return success
        return jsonify({"message": "If this email is registered, you will receive a reset code."}), 200

    # Generate OTP and store it (reuse OTP table with name=__PASSWORD_RESET__ to distinguish)
    otp_code = OTP.generate_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Remove any existing reset OTPs for this email
    OTP.query.filter_by(email=email, name="__PASSWORD_RESET__").delete()

    otp = OTP(
        email=email,
        code=otp_code,
        expires_at=expires_at,
        name="__PASSWORD_RESET__",
    )
    db.session.add(otp)
    db.session.commit()

    email_sent = send_password_reset_email(email, user.name, otp_code)

    if not email_sent:
        return jsonify({"error": "Failed to send reset email. Please try again."}), 500

    return jsonify({"message": "If this email is registered, you will receive a reset code."}), 200


@auth_bp.route("/verify-reset-otp", methods=["POST"])
def verify_reset_otp():
    """Step 2: Verify the OTP code for password reset (max 3 attempts)."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    email = data.get("email", "").strip().lower()
    code = data.get("code", "").strip()

    if not email or not code:
        return jsonify({"error": "Email and code are required"}), 400

    # Find the reset OTP for this email (regardless of code — to track attempts)
    otp = OTP.query.filter_by(
        email=email, name="__PASSWORD_RESET__"
    ).order_by(OTP.created_at.desc()).first()

    if not otp:
        return jsonify({"error": "No reset request found. Please request a new code."}), 400

    if otp.is_expired():
        OTP.query.filter_by(email=email, name="__PASSWORD_RESET__").delete()
        db.session.commit()
        return jsonify({"error": "Reset code has expired. Please request a new one.", "expired": True}), 400

    # Check if already exceeded max attempts
    if otp.attempts >= OTP.MAX_ATTEMPTS:
        OTP.query.filter_by(email=email, name="__PASSWORD_RESET__").delete()
        db.session.commit()
        return jsonify({
            "error": "Too many failed attempts. This code has been invalidated. Please request a new one.",
            "locked": True,
            "attempts_remaining": 0,
        }), 429

    # Check if code matches
    if otp.code != code:
        otp.attempts += 1
        remaining = OTP.MAX_ATTEMPTS - otp.attempts

        if remaining <= 0:
            # Max attempts reached — invalidate the OTP
            OTP.query.filter_by(email=email, name="__PASSWORD_RESET__").delete()
            db.session.commit()
            return jsonify({
                "error": "Too many failed attempts. This code has been invalidated. Please request a new one.",
                "locked": True,
                "attempts_remaining": 0,
            }), 429

        db.session.commit()
        return jsonify({
            "error": f"Invalid code. {remaining} attempt{'s' if remaining != 1 else ''} remaining.",
            "attempts_remaining": remaining,
        }), 400

    # Code is correct — generate reset token
    import secrets
    reset_token = secrets.token_urlsafe(32)
    otp.password_hash = reset_token
    otp.attempts = 0  # reset attempts on success
    db.session.commit()

    return jsonify({
        "message": "Code verified successfully",
        "reset_token": reset_token,
    }), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Step 3: Set new password using the reset token."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    email = data.get("email", "").strip().lower()
    reset_token = data.get("reset_token", "").strip()
    new_password = data.get("new_password", "")

    if not email or not reset_token or not new_password:
        return jsonify({"error": "Email, reset token, and new password are required"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    # Verify the reset token
    otp = OTP.query.filter_by(
        email=email, name="__PASSWORD_RESET__", password_hash=reset_token
    ).first()

    if not otp:
        return jsonify({"error": "Invalid or expired reset session"}), 400

    if otp.is_expired():
        return jsonify({"error": "Reset session has expired. Please start over."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update password
    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    user.password_changed_at = datetime.utcnow()

    # Clean up all reset OTPs for this email
    OTP.query.filter_by(email=email, name="__PASSWORD_RESET__").delete()
    db.session.commit()

    log_security_event(user.id, "PWD_RESET", metadata={"method": "email_otp"})

    return jsonify({"message": "Password reset successfully. You can now log in."}), 200
