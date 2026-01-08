-- ============================================
-- TAMUU - D1 MIGRATION: ADVANCED MUSIC
-- ============================================

-- 1. EXTEND music_library table
-- Note: SQLite doesn't support multiple ADD COLUMN in one statement easily without recreate,
-- but for D1 we can run them sequentially.

ALTER TABLE music_library ADD COLUMN user_id TEXT;
ALTER TABLE music_library ADD COLUMN source_type TEXT DEFAULT 'library';
ALTER TABLE music_library ADD COLUMN external_id TEXT;

-- 2. CREATE INDEX for performance
CREATE INDEX IF NOT EXISTS idx_music_user ON music_library(user_id);
