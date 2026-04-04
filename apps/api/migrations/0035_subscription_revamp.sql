-- Migration: Revamp Subscriptions and Add Custom Domains
CREATE TABLE IF NOT EXISTS custom_domains (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    invitation_id TEXT NOT NULL,
    hostname TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'EXPIRED')),
    maintenance_expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (invitation_id) REFERENCES invitations(id)
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_user ON custom_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_hostname ON custom_domains(hostname);

-- Update users table with loyalty_credit for prorated upgrades
ALTER TABLE users ADD COLUMN loyalty_credit INTEGER DEFAULT 0;
