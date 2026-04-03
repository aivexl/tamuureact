"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@tamuu/shared';

interface AuthContextType {
    user: any;
    session: any;
    isAuthenticated: boolean;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setAuthSession, setUser: setStoreUser, setToken: setStoreToken, setLoading: setStoreLoading } = useStore();
    const [user, setUser] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isAuthenticated = !!user || !!session;
    const lastSyncedSession = useRef<string | null>(null);
    const isLoggingOut = useRef<boolean>(false);
    const router = useRouter();
    
    // Create a stable supabase client instance using the SSR client factory
    const supabase = useMemo(() => createClient(), []);

    const syncWithD1 = async (supabaseUser: any, token: string, sessionObj?: any) => {
        if (isLoggingOut.current) return;
        
        // De-duplication check using access token
        const sessionKey = sessionObj?.access_token || token;
        if (lastSyncedSession.current === sessionKey) return;
        lastSyncedSession.current = sessionKey;

        // 1. Set Initial User from Metadata (Immediate UI feedback)
        const initialUser = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
            avatar_url: supabaseUser.user_metadata?.avatar_url || '',
            role: (supabaseUser.user_metadata?.role as 'user' | 'admin' | 'reseller') || 'user',
            permissions: [],
            tier: 'free',
            maxInvitations: 1,
            invitationCount: 0
        };

        // Sync to Zustand Store
        setAuthSession({ user: initialUser, token });
        setUser(initialUser);

        try {
            // 2. Fetch Full Profile from D1
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tamuu.id';
            const res = await fetch(`${API_BASE}/api/auth/me?email=${encodeURIComponent(supabaseUser.email)}&uid=${supabaseUser.id}&name=${encodeURIComponent(supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '')}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const d1User = await res.json();
                console.log('[Auth Sync] Synced with D1:', d1User);
                
                const fullUser = { 
                    ...initialUser, 
                    ...d1User,
                    id: d1User.id || initialUser.id, // Ensure canonical ID consistency
                    d1_id: d1User.id 
                };

                // Update both local state and Zustand store
                setUser(fullUser);
                setAuthSession({ user: fullUser, token });
                
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('tamuu_user', JSON.stringify(fullUser));
                    localStorage.setItem('tamuu_token', token);
                }
            }
        } catch (err) {
            console.error('[Auth Sync] Failed to sync with D1:', err);
            setStoreLoading(false);
        }
    };

    useEffect(() => {
        setStoreLoading(true);

        // Initial session check
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            if (isLoggingOut.current) return;
            
            setSession(currentSession);
            if (currentSession?.user) {
                syncWithD1(currentSession.user, currentSession.access_token, currentSession);
            } else {
                setStoreLoading(false);
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            console.log(`[Auth Event] ${event}`);
            
            if (isLoggingOut.current) {
                console.log('[Auth Sync] Skipping event during logout');
                return;
            }

            setSession(newSession);
            
            if (newSession?.user) {
                syncWithD1(newSession.user, newSession.access_token, newSession);
            } else {
                setUser(null);
                setStoreUser(null);
                setStoreToken(null);
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem('tamuu_user');
                    localStorage.removeItem('tamuu_token');
                }
            }
            setIsLoading(false);
            setStoreLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        isLoggingOut.current = true;
        
        // 1. Clear State Immediately
        setUser(null);
        setSession(null);
        setStoreUser(null);
        setStoreToken(null);
        lastSyncedSession.current = null;

        // 2. Clear Shared Cookies (Defensive)
        if (typeof document !== 'undefined') {
            document.cookie = 'sb-mqbgpulironhtvzfpzfp-auth-token=; path=/; domain=.tamuu.id; max-age=0';
            document.cookie = 'tamuu_user=; path=/; domain=.tamuu.id; max-age=0';
            document.cookie = 'tamuu_token=; path=/; domain=.tamuu.id; max-age=0';
        }

        // 3. Supabase Sign Out
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('[Auth SignOut] Supabase error:', err);
        }

        // 4. Final state clear and redirect
        router.push('/login');
        
        // Reset flag after a delay to allow for redirection
        setTimeout(() => {
            isLoggingOut.current = false;
        }, 2000);
    };

    return (
        <AuthContext.Provider value={{ user, session, isAuthenticated, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
