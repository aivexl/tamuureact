-- Migration: 0050_blog_enhanced_system.sql
-- Description: Infrastruktur untuk Blog Minimalist & Enterprise SEO (v17.0)
-- Author: Tamuu CTO

-- 1. Create Blog Carousel Table
CREATE TABLE IF NOT EXISTS blog_carousel (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    image_url TEXT NOT NULL,
    link_url TEXT, -- Can be internal (/blog/slug) or external
    title TEXT, -- Minimalist overlay text (optional)
    category_label TEXT, -- Small label text (optional)
    order_index INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_carousel_active ON blog_carousel(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_carousel_order ON blog_carousel(order_index);

-- 2. Seed Default Carousel Data (Empty placeholder logic handled by frontend)
INSERT OR IGNORE INTO blog_carousel (id, image_url, title, category_label, order_index) VALUES 
('default-car-1', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000', 'The Minimalist Wedding', 'Inspirasi', 1),
('default-car-2', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000', 'The Architecture of Love', 'Panduan', 2);

-- Note: We assume blog_categories already exists from 0032_create_blog_categories.sql
-- And blog_posts already has category_id from 0030_add_blog_category.sql
-- Since D1 SQLite doesn't fully support ALTER TABLE ADD CONSTRAINT for existing tables easily,
-- we will handle the "ON DELETE SET NULL" behavior gracefully in the API logic.
