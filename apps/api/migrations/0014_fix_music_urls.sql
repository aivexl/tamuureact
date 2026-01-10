-- ============================================
-- TAMUU - D1 UPDATE: FIX MUSIC LINKS (DEMO MODE)
-- ============================================

-- TRADITIONAL & CLASSIC (Using reliable SoundHelix mirrors)
UPDATE music_library SET url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' WHERE category IN ('Traditional', 'Classic');

-- POP & MODERN (Using reliable SoundHelix mirrors)
UPDATE music_library SET url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' WHERE category IN ('Modern', 'Instrumental');

-- ACOUSTIC (Using reliable SoundHelix mirrors)
UPDATE music_library SET url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' WHERE category = 'Acoustic';

-- SPECIFIC TRACK FIXES (Optional overrides for variety if needed later)
-- For now, invalidating the 404 links is priority.
