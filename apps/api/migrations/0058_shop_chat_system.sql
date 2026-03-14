-- Migration: 0058_shop_chat_system.sql
-- Description: Foundation for User-Vendor P2P Chat System with Admin Monitoring

-- Track conversations between users and merchants
CREATE TABLE IF NOT EXISTS shop_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    merchant_id TEXT NOT NULL,
    last_message TEXT,
    last_sender_id TEXT,
    unread_count_user INTEGER DEFAULT 0,
    unread_count_vendor INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(merchant_id) REFERENCES shop_merchants(id)
);

-- Store individual messages
CREATE TABLE IF NOT EXISTS shop_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text', -- text, image, product_link
    read_at DATETIME, -- Only populated when the recipient views it
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id) REFERENCES shop_conversations(id)
);

CREATE INDEX IF NOT EXISTS idx_shop_msgs_conv ON shop_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_shop_conv_user ON shop_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_conv_vendor ON shop_conversations(merchant_id);
