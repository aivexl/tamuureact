import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // 1. SESSION REFRESH (Supabase Standard)
  const { user, response } = await updateSession(request)
  
  // Add debug header to confirm worker is hit
  response.headers.set('x-tamuu-version', '2.1.0-unified-master');

  // 2. DOMAIN REDIRECTION LOGIC
  const isAppDomain = host.startsWith('app.tamuu.id');
  const isPublicDomain = (host === 'tamuu.id' || host === 'www.tamuu.id') || 
                        (host.endsWith('pages.dev') && !host.includes('tamuu-app') && !host.includes('app.tamuu'));
  
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname.startsWith('/auth');
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

  // STRATEGY: Proxy complex app routes to Legacy Vite (tamuu-app.pages.dev)
  // This restores the rich "7-day-ago" UI immediately while maintaining Next.js 15 Auth Shell.
  const isAsset = pathname.startsWith('/assets/');
  
  if ((isAppRoute || isAsset) && isAppDomain) {
    console.log(`[Middleware] Proxying ${pathname} to Legacy Vite`);
    const legacyUrl = new URL(pathname + url.search, 'https://tamuu-app.pages.dev');
    const proxyResponse = NextResponse.rewrite(legacyUrl);
    
    // Copy auth state from current response to the proxy response
    response.headers.forEach((v, k) => proxyResponse.headers.set(k, v));
    response.cookies.getAll().forEach((cookie) => {
      proxyResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return proxyResponse;
  }

  // Logic A: Authenticated users should not see login/signup/forgot-password
  if (user && isAuthRoute) {
    console.log(`[Middleware] Auth user on auth route ${pathname}, redirecting to dashboard`);
    // ALWAYS use relative redirect if already on app domain to avoid full URL loops
    const targetPath = '/dashboard';
    const redirectResponse = isAppDomain 
      ? NextResponse.redirect(new URL(targetPath, request.url))
      : NextResponse.redirect(new URL(`https://app.tamuu.id${targetPath}`, request.url));
    
    // Copy headers and cookies
    response.headers.forEach((v, k) => redirectResponse.headers.set(k, v));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Logic B: Unauthenticated users should not see app routes
  if (!user && isAppRoute) {
    console.log(`[Middleware] Guest on app route ${pathname}, redirecting to login`);
    const targetPath = `/login?return_to=${encodeURIComponent(pathname)}`;
    const redirectResponse = isAppDomain 
      ? NextResponse.redirect(new URL(targetPath, request.url))
      : NextResponse.redirect(new URL(`https://app.tamuu.id${targetPath}`, request.url));

    response.headers.forEach((v, k) => redirectResponse.headers.set(k, v));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // Logic C: Cross-domain handoff (public domain -> app subdomain) for app routes
  if (isPublicDomain && isAppRoute) {
    console.log(`[Middleware] Redirecting app route ${pathname} from ${host} to app.tamuu.id`);
    const redirectResponse = NextResponse.redirect(new URL(`https://app.tamuu.id${pathname}${url.search}`, request.url));
    response.headers.forEach((v, k) => redirectResponse.headers.set(k, v));
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
