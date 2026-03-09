-- ============================================
-- TAMUU PUSH NOTIFICATION SYSTEM
-- Supporting Web Push (VAPID)
-- ============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    platform TEXT, -- 'mobile', 'desktop', 'tablet'
    user_agent TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_active ON push_subscriptions(is_active);

-- Log the migration
INSERT INTO d1_migrations (name, applied_at) VALUES ('0047_push_notification_system', CURRENT_TIMESTAMP);
