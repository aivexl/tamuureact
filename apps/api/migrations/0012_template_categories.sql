-- ============================================
-- MIGRATION: Template Categories
-- Purpose: Dynamic category management for templates
-- ============================================

CREATE TABLE IF NOT EXISTS template_categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '📁',
    color TEXT DEFAULT '#6366F1',
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_categories_order ON template_categories(display_order);

-- Seed default categories
INSERT OR IGNORE INTO template_categories (name, slug, icon, color, display_order) VALUES 
    ('Wedding', 'wedding', '💒', '#EC4899', 1),
    ('Birthday', 'birthday', '🎂', '#F59E0B', 2),
    ('Event', 'event', '🎉', '#10B981', 3),
    ('Classic', 'classic', '✨', '#6366F1', 4),
    ('Floral', 'floral', '🌸', '#F472B6', 5);
