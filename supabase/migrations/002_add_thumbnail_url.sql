-- ============================================
-- 2. ADD THUMBNAIL URL COLUMN
-- ============================================

DO $$ 
BEGIN
    -- Add thumbnail_url to templates if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='templates' AND column_name='thumbnail_url') THEN
        ALTER TABLE templates ADD COLUMN thumbnail_url TEXT;
    END IF;

    -- Add thumbnail_url to invitations if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invitations' AND column_name='thumbnail_url') THEN
        ALTER TABLE invitations ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;
