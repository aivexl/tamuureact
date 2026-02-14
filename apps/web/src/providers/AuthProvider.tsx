import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { User, SubscriptionTier } from '../store/authSlice';

interface AuthContextType {
    // Add any specific helper methods here if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setAuthSession, setUser, setToken, setLoading } = useStore();
    const lastSyncedSession = React.useRef<string | null>(null);

    useEffect(() => {
        // 1. Check current session on load
        const initAuth = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // Non-blocking sync to allow immediate access to basic auth state
                syncUserProfile(session.user, session.access_token, session);
            } else {
                setLoading(false);
            }
        };

        initAuth();

        // 2. Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[Auth Event] ${event}`);

            if (session) {
                // Non-blocking profile sync for faster UI response
                syncUserProfile(session.user, session.access_token, session);
            } else {
                setUser(null);
                setToken(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setToken, setLoading]);

    /**
     * Syncs Supabase Auth user with our Zustand store
     * Uses user_metadata initially, then fetches D1 data
     */
    const syncUserProfile = async (supabaseUser: any, token: string, session?: any) => {
        // Use session access token or specific identifier for deduplication
        const sessionKey = session?.access_token || token;
        if (lastSyncedSession.current === sessionKey) {
            return;
        }
        lastSyncedSession.current = sessionKey;

        // Build initial user object from Supabase auth metadata
        const initialUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
            avatar_url: supabaseUser.user_metadata?.avatar_url || '',
            role: (supabaseUser.user_metadata?.role as 'user' | 'admin' | 'reseller') || 'user',
            permissions: [],
            gender: supabaseUser.user_metadata?.gender || '',
            birthDate: supabaseUser.user_metadata?.birth_date || '',
            tier: 'free', // Initial default
            maxInvitations: 1,
            invitationCount: 0,
            expiresAt: undefined,
        };

        // Set initial state atomically with token
        setAuthSession({ user: initialUser, token });

        try {
            // Fetch real tier and quotas from D1 via our API
            const { users: usersApi } = await import('../lib/api');
            const d1User = await usersApi.getMe(`${supabaseUser.email}`, {
                uid: supabaseUser.id,
                name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
                gender: supabaseUser.user_metadata?.gender || '',
                birthDate: supabaseUser.user_metadata?.birth_date || ''
            });

            console.log('[Auth Sync] D1 Profile received:', d1User);

            if (d1User) {
                const updatedUser: User = {
                    ...initialUser,
                    tier: d1User.tier || 'free',
                    maxInvitations: d1User.maxInvitations || 1,
                    invitationCount: d1User.invitationCount || 0,
                    expiresAt: d1User.expires_at,
                    role: d1User.role || initialUser.role,
                    permissions: d1User.permissions || []
                };

                console.log('[Auth Sync] Updating session with:', updatedUser.tier);
                setAuthSession({ user: updatedUser, token });
            }
        } catch (error) {
            console.error('[Auth Sync] Failed to sync profile with D1:', error);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
