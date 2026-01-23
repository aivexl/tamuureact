-- Migration: Add CANCELLED status to billing_transactions
-- SQLite requires table recreation to modify CHECK constraint

-- Step 1: Create new table with updated CHECK constraint
CREATE TABLE IF NOT EXISTS billing_transactions_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    external_id TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'IDR',
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED')),
    tier TEXT NOT NULL,
    payment_method TEXT,
    payment_channel TEXT,
    payment_url TEXT,
    paid_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Step 2: Copy data from old table to new table
INSERT INTO billing_transactions_new (id, user_id, external_id, amount, currency, status, tier, payment_method, payment_channel, payment_url, paid_at, created_at, updated_at)
SELECT id, user_id, external_id, amount, currency, status, tier, payment_method, payment_channel, payment_url, paid_at, created_at, updated_at
FROM billing_transactions;

-- Step 3: Drop old table
DROP TABLE billing_transactions;

-- Step 4: Rename new table to original name
ALTER TABLE billing_transactions_new RENAME TO billing_transactions;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_billing_user ON billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_external ON billing_transactions(external_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing_transactions(status);
