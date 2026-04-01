import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          const host = request.headers.get('host') || '';
          const isProd = host.endsWith('tamuu.id');
          const domain = isProd ? '.tamuu.id' : undefined;

          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options, domain, sameSite: 'lax', secure: true });
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options, domain, sameSite: 'lax', secure: true });
          })
        },
      },
    }
  )

  // This will refresh session if expired - essential for SSR
  const { data: { user } } = await supabase.auth.getUser()

  return { user, response }
}
