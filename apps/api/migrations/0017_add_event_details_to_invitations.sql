-- Migration: Add Event Details to Invitations
ALTER TABLE invitations ADD COLUMN event_date TEXT;
ALTER TABLE invitations ADD COLUMN event_location TEXT;
ALTER TABLE invitations ADD COLUMN venue_name TEXT;
ALTER TABLE invitations ADD COLUMN address TEXT;
ALTER TABLE invitations ADD COLUMN google_maps_url TEXT;

-- Create index for filtering by date if needed
CREATE INDEX IF NOT EXISTS idx_invitations_event_date ON invitations(event_date);
