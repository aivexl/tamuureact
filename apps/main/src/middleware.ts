import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isAppPath, isVitePublicPath } from './lib/routing-policy'

/**
 * TAMUU SMART ROUTING ENGINE v4.7.0 (Auto-Pilot)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Strict Bi-directional Domain Consistency Enforcement.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // 1. ADVANCED HOST DETECTION (Cloudflare + OpenNext Robustness)
  const host = request.headers.get('host') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host');
  const hostname = (xForwardedHost || host || request.nextUrl.hostname).toLowerCase().split(':')[0];

  // 2. SESSION & BASE RESPONSE
  const { user, response: baseResponse } = await updateSession(request);
  
  // Inject Tracking Headers
  baseResponse.headers.set('x-tamuu-version', '4.5.0-universal');
  baseResponse.headers.set('x-tamuu-host', hostname);

  // 3. STATIC & INTERNAL BYPASS
  if (
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname === '/favicon.ico' || 
      pathname === '/sw.js' ||
      pathname.includes('.') ||
      pathname.startsWith('/assets/')
  ) {
    return baseResponse;
  }

  // 4. CLASSIFICATION
  const isAppDomain = hostname.startsWith('app.');
  const isPublicDomain = hostname === 'tamuu.id' || hostname === 'www.tamuu.id' || !hostname.includes('.');
  const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
  const isAppRoute = isAppPath(pathname);

  // ============================================
  // 5. EDGE REDIRECT ENFORCER (Absolute Priority)
  // ============================================
  if (!isDev) {
      // A. Public -> App (Strict)
      if (isPublicDomain && isAppRoute) {
          const redirectUrl = new URL(`https://app.tamuu.id${pathname}${search}`, request.url);
          const redirectRes = NextResponse.redirect(redirectUrl, 308);
          // Sync headers/cookies to the new response
          baseResponse.headers.forEach((v, k) => redirectRes.headers.set(k, v));
          baseResponse.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c));
          redirectRes.headers.set('x-tamuu-policy', 'edge-public-to-app');
          return redirectRes;
      }

      // B. App -> Public (Strict)
      if (isAppDomain && !isAppRoute) {
          const redirectUrl = new URL(`https://tamuu.id${pathname}${search}`, request.url);
          const redirectRes = NextResponse.redirect(redirectUrl, 308);
          baseResponse.headers.forEach((v, k) => redirectRes.headers.set(k, v));
          baseResponse.cookies.getAll().forEach(c => redirectRes.cookies.set(c.name, c.value, c));
          redirectRes.headers.set('x-tamuu-policy', 'edge-app-to-public');
          return redirectRes;
      }
  }

  // ============================================
  // 6. PROXY DELEGATION (Vite vs Next.js)
  // ============================================
  const isVitePublicRoute = isVitePublicPath(pathname);
  
  // A. App content on App Domain -> PROXY to Vite
  // B. Public Vite content on any domain (already redirected if needed) -> PROXY to Vite
  if ((isAppDomain && isAppRoute) || isVitePublicRoute) {
      const targetUrl = new URL(pathname + search, 'https://tamuu-app.pages.dev');
      const proxyRes = NextResponse.rewrite(targetUrl);
      
      // Transfer session and headers
      baseResponse.headers.forEach((v, k) => proxyRes.headers.set(k, v));
      baseResponse.cookies.getAll().forEach(c => proxyRes.cookies.set(c.name, c.value, c));
      
      proxyRes.headers.set('x-tamuu-policy', 'proxy-to-vite');
      return proxyRes;
  }

  // Otherwise, serve via Next.js (tamuu.id Public Routes)
  baseResponse.headers.set('x-tamuu-policy', 'native-nextjs');
  return baseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
