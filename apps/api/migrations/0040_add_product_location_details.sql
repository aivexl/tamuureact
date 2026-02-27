-- Migration: 0040_add_product_location_details.sql
-- Description: Adds alamat_lengkap and google_maps_url to shop_products.

-- Using TRY/CATCH style for D1 migrations if possible, but the robust script handles errors.
ALTER TABLE shop_products ADD COLUMN alamat_lengkap TEXT;
ALTER TABLE shop_products ADD COLUMN google_maps_url TEXT;
