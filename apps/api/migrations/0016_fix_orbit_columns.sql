-- ============================================
-- MIGRATION: 0016_fix_orbit_columns.sql
-- Description: Ensures 'orbit_layers' and 'orbit' columns exist in both invitations and templates tables.
-- Purpose: Resolves D1_ERROR: no such column: orbit_layers and ensures architectural consistency.
-- ============================================

-- 1. Fix INVITATIONS table
-- Add orbit_layers if it doesn't exist
-- ALTER TABLE invitations ADD COLUMN orbit_layers TEXT DEFAULT '[]';

-- Add orbit alias for redundancy and compatibility
ALTER TABLE invitations ADD COLUMN orbit TEXT DEFAULT '{}';

-- 2. Fix TEMPLATES table
-- Add orbit column (used by remigrate scripts)
ALTER TABLE templates ADD COLUMN orbit TEXT DEFAULT '{}';

-- Add orbit_layers for parity with invitations
ALTER TABLE templates ADD COLUMN orbit_layers TEXT DEFAULT '[]';

-- 3. Data Integrity: Sync columns if one exists but not the other
-- If orbit has data but orbit_layers doesn't (in invitations)
UPDATE invitations SET orbit_layers = orbit WHERE orbit IS NOT NULL AND (orbit_layers IS NULL OR orbit_layers = '[]');

-- If orbit_layers has data but orbit doesn't (in templates)
UPDATE templates SET orbit = orbit_layers WHERE orbit_layers IS NOT NULL AND (orbit IS NULL OR orbit = '{}');
