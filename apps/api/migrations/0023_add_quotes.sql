-- Add quote fields to invitations table
ALTER TABLE invitations ADD COLUMN quote_text TEXT DEFAULT '';
ALTER TABLE invitations ADD COLUMN quote_author TEXT DEFAULT '';
