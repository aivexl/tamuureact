-- Add is_featured and tags columns to blog_posts
ALTER TABLE blog_posts ADD COLUMN is_featured INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN tags TEXT; -- JSON stringified array

-- Create index for featured posts to optimize Hero Slider queries
CREATE INDEX IF NOT EXISTS idx_blog_featured ON blog_posts(is_featured) WHERE is_featured = 1;
