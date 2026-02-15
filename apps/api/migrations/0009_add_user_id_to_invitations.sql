-- ============================================
-- MIGRATION: Add user_id to invitations table
-- Purpose: Enable data isolation per user
-- ============================================

-- Add user_id column to invitations table
-- ALTER TABLE invitations ADD COLUMN user_id TEXT;

-- Create index for performance filtering by user
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
