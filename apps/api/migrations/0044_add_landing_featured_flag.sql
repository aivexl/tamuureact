-- Migration: 0044_add_landing_featured_flag.sql
-- Description: Add a flag for products to be featured specifically on the landing page

ALTER TABLE shop_products ADD COLUMN is_landing_featured INTEGER DEFAULT 0;
