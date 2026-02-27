-- Migration: 0041_add_shop_ads_table.sql
-- Description: Creates a table for managing shop-wide banners and advertisements.

CREATE TABLE IF NOT EXISTS shop_ads (
    id TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    link_url TEXT,
    title TEXT,
    position TEXT DEFAULT 'PRODUCT_DETAIL_SIDEBAR', -- e.g., 'PRODUCT_DETAIL_SIDEBAR', 'SHOP_FOOTER'
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed with a default banner
INSERT OR IGNORE INTO shop_ads (id, image_url, link_url, title, position, is_active)
VALUES (
    'ad-default-1', 
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80', 
    '/shop', 
    'Default Sponsor', 
    'PRODUCT_DETAIL_SIDEBAR', 
    1
);
