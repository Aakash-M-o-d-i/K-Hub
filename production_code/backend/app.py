import os
from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.auth import auth_bp, bcrypt
from routes.papers import papers_bp
from routes.admin import admin_bp
from routes.leaderboard import leaderboard_bp
from routes.notifications import notifications_bp
from utils.security import (
    limiter, add_security_headers, get_safe_cors_origins,
    SessionSecurity, AuditLogger
)


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Ensure upload directories exist
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "pending"), exist_ok=True)
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "approved"), exist_ok=True)

    # Init extensions
    db.init_app(app)
    bcrypt.init_app(app)
    
    # Configure CORS with safe origins only
    cors_origins = get_safe_cors_origins()
    CORS(app, resources={
        r"/api/*": {
            "origins": cors_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })
    
    JWTManager(app)
    limiter.init_app(app)
    
    # Configure session security
    SessionSecurity.validate_session_cookie_settings(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(papers_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(leaderboard_bp)
    app.register_blueprint(notifications_bp)

    # ✅ Add security headers to all responses
    @app.after_request
    def apply_security_headers(response):
        return add_security_headers(response)
    
    # ✅ Log all requests
    @app.before_request
    def log_request():
        AuditLogger.log_event(
            'HTTP_REQUEST',
            details=f"{request.method} {request.path}",
            severity='DEBUG'
        )

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "PYQ API is running"}, 200

    # Anti-enumeration: generic 404 for all unknown routes
    # Prevents Gobuster/DirBuster from distinguishing valid vs invalid paths
    @app.errorhandler(404)
    def not_found(e):
        import time
        import random
        time.sleep(random.uniform(0.1, 0.3))
        return {"error": "Not found"}, 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return {"error": "Not found"}, 404

    # Strip server identity headers to reduce fingerprinting surface
    @app.after_request
    def strip_server_headers(response):
        response.headers.pop("Server", None)
        response.headers.pop("X-Powered-By", None)
        return response

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=(os.getenv('FLASK_ENV') != 'production'), port=5000)
