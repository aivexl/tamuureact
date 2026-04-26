-- Migration: 0066_promo_popups.sql
-- Description: Create table for Promo Popup Banners

CREATE TABLE IF NOT EXISTS shop_promo_popups (
    id TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    link_url TEXT,
    placements TEXT DEFAULT 'all', -- Comma-separated: homepage,shop,dashboard,admin,user,all
    is_active INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Dummy Data (3 banners)
-- Using Tamuu logo from carousel as base if possible, otherwise placeholder
INSERT INTO shop_promo_popups (id, image_url, link_url, placements, order_index) VALUES 
('dummy-1', 'https://tamuu.id/tamuu-logo.png', 'https://tamuu.id', 'all', 0),
('dummy-2', 'https://tamuu.id/tamuu-logo.png', 'https://tamuu.id', 'all', 1),
('dummy-3', 'https://tamuu.id/tamuu-logo.png', 'https://tamuu.id', 'all', 2);
