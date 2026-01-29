UPDATE blog_posts SET is_published = 1, status = 'published' WHERE slug = 'test';
UPDATE blog_posts SET is_published = 1, status = 'published' WHERE status = 'published';
SELECT id, slug, status, is_published FROM blog_posts;
