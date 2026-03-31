import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing environment variables. Please check your .env.local file.');
}

/**
 * Enterprise-grade Supabase client singleton
 * Configured for cross-subdomain authentication (tamuu.id <-> app.tamuu.id)
 * Replicates EXACT legacy logic from 7 days ago.
 */
const isProduction = typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('tamuu.id') || window.location.hostname === 'tamuu.id');

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: true,
            // CRITICAL: Robust Cross-Subdomain Cookie Logic
            ...(isProduction && {
                storage: {
                    getItem: (key: string) => {
                        if (typeof document === 'undefined') return null;
                        
                        // 1. Try to read as a single cookie first
                        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
                        let value = match ? decodeURIComponent(match[2]) : null;
                        
                        // 2. If not found, try to read as chunked cookies (key.0, key.1, ...)
                        // This ensures compatibility with @supabase/ssr used in Next.js
                        if (!value) {
                            let chunkedValue = '';
                            let i = 0;
                            while (true) {
                                const chunkMatch = document.cookie.match(new RegExp('(^| )' + key + '\\.' + i + '=([^;]+)'));
                                if (chunkMatch) {
                                    chunkedValue += decodeURIComponent(chunkMatch[2]);
                                    i++;
                                } else {
                                    break;
                                }
                            }
                            value = chunkedValue || null;
                        }

                        if (!value) return null;

                        // 3. Handle base64- prefix (standard for @supabase/ssr)
                        if (value.startsWith('base64-')) {
                            try {
                                return atob(value.slice(7));
                            } catch (e) {
                                console.error('[Supabase Storage] Failed to decode base64 session', e);
                                return null;
                            }
                        }
                        
                        return value;
                    },
                    setItem: (key: string, value: string) => {
                        if (typeof document === 'undefined') return;
                        // Set cookie with .tamuu.id domain for cross-subdomain sharing
                        // Note: Standard supabase-js doesn't auto-chunk, but browser has 4KB limit
                        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; domain=.tamuu.id; max-age=31536000; SameSite=Lax; Secure`;
                    },
                    removeItem: (key: string) => {
                        if (typeof document === 'undefined') return;
                        // Remove all possible chunks just in case
                        document.cookie = `${key}=; path=/; domain=.tamuu.id; max-age=0`;
                        for (let i = 0; i < 10; i++) {
                            document.cookie = `${key}.${i}=; path=/; domain=.tamuu.id; max-age=0`;
                        }
                    },
                },
            }),
        },
    }
);

// Helper for generic error handling
export const handleSupabaseError = (error: any) => {
    if (!error) return null;
    console.error('[Supabase Error]', error.message || error);
    return error.message || 'Terjadi kesalahan sistem. Silakan coba lagi.';
};
