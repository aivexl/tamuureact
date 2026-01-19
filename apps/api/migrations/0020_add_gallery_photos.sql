-- Add gallery_photos column to invitations table
-- Stores an array of photo URLs as JSON
ALTER TABLE invitations ADD COLUMN gallery_photos TEXT DEFAULT '[]';
