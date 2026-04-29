-- Migration: Add tiers column to shop_promo_popups
ALTER TABLE shop_promo_popups ADD COLUMN tiers TEXT DEFAULT 'all';
