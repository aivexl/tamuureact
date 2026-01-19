-- Add livestream_url column to invitations table
ALTER TABLE invitations ADD COLUMN livestream_url TEXT DEFAULT '';
