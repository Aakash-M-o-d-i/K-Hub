-- Migration to add missing tables
USE pyq_db;

-- 10. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,                           -- recipient
    type            VARCHAR(50) NOT NULL,                  -- info, success, warning, danger
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    link            VARCHAR(255) DEFAULT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_notif (user_id, is_read)
) ENGINE=InnoDB;

-- 11. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    `key`           VARCHAR(50) PRIMARY KEY,
    `value`         JSON NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed default settings
INSERT IGNORE INTO system_settings (`key`, `value`) VALUES
('auto_approval', 'false'),
('max_file_size', '128'),
('allowed_extensions', '["pdf", "jpg", "jpeg", "png", "docx", "zip", "txt", "*"]'),
('mod_assignment', '"round-robin"'),
('spam_sensitivity', '"High"');
