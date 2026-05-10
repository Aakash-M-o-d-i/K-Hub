import os
import re
import subprocess
import pymysql
from dotenv import load_dotenv

from pdf2image import convert_from_path
import pytesseract

# Load environment variables
load_dotenv()

# Database connection
def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "1111"),
        database=os.getenv("DB_NAME", "pyq_db"),
        cursorclass=pymysql.cursors.DictCursor
    )

ROMAN_MAP = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8
}

def extract_text_from_pdf(filepath):
    text = ""
    try:
        # Try standard text extraction
        result = subprocess.run(['pdftotext', '-layout', filepath, '-'], capture_output=True, text=True)
        text = result.stdout
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    
    # If text is too short, try OCR
    if len(text.strip()) < 50:
        print(f"  Attempting OCR on {os.path.basename(filepath)}...")
        try:
            images = convert_from_path(filepath, first_page=1, last_page=1)
            if images:
                ocr_text = pytesseract.image_to_string(images[0])
                text = ocr_text
        except Exception as e:
            print(f"  OCR failed: {e}")
            
    return text

def parse_metadata(text, filename):
    metadata = {
        'title': None,
        'subject_code': None,
        'semester': None,
        'exam_type': None,
        'department_name': None
    }

    # Heuristics for text parsing
    if text:
        # Semester
        sem_match = re.search(r'Semester:\s*([IVX1-8]+)', text, re.IGNORECASE)
        if sem_match:
            metadata['semester'] = ROMAN_MAP.get(sem_match.group(1).upper())
        
        # Course Name / Title
        course_match = re.search(r'Name of the Course\s*:\s*(.*)', text, re.IGNORECASE)
        if course_match:
            metadata['title'] = course_match.group(1).strip()
            
        # Subject Code
        code_match = re.search(r'Course Code:\s*(\S+)', text, re.IGNORECASE)
        if code_match:
            metadata['subject_code'] = code_match.group(1).strip()
            
        # Exam Type
        if "End Examnination" in text or "End-Semester" in text:
            metadata['exam_type'] = "End Semester"
        elif "Mid-I" in text or "Mid-1" in text:
            metadata['exam_type'] = "Mid 1"
        elif "Mid-II" in text or "Mid-2" in text:
            metadata['exam_type'] = "Mid 2"
            
        # Department
        dept_match = re.search(r'Name of\' the Progranm:\s*.*?(?:Department of|opted)\s+(\w+)', text, re.IGNORECASE)
        if dept_match:
            metadata['department_name'] = dept_match.group(1).strip()

    # Fallback to filename parsing
    filename_parts = filename.split('_')
    if len(filename_parts) >= 3:
        # Extract the description part (after the second underscore)
        raw_desc = filename_parts[2].replace('.pdf', '').replace('.PDF', '')
        # Clean up common separators
        clean_title = raw_desc.replace('-', ' ').replace('_', ' ').strip()
        if not metadata['title']:
            metadata['title'] = clean_title

    if not metadata['semester']:
        sem_match = re.search(r'Semester-?([IVX1-8]+)', filename, re.IGNORECASE)
        if sem_match:
            metadata['semester'] = ROMAN_MAP.get(sem_match.group(1).upper())
            
    if not metadata['exam_type']:
        if "end" in filename.lower():
            metadata['exam_type'] = "End Semester"
        elif "mid-1" in filename.lower() or "mid1" in filename.lower() or "mid-i" in filename.lower():
            metadata['exam_type'] = "Mid 1"
        elif "mid-2" in filename.lower() or "mid2" in filename.lower() or "mid-ii" in filename.lower():
            metadata['exam_type'] = "Mid 2"
            
    if not metadata['department_name']:
        # Try to find a department name in the filename
        # Common departments: Botany, Chemistry, Geology, AI, BBA, etc.
        depts = ["Botany", "Chemistry", "Geology", "English", "CS", "Biotechnology", "Business", "Commerce", "Social", "Sociology", "Tourism", "Tribal"]
        for d in depts:
            if d.lower() in filename.lower():
                metadata['department_name'] = d
                break

    return metadata

def sync_all():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Get all approved papers
            cursor.execute("SELECT id, title, file_url, department_id FROM papers WHERE status = 'approved'")
            papers = cursor.fetchall()
            
            # Get department mapping
            cursor.execute("SELECT id, name, code FROM departments")
            departments = cursor.fetchall()
            dept_map = {}
            for d in departments:
                dept_map[d['name'].lower()] = d['id']
                dept_map[d['code'].lower()] = d['id']
                # Substring match for short names like "Botany"
                short_name = d['name'].replace("Department of", "").strip().lower()
                dept_map[short_name] = d['id']

            for paper in papers:
                filepath = os.path.join("/home/ethereal/Documents/KnowledgeHub/backend/uploads/approved", paper['file_url'])
                if not os.path.exists(filepath):
                    print(f"File not found: {filepath}")
                    continue
                
                print(f"Processing Paper ID {paper['id']}: {paper['file_url']}")
                text = extract_text_from_pdf(filepath)
                meta = parse_metadata(text, paper['file_url'])
                
                # Prepare updates
                updates = []
                params = []
                
                if meta['title']:
                    updates.append("title = %s")
                    params.append(meta['title'])
                
                if meta['subject_code']:
                    updates.append("subject_code = %s")
                    params.append(meta['subject_code'])
                    
                if meta['semester']:
                    updates.append("semester = %s")
                    params.append(meta['semester'])
                    
                if meta['exam_type']:
                    updates.append("exam_type = %s")
                    params.append(meta['exam_type'])
                    
                if meta['department_name']:
                    dept_id = dept_map.get(meta['department_name'].lower())
                    if dept_id:
                        updates.append("department_id = %s")
                        params.append(dept_id)
                
                if updates:
                    sql = f"UPDATE papers SET {', '.join(updates)} WHERE id = %s"
                    params.append(paper['id'])
                    cursor.execute(sql, tuple(params))
                    print(f"  Updated metadata: {meta}")
                else:
                    print("  No metadata extracted.")
            
            conn.commit()
            print("Synchronization complete.")
            
    finally:
        conn.close()

if __name__ == "__main__":
    sync_all()
