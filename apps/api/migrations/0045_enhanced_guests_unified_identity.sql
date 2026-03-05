-- ============================================
-- TAMUU - D1 MIGRATION: ENHANCED GUESTS (UNIFIED TOKEN & SLUG)
-- ============================================

-- 1. Add slug column to guests table
ALTER TABLE guests ADD COLUMN slug TEXT;

-- 2. Create Unique Indexes for high-performance lookup and data integrity
-- Ensure check_in_code is unique across the entire platform
CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_unique_token ON guests(check_in_code);

-- Ensure slug is unique per invitation to prevent URL collisions
CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_unique_slug_per_invitation ON guests(invitation_id, slug);

-- 3. Optimization: Add index for name-based lookup if needed
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);
