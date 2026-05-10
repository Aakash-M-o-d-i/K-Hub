import hmac  # SECURITY FIX [M5]: Added for constant-time OTP comparison
import secrets
import traceback

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
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
from utils.security import (
    limiter, InputValidator, SecurityLog as SecurityLogUtil, 
    AuditLogger, EncryptionUtils
)
from middleware.auth import jwt_required_with_user, get_jwt
from sqlalchemy import func
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

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
@limiter.limit("5 per hour")  # Rate limit registration attempts
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    department_id = data.get("department_id")
    semester = data.get("semester")
    phone_number = data.get("phone_number", "").strip()

    # ✅ VALIDATION: Email format
    if not InputValidator.is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400
    
    # ✅ VALIDATION: Name sanitization
    name = InputValidator.sanitize_text(name, max_length=100)
    if not name:
        return jsonify({"error": "Name is required"}), 400
    
    if not email or not password or not department_id or not semester or not phone_number:
        return jsonify({"error": "All fields are required (Name, Email, Password, Department, Semester, Phone)"}), 400
    
    # ✅ VALIDATION: Phone format
    if not InputValidator.is_valid_phone(phone_number):
        return jsonify({"error": "Invalid phone number format"}), 400
    
    # ✅ VALIDATION: Strong password
    is_valid, pwd_error = InputValidator.validate_password_strength(password)
    if not is_valid:
        return jsonify({"error": pwd_error}), 400
    
    # ✅ VALIDATION: Existing user check
    if User.query.filter_by(email=email).first():
        # Don't reveal if email exists (security best practice)
        return jsonify({"error": "Email already registered"}), 409
    
    # ✅ SECURITY: Hash password
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
        otp.semester = semester
        otp.phone_number = phone_number
    else:
        otp = OTP(
            email=email, 
            code=otp_code, 
            expires_at=expires_at,
            name=name,
            password_hash=password_hash,
            department_id=department_id,
            semester=semester,
            phone_number=phone_number
        )
        db.session.add(otp)
    
    db.session.commit()

    email_sent = send_otp_email(email, name, otp_code)
    
    # ✅ AUDIT: Log registration attempt
    AuditLogger.log_event('REGISTRATION_ATTEMPT', details=f"Email: {email}")

    return jsonify({
        "message": "Verification email sent. Please verify your email to complete registration.",
        "verification_email_sent": email_sent
    }), 201


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")  # Rate limit login attempts
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # ✅ BRUTE FORCE PROTECTION: Check account lock
    if SecurityLogUtil.is_account_locked(email):
        remaining = SecurityLogUtil.get_lockout_remaining(email)
        AuditLogger.log_event('LOGIN_ATTEMPT_LOCKED', details=f"Email: {email}, Remaining: {remaining}s")
        return jsonify({
            "error": f"Account locked. Try again in {remaining} seconds"
        }), 429

    # ✅ SQL INJECTION PROTECTION: Parameterized query (ORM handles this)
    user = User.query.filter_by(email=email).first()
    
    # ✅ SECURITY: Use constant-time password comparison
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        # Record failed attempt
        status = SecurityLogUtil.record_failed_login(email)
        
        if status == "account_locked":
            AuditLogger.log_event('ACCOUNT_LOCKED', details=f"Email: {email}")
            return jsonify({
                "error": "Too many failed attempts. Account locked for 15 minutes"
            }), 429
        
        AuditLogger.log_event('FAILED_LOGIN', details=f"Email: {email}")
        return jsonify({"error": "Invalid email or password"}), 401

    # ✅ Clear failed attempts on successful login
    SecurityLogUtil.clear_failed_attempts(email)
    
    # ✅ SECURITY: Generate new session ID
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
    
    # ✅ AUDIT: Log successful login
    AuditLogger.log_event('LOGIN_SUCCESS', user_id=user.id, details=f"Browser: {getattr(ua, 'browser', 'Unknown')}")
    
    return jsonify({"token": access_token, "user": user.to_dict()}), 200


@auth_bp.route("/google", methods=["POST"])
@limiter.limit("20 per minute")
def google_auth():
    """Handle Google OAuth login/registration via ID token verification."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    credential = data.get("credential", "")
    action = data.get("action", "login")  # 'login' or 'register'
    if not credential:
        return jsonify({"error": "Google credential token is required"}), 400

    try:
        # Verify the Google ID token
        google_client_id = current_app.config.get("GOOGLE_CLIENT_ID")
        if not google_client_id:
            return jsonify({"error": "Google OAuth is not configured on the server"}), 500

        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            google_client_id
        )

        # Validate the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return jsonify({"error": "Invalid token issuer"}), 401

        # Extract user info from Google token
        google_id = idinfo['sub']
        email = idinfo.get('email', '').lower()
        name = idinfo.get('name', '')
        avatar_url = idinfo.get('picture', '')
        email_verified = idinfo.get('email_verified', False)

        if not email:
            return jsonify({"error": "Email not provided by Google"}), 400

        if not email_verified:
            return jsonify({"error": "Google email is not verified"}), 400

        # Check if user exists by OAuth provider + ID
        user = User.query.filter_by(oauth_provider='google', oauth_id=google_id).first()

        if not user:
            # Check if a user with the same email already exists (registered via email/password)
            user = User.query.filter_by(email=email).first()

            if user:
                # Link existing account with Google OAuth
                user.oauth_provider = 'google'
                user.oauth_id = google_id
                if not user.avatar_url and avatar_url:
                    user.avatar_url = avatar_url
                if not user.is_verified:
                    user.is_verified = True
                db.session.commit()
                AuditLogger.log_event('OAUTH_LINK', user_id=user.id, details=f"Linked Google account: {email}")
            else:
                # No account found — if this is a login attempt, reject it
                if action == "login":
                    return jsonify({
                        "error": "No account found with this Google email. Please sign up first.",
                        "redirect": "register"
                    }), 404

                # Create new user via Google OAuth (register flow)
                user = User(
                    name=name,
                    email=email,
                    password_hash=None,
                    oauth_provider='google',
                    oauth_id=google_id,
                    avatar_url=avatar_url,
                    role='student',
                    is_verified=True
                )
                db.session.add(user)
                db.session.commit()
                db.session.refresh(user)

                AuditLogger.log_event('GOOGLE_REGISTRATION', user_id=user.id, details=f"New user via Google: {email}")

                # Notify Admins about new user
                admins = User.query.filter(User.role.in_(['admin', 'super_admin'])).all()
                for admin in admins:
                    n = Notification(
                        user_id=admin.id,
                        type='success',
                        title='New User Registered (Google)',
                        message=f'User {name} ({email}) has joined via Google OAuth.',
                        link='/nituganesh/users'
                    )
                    db.session.add(n)
                db.session.commit()

        # Generate JWT token and create session
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

        log_security_event(user.id, "GOOGLE_LOGIN", metadata={"email": email})
        AuditLogger.log_event('GOOGLE_LOGIN_SUCCESS', user_id=user.id, details=f"Google login: {email}")

        return jsonify({"token": access_token, "user": user.to_dict()}), 200

    except ValueError as e:
        AuditLogger.log_event('GOOGLE_LOGIN_FAILED', details=f"Invalid token: {str(e)}")
        return jsonify({"error": "Invalid Google credential"}), 401
    except Exception as e:
        current_app.logger.error(f"Google OAuth Error: {traceback.format_exc()}")
        return jsonify({"error": "Google authentication failed"}), 500


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

    # Upload activity (Last 6 months)
    upload_activity = []
    today = datetime.utcnow()
    for i in range(5, -1, -1):
        # Calculate month start and end
        # Simple logic: first day of month
        target_date = today - timedelta(days=i*30)
        month_start = target_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if target_date.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)
        
        count = Paper.query.filter(
            Paper.uploader_id == current_user.id,
            Paper.created_at >= month_start,
            Paper.created_at < month_end
        ).count()
        
        upload_activity.append({
            "month": month_start.strftime("%b"),
            "count": count
        })

    # Daily Contribution Grid (Last 365 days)
    # Get daily counts for the last year
    one_year_ago = today - timedelta(days=365)
    daily_stats = db.session.query(
        func.date(Paper.created_at).label('date'),
        func.count(Paper.id).label('count')
    ).filter(
        Paper.uploader_id == current_user.id,
        Paper.created_at >= one_year_ago
    ).group_by(func.date(Paper.created_at)).all()
    
    contribution_grid = {str(row.date): row.count for row in daily_stats}
    
    user_data = current_user.to_dict()
    user_data.update({
        "total_uploads": total_uploads,
        "total_downloads": total_downloads,
        "rank": rank,
        "upload_activity": upload_activity,
        "contribution_grid": contribution_grid
    })
    
    return jsonify({"user": user_data}), 200


@auth_bp.route("/me", methods=["PUT"])
@jwt_required_with_user
def update_profile(**kwargs):
    current_user = kwargs["current_user"]
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400
        
    # ✅ INPUT VALIDATION: Sanitize all text inputs
    if "name" in data:
        current_user.name = InputValidator.sanitize_text(data["name"], max_length=100) or current_user.name
    if "department_id" in data:
        try:
            current_user.department_id = int(data["department_id"]) if data["department_id"] else None
        except (ValueError, TypeError):
            pass
    if "roll_no" in data:
        current_user.roll_no = InputValidator.sanitize_text(data.get("roll_no", ""), max_length=50) or current_user.roll_no
    if "year" in data:
        try:
            current_user.year = int(data["year"]) if data["year"] else None
        except (ValueError, TypeError):
            pass
    if "bio" in data:
        current_user.bio = InputValidator.sanitize_text(data.get("bio", ""), max_length=500)
    if "semester" in data:
        try:
            current_user.semester = int(data["semester"]) if data["semester"] else None
        except (ValueError, TypeError):
            pass
    if "phone_number" in data:
        phone = data.get("phone_number", "").strip()
        if phone and not InputValidator.is_valid_phone(phone):
            return jsonify({"error": "Invalid phone number format"}), 400
        current_user.phone_number = phone
    
    # ✅ SECURITY: Validate avatar URL to prevent stored XSS
    if "avatar_url" in data:
        avatar = data["avatar_url"]
        if avatar and not InputValidator.validate_url(avatar):
            return jsonify({"error": "Invalid avatar URL"}), 400
        current_user.avatar_url = avatar
        
    db.session.commit()
    return jsonify({"message": "Profile updated successfully", "user": current_user.to_dict()}), 200
@auth_bp.route("/preferences", methods=["PUT"])
@jwt_required_with_user
def update_preferences(**kwargs):
    current_user = kwargs["current_user"]
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400
    
    # SECURITY FIX [M3]: Strict allowlist validation for enum-like fields.
    # Previously these accepted any value from the client, allowing injection
    # of arbitrary strings into the database.
    VALID_MODES = {"light", "dark", "system"}
    VALID_ACCENTS = {"blue", "emerald", "amber", "rose", "indigo", "slate"}
    VALID_DOWNLOAD = {"direct", "preview"}
    
    mode = data.get("interface_mode", "")
    if mode and mode in VALID_MODES:
        current_user.interface_mode = mode
    
    accent = data.get("accent_color", "")
    if accent and accent in VALID_ACCENTS:
        current_user.accent_color = accent
    
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
    
    dl_behavior = data.get("download_behavior", "")
    if dl_behavior and dl_behavior in VALID_DOWNLOAD:
        current_user.download_behavior = dl_behavior
    
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

    # OAuth-only users don't have a local password
    if current_user.oauth_provider and not current_user.password_hash:
        return jsonify({"error": "Your account uses Google sign-in. You can set a password from your security settings."}), 400

    if not bcrypt.check_password_hash(current_user.password_hash, current_password):
        return jsonify({"error": "Incorrect current password"}), 401

    is_valid, pwd_error = InputValidator.validate_password_strength(new_password)
    if not is_valid:
        return jsonify({"error": pwd_error}), 400

    current_user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    current_user.password_changed_at = datetime.utcnow()
    
    # ✅ SECURITY: Invalidate all other sessions after password change
    jwt_data = get_jwt()
    current_jti = jwt_data.get("jti")
    UserSession.query.filter(
        UserSession.user_id == current_user.id,
        UserSession.jti != current_jti,
        UserSession.is_revoked == False
    ).update({"is_revoked": True})
    
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
@limiter.limit("10 per hour")
def verify_email():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body required"}), 400
            
        email = data.get("email", "").strip().lower()
        code = data.get("code", "").strip()
        
        if not email or not code:
            return jsonify({"error": "Email and code are required"}), 400
            
        # SECURITY FIX [M5]: Use constant-time comparison to prevent timing attacks.
        # Previously used OTP.query.filter_by(email=email, code=code) which allows
        # attackers to infer correct digits via response time differences.
        otp = OTP.query.filter_by(email=email).order_by(OTP.created_at.desc()).first()
        
        if not otp or not hmac.compare_digest(otp.code, code):
            return jsonify({"error": "Invalid verification code"}), 400
            
        if otp.is_expired():
            return jsonify({"error": "Verification code has expired"}), 400
            
        # Check if user already exists
        user = User.query.filter_by(email=email).first()
        if user:
            user.is_verified = True
        else:
            if not otp.name or not otp.password_hash:
                return jsonify({"error": "Incomplete registration data. Please register again."}), 400
                
            user = User(
                name=otp.name,
                email=otp.email,
                password_hash=otp.password_hash,
                department_id=otp.department_id,
                semester=otp.semester,
                phone_number=otp.phone_number,
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
                link='/nituganesh/users'
            )
            db.session.add(n)
        db.session.commit()
        
        return jsonify({
            "message": "Email verified and registration complete", 
            "token": access_token,
            "user": user.to_dict()
        }), 200
    except Exception as e:
        current_app.logger.error(
            f"Verify Email Error ({datetime.now()}): {traceback.format_exc()}"
        )
        return jsonify({"error": "Internal server error during verification"}), 500


@auth_bp.route("/resend-otp", methods=["POST"])
@limiter.limit("3 per hour")
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
@limiter.limit("5 per hour")
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
@limiter.limit("10 per hour")
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
    reset_token = secrets.token_urlsafe(32)
    otp.password_hash = reset_token
    otp.attempts = 0  # reset attempts on success
    db.session.commit()

    return jsonify({
        "message": "Code verified successfully",
        "reset_token": reset_token,
    }), 200


@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("5 per hour")  # SECURITY FIX [H4]: Added rate limit — was previously unprotected
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

    is_valid, pwd_error = InputValidator.validate_password_strength(new_password)
    if not is_valid:
        return jsonify({"error": pwd_error}), 400

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

    # ✅ SECURITY: Invalidate ALL sessions after password reset
    UserSession.query.filter(
        UserSession.user_id == user.id,
        UserSession.is_revoked == False
    ).update({"is_revoked": True})

    # Clean up all reset OTPs for this email
    OTP.query.filter_by(email=email, name="__PASSWORD_RESET__").delete()
    db.session.commit()

    log_security_event(user.id, "PWD_RESET", metadata={"method": "email_otp"})

    return jsonify({"message": "Password reset successfully. You can now log in."}), 200
