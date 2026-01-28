-- ============================================
-- BLOG POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown/HTML content
    excerpt TEXT,
    featured_image TEXT,
    author_id TEXT,
    is_published INTEGER DEFAULT 0,
    published_at TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    canonical_url TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_author ON blog_posts(author_id);

-- ============================================
-- BLOG SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active', -- active, unsubscribed
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON blog_subscribers(email);

-- ============================================
-- BLOG ANALYTICS (Internal Tracker)
-- ============================================
CREATE TABLE IF NOT EXISTS blog_daily_stats (
    date TEXT NOT NULL, -- YYYY-MM-DD
    post_id TEXT,
    views INTEGER DEFAULT 0,
    visitors INTEGER DEFAULT 0,
    reads INTEGER DEFAULT 0, -- > 5 seconds
    PRIMARY KEY (date, post_id)
);

CREATE INDEX IF NOT EXISTS idx_stats_date ON blog_daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_stats_post ON blog_daily_stats(post_id);

-- Add post_id to assets for blog images
ALTER TABLE assets ADD COLUMN post_id TEXT;
CREATE INDEX IF NOT EXISTS idx_assets_post ON assets(post_id);
