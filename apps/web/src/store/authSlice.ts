import { StateCreator } from 'zustand';
import { supabase } from '../lib/supabase';

export type SubscriptionTier = 'free' | 'vip' | 'vvip';

export interface User {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    role: 'user' | 'admin';
    tier: SubscriptionTier;
    maxInvitations: number;
    invitationCount: number;
    expiresAt?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    updateSubscription: (updates: Partial<Pick<User, 'tier' | 'maxInvitations' | 'expiresAt'>>) => void;
    setAuthSession: (session: { user: User; token: string }) => void;
    logout: () => void;
}

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
    user: null,
    isAuthenticated: false,
    token: null,
    isLoading: true, // Initialized to true to handle session rehydration gracefully
    error: null,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setToken: (token) => set({ token }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    updateSubscription: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
    })),
    setAuthSession: ({ user, token }) => set({
        user,
        token,
        isAuthenticated: !!user,
        isLoading: false
    }),
    logout: () => {
        // 1. Terminate Supabase Session (Clears Cookies/Storage)
        supabase.auth.signOut().catch(err => {
            console.error('[Auth logout] Sign out error:', err);
        });

        // 2. Clear Zustand State
        set({ user: null, isAuthenticated: false, token: null, error: null });
    },
});
