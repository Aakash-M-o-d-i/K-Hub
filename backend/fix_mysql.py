import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

# MySQL Configuration from .env
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "pyq_db")

try:
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT
    )
    cursor = conn.cursor()

    print(f"Connected to MySQL database: {DB_NAME}")

    # Check for missing columns in otps table
    cursor.execute("DESCRIBE otps")
    existing_columns = [row[0] for row in cursor.fetchall()]
    
    missing_columns = {
        "name": "VARCHAR(100)",
        "password_hash": "VARCHAR(255)",
        "department_id": "INT"
    }

    for col, data_type in missing_columns.items():
        if col not in existing_columns:
            print(f"Adding column '{col}' to 'otps' table...")
            cursor.execute(f"ALTER TABLE otps ADD COLUMN {col} {data_type}")
        else:
            print(f"Column '{col}' already exists.")

    conn.commit()
    conn.close()
    print("MySQL schema update complete.")

except Exception as e:
    print(f"Error updating MySQL schema: {e}")
