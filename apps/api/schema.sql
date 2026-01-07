-- ============================================
-- TAMUU - D1 DATABASE SCHEMA (SQLite)
-- ============================================

-- ============================================
-- 1. TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL DEFAULT 'Untitled Template',
    slug TEXT,
    thumbnail TEXT,
    category TEXT DEFAULT 'Wedding',
    type TEXT DEFAULT 'invitation',  -- 'invitation' or 'display'
    zoom REAL DEFAULT 1,
    pan TEXT DEFAULT '{"x": 0, "y": 0}',
    sections TEXT DEFAULT '[]',
    layers TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug);
CREATE INDEX IF NOT EXISTS idx_templates_updated ON templates(updated_at DESC);

-- ============================================
-- 2. INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,
    template_id TEXT,
    name TEXT NOT NULL DEFAULT 'Untitled Invitation',
    slug TEXT UNIQUE,
    thumbnail_url TEXT,
    category TEXT DEFAULT 'Wedding',
    zoom REAL DEFAULT 1,
    pan TEXT DEFAULT '{"x": 0, "y": 0}',
    sections TEXT DEFAULT '[]',
    layers TEXT DEFAULT '[]',
    orbit_layers TEXT DEFAULT '[]',
    is_published INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (template_id) REFERENCES templates(id)
);

CREATE INDEX IF NOT EXISTS idx_invitations_slug ON invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_user ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_updated ON invitations(updated_at DESC);

-- ============================================
-- 3. RSVP RESPONSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rsvp_responses (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    invitation_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    attendance TEXT NOT NULL CHECK (attendance IN ('attending', 'not_attending', 'maybe')),
    guest_count INTEGER DEFAULT 1,
    meal_preference TEXT,
    song_request TEXT,
    message TEXT,
    ip_address TEXT,
    user_agent TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    is_approved INTEGER DEFAULT 1,
    is_visible INTEGER DEFAULT 1,
    flagged_as_spam INTEGER DEFAULT 0,
    deleted_at TEXT,
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rsvp_invitation ON rsvp_responses(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_submitted ON rsvp_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvp_attendance ON rsvp_responses(attendance);

-- ============================================
-- 4. USERS TABLE (for future auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    provider TEXT DEFAULT 'email',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 5. ASSETS TABLE (file metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,
    invitation_id TEXT,
    filename TEXT NOT NULL,
    content_type TEXT,
    size INTEGER,
    r2_key TEXT NOT NULL,
    public_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_invitation ON assets(invitation_id);
