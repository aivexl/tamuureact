-- Add love_story column to invitations table
-- Stores timeline events as JSON array
ALTER TABLE invitations ADD COLUMN love_story TEXT DEFAULT '[]';
