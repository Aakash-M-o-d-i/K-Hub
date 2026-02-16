-- PYQ Platform Database Schema
-- Run: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS pyq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pyq_db;

-- ============================================================
-- 1. Departments
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    code            VARCHAR(10)  NOT NULL UNIQUE,          -- CS, EE, ME …
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed departments
INSERT IGNORE INTO departments (name, code) VALUES
('Computer Science',        'CS'),
('Electrical Engineering',  'EE'),
('Mechanical Engineering',  'ME'),
('Civil Engineering',       'CE'),
('Business Administration', 'BA'),
('Humanities',              'HS'),
('Chemistry',               'CH'),
('Physics',                 'PH'),
('Mathematics',             'MA');

-- ============================================================
-- 2. Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('student','admin','super_admin') DEFAULT 'student',
    avatar_url      VARCHAR(500) DEFAULT NULL,
    department_id   INT DEFAULT NULL,
    total_points    INT DEFAULT 0,
    password_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_2fa_enabled  BOOLEAN DEFAULT FALSE,
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 3. Papers
-- ============================================================
CREATE TABLE IF NOT EXISTS papers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    subject_code    VARCHAR(20)  NOT NULL,
    year            VARCHAR(9)   NOT NULL,                  -- e.g. "2023-2024"
    semester        TINYINT      NOT NULL,                  -- 1-8
    file_url        VARCHAR(500) NOT NULL,
    file_type       VARCHAR(10)  DEFAULT 'pdf',
    file_size       INT          DEFAULT 0,                 -- bytes
    professor       VARCHAR(100) DEFAULT NULL,
    status          ENUM('pending','approved','rejected') DEFAULT 'pending',
    rating_avg      DECIMAL(2,1) DEFAULT 0.0,
    rating_count    INT          DEFAULT 0,
    download_count  INT          DEFAULT 0,
    uploader_id     INT          NOT NULL,
    department_id   INT          NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_id)   REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_status   (status),
    INDEX idx_dept     (department_id),
    INDEX idx_semester (semester),
    INDEX idx_year     (year)
) ENGINE=InnoDB;

-- ============================================================
-- 4. Downloads
-- ============================================================
CREATE TABLE IF NOT EXISTS downloads (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    paper_id        INT NOT NULL,
    downloaded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. Leaderboard Points
-- ============================================================
CREATE TABLE IF NOT EXISTS leaderboard_points (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    points          INT NOT NULL DEFAULT 0,
    action_type     ENUM('upload','approved','download_milestone','bonus') NOT NULL,
    reference_id    INT DEFAULT NULL,                       -- paper_id if applicable
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. Audit Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    admin_id        INT NOT NULL,
    action          VARCHAR(50)  NOT NULL,                  -- approve, reject, delete, etc.
    target_paper_id INT DEFAULT NULL,
    target_user_id  INT DEFAULT NULL,
    reason          TEXT DEFAULT NULL,
    metadata_json   JSON DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id)        REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (target_paper_id) REFERENCES papers(id) ON DELETE SET NULL,
    FOREIGN KEY (target_user_id)  REFERENCES users(id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 7. Bookmarks (optional — referenced in Stitch dashboard)
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    paper_id        INT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_bookmark (user_id, paper_id),
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 8. User Sessions (Active Sessions Tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    jti             VARCHAR(36) NOT NULL UNIQUE,
    browser         VARCHAR(100),
    os              VARCHAR(100),
    device_type     VARCHAR(100),
    ip_address      VARCHAR(45),
    location        VARCHAR(255),
    is_revoked      BOOLEAN DEFAULT FALSE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_jti (jti)
) ENGINE=InnoDB;

-- ============================================================
-- 9. Security Logs (Audit Trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS security_logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    event_type      VARCHAR(50) NOT NULL,
    ip_address      VARCHAR(45),
    metadata_json   JSON,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_history (user_id, created_at)
) ENGINE=InnoDB;

-- ============================================================
-- 10. Notifications
-- ============================================================
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

-- ============================================================
-- 11. System Settings
-- ============================================================
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

-- ============================================================
-- 12. OTPs (Email Verification)
-- ============================================================
CREATE TABLE IF NOT EXISTS otps (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(150) NOT NULL,
    code            VARCHAR(6) NOT NULL,
    name            VARCHAR(100),
    password_hash   VARCHAR(255),
    department_id   INT,
    expires_at      DATETIME NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_email (email)
) ENGINE=InnoDB;
