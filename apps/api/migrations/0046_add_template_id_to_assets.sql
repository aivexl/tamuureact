-- Migration: Add template_id to assets
-- Purpose: Support assets associated with templates and fix FK constraints

ALTER TABLE assets ADD COLUMN template_id TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_assets_template ON assets(template_id);

-- Note: SQLite doesn't support adding FOREIGN KEY constraints via ALTER TABLE.
-- However, we can still use the column. 
-- In a future baseline sync, we will include the FK in the CREATE TABLE statement.
