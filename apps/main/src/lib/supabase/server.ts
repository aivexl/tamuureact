import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            const host = cookieStore.get('host')?.value || '';
            const isProd = host.endsWith('tamuu.id') || true; // Server-side usually implies prod or proxy
            const domain = isProd ? '.tamuu.id' : undefined;

            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                domain,
                path: '/'
              })
            )
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  )
}
