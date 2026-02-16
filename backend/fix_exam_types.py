import pymysql
import os
import re
from dotenv import load_dotenv

load_dotenv()

# MySQL Configuration
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1111")
DB_HOST = "127.0.0.1"
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "pyq_db")

def fix_exam_types():
    conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME, port=DB_PORT, cursorclass=pymysql.cursors.DictCursor)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, title FROM papers")
    papers = cursor.fetchall()
    
    updated = 0
    for paper in papers:
        title_lower = paper['title'].lower()
        new_exam_type = "End Semester"
        
        # Use regex for more robust matching
        if re.search(r"mid(term|[\s-]*term)?[\s-]*2\b|mid(term|[\s-]*term)?[\s-]*ii\b|mid[\s-]*2", title_lower):
            new_exam_type = "Mid 2"
        elif re.search(r"mid(term|[\s-]*term)?[\s-]*1\b|mid(term|[\s-]*term)?[\s-]*i\b|mid[\s-]*1", title_lower):
            new_exam_type = "Mid 1"
            
        cursor.execute("UPDATE papers SET exam_type = %s WHERE id = %s", (new_exam_type, paper['id']))
        updated += 1
        # print(f"Updated Paper {paper['id']}: {paper['title']} -> {new_exam_type}")

    conn.commit()
    conn.close()
    print(f"Update complete: {updated} papers processed.")

if __name__ == "__main__":
    fix_exam_types()
