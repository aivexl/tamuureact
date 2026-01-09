-- ============================================
-- MIGRATION: User Wishlist (Template Favorites)
-- Purpose: Allow users to save favorite templates
-- ============================================

CREATE TABLE IF NOT EXISTS user_wishlist (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    UNIQUE(user_id, template_id) -- Prevent duplicate entries
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_template ON user_wishlist(template_id);
