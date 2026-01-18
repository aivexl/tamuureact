import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing environment variables. Please check your .env.local file.');
}

/**
 * Enterprise-grade Supabase client singleton
 * Configured for cross-subdomain authentication (tamuu.id <-> app.tamuu.id)
 */
const isProduction = typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('tamuu.id') || window.location.hostname === 'tamuu.id');

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            // Cross-subdomain cookie configuration for production
            // This allows session sharing between tamuu.id and app.tamuu.id
            ...(isProduction && {
                storage: {
                    getItem: (key: string) => {
                        if (typeof document === 'undefined') return null;
                        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
                        return match ? decodeURIComponent(match[2]) : null;
                    },
                    setItem: (key: string, value: string) => {
                        if (typeof document === 'undefined') return;
                        // Set cookie with .tamuu.id domain for cross-subdomain sharing
                        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; domain=.tamuu.id; max-age=31536000; SameSite=Lax; Secure`;
                    },
                    removeItem: (key: string) => {
                        if (typeof document === 'undefined') return;
                        document.cookie = `${key}=; path=/; domain=.tamuu.id; max-age=0`;
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
