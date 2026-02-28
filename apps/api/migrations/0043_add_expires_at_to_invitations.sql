-- Migration: Add expires_at to invitations table
ALTER TABLE invitations ADD COLUMN expires_at TEXT;

-- Seed existing invitations with their owner's expiration date to maintain continuity
UPDATE invitations
SET expires_at = (SELECT expires_at FROM users WHERE users.id = invitations.user_id)
WHERE user_id IS NOT NULL;
