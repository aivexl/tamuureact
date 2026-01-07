-- ============================================
-- MIGRATION: Add type column to templates table
-- Description: Support for 'invitation' and 'display' template types
-- Run this on your D1 database via Wrangler CLI
-- ============================================

-- Add the type column with default 'invitation'
ALTER TABLE templates ADD COLUMN type TEXT DEFAULT 'invitation';

-- Create index for filtering by type
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);

-- Update existing templates to have the correct default type
-- (All existing templates are invitation type by default)
UPDATE templates SET type = 'invitation' WHERE type IS NULL;
