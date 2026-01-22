-- Migration: Create user_display_designs table
-- This table stores user-owned display designs based on system templates

CREATE TABLE IF NOT EXISTS user_display_designs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    invitation_id TEXT,
    name TEXT DEFAULT 'Display Design',
    thumbnail_url TEXT,
    source_template_id TEXT,
    content TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE SET NULL,
    FOREIGN KEY (source_template_id) REFERENCES templates(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_display_designs_user ON user_display_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_display_designs_invitation ON user_display_designs(invitation_id);
