-- Add is_verified col to users
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Create otps table
CREATE TABLE IF NOT EXISTS otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX (email)
);
