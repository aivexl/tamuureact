-- Update testtemplate URLs from Supabase to R2
-- This replaces all Supabase storage URLs with Cloudflare R2 URLs

UPDATE templates SET 
    sections = REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(
                            sections, 
                            'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1766801467213_3164.png',
                            'https://api.tamuu.id/assets/uploads/1766801467213_3164.png'
                        ),
                        'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1766815585358_9185.png',
                        'https://api.tamuu.id/assets/uploads/1766815585358_9185.png'
                    ),
                    'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1766817790628_7573.png',
                    'https://api.tamuu.id/assets/uploads/1766817790628_7573.png'
                ),
                'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1767021194998_2984.png',
                'https://api.tamuu.id/assets/uploads/1767021194998_2984.png'
            ),
            'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1767022386553_5822.png',
            'https://api.tamuu.id/assets/uploads/1767022386553_5822.png'
        ),
        'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1767183712278_2145.png',
        'https://api.tamuu.id/assets/uploads/1767183712278_2145.png'
    ),
    orbit = REPLACE(
        orbit,
        'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/anon/1767183712278_2145.png',
        'https://api.tamuu.id/assets/uploads/1767183712278_2145.png'
    ),
    thumbnail = REPLACE(
        thumbnail,
        'https://mqbgpulironhtvzfpzfp.supabase.co/storage/v1/object/public/invitation-assets/thumbnails/',
        'https://api.tamuu.id/assets/uploads/'
    ),
    updated_at = datetime('now')
WHERE slug = 'testtemplate';
