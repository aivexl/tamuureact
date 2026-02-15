-- ============================================
-- MIGRATION: Add user_id to assets table
-- Purpose: Enable asset ownership tracking
-- ============================================

-- Add user_id column to assets table
-- ALTER TABLE assets ADD COLUMN user_id TEXT;

-- Create index for performance filtering by user
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
