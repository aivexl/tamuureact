-- Migration: Add Subscription and Billing Tracking
-- 1. Update users table with subscription fields
ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN max_invitations INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN invitation_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN expires_at TEXT;

-- 2. Create billing_transactions table
CREATE TABLE IF NOT EXISTS billing_transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    external_id TEXT UNIQUE NOT NULL, -- Midtrans Order ID
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'IDR',
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED')),
    tier TEXT NOT NULL,
    payment_method TEXT,
    payment_channel TEXT,
    paid_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_billing_user ON billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_external ON billing_transactions(external_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing_transactions(status);
