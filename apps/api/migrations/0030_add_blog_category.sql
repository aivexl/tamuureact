-- Add category column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN category TEXT;
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);
