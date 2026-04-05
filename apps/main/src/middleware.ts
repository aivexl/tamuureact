import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isAppPath, isVitePublicPath } from './lib/routing-policy'

/**
 * TAMUU SMART ROUTING ENGINE v4.8.0 (Instant Redirect)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Strict Bi-directional Domain Consistency Enforcement.
 * INSTANT 308 Redirect - NO 404 Page Load Before Redirect!
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // 1. ADVANCED HOST DETECTION (Cloudflare + OpenNext Robustness)
  const host = request.headers.get('host') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host');
  const hostname = (xForwardedHost || host || request.nextUrl.hostname).toLowerCase().split(':')[0];

  // 2. STATIC & INTERNAL BYPASS (Check BEFORE session for speed)
  if (
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname === '/favicon.ico' || 
      pathname === '/sw.js' ||
      pathname.includes('.') ||
      pathname.startsWith('/assets/') ||
      pathname.startsWith('/robots.txt') ||
      pathname.startsWith('/sitemap.xml')
  ) {
    // Return simple response for static assets - no session overhead
    return NextResponse.next();
  }

  // 3. SESSION & BASE RESPONSE
  const { user, response: baseResponse } = await updateSession(request);
  
  // Inject Tracking Headers
  baseResponse.headers.set('x-tamuu-version', '4.8.0-instant-redirect');
  baseResponse.headers.set('x-tamuu-host', hostname);

  // 4. CLASSIFICATION
  const isAppDomain = hostname.startsWith('app.');
  const isPublicDomain = hostname === 'tamuu.id' || hostname === 'www.tamuu.id' || !hostname.includes('.');
  const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
  const isAppRoute = isAppPath(pathname);
  const isVitePublicRoute = isVitePublicPath(pathname);

  // ============================================
  // 5. EDGE REDIRECT ENFORCER (INSTANT - Priority #1)
  // This runs BEFORE any page rendering - NO 404 will be shown!
  // ============================================
  if (!isDev) {
      // A. Public Domain -> App Domain (Instant 308 Redirect)
      // Example: tamuu.id/dashboard → app.tamuu.id/dashboard
      if (isPublicDomain && isAppRoute) {
          const redirectUrl = `https://app.tamuu.id${pathname}${search}`;
          console.log(`[Middleware ⚡] INSTANT Redirect: ${hostname}${pathname} → ${redirectUrl}`);
          
          const redirectRes = NextResponse.redirect(redirectUrl, 308);
          redirectRes.headers.set('x-tamuu-policy', 'edge-public-to-app');
          redirectRes.headers.set('x-tamuu-redirect-reason', 'public-domain-accessing-app-route');
          redirectRes.headers.set('x-tamuu-middleware-version', '4.8.0');
          return redirectRes;
      }

      // B. App Domain -> Public Domain (Instant 308 Redirect)
      // Example: app.tamuu.id/ → tamuu.id/
      if (isAppDomain && !isAppRoute && !isVitePublicRoute) {
          const redirectUrl = `https://tamuu.id${pathname}${search}`;
          console.log(`[Middleware ⚡] INSTANT redirect: ${hostname}${pathname} → ${redirectUrl}`);
          
          const redirectRes = NextResponse.redirect(redirectUrl, 308);
          redirectRes.headers.set('x-tamuu-policy', 'edge-app-to-public');
          redirectRes.headers.set('x-tamuu-redirect-reason', 'app-domain-accessing-public-route');
          redirectRes.headers.set('x-tamuu-middleware-version', '4.8.0');
          return redirectRes;
      }
  }

  // ============================================
  // 6. PROXY DELEGATION (Vite vs Next.js)
  // ============================================
  
  // A. App content on App Domain -> PROXY to Vite
  if (isAppDomain && isAppRoute) {
      const targetUrl = new URL(pathname + search, 'https://tamuu-app.pages.dev');
      const proxyRes = NextResponse.rewrite(targetUrl);
      
      // Transfer session and headers
      baseResponse.headers.forEach((v, k) => proxyRes.headers.set(k, v));
      baseResponse.cookies.getAll().forEach(c => proxyRes.cookies.set(c.name, c.value, c));
      
      proxyRes.headers.set('x-tamuu-policy', 'proxy-to-vite-app');
      proxyRes.headers.set('x-tamuu-middleware-version', '4.8.0');
      return proxyRes;
  }

  // B. Public Vite content on any domain -> PROXY to Vite
  if (isVitePublicRoute) {
      const targetUrl = new URL(pathname + search, 'https://tamuu-app.pages.dev');
      const proxyRes = NextResponse.rewrite(targetUrl);
      
      // Transfer session and headers
      baseResponse.headers.forEach((v, k) => proxyRes.headers.set(k, v));
      baseResponse.cookies.getAll().forEach(c => proxyRes.cookies.set(c.name, c.value, c));
      
      proxyRes.headers.set('x-tamuu-policy', 'proxy-to-vite-public');
      proxyRes.headers.set('x-tamuu-middleware-version', '4.8.0');
      return proxyRes;
  }

  // ============================================
  // 7. FALLBACK: Serve via Next.js (tamuu.id Public Routes)
  // ============================================
  baseResponse.headers.set('x-tamuu-policy', 'native-nextjs');
  baseResponse.headers.set('x-tamuu-middleware-version', '4.8.0');
  return baseResponse;
}

export const config = {
  matcher: [
    /*
     * Match ALL paths except:
     * - API routes
     * - Next.js static files
     * - Next.js image optimization
     * - Favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
