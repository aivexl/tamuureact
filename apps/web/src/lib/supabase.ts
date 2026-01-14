import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing environment variables. Please check your .env.local file.');
}

/**
 * Enterprise-grade Supabase client singleton
 */
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    }
);

// Helper for generic error handling
export const handleSupabaseError = (error: any) => {
    if (!error) return null;
    console.error('[Supabase Error]', error.message || error);
    return error.message || 'Terjadi kesalahan sistem. Silakan coba lagi.';
};
