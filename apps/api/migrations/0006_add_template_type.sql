-- ============================================
-- MIGRATION: Add type column to templates table
-- Description: Support for 'invitation' and 'display' template types
-- Run this on your D1 database via Wrangler CLI
-- ============================================

-- Add the type column with default 'invitation'
-- ALTER TABLE templates ADD COLUMN type TEXT DEFAULT 'invitation';
-- CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);
-- UPDATE templates SET type = 'invitation' WHERE type IS NULL;
