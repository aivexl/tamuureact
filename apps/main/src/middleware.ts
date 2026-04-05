import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * TAMUU SMART ROUTING ENGINE v4.3.0 (Absolute Consistency)
 * ═══════════════════════════════════════════════════════════════════════════════
 * This engine enforces a strict policy:
 * - App Routes (Private/Mgmt): MUST live on app.tamuu.id
 * - Public Routes (Marketing/Shop): MUST live on tamuu.id
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const isAppPath = (pathname: string): boolean => {
    return pathname.startsWith('/login') || 
           pathname.startsWith('/signup') || 
           pathname.startsWith('/forgot-password') || 
           pathname.startsWith('/auth') ||
           pathname.startsWith('/dashboard') || 
           pathname.startsWith('/editor') ||
           pathname.startsWith('/profile') ||
           pathname.startsWith('/billing') ||
           pathname.startsWith('/upgrade') ||
           pathname.startsWith('/guests') ||
           pathname.startsWith('/wishes') ||
           pathname.startsWith('/admin') ||
           pathname.startsWith('/vendor') ||
           pathname.startsWith('/onboarding') ||
           pathname.startsWith('/invitations'); // Invitations MGMT/Store is part of the app
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0];
  const pathname = url.pathname;

  // 1. Session Refresh (Essential for SSR Auth)
  const { user, response } = await updateSession(request)
  
  response.headers.set('x-tamuu-version', '4.3.0-absolute');
  response.headers.set('x-tamuu-host', host);

  // ============================================
  // 1. BYPASS LOGIC (Assets & Internals)
  // ============================================
  
  // A. Internal Next.js & API
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico' || pathname === '/sw.js') {
    return response;
  }

  // B. Vite Static Assets Proxy
  if (pathname.startsWith('/assets/') || pathname.endsWith('.css') || pathname.endsWith('.js') || pathname.endsWith('.woff2') || pathname.endsWith('.png') || pathname.endsWith('.jpg') || pathname.endsWith('.svg')) {
    const assetUrl = new URL(pathname + url.search, 'https://tamuu-app.pages.dev');
    const proxyResponse = NextResponse.rewrite(assetUrl);
    response.headers.forEach((v, k) => proxyResponse.headers.set(k, v));
    response.cookies.getAll().forEach((cookie) => proxyResponse.cookies.set(cookie.name, cookie.value, cookie));
    return proxyResponse;
  }

  // ============================================
  // 2. DOMAIN ENFORCEMENT (CTO Level Strictness)
  // ============================================
  const isAppHost = host === 'app.tamuu.id';
  const isPublicHost = host === 'tamuu.id' || host === 'www.tamuu.id';
  const isDev = host === 'localhost' || host === '127.0.0.1';
  
  const isAppRoute = isAppPath(pathname);
  const isPublicRoute = !isAppRoute && !pathname.includes('.');

  if (!isDev) {
      // Enforcement A: App content MUST be on app.tamuu.id
      if (isPublicHost && isAppRoute) {
          const redirectUrl = new URL(`https://app.tamuu.id${pathname}${url.search}`, request.url);
          const redirectResponse = NextResponse.redirect(redirectUrl, 308);
          // Sync cookies/headers to redirect
          response.headers.forEach((v, k) => redirectResponse.headers.set(k, v));
          response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie.name, cookie.value, cookie));
          return redirectResponse;
      }

      // Enforcement B: Public content MUST be on tamuu.id
      if (isAppHost && isPublicRoute) {
          const redirectUrl = new URL(`https://tamuu.id${pathname}${url.search}`, request.url);
          const redirectResponse = NextResponse.redirect(redirectUrl, 308);
          response.headers.forEach((v, k) => redirectResponse.headers.set(k, v));
          response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie.name, cookie.value, cookie));
          return redirectResponse;
      }
  }

  // ============================================
  // 3. FRAMEWORK DELEGATION (Next.js vs Vite)
  // ============================================
  
  // Routes served by the Vite SPA (apps/web)
  const isViteRoute = 
    pathname.startsWith('/invitations') ||
    pathname.startsWith('/preview') ||
    pathname.startsWith('/v/') ||
    pathname.startsWith('/c/') ||
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/editor') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/upgrade') ||
    pathname.startsWith('/guests') ||
    pathname.startsWith('/wishes') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/vendor') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/onboarding');

  if (isViteRoute) {
    const legacyUrl = new URL(pathname + url.search, 'https://tamuu-app.pages.dev');
    const proxyResponse = NextResponse.rewrite(legacyUrl);
    // Sync cookies/headers to proxy
    response.headers.forEach((v, k) => proxyResponse.headers.set(k, v));
    response.cookies.getAll().forEach((cookie) => proxyResponse.cookies.set(cookie.name, cookie.value, cookie));
    return proxyResponse;
  }

  // All other routes (Homepage, /shop, /blog, etc.) served by Next.js
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
