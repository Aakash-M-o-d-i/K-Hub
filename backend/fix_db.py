import sqlite3
import os

db_path = "database.db"

if not os.path.exists(db_path):
    print(f"Creating {db_path}...")
    # You might want to run schema.sql here if it's missing entirely
    
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if otps table exists, if not create it
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='otps';")
if not cursor.fetchone():
    print("Creating otps table...")
    cursor.execute("""
    CREATE TABLE otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(150) NOT NULL,
        code VARCHAR(6) NOT NULL,
        name VARCHAR(100),
        password_hash VARCHAR(255),
        department_id INTEGER,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
else:
    print("otps table exists. Adding columns if missing...")
    columns = [c[1] for c in cursor.execute("PRAGMA table_info(otps);").fetchall()]
    
    if "name" not in columns:
        cursor.execute("ALTER TABLE otps ADD COLUMN name VARCHAR(100);")
    if "password_hash" not in columns:
        cursor.execute("ALTER TABLE otps ADD COLUMN password_hash VARCHAR(255);")
    if "department_id" not in columns:
        cursor.execute("ALTER TABLE otps ADD COLUMN department_id INTEGER;")

conn.commit()
conn.close()
print("Database verified/updated.")
