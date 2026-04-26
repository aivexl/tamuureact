-- Add position column to shop_category for manual ordering
ALTER TABLE shop_category ADD COLUMN position INTEGER DEFAULT 0;
