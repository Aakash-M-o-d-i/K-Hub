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
    SECRET_KEY = os.getenv("SECRET_KEY", "pyq-super-secret-key-change-in-prod")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-prod")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

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

    # File uploads
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    MAX_CONTENT_LENGTH = 128 * 1024 * 1024  # 128 MB (Hard Node Limit)
    ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png", "docx", "zip", "txt"}

    # Brevo
    BREVO_API_KEY = os.getenv("BREVO_API_KEY")
    BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "noreply@knowledgehub.com")
    BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Knowledge Hub")
