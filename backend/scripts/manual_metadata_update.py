import os
import pymysql
from dotenv import load_dotenv

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

# Manual mapping provided by the user
MANUAL_MAPPING = [
    ("1_1708000040_TTM Semester-II Mid-1_1-4 Common.pdf", "Tourism Concepts, Systems and Functions", 2, "Mid 2"),
    ("1_1708000041_semester -II Mid-2.pdf", "Tourism Concepts, Systems and Functions", 2, "Mid 1"),
    ("1_1708000042_End-semester-II.pdf", "Software, Hardware and Networking", 2, "End Semester"),
    ("1_1708000043_semester -II Mid-1-Batch-24.pdf", "Basics of Computer Science and MS-Office Suite", 1, "Mid 1"),
    ("1_1708000044_semester -II Mid-2.pdf", "Software, Hardware and Networking", 2, "Mid 2"),
    ("1_1708000045_End-semester-II.pdf", "Hindi", 2, "End Semester"),
    ("1_1708000046_Hindi-mid2-semester-IV.pdf", "Hindi", 4, "Mid 2"),
    ("1_1708000047_semester -II Mid-2.pdf", "Hindi", 2, "Mid 2"),
    ("1_1708000048_Mid-1 Semester-II.pdf", "Hindi", 1, "Mid 1"),
    ("1_1708000049_Hindi-mid1-semester-IV.pdf", "Hindi", 4, "Mid 1"),
    ("1_1708000050_End-semester-II.pdf", "Environmental Science", 2, "End Semester"),
    ("1_1708000051_Semester-II Mid-1.pdf", "Environmental Science", 2, "Mid 1"),
    ("1_1708000052_semester -II Mid-2.pdf", "Environmental Science", 2, "Mid 2"),
    ("1_1708000053_Desktop-Publishing-mid1-semester-iii.pdf", "Desktop Publishing (DTP)", 3, "Mid 1"),
    ("1_1708000054_Desktop-Publishing-mid2-semester-iii.pdf", "DTP (Multi Disciplinary)", 3, "Mid 2"),
    ("1_1708000055_End-semester-II.pdf", "Programming for Problem Solving using \"C\"", 2, "End Semester"),
    ("1_1708000056_AI Semester-II Mid-2.pdf", "Programming for Problem Solving using \"C\"", 2, "Mid 2"),
    ("1_1708000057_AI Semester-II Mid-1.pdf", "Programming for Problem Solving using \"C\"", 2, "Mid 1"),
    ("1_1708000058_AI semester-I, Mid-term-II.pdf", "Basics of Computer Science & MS-Office Suite", 1, "Mid 2"),
    ("1_1708000059_Semester-I, Mid-term-1, AImajor.pdf", "Basics of Computer Science and MS-Office Suite", 1, "Mid 1"),
    ("1_1708000060_AI End-semester_1.pdf", "Basics of Computer Science and MS-Office Suite", 1, "End Semester"),
    ("1_1708000061_Renewable Energy-mid1-semester-iii.pdf", "Introduction to Renewable Energy", 4, "Mid 1"),
    ("1_1708000062_Renewable Energy-mid2-semester-iii.pdf", "Good Laboratory Practices (GLP)", 4, "Mid 1"),
    ("1_1708000063_End-semester_1.pdf", "Indian Constitution and Heritage", 1, "End Semester"),
    ("1_1708000064_Semester-I Mid-I-Batch-24.pdf", "Indian Heritage and Constitution", 1, "Mid 1"),
    ("1_1708000065_Semester-I Mid-I.pdf", "Indian Constitution and Heritage", 1, "Mid 1"),
    ("1_1708000066_Semester-I Mid-II.pdf", "Indian Constitution and Heritage", 1, "Mid 2"),
    ("1_1708000067_Semester-I, Mid-term-I.pdf", "Verbal Ability and Quantitative Aptitude", 1, "Mid 1"),
    ("1_1708000068_End-semester_1.pdf", "Verbal Ability and Quantitative Aptitude", 1, "End Semester"),
    ("1_1708000069_semester-I, Mid-term-II.pdf", "Verbal Ability and Quantitative Aptitude", 2, "Mid 2"),
    ("1_1708000070_Semester-I, Mid-term-I-Batch-24.pdf", "Verbal Ability and Quantitative Aptitude", 1, "Mid 1"),
    ("1_1708000071_Semester-I, Mid-term-I.pdf", "English for Communication - I", 1, "Mid 1"),
    ("1_1708000072_End-semester_.pdf", "English for Communication - I", 1, "End Semester"),
    ("1_1708000073_English-end-semester-iii.pdf", "English for Communication - II", 3, "End Semester"),
    ("1_1708000074_semester-I, Mid-term-II.pdf", "English for Communication - I", 1, "Mid 2"),
    ("1_1708000075_English-mid2-semester-iii.pdf", "English for Communication - II", 3, "Mid 2"),
    ("1_1708000076_Semester-I, Mid-term-I-Batch-24.pdf", "English for Communication - I", 1, "Mid 1"),
    ("1_1708000077_Semester-I, Mid-term-I.pdf", "Personality Development", 1, "Mid 1"),
    ("1_1708000078_End-semester_1.pdf", "Personality Development", 1, "End Semester"),
    ("1_1708000079_semester-I, Mid-term-II.pdf", "Personality Development", 1, "Mid 2"),
    ("1_1708000080_Semester-I, Mid-term-I-Batch-24.pdf", "Personality Development", 1, "Mid 1"),
    ("1_1708000081_Semester-I, Mid-term-I.pdf", "Global Tourism Geography", 1, "Mid 1"),
    ("1_1708000082_End-semester_1.pdf", "Global Tourism Geography", 1, "End Semester"),
    ("1_1708000083_semester-I, Mid-term-II.pdf", "Global Tourism Geography", 1, "Mid 2"),
    ("1_1708000084_Semester-I, Mid-term-I.pdf", "Management Concepts and Organizational Behaviour", 1, "Mid 1"),
    ("1_1708000085_semester-I, Mid-term-II.pdf", "MCOB (Management Concepts and Organizational Behaviour)", 1, "Mid 2"),
    ("4_640671_AI_semester-I_Mid-term-II.pdf", "Basics of Computer Science & MS-Office Suite", 1, "Mid 2"),
    ("4_68112_Semester-I_Mid-term-1_AImajor.pdf", "Basics of Computer Science and MS-Office Suite", 1, "Mid 1"),
    # New batch
    ("1_1708000001_Mineral Resources-end-semester-iii.pdf", "Mineral Resources of India", 3, "End Semester"),
    ("1_1708000002_Mineral Resources-mid2-semester-iii.pdf", "Mineral Resources of India", 3, "Mid 2"),
    ("1_1708000003_Geology Mid-I Semester-I.pdf", "Physical Geology and Geodynamics", 1, "Mid 1"),
    ("1_1708000004_Geology Semester-I.pdf", "Physical Geology and Geodynamics", 1, "End Semester"),
    ("1_1708000005_Geology Mid-II Semester-I.pdf", "Physical Geology and Geodynamics", 1, "Mid 2"),
    ("1_1708000006_BBA-mid1-semester-IV.pdf", "Event Management", 4, "Mid 1"),
    ("1_1708000007_BBA-mid2-semester-IV.pdf", "Event Management", 4, "Mid 2"),
    ("1_1708000008_Geology Mid-II Semester-II.pdf", "Crystallography and Mineralogy", 2, "Mid 1"),
    ("1_1708000009_Geology End-Semester-II.pdf", "Crystallography and Mineralogy", 2, "End Semester"),
    ("1_1708000010_Botany End-Semester.pdf", "Biodiversity", 1, "End Semester"),
    ("1_1708000011_Botany, Semester-I Mid -1.pdf", "Biodiversity", 1, "Mid 1"),
    ("1_1708000012_Botany, Semester-I Mid -2.pdf", "Biodiversity", 1, "Mid 1"),
    ("1_1708000013_Chemistry Mid-1 semester-1.pdf", "Inorganic Chemistry-1", 1, "Mid 1"),
    ("1_1708000014_Chemistry Mid-2 semester-1.pdf", "Inorganic Chemistry-1", 1, "Mid 1"),
    ("1_1708000015_Chemistry Mid-1 semester-1-Batch-24.pdf", "Inorganic Chemistry-1", 1, "Mid 1"),
    ("1_1708000016_Chemistry End-semester-1.pdf", "Inorganic Chemistry-I", 1, "End Semester"),
    ("1_1708000017_Leadership-Management-Skills-end-semester-iii.pdf", "Leadership and Management Skills", 3, "End Semester"),
    ("1_1708000018_Botany End-Semester.pdf", "Plant Morphology and Anatomy", 2, "End Semester"),
    ("1_1708000019_Botany, Semester-II Mid -2.pdf", "Plant Morphology and Anatomy", 2, "Mid 2"),
    ("1_1708000020_Database-Management-Systems-end-semester-iii.pdf", "Database Management Systems", 3, "End Semester"),
    ("1_1708000021_Database-Management-Systems-mid2-semester-iii.pdf", "Database Management Systems", 3, "Mid 2"),
    ("1_1708000022_C++-mid2-semester-iii.pdf", "Object Oriented Programming using C++", 3, "Mid 2"),
    ("1_1708000023_C++-end-semester-iii.pdf", "Object Programming using C++", 3, "End Semester"),
    ("1_1708000024_chemistry Mid-1 semester-2.pdf", "Organic Chemistry-1", 2, "Mid 1"),
    ("1_1708000025_chemistry Semester-2.pdf", "Organic Chemistry-I", 2, "End Semester"),
    ("1_1708000026_Physical Chemistry-mid1-semester-iii.pdf", "Physical Chemistry-I", 3, "Mid 1"),
    ("1_1708000027_Market-Management-mid1-semester-iii.pdf", "Marketing Management", 3, "Mid 1"),
    ("1_1708000028_End-semester-II.pdf", "Basics of Accounting", 2, "End Semester"),
    ("1_1708000029_Market-Management-mid2-semester-iii.pdf", "Marketing Management", 3, "Mid 2"),
    ("1_1708000030_AI-Minor-Semester-II Mid-1.pdf", "Basics of Accounting", 2, "Mid 1"),
    ("1_1708000031_semester -II Mid-2.pdf", "Basics of Accounting", 2, "Mid 2"),
    ("1_1708000032_Market-Management-end-semester-iii.pdf", "Marketing Management", 3, "End Semester"),
    ("1_1708000033_AI-GLP-mid2-semester-IV.pdf", "Good Laboratory Practices", 4, "Mid 2"),
    ("1_1708000034_Python-mid2-semester-IV.pdf", "Python Programming", 4, "Mid 2"),
    ("1_1708000035_AI-mid2-semester-IV.pdf", "Introduction to Artificial Intelligence", 4, "Mid 2"),
    ("1_1708000036_End-semester-II.pdf", "Emotional Intelligence", 2, "End Semester"),
    ("1_1708000037_EI Semester-II Mid-1 Common.pdf", "Emotional Intelligence", 2, "Mid 1"),
    ("1_1708000038_semester -II Mid-2-7.pdf", "Emotional Intelligence", 2, "Mid 2"),
    ("1_1708000039_End-semester-II.pdf", "Tourism Concepts, Systems, and Functions", 2, "End Semester"),
]

def apply_manual_updates():
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            for file_name, subject, sem, exam_type in MANUAL_MAPPING:
                print(f"Updating: {file_name} -> {subject}")
                sql = """
                    UPDATE papers 
                    SET title = %s, semester = %s, exam_type = %s 
                    WHERE file_url = %s
                """
                cursor.execute(sql, (subject, sem, exam_type, file_name))
            
            conn.commit()
            print("\nManual metadata update successful.")
    finally:
        conn.close()

if __name__ == "__main__":
    apply_manual_updates()
