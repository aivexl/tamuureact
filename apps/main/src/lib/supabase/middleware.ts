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
          cookiesToSet.forEach(({ name, value, options }) => {
            const domain = process.env.NODE_ENV === 'production' ? '.tamuu.id' : undefined;
            request.cookies.set({ name, value, ...options, domain, sameSite: 'lax', secure: true });
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            const domain = process.env.NODE_ENV === 'production' ? '.tamuu.id' : undefined;
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
