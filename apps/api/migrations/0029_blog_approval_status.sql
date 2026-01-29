-- Migration: Add Approval Status to Blog Posts
ALTER TABLE blog_posts ADD COLUMN status TEXT DEFAULT 'draft';
ALTER TABLE blog_posts ADD COLUMN approved_by TEXT;

-- Migration: Sync existing is_published flag to new status column
UPDATE blog_posts SET status = 'published' WHERE is_published = 1;
UPDATE blog_posts SET status = 'draft' WHERE is_published = 0;
