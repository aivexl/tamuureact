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

  // 2. STATIC & INTERNAL BYPASS (Only Next.js internals - NOT Vite assets!)
  // ⚠️ IMPORTANT: Do NOT bypass /assets/ or files with dots - those are Vite assets!
  if (
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname === '/favicon.ico' || 
      pathname === '/sw.js' ||
      pathname.startsWith('/robots.txt') ||
      pathname.startsWith('/sitemap.xml')
  ) {
    // Return simple response for Next.js static assets - no session overhead
    return NextResponse.next();
  }

  // 3. SESSION & BASE RESPONSE
  const { user, response: baseResponse } = await updateSession(request);
  
  // Inject Tracking Headers
  baseResponse.headers.set('x-tamuu-version', '4.8.1-asset-fix');
  baseResponse.headers.set('x-tamuu-host', hostname);

  // 4. CLASSIFICATION
  const isAppDomain = hostname.startsWith('app.');
  const isPublicDomain = hostname === 'tamuu.id' || hostname === 'www.tamuu.id' || !hostname.includes('.');
  const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
  const isAppRoute = isAppPath(pathname);
  const isVitePublicRoute = isVitePublicPath(pathname);

  // ============================================
  // 4.5 BOT DETECTION (For SEO Injection)
  // ============================================
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /bot|crawler|spider|facebookexternalhit|whatsapp|google|bing|yandex|slack|twitterbot/i.test(userAgent);

  // ============================================
  // 5. ASSET PROXY (Priority #1 - Before Redirects!)
  // Assets must be proxied BEFORE domain enforcement
  // ============================================
  
  // A. Proxy all asset files to Vite app (regardless of domain)
  if (pathname.startsWith('/assets/') || pathname.startsWith('/images/') || pathname.match(/\.(js|css|webp|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      const targetUrl = new URL(pathname + search, 'https://tamuu-app.pages.dev');
      const proxyRes = NextResponse.rewrite(targetUrl);
      
      // Transfer session and headers
      baseResponse.headers.forEach((v, k) => proxyRes.headers.set(k, v));
      baseResponse.cookies.getAll().forEach(c => proxyRes.cookies.set(c.name, c.value, c));
      
      proxyRes.headers.set('x-tamuu-policy', 'proxy-to-vite-assets');
      proxyRes.headers.set('x-tamuu-middleware-version', '4.8.2-asset-priority');
      return proxyRes;
  }

  // ============================================
  // 6. EDGE REDIRECT ENFORCER (INSTANT - Priority #2)
  // This runs AFTER asset proxy - NO 404 will be shown!
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
          redirectRes.headers.set('x-tamuu-middleware-version', '4.8.2-asset-priority');
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
          redirectRes.headers.set('x-tamuu-middleware-version', '4.8.2-asset-priority');
          return redirectRes;
      }
  }

  // ============================================
  // 7. PROXY DELEGATION (Vite vs Next.js)
  // ============================================
  
  // A. App content on App Domain -> PROXY to Vite
  if (isAppDomain && isAppRoute) {
      const targetUrl = new URL(pathname + search, 'https://tamuu-app.pages.dev');
      const proxyRes = NextResponse.rewrite(targetUrl);
      
      // Transfer session and headers
      baseResponse.headers.forEach((v, k) => proxyRes.headers.set(k, v));
      baseResponse.cookies.getAll().forEach(c => proxyRes.cookies.set(c.name, c.value, c));
      
      proxyRes.headers.set('x-tamuu-policy', 'proxy-to-vite-app');
      proxyRes.headers.set('x-tamuu-middleware-version', '4.8.2-asset-priority');
      return proxyRes;
  }

  // B. Public Vite content on any domain -> PROXY to Vite
  if (isVitePublicRoute) {
      // SEO BOT REDIRECTION: If it's a crawler and hitting a shop/product detail, 
      // rewrite to our Next.js SEO shell instead of proxying to Vite.
      if (isBot) {
          const productMatch = pathname.match(/\/shop\/[^\/]+\/([^\/]+)/);
          const shortProductMatch = pathname.match(/\/product\/([^\/]+)/);
          
          if (productMatch || shortProductMatch) {
              const productId = productMatch ? productMatch[1] : shortProductMatch?.[1];
              const slug = productMatch ? pathname.split('/')[2] : 'umum';
              
              const seoUrl = new URL(`/shop/${slug}/${productId}/seo-bot`, request.url);
              console.log(`[Middleware 🤖] SEO Bot Detected. Rewriting to SEO Shell: ${seoUrl.pathname}`);
              return NextResponse.rewrite(seoUrl);
          }

          const storefrontMatch = pathname.match(/\/shop\/([^\/]+)$/);
          if (storefrontMatch && !pathname.includes('.')) {
              const slug = storefrontMatch[1];
              const seoUrl = new URL(`/shop/${slug}/seo-bot`, request.url);
              console.log(`[Middleware 🤖] SEO Bot Detected. Rewriting to Storefront SEO Shell: ${seoUrl.pathname}`);
              return NextResponse.rewrite(seoUrl);
          }
      }

      const targetUrl = new URL(pathname + search, 'https://tamuu-app.pages.dev');
      const proxyRes = NextResponse.rewrite(targetUrl);
      
      // Transfer session and headers
      baseResponse.headers.forEach((v, k) => proxyRes.headers.set(k, v));
      baseResponse.cookies.getAll().forEach(c => proxyRes.cookies.set(c.name, c.value, c));
      
      proxyRes.headers.set('x-tamuu-policy', 'proxy-to-vite-public');
      proxyRes.headers.set('x-tamuu-middleware-version', '4.8.2-asset-priority');
      return proxyRes;
  }

  // ============================================
  // 8. FALLBACK: Serve via Next.js (tamuu.id Public Routes)
  // ============================================
  baseResponse.headers.set('x-tamuu-policy', 'native-nextjs');
  baseResponse.headers.set('x-tamuu-middleware-version', '4.8.2-asset-priority');
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
