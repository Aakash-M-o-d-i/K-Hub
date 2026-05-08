-- Migration: Add is_banned column to users table
-- Date: 2026-05-08

ALTER TABLE `users`
    ADD COLUMN `is_banned` BOOLEAN DEFAULT FALSE COMMENT 'Whether the user account is banned/suspended';
