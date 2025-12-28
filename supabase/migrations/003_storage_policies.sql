-- Enable RLS on storage.objects (usually enabled by default, but ensuring policies exist)

-- 1. Create the bucket if it doesn't exist (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('invitation-assets', 'invitation-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts during dev iterations
DROP POLICY IF EXISTS "Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;

-- 3. Create Policies

-- Allow public read access to all files in invitation-assets
CREATE POLICY "Public Select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'invitation-assets' );

-- Allow public upload access to invitation-assets (For Anon/Unauthenticated users)
-- WARNING: In production, you might want to restrict this to authenticated users
CREATE POLICY "Public Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'invitation-assets' );

-- Allow public update access (for overwriting thumbnails)
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'invitation-assets' );
