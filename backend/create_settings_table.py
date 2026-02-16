from app import create_app
from models import db
from models.leaderboard import SystemSetting

app = create_app()
with app.app_context():
    db.create_all()
    print("Database tables created/verified (including system_settings)")
