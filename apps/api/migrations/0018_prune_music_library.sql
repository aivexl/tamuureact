-- ============================================
-- TAMUU - D1 MIGRATION: PRUNE TO POPULAR 3
-- ============================================

-- IDs to retain:
-- 'pop-1' (Beautiful in White)
-- 'pop-2' (A Thousand Years)
-- 'pop-3' (Perfect)

DELETE FROM music_library 
WHERE id NOT IN ('pop-1', 'pop-2', 'pop-3');

-- Update URLs to .m4a (Expected compressed format)
UPDATE music_library 
SET url = REPLACE(url, '.mp3', '.m4a')
WHERE id IN ('pop-1', 'pop-2', 'pop-3');

-- Optimization: Ensure indexes are fresh
ANALYZE music_library;
