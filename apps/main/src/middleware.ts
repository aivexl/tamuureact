import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * TAMUU SMART ROUTING ENGINE v4.4.0 (Enterprise Standard)
 * ═══════════════════════════════════════════════════════════════════════════════
 * High-performance, bi-directional routing enforcer for multi-domain ecosystems.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// CENTRAL ROUTE POLICY (App Paths must live on app.tamuu.id)
const APP_PATHS = [
    '/login', '/signup', '/forgot-password', '/auth',
    '/dashboard', '/editor', '/profile', '/billing',
    '/upgrade', '/guests', '/wishes', '/admin',
    '/vendor', '/onboarding', '/invitations'
];

const isAppPath = (path: string) => APP_PATHS.some(p => path.startsWith(p));

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // 1. Hostname Detection (Cloudflare Edge Optimized)
  const hostHeader = request.headers.get('host') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host');
  const hostname = (xForwardedHost || hostHeader).toLowerCase().split(':')[0];

  // 2. Session Integrity (Root domain cookie sync)
  const { user, response } = await updateSession(request);
  
  // Diagnostic Headers
  response.headers.set('x-tamuu-version', '4.4.0-enterprise');
  response.headers.set('x-tamuu-host', hostname);

  // 3. Early Bypass (Assets & Internal)
  if (
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname === '/favicon.ico' || 
      pathname === '/sw.js' ||
      pathname.includes('.') // Static files (.js, .css, .png, etc.)
  ) {
    return response;
  }

  // 4. Domain & Path Classification
  const isAppHost = hostname.includes('app.tamuu.id');
  const isPublicHost = hostname === 'tamuu.id' || hostname === 'www.tamuu.id';
  const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
  const isAppRoute = isAppPath(pathname);

  // ============================================
  // 5. SMART REDIRECT ENFORCER (Bi-directional)
  // ============================================
  if (!isDev) {
      // Case A: App path on Public Domain -> REDIRECT to App Domain
      if (isPublicHost && isAppRoute) {
          const redirectUrl = new URL(`https://app.tamuu.id${pathname}${search}`, request.url);
          const redirectRes = NextResponse.redirect(redirectUrl, 308);
          response.headers.forEach((v, k) => redirectRes.headers.set(k, v));
          response.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c));
          redirectRes.headers.set('x-tamuu-policy', 'public-to-app-redirect');
          return redirectRes;
      }

      // Case B: Public path on App Domain -> REDIRECT to Public Domain
      if (isAppHost && !isAppRoute) {
          const redirectUrl = new URL(`https://tamuu.id${pathname}${search}`, request.url);
          const redirectRes = NextResponse.redirect(redirectUrl, 308);
          response.headers.forEach((v, k) => redirectRes.headers.set(k, v));
          response.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c));
          redirectRes.headers.set('x-tamuu-policy', 'app-to-public-redirect');
          return redirectRes;
      }
  }

  // ============================================
  // 6. FRAMEWORK DELEGATION (Next.js vs Vite SPA)
  // ============================================
  
  // All App paths on app.tamuu.id are handled by the Vite SPA
  if (isAppHost && isAppRoute) {
      const targetUrl = new URL(pathname + search, 'https://tamuu-app.pages.dev');
      const proxyRes = NextResponse.rewrite(targetUrl);
      
      // Sync auth state to the proxy response
      response.headers.forEach((v, k) => proxyRes.headers.set(k, v));
      response.cookies.getAll().forEach(c => proxyRes.cookies.set(c.name, c.value, c));
      
      proxyRes.headers.set('x-tamuu-policy', 'vite-spa-proxy');
      return proxyRes;
  }

  // Fallback to Next.js (Home, Shop, Blog, etc. on tamuu.id)
  response.headers.set('x-tamuu-policy', 'nextjs-native');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
