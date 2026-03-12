-- Migration: 0052_merchant_ads_enhancement.sql
-- Description: Enhances shop_ads to support merchant-owned ads and basic telemetry.

ALTER TABLE shop_ads ADD COLUMN merchant_id TEXT;
ALTER TABLE shop_ads ADD COLUMN total_impressions INTEGER DEFAULT 0;
ALTER TABLE shop_ads ADD COLUMN total_clicks INTEGER DEFAULT 0;
ALTER TABLE shop_ads ADD COLUMN budget_remaining INTEGER DEFAULT 0;
ALTER TABLE shop_ads ADD COLUMN is_approved INTEGER DEFAULT 1; -- Default to 1 for manual ads for now
