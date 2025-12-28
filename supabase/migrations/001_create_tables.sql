-- ============================================
-- TAMUU STUDIO - DATABASE SCHEMA
-- Run this SQL in Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- 1. TEMPLATES TABLE (Master Template Storage)
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Untitled Template',
    slug TEXT,
    thumbnail TEXT,
    category TEXT DEFAULT 'Wedding',
    zoom FLOAT DEFAULT 1,
    pan JSONB DEFAULT '{"x": 0, "y": 0}'::jsonb,
    sections JSONB DEFAULT '[]'::jsonb,
    layers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INVITATIONS TABLE - Add missing columns
-- ============================================
-- First, add columns if they don't exist (safe for existing tables)
DO $$ 
BEGIN
    -- Add slug column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='slug') THEN
        ALTER TABLE invitations ADD COLUMN slug TEXT;
    END IF;
    
    -- Add zoom column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='zoom') THEN
        ALTER TABLE invitations ADD COLUMN zoom FLOAT DEFAULT 1;
    END IF;
    
    -- Add pan column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='pan') THEN
        ALTER TABLE invitations ADD COLUMN pan JSONB DEFAULT '{"x": 0, "y": 0}'::jsonb;
    END IF;
    
    -- Add sections column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='sections') THEN
        ALTER TABLE invitations ADD COLUMN sections JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add layers column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='layers') THEN
        ALTER TABLE invitations ADD COLUMN layers JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- ============================================
-- 3. CREATE INDEXES (only if columns exist)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);
CREATE INDEX IF NOT EXISTS idx_templates_updated ON templates(updated_at DESC);

-- Only create if invitations table has the columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='slug') THEN
        CREATE INDEX IF NOT EXISTS idx_invitations_slug ON invitations(slug);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_invitations_updated ON invitations(updated_at DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "public_templates_select" ON templates;
DROP POLICY IF EXISTS "public_templates_insert" ON templates;
DROP POLICY IF EXISTS "public_templates_update" ON templates;
DROP POLICY IF EXISTS "public_templates_delete" ON templates;
DROP POLICY IF EXISTS "public_invitations_select" ON invitations;
DROP POLICY IF EXISTS "public_invitations_insert" ON invitations;
DROP POLICY IF EXISTS "public_invitations_update" ON invitations;
DROP POLICY IF EXISTS "public_invitations_delete" ON invitations;

-- Create policies
CREATE POLICY "public_templates_select" ON templates FOR SELECT USING (true);
CREATE POLICY "public_templates_insert" ON templates FOR INSERT WITH CHECK (true);
CREATE POLICY "public_templates_update" ON templates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_templates_delete" ON templates FOR DELETE USING (true);

CREATE POLICY "public_invitations_select" ON invitations FOR SELECT USING (true);
CREATE POLICY "public_invitations_insert" ON invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "public_invitations_update" ON invitations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_invitations_delete" ON invitations FOR DELETE USING (true);

-- ============================================
-- 5. AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invitations_updated_at ON invitations;
CREATE TRIGGER update_invitations_updated_at
    BEFORE UPDATE ON invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! 
-- ============================================
SELECT 'Schema updated successfully!' as status;
