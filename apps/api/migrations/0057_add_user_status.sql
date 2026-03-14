-- Migration: 0057_add_user_status.sql
-- Description: Add status column to users table for administrative governance
-- Status: active (default), suspended, banned

ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
