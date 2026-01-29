-- Chat Conversation History Schema
-- Tamuu AI Chat System v8.0
-- Migration: Create chat_conversations and chat_messages tables
-- Purpose: Persistent storage for chat history, analytics, and session recovery

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  sentiment_summary TEXT CHECK(sentiment_summary IN ('positive', 'neutral', 'negative')),
  
  -- Metadata for analytics
  started_intent TEXT,
  primary_intents TEXT, -- JSON array
  resolved BOOLEAN DEFAULT FALSE,
  resolution_time_minutes INTEGER,
  user_satisfaction_score INTEGER,
  escalated_to_human BOOLEAN DEFAULT FALSE,
  
  -- Performance tracking
  average_response_time_ms FLOAT,
  fallback_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  
  -- Foreign keys and constraints
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_archived ON chat_conversations(archived);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_created ON chat_conversations(user_id, created_at DESC);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_length INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- AI response metadata
  ai_provider TEXT CHECK(ai_provider IN ('gemini', 'groq', 'fallback')),
  model_version TEXT,
  response_time_ms FLOAT,
  tokens_used INTEGER,
  
  -- Content analysis
  intent TEXT,
  sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
  has_links BOOLEAN DEFAULT FALSE,
  has_code BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'id',
  
  -- Moderation flags
  flagged_for_review BOOLEAN DEFAULT FALSE,
  moderation_status TEXT CHECK(moderation_status IN ('clean', 'warning', 'violation')),
  moderation_reason TEXT,
  
  -- Safety metadata
  safety_ratings TEXT, -- JSON array from Gemini
  
  -- Foreign keys
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_intent ON chat_messages(intent);
CREATE INDEX IF NOT EXISTS idx_chat_messages_flagged ON chat_messages(flagged_for_review);

-- Create chat_session_cache table for quick session lookup
CREATE TABLE IF NOT EXISTS chat_session_cache (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id TEXT NOT NULL,
  session_context TEXT, -- JSON
  cache_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for chat_session_cache
CREATE INDEX IF NOT EXISTS idx_chat_session_cache_user_id ON chat_session_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_session_cache_conversation_id ON chat_session_cache(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_session_cache_expires_at ON chat_session_cache(cache_expires_at);

-- Create chat_diagnostics_log table for tracking diagnostics
CREATE TABLE IF NOT EXISTS chat_diagnostics_log (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id TEXT,
  diagnostic_type TEXT NOT NULL CHECK(diagnostic_type IN ('payment', 'technical', 'account', 'general')),
  diagnostic_data TEXT, -- JSON
  findings TEXT, -- JSON array
  recommendations TEXT, -- JSON array
  auto_fix_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE SET NULL
);

-- Create indexes for chat_diagnostics_log
CREATE INDEX IF NOT EXISTS idx_chat_diagnostics_log_user_id ON chat_diagnostics_log(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_diagnostics_log_created_at ON chat_diagnostics_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_diagnostics_log_type ON chat_diagnostics_log(diagnostic_type);

-- Create chat_analytics table for aggregated metrics
CREATE TABLE IF NOT EXISTS chat_analytics (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  date_key TEXT NOT NULL, -- YYYY-MM-DD format
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  average_response_time_ms FLOAT,
  error_rate FLOAT,
  fallback_rate FLOAT,
  common_intents TEXT, -- JSON
  user_tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date_key)
);

-- Create indexes for chat_analytics
CREATE INDEX IF NOT EXISTS idx_chat_analytics_user_id ON chat_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_date_key ON chat_analytics(date_key);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_user_date ON chat_analytics(user_id, date_key);

-- Create admin_chat_audit_log table for audit trail
CREATE TABLE IF NOT EXISTS admin_chat_audit_log (
  id TEXT PRIMARY KEY,
  admin_id UUID,
  admin_level TEXT NOT NULL CHECK(admin_level IN ('moderator', 'admin', 'super_admin')),
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  affected_conversation_id TEXT,
  details TEXT, -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (affected_conversation_id) REFERENCES chat_conversations(id) ON DELETE SET NULL
);

-- Create indexes for admin_chat_audit_log
CREATE INDEX IF NOT EXISTS idx_admin_chat_audit_log_admin_id ON admin_chat_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_chat_audit_log_target_user_id ON admin_chat_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_chat_audit_log_created_at ON admin_chat_audit_log(created_at DESC);

-- Add triggers for automatic timestamp updates
-- For chat_conversations
DROP TRIGGER IF EXISTS update_chat_conversations_timestamp ON chat_conversations;
CREATE TRIGGER update_chat_conversations_timestamp
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- For chat_messages
DROP TRIGGER IF EXISTS update_chat_messages_timestamp ON chat_messages;
CREATE TRIGGER update_chat_messages_timestamp
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- For chat_analytics
DROP TRIGGER IF EXISTS update_chat_analytics_timestamp ON chat_analytics;
CREATE TRIGGER update_chat_analytics_timestamp
    BEFORE UPDATE ON chat_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant appropriate permissions (if using user roles)
-- Note: Adjust based on your actual user/role setup
-- GRANT SELECT, INSERT, UPDATE ON chat_conversations TO app_role;
-- GRANT SELECT, INSERT ON chat_messages TO app_role;
-- GRANT SELECT, INSERT ON chat_diagnostics_log TO app_role;
-- GRANT SELECT ON chat_analytics TO app_role;
-- GRANT SELECT, INSERT ON admin_chat_audit_log TO admin_role;

-- Migration info comment
-- Created: 2026-01-27
-- Version: 1.0
-- Purpose: Enterprise chat history persistence and analytics
-- Next migration: Add vector embeddings table for semantic search
