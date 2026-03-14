-- Migration: Add kontak_utama to shop_products and shop_merchants
-- Description: Ensures the primary contact method column exists for proper persistence.

-- 1. Add to shop_products
ALTER TABLE shop_products ADD COLUMN kontak_utama TEXT DEFAULT 'whatsapp';

-- 2. Add to shop_merchants
ALTER TABLE shop_merchants ADD COLUMN kontak_utama TEXT DEFAULT 'whatsapp';
