import os
import shutil
import pymysql
from dotenv import load_dotenv
import re

load_dotenv()

# MySQL Configuration
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1111")
DB_HOST = "127.0.0.1"
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "pyq_db")

PAPERS_DIR = "/home/ethereal/Documents/Production_Pyqs-V3/V3_PYQS/questions_papers"
UPLOAD_DIR = "/home/ethereal/Documents/Production_Pyqs-V3/V3_PYQS/backend/uploads/approved"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Admin user ID for global uploads
ADMIN_USER_ID = 1 # Assuming first user is admin

# Department Mapping (Folder Name -> DB Name/Code)
DEPT_MAP = {
    "AI": "Department of Computer Science",
    "Botany": "Department of Botany",
    "Chem": "Department of Chemistry",
    "Geo": "Department of Geology",
    "Common": "Department of English",
    "Desktop Publishing": "Department of Journalism (Journalism and Mass Communication)",
    "Leadership": "Department of English",
    "Mineral": "Department of Geology",
    "Renewable": "Department of Business Management",
    "Tribal": "Department of Tribal Studies",
    "TS-": "Department of Tribal Studies",
    "Biotech": "Department of Biotechnology",
    "Comm": "Department of Commerce",
    "Soc": "Department of Sociology",
    "SocialWork": "Department of Social Work",
    "Tourism": "Department of Tourism and Hospitality Management",
    "BBA": "Department of Business Management"
}

def get_dept_id(cursor, folder_name):
    for key, val in DEPT_MAP.items():
        if key in folder_name:
            cursor.execute("SELECT id FROM departments WHERE name = %s", (val,))
            res = cursor.fetchone()
            if res: return res['id']
    return 51 # Default to Department of English if unknown

def parse_metadata(folder_name, filename):
    # Extract Semester from folder or filename
    sem = 1
    sem_match = re.search(r"Semester-([IVX1-8]+)", folder_name + filename, re.I)
    if sem_match:
        val = sem_match.group(1).upper()
        mapping = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "1": 1, "2": 2, "3": 3, "4": 4}
        sem = mapping.get(val, 1)

    # Extract Exam Type
    exam_type = "End Semester"
    filename_lower = filename.lower()
    if any(k in filename_lower for k in ["mid 1", "mid-1", "mid term 1", "mid-term 1", "mid term i", "mid-term i"]):
        exam_type = "Mid 1"
    elif any(k in filename_lower for k in ["mid 2", "mid-2", "mid term 2", "mid-term 2", "mid term ii", "mid-term ii"]):
        exam_type = "Mid 2"

    # Year
    year = "2023-2024" # Default for batch import

    # Subject Code and Title
    # Clean up filename for title
    title = filename.replace(".pdf", "").replace("_", " ").strip()
    subject_code = "GEN-" + str(sem) + "01" # Default code
    
    # Try to extract code if it looks like XXX-000
    code_match = re.search(r"([A-Z]{2,}-\d{3})", filename)
    if code_match:
        subject_code = code_match.group(1)

    return sem, exam_type, year, title, subject_code

def ingest():
    conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME, port=DB_PORT, cursorclass=pymysql.cursors.DictCursor)
    cursor = conn.cursor()
    
    total = 0
    success = 0

    for root, dirs, files in os.walk(PAPERS_DIR):
        folder_name = os.path.basename(root)
        if not files: continue

        dept_id = get_dept_id(cursor, folder_name)
        
        for file in files:
            if not file.endswith(".pdf"): continue
            
            total += 1
            sem, exam_type, year, title, subject_code = parse_metadata(folder_name, file)
            
            # File processing
            timestamp = 1708000000 + total # Dummy unique timestamp
            safe_name = f"{ADMIN_USER_ID}_{timestamp}_{file}"
            src_path = os.path.join(root, file)
            dst_path = os.path.join(UPLOAD_DIR, safe_name)
            
            try:
                shutil.copy2(src_path, dst_path)
                
                # DB Insert
                sql = """
                INSERT INTO papers (uploader_id, title, subject_code, year, semester, exam_type, file_url, file_type, file_size, department_id, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """
                cursor.execute(sql, (
                    ADMIN_USER_ID, title, subject_code, year, sem, exam_type, safe_name, "pdf", os.path.getsize(src_path), dept_id, "approved"
                ))
                success += 1
                print(f"Ingested: {title} ({exam_type}) -> Dept {dept_id}")
            except Exception as e:
                print(f"Failed to ingest {file}: {e}")

    conn.commit()
    conn.close()
    print(f"\nIngestion Complete: {success}/{total} papers imported.")

if __name__ == "__main__":
    ingest()
