-- Add exam_type column to papers table
ALTER TABLE papers ADD COLUMN exam_type VARCHAR(50) DEFAULT 'End Semester' AFTER semester;
