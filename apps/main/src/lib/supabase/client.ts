import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const isProd = typeof window !== 'undefined' && window.location.hostname.endsWith('tamuu.id');
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: isProd ? '.tamuu.id' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: true,
      }
    }
  )
}
