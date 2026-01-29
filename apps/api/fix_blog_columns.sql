-- Manually ensuring ALL required columns and tables exist for the Blog system
-- Missing columns from 0029, 0030, 0031, 0033
ALTER TABLE blog_posts ADD COLUMN status TEXT DEFAULT 'draft';
ALTER TABLE blog_posts ADD COLUMN approved_by TEXT;
ALTER TABLE blog_posts ADD COLUMN category TEXT;
ALTER TABLE blog_posts ADD COLUMN image_meta TEXT;
ALTER TABLE blog_posts ADD COLUMN image_alt TEXT;

-- Migration: Sync existing is_published flag to new status column
UPDATE blog_posts SET status = 'published' WHERE is_published = 1;
UPDATE blog_posts SET status = 'draft' WHERE is_published = 0;

-- Create blog_categories table if missing (0032)
CREATE TABLE IF NOT EXISTS blog_categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    post_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Ensure indexes
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
