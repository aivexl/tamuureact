-- ============================================
-- MASTER SECURITY MIGRATION - Tamuu Platform
-- Created: 2026-01-30
-- Purpose: Enable RLS on all public tables and fix function security
-- ============================================

-- ============================================
-- SECTION 1: ENABLE RLS ON ALL CHAT TABLES
-- ============================================

-- Enable RLS on chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chat_session_cache
ALTER TABLE public.chat_session_cache ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chat_diagnostics_log
ALTER TABLE public.chat_diagnostics_log ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chat_analytics
ALTER TABLE public.chat_analytics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on admin_chat_audit_log
ALTER TABLE public.admin_chat_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 2: RLS POLICIES FOR CHAT_CONVERSATIONS
-- Users can only access their own conversations
-- ============================================

DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
CREATE POLICY "Users can view own conversations" ON public.chat_conversations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON public.chat_conversations;
CREATE POLICY "Users can insert own conversations" ON public.chat_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON public.chat_conversations;
CREATE POLICY "Users can update own conversations" ON public.chat_conversations
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON public.chat_conversations;
CREATE POLICY "Users can delete own conversations" ON public.chat_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 3: RLS POLICIES FOR CHAT_MESSAGES
-- Users can only access messages in their conversations
-- ============================================

DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
CREATE POLICY "Users can view own messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
CREATE POLICY "Users can insert own messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own messages" ON public.chat_messages;
CREATE POLICY "Users can update own messages" ON public.chat_messages
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
CREATE POLICY "Users can delete own messages" ON public.chat_messages
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 4: RLS POLICIES FOR CHAT_SESSION_CACHE
-- Users can only access their own session cache
-- ============================================

DROP POLICY IF EXISTS "Users can view own session cache" ON public.chat_session_cache;
CREATE POLICY "Users can view own session cache" ON public.chat_session_cache
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own session cache" ON public.chat_session_cache;
CREATE POLICY "Users can insert own session cache" ON public.chat_session_cache
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own session cache" ON public.chat_session_cache;
CREATE POLICY "Users can update own session cache" ON public.chat_session_cache
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own session cache" ON public.chat_session_cache;
CREATE POLICY "Users can delete own session cache" ON public.chat_session_cache
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 5: RLS POLICIES FOR CHAT_DIAGNOSTICS_LOG
-- Users can only access their own diagnostics
-- ============================================

DROP POLICY IF EXISTS "Users can view own diagnostics" ON public.chat_diagnostics_log;
CREATE POLICY "Users can view own diagnostics" ON public.chat_diagnostics_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own diagnostics" ON public.chat_diagnostics_log;
CREATE POLICY "Users can insert own diagnostics" ON public.chat_diagnostics_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SECTION 6: RLS POLICIES FOR CHAT_ANALYTICS
-- Users can only access their own analytics
-- ============================================

DROP POLICY IF EXISTS "Users can view own analytics" ON public.chat_analytics;
CREATE POLICY "Users can view own analytics" ON public.chat_analytics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analytics" ON public.chat_analytics;
CREATE POLICY "Users can insert own analytics" ON public.chat_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own analytics" ON public.chat_analytics;
CREATE POLICY "Users can update own analytics" ON public.chat_analytics
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SECTION 7: RLS POLICIES FOR ADMIN_CHAT_AUDIT_LOG
-- Only admins can access audit logs (via service role)
-- Regular users cannot access this table at all
-- ============================================

DROP POLICY IF EXISTS "Service role only for audit logs" ON public.admin_chat_audit_log;
CREATE POLICY "Service role only for audit logs" ON public.admin_chat_audit_log
    FOR ALL USING (false);

-- ============================================
-- SECTION 8: FIX FUNCTION SEARCH_PATH - handle_new_user
-- Recreate with immutable search_path
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, tier, max_invitations)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        'free',
        1
    );
    RETURN NEW;
END;
$$;

-- ============================================
-- SECTION 9: FIX FUNCTION SEARCH_PATH - update_updated_at_column
-- Recreate with immutable search_path
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================
-- SECTION 10: FIX FUNCTION SEARCH_PATH - get_rsvp_stats
-- Recreate with immutable search_path
-- ============================================

CREATE OR REPLACE FUNCTION public.get_rsvp_stats(p_invitation_id UUID)
RETURNS TABLE (
    total_responses BIGINT,
    attending_count BIGINT,
    not_attending_count BIGINT,
    maybe_count BIGINT,
    total_guests BIGINT,
    wishes_count BIGINT
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_responses,
        COUNT(*) FILTER (WHERE r.attendance = 'attending')::BIGINT as attending_count,
        COUNT(*) FILTER (WHERE r.attendance = 'not_attending')::BIGINT as not_attending_count,
        COUNT(*) FILTER (WHERE r.attendance = 'maybe')::BIGINT as maybe_count,
        COALESCE(SUM(r.guest_count) FILTER (WHERE r.attendance = 'attending'), 0)::BIGINT as total_guests,
        COUNT(*) FILTER (WHERE r.message IS NOT NULL AND r.message != '')::BIGINT as wishes_count
    FROM public.rsvp_responses r
    WHERE r.invitation_id = p_invitation_id
      AND r.deleted_at IS NULL 
      AND r.is_visible = true;
END;
$$;

-- ============================================
-- SECTION 11: SECURE INVITATIONS TABLE POLICIES
-- Keep SELECT public, restrict write to authenticated
-- ============================================

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Public invitations access" ON public.invitations;
DROP POLICY IF EXISTS "public_invitations_select" ON public.invitations;
DROP POLICY IF EXISTS "public_invitations_insert" ON public.invitations;
DROP POLICY IF EXISTS "public_invitations_update" ON public.invitations;
DROP POLICY IF EXISTS "public_invitations_delete" ON public.invitations;
DROP POLICY IF EXISTS "auth_invitations_insert" ON public.invitations;
DROP POLICY IF EXISTS "auth_invitations_update" ON public.invitations;
DROP POLICY IF EXISTS "auth_invitations_delete" ON public.invitations;

-- Public SELECT for guests viewing invitations
CREATE POLICY "public_invitations_select" ON public.invitations
    FOR SELECT USING (true);

-- Authenticated-only write operations
CREATE POLICY "auth_invitations_insert" ON public.invitations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_invitations_update" ON public.invitations
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_invitations_delete" ON public.invitations
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- SECTION 12: SECURE TEMPLATES TABLE POLICIES
-- Keep SELECT public, restrict write to authenticated
-- ============================================

-- Drop existing overly permissive write policies
DROP POLICY IF EXISTS "public_templates_insert" ON public.templates;
DROP POLICY IF EXISTS "public_templates_update" ON public.templates;
DROP POLICY IF EXISTS "public_templates_delete" ON public.templates;
DROP POLICY IF EXISTS "auth_templates_insert" ON public.templates;
DROP POLICY IF EXISTS "auth_templates_update" ON public.templates;
DROP POLICY IF EXISTS "auth_templates_delete" ON public.templates;

-- Create secure authenticated-only write policies
CREATE POLICY "auth_templates_insert" ON public.templates
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_templates_update" ON public.templates
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_templates_delete" ON public.templates
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Security migration applied successfully!' as status;
