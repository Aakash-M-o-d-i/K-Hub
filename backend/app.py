import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.auth import auth_bp, bcrypt
from routes.papers import papers_bp
from routes.admin import admin_bp
from routes.leaderboard import leaderboard_bp
from routes.notifications import notifications_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Ensure upload directories exist
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "pending"), exist_ok=True)
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "approved"), exist_ok=True)

    # Init extensions
    db.init_app(app)
    bcrypt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(papers_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(leaderboard_bp)
    app.register_blueprint(notifications_bp)

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "PYQ API is running"}, 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
