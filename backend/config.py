import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))

# Load environment variables based on FLASK_ENV
env_mode = os.getenv("FLASK_ENV", "development")
if env_mode == "production":
    env_file = ".env.production"
else:
    env_file = ".env"

load_dotenv(os.path.join(basedir, env_file))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    
    if not SECRET_KEY or not JWT_SECRET_KEY:
        raise ValueError(
            "CRITICAL: SECRET_KEY and JWT_SECRET_KEY must be set in environment. "
            "Copy .env.example to .env and fill in secure values."
        )
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    ENV = os.getenv("FLASK_ENV", "development")

    # MySQL
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "pyq_db")
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ✅ SECURITY: File upload restrictions
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    MAX_CONTENT_LENGTH = 128 * 1024 * 1024  # 128 MB (Hard Node Limit)
    ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png", "docx", "zip", "txt"}
    
    # ✅ SECURITY: Session configuration
    SESSION_COOKIE_SECURE = env_mode == "production"  # Only require HTTPS in production
    SESSION_COOKIE_HTTPONLY = True  # No JavaScript access
    SESSION_COOKIE_SAMESITE = 'Lax'  # CSRF protection
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    SESSION_REFRESH_EACH_REQUEST = True
    
    # ✅ SECURITY: JWT Configuration
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # ✅ SECURITY: CORS Configuration
    CORS_ALLOWED_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:3000,http://localhost:5173'
    ).split(',')

    # Brevo
    BREVO_API_KEY = os.getenv("BREVO_API_KEY")
    BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "noreply@knowledgehub.com")
    BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Knowledge Hub")

    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
