import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mqbgpulironhtvzfpzfp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xYmdwdWxpcm9uaHR2emZwemZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzcwNDksImV4cCI6MjA4MjMxMzA0OX0.wFmTRftjHuBj-vQ2gcZ_pJzVNkcJCAPbWl7fnfWUniU';

/**
 * Supabase client for Tamuu Next.js
 * Optimized for cross-subdomain session sharing (tamuu.id <-> app.tamuu.id)
 * Replicates EXACT legacy logic from 7 days ago.
 */
const isProduction = typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('tamuu.id') || window.location.hostname === 'tamuu.id');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
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
                    // This ensures compatibility with @supabase/ssr used in Next.js middleware
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
                            const base64Content = value.slice(7);
                            return atob(base64Content);
                        } catch (e) {
                            console.error('[Supabase Storage] Failed to decode base64 session', e);
                            return null;
                        }
                    }
                    
                    return value;
                },
                setItem: (key: string, value: any) => {
                    if (typeof document === 'undefined') return;
                    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                    // Legacy Domain Spec: .tamuu.id ensures session is shared across all subdomains
                    document.cookie = `${key}=${encodeURIComponent(stringValue)}; path=/; domain=.tamuu.id; max-age=31536000; SameSite=Lax; Secure`;
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
});
