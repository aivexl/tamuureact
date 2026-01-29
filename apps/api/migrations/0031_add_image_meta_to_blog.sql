-- Migration: Add image_meta column to blog_posts to store JSON metadata (alt, title)
ALTER TABLE blog_posts ADD COLUMN image_meta TEXT;
