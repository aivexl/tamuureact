-- Migration: Add Extended Profile Fields to Users
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', ''));
ALTER TABLE users ADD COLUMN birth_date TEXT;
ALTER TABLE users ADD COLUMN tamuu_id TEXT;

-- Create an index for tamuu_id lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tamuu_id ON users(tamuu_id);
