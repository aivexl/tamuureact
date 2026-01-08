-- Migration: Add Music Persistence to Invitations and Templates
ALTER TABLE invitations ADD COLUMN music TEXT;
ALTER TABLE templates ADD COLUMN music TEXT;
