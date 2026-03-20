-- Migration: 0062_ad_bidding_system.sql
-- Description: Enhances shop_ads to support a bidding system, multiple placements, and targeted promotions.

ALTER TABLE shop_ads ADD COLUMN target_type TEXT DEFAULT 'STORE'; -- 'PRODUCT' or 'STORE'
ALTER TABLE shop_ads ADD COLUMN target_id TEXT; -- ID of product or vendor
ALTER TABLE shop_ads ADD COLUMN bid_amount INTEGER DEFAULT 0; -- Bid value per click (IDR)
ALTER TABLE shop_ads ADD COLUMN daily_budget INTEGER DEFAULT 0; -- Max spend per day
ALTER TABLE shop_ads ADD COLUMN start_date DATETIME;
ALTER TABLE shop_ads ADD COLUMN end_date DATETIME;
ALTER TABLE shop_ads ADD COLUMN rejection_reason TEXT;
ALTER TABLE shop_ads ADD COLUMN metadata TEXT; -- JSON for demographics tracking (city, devices, etc.)
ALTER TABLE shop_ads ADD COLUMN status TEXT DEFAULT 'ACTIVE'; -- 'ACTIVE', 'PAUSED', 'COMPLETED'

-- Update existing defaults
UPDATE shop_ads SET target_type = 'STORE', target_id = vendor_id WHERE vendor_id IS NOT NULL;
