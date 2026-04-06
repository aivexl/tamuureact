import { StateCreator } from 'zustand';
import { supabase } from '../lib/supabase';

export type SubscriptionTier = 'free' | 'pro' | 'ultimate' | 'elite' | 'vip' | 'platinum' | 'vvip';

export const TIER_LABELS: Record<string, string> = {
    free: 'FREE',
    pro: 'PRO',
    ultimate: 'ULTIMATE',
    elite: 'ELITE',
    vip: 'PRO',
    platinum: 'ULTIMATE',
    vvip: 'ELITE'
};

export interface User {
    id: string; // Supabase UUID
    d1_id?: string; // Canonical D1 Database ID
    email: string;
    name?: string;
    gender?: string;
    birthDate?: string;
    avatar_url?: string;
    role: 'user' | 'admin' | 'reseller';
    permissions: string[];
    tier: SubscriptionTier;
    maxInvitations: number;
    invitationCount: number;
    expiresAt?: string;
    giftRecipientName?: string;
    giftAddress?: string;
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

        // 2. Clear localStorage
        localStorage.removeItem('tamuu_user');
        localStorage.removeItem('tamuu_token');

        // 3. Clear Zustand State
        set({ user: null, isAuthenticated: false, token: null, error: null });
    },
});
