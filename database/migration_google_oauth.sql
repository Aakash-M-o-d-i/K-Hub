-- Migration: Add Google OAuth support to users table
-- Run this against your pyq_db database

-- Add OAuth columns
ALTER TABLE `users`
    ADD COLUMN `oauth_provider` VARCHAR(20) DEFAULT NULL COMMENT 'OAuth provider: google, github, etc.',
    ADD COLUMN `oauth_id` VARCHAR(255) DEFAULT NULL COMMENT 'Unique ID from the OAuth provider';

-- Make password_hash nullable (OAuth users won't have a local password)
ALTER TABLE `users`
    MODIFY COLUMN `password_hash` VARCHAR(255) DEFAULT NULL;

-- Add unique index on oauth provider + id combo to prevent duplicate OAuth accounts
ALTER TABLE `users`
    ADD UNIQUE INDEX `idx_oauth_provider_id` (`oauth_provider`, `oauth_id`);
