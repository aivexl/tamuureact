-- Migration: 0064_add_alt_text_to_assets.sql
-- Description: Add alt_text column to carousel and ads tables for SEO optimization.
-- Author: Tamuu CTO

-- 1. Add alt_text to shop_carousel
ALTER TABLE shop_carousel ADD COLUMN alt_text TEXT;

-- 2. Add alt_text to invitations_carousel
ALTER TABLE invitations_carousel ADD COLUMN alt_text TEXT;

-- 3. Add alt_text to shop_ads
ALTER TABLE shop_ads ADD COLUMN alt_text TEXT;
