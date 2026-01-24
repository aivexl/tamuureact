-- Migration: Add User Roles and Granular Permissions
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '[]';

-- Update initial admin account
UPDATE users SET role = 'admin', permissions = '["all"]' WHERE email = 'admin@tamuu.id';
