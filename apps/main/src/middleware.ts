import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * TAMUU SMART ROUTING ENGINE v4.1 (Strict Enforcement)
 * All domains rely on a single source of truth for routing.
 */

// SINGLE SOURCE OF TRUTH (Matches lib/utils.ts isAppPath)
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
           pathname.startsWith('/onboarding');
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // 1. Session Refresh (Essential for SSR Auth)
  const { user, response } = await updateSession(request)
  
  response.headers.set('x-tamuu-version', '4.1.0-strict-synergy');

  const isAppDomain = host.includes('app.tamuu.id');
  const isPublicDomain = !isAppDomain && !host.includes('tamuu-app.pages.dev');

  // ============================================
  // 1. BYPASS LOGIC (Assets & Internals)
  // ============================================
  
  // A. Next.js Internal Resources (Bypass to Next.js)
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico' || pathname === '/sw.js') {
    return response;
  }

  // B. CRITICAL: Force Redirect for /upgrade (Ensures no 404 on tamuu.id/upgrade)
  if (isPublicDomain && pathname.startsWith('/upgrade')) {
      const redirectUrl = new URL(`https://app.tamuu.id${pathname}${url.search}`, request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl, 308);
      response.headers.forEach((v, k) => redirectResponse.headers.set(k, v));
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie.name, cookie.value, cookie));
      return redirectResponse;
  }

  // B. Vite Static Assets Proxy (Explicit delegate to Vite backend)
  if (pathname.startsWith('/assets/') || pathname.endsWith('.css') || pathname.endsWith('.js') || pathname.endsWith('.woff2')) {
    const assetUrl = new URL(pathname + url.search, 'https://tamuu-app.pages.dev');
    const proxyResponse = NextResponse.rewrite(assetUrl);
    response.headers.forEach((v, k) => proxyResponse.headers.set(k, v));
    response.cookies.getAll().forEach((cookie) => proxyResponse.cookies.set(cookie.name, cookie.value, cookie));
    return proxyResponse;
  }

  // ============================================
  // 2. ROUTE CLASSIFICATION (v4.1 Policy)
  // ============================================
  const isAppRoute = isAppPath(pathname);
  const isPublicRoute = !isAppRoute && !pathname.includes('.');

  // ============================================
  // 3. SMART ENFORCEMENT (308 Permanent)
  // ============================================

  // Enforcement 1: Move App content from Public domain -> app.tamuu.id
  if (isPublicDomain && isAppRoute) {
    const redirectUrl = new URL(`https://app.tamuu.id${pathname}${url.search}`, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl, 308);
    response.headers.forEach((v, k) => redirectResponse.headers.set(k, v));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie.name, cookie.value, cookie));
    return redirectResponse;
  }

  // Enforcement 2: Move Public content from App domain -> tamuu.id
  if (isAppDomain && isPublicRoute) {
    const redirectUrl = new URL(`https://tamuu.id${pathname}${url.search}`, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl, 308);
    response.headers.forEach((v, k) => redirectResponse.headers.set(k, v));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie.name, cookie.value, cookie));
    return redirectResponse;
  }

  // ============================================
  // 4. FRAMEWORK DELEGATION (Next.js vs Vite)
  // ============================================
  
  // Routes served by the Legacy Vite App (apps/web)
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
    pathname.startsWith('/vendor');

  if (isViteRoute) {
    const legacyUrl = new URL(pathname + url.search, 'https://tamuu-app.pages.dev');
    const proxyResponse = NextResponse.rewrite(legacyUrl);
    response.headers.forEach((v, k) => proxyResponse.headers.set(k, v));
    response.cookies.getAll().forEach((cookie) => proxyResponse.cookies.set(cookie.name, cookie.value, cookie));
    return proxyResponse;
  }

  // All other routes (Homepage, /shop, /blog, /vendor, etc.) served by Next.js
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
