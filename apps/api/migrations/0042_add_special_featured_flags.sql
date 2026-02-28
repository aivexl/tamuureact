-- Migration: 0042_add_special_featured_flags.sql
-- Description: Add flags for Special and Featured products in the shop

ALTER TABLE shop_products ADD COLUMN is_special INTEGER DEFAULT 0;
ALTER TABLE shop_products ADD COLUMN is_featured INTEGER DEFAULT 0;
