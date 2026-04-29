-- Migration: Add missing columns to carousel tables
-- Description: Adds alt_text and updated_at to ensure full functionality.

-- 1. shop_carousel
ALTER TABLE shop_carousel ADD COLUMN alt_text TEXT;
ALTER TABLE shop_carousel ADD COLUMN updated_at DATETIME;

-- 2. invitations_carousel
ALTER TABLE invitations_carousel ADD COLUMN alt_text TEXT;
