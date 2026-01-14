import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { User, SubscriptionTier } from '../store/authSlice';

interface AuthContextType {
    // Add any specific helper methods here if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setUser, setToken, setLoading } = useStore();

    useEffect(() => {
        // 1. Check current session on load
        const initAuth = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setToken(session.access_token);
                // Non-blocking sync to allow immediate access to basic auth state
                syncUserProfile(session.user);
            }
            setLoading(false);
        };

        initAuth();

        // 2. Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[Auth Event] ${event}`);

            if (session) {
                setToken(session.access_token);
                // Non-blocking profile sync for faster UI response
                syncUserProfile(session.user);
            } else {
                setUser(null);
                setToken(null);
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setToken, setLoading]);

    /**
     * Syncs Supabase Auth user with our Zustand store
     * Uses user_metadata only (no external profiles table required)
     */
    const syncUserProfile = (supabaseUser: any) => {
        // Build user object directly from Supabase auth metadata
        const user: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
            avatar_url: supabaseUser.user_metadata?.avatar_url || '',
            role: (supabaseUser.user_metadata?.role as 'user' | 'admin') || 'user',
            tier: 'free', // Default tier, can be updated later from billing system
            maxInvitations: 1,
            invitationCount: 0,
            expiresAt: undefined,
        };

        setUser(user);
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
