-- ================================================
-- RSVP Responses Table
-- Stores all RSVP submissions with guest wishes
-- ================================================

-- Create RSVP responses table
CREATE TABLE IF NOT EXISTS rsvp_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
    
    -- Guest Information
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Attendance
    attendance VARCHAR(20) NOT NULL CHECK (attendance IN ('attending', 'not_attending', 'maybe')),
    guest_count INTEGER DEFAULT 1,
    
    -- Optional Fields
    meal_preference VARCHAR(50),
    song_request VARCHAR(200),
    
    -- Message/Wish (Guest Wishes)
    message TEXT,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Moderation
    is_approved BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    flagged_as_spam BOOLEAN DEFAULT false,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_rsvp_invitation_id ON rsvp_responses(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_submitted_at ON rsvp_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvp_attendance ON rsvp_responses(attendance);
CREATE INDEX IF NOT EXISTS idx_rsvp_visible ON rsvp_responses(is_visible) WHERE is_visible = true;

-- ================================================
-- RSVP Stats View
-- Aggregated statistics per invitation
-- ================================================
CREATE OR REPLACE VIEW rsvp_stats AS
SELECT 
    invitation_id,
    COUNT(*) as total_responses,
    COUNT(*) FILTER (WHERE attendance = 'attending') as attending_count,
    COUNT(*) FILTER (WHERE attendance = 'not_attending') as not_attending_count,
    COUNT(*) FILTER (WHERE attendance = 'maybe') as maybe_count,
    COALESCE(SUM(guest_count) FILTER (WHERE attendance = 'attending'), 0) as total_guests,
    COUNT(*) FILTER (WHERE message IS NOT NULL AND message != '') as wishes_count
FROM rsvp_responses
WHERE deleted_at IS NULL AND is_visible = true
GROUP BY invitation_id;

-- ================================================
-- Row Level Security (RLS)
-- ================================================
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can submit RSVP" ON rsvp_responses;
DROP POLICY IF EXISTS "Anyone can view approved wishes" ON rsvp_responses;
DROP POLICY IF EXISTS "Owner can manage responses" ON rsvp_responses;

-- Public can insert (submit RSVP) - no auth required for guests
CREATE POLICY "Anyone can submit RSVP"
ON rsvp_responses FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Public can view approved, visible wishes
CREATE POLICY "Anyone can view approved wishes"
ON rsvp_responses FOR SELECT
TO anon, authenticated
USING (is_approved = true AND is_visible = true AND deleted_at IS NULL);

-- Invitation owner can manage all their responses
CREATE POLICY "Owner can manage responses"
ON rsvp_responses FOR ALL
TO authenticated
USING (
    invitation_id IN (
        SELECT id FROM invitations WHERE user_id = auth.uid()
    )
);

-- ================================================
-- Helper function to get RSVP statistics
-- ================================================
CREATE OR REPLACE FUNCTION get_rsvp_stats(p_invitation_id UUID)
RETURNS TABLE (
    total_responses BIGINT,
    attending_count BIGINT,
    not_attending_count BIGINT,
    maybe_count BIGINT,
    total_guests BIGINT,
    wishes_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_responses,
        COUNT(*) FILTER (WHERE r.attendance = 'attending')::BIGINT as attending_count,
        COUNT(*) FILTER (WHERE r.attendance = 'not_attending')::BIGINT as not_attending_count,
        COUNT(*) FILTER (WHERE r.attendance = 'maybe')::BIGINT as maybe_count,
        COALESCE(SUM(r.guest_count) FILTER (WHERE r.attendance = 'attending'), 0)::BIGINT as total_guests,
        COUNT(*) FILTER (WHERE r.message IS NOT NULL AND r.message != '')::BIGINT as wishes_count
    FROM rsvp_responses r
    WHERE r.invitation_id = p_invitation_id
      AND r.deleted_at IS NULL 
      AND r.is_visible = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
