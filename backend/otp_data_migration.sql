-- Migration to support verify-before-register flow
-- Adds pending registration data to the otps table

ALTER TABLE otps ADD COLUMN name VARCHAR(100);
ALTER TABLE otps ADD COLUMN password_hash VARCHAR(255);
ALTER TABLE otps ADD COLUMN department_id INTEGER;
