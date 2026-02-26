-- Migration: 0038_admin_custom_products.sql
-- Description: Supports products posted by admin with custom store names.

ALTER TABLE shop_products ADD COLUMN is_admin_listing INTEGER DEFAULT 0;
ALTER TABLE shop_products ADD COLUMN custom_store_name TEXT;
