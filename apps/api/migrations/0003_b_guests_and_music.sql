-- ============================================
-- TAMUU - D1 MIGRATION: GUESTS & MUSIC
-- ============================================

-- 1. GUESTS TABLE
CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    invitation_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT DEFAULT 'di tempat',
    table_number TEXT,
    tier TEXT CHECK (tier IN ('reguler', 'vip', 'vvip')) DEFAULT 'reguler',
    guest_count INTEGER DEFAULT 1,
    check_in_code TEXT,
    shared_at TEXT,
    checked_in_at TEXT,
    checked_out_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_guests_invitation ON guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_checkin ON guests(check_in_code);

-- 2. MUSIC LIBRARY TABLE
CREATE TABLE IF NOT EXISTS music_library (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    artist TEXT,
    url TEXT NOT NULL,
    category TEXT,
    duration TEXT,
    is_premium INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_music_category ON music_library(category);

-- 3. SEED INITIAL MUSIC (Optional but helpful for first use)
INSERT INTO music_library (title, artist, url, category, duration, is_premium)
VALUES 
('A Thousand Years', 'Christina Perri', 'https://api.tamuu.id/assets/music/thousand-years.mp3', 'Romantic', '4:45', 1),
('Can''t Help Falling In Love', 'Elvis Presley', 'https://api.tamuu.id/assets/music/falling-in-love.mp3', 'Classic', '3:01', 0),
('Perfect', 'Ed Sheeran', 'https://api.tamuu.id/assets/music/perfect.mp3', 'Pop', '4:23', 1);
