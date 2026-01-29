-- Add image_alt column to blog_posts for accessible featured images
ALTER TABLE blog_posts ADD COLUMN image_alt TEXT;
