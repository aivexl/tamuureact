import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // 1. SESSION REFRESH (Supabase Standard)
  const { user, response } = await updateSession(request)

  // 2. DOMAIN REDIRECTION LOGIC
  // If user is on public domain but trying to access app routes, redirect to app subdomain
  const isPublicDomain = host === 'tamuu.id' || host === 'www.tamuu.id' || (host.endsWith('pages.dev') && !host.includes('tamuu-app'));
  
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAppRoute = pathname.startsWith('/dashboard') || 
                     pathname.startsWith('/onboarding') ||
                     pathname.startsWith('/editor') ||
                     pathname.startsWith('/profile') ||
                     pathname.startsWith('/admin') ||
                     pathname.startsWith('/vendor') ||
                     pathname.startsWith('/billing') ||
                     pathname.startsWith('/upgrade') ||
                     pathname.startsWith('/guests') ||
                     pathname.startsWith('/wishes');

  // Logic A: Authenticated users should not see login/signup
  if (user && isAuthRoute) {
    console.log(`[Middleware] Authenticated user on auth route ${pathname}, redirecting to app dashboard`);
    const redirectResponse = NextResponse.redirect(`https://app.tamuu.id/dashboard`);
    // Copy cookies to ensure refreshed session is preserved
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Logic B: Cross-domain handoff (public domain -> app subdomain)
  if (isPublicDomain && isAppRoute) {
    console.log(`[Middleware] Redirecting app route ${pathname} from ${host} to app.tamuu.id`);
    const redirectResponse = NextResponse.redirect(`https://app.tamuu.id${pathname}${url.search}`);
    // Copy cookies to ensure refreshed session is preserved
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
