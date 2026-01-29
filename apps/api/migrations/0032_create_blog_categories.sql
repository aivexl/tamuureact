-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_category_slug ON blog_categories(slug);

-- Seed defaults
INSERT OR IGNORE INTO blog_categories (id, name, slug) VALUES 
('cat-01', 'Tips & Tricks', 'tips-tricks'),
('cat-02', 'Inspirasi', 'inspirasi'),
('cat-03', 'Teknologi', 'teknologi'),
('cat-04', 'Etika & Budaya', 'etika-budaya'),
('cat-05', 'Keuangan', 'keuangan');
