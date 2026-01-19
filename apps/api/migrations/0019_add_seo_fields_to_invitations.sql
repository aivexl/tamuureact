-- Migration: Add SEO fields to Invitations
ALTER TABLE invitations ADD COLUMN seo_title TEXT;
ALTER TABLE invitations ADD COLUMN seo_description TEXT;
ALTER TABLE invitations ADD COLUMN og_image TEXT;
