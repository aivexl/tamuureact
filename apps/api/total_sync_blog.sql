-- TOTAL SYNC: Adding all missing columns from 0027 and subsequent migrations
-- This handles legacy tables that were created with incomplete schemas

-- Columns from 0027 (if missing)
ALTER TABLE blog_posts ADD COLUMN is_published INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN published_at TEXT;
ALTER TABLE blog_posts ADD COLUMN seo_title TEXT;
ALTER TABLE blog_posts ADD COLUMN seo_description TEXT;
ALTER TABLE blog_posts ADD COLUMN seo_keywords TEXT;
ALTER TABLE blog_posts ADD COLUMN canonical_url TEXT;
ALTER TABLE blog_posts ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN created_at TEXT DEFAULT (datetime('now'));
ALTER TABLE blog_posts ADD COLUMN updated_at TEXT DEFAULT (datetime('now'));

-- Columns from 0030, 0031, 0033 (if missing - status/approved_by were already seen)
ALTER TABLE blog_posts ADD COLUMN category TEXT;
ALTER TABLE blog_posts ADD COLUMN image_meta TEXT;
ALTER TABLE blog_posts ADD COLUMN image_alt TEXT;

-- Create blog_categories table (0032)
CREATE TABLE IF NOT EXISTS blog_categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    post_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_is_published ON blog_posts(is_published);

-- Sync status and is_published
UPDATE blog_posts SET is_published = 1 WHERE status = 'published';
UPDATE blog_posts SET status = 'published' WHERE is_published = 1;
