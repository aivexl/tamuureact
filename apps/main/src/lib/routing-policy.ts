/**
 * TAMUU MASTER ROUTING POLICY v5.1.0 (Complete Coverage)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Single Source of Truth for domain and framework delegation.
 * This file acts as the primary mapping for the Universal Bridge.
 * 
 * Based on: ARCHITECTURE.md & DOMAIN_POLICY.md
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// 1. APP DOMAIN PATHS (MUST live on app.tamuu.id - Vite Hub)
// These are authenticated/management routes that require instant redirect
export const APP_PATHS = [
    // Auth Routes
    '/login',
    '/signup',
    '/forgot-password',
    '/auth',
    
    // User Setup
    '/onboarding',
    
    // Core App Routes
    '/dashboard',
    '/editor',
    '/profile',
    '/billing',
    '/upgrade',
    '/guests',
    '/wishes',
    
    // Admin & Vendor
    '/vendor',
    '/admin',
    
    // Additional App Routes
    '/ai-chat',
    '/notifications'
];

// 2. PUBLIC VITE PATHS (Served by Vite proxy on tamuu.id)
// These are public-facing routes that use Vite but stay on tamuu.id
export const VITE_PUBLIC_PATHS = [
    '/invitations',
    '/preview',
    '/v/',
    '/c/',
    '/templates',
    '/preview-invitation'
];

// 3. NEXT.js NATIVE PATHS (Marketing/SEO pages on tamuu.id)
// These are SEO-rich pages served natively by Next.js
export const NEXTJS_PUBLIC_PATHS = [
    '/',
    '/undangan-digital',
    '/blog',
    '/shop',
    '/product',
    '/support',
    '/about',
    '/terms',
    '/privacy',
    '/contact',
    '/pricing',
    '/wedding-marketplace'
];

/**
 * Helper to check if a path belongs to the Application Hub
 * Returns TRUE for exact matches AND subpaths
 * Example: /dashboard → TRUE, /dashboard/settings → TRUE
 */
export const isAppPath = (pathname: string): boolean => {
    // Normalize pathname to remove trailing slash for comparison
    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
    return APP_PATHS.some(p => cleanPath === p || cleanPath.startsWith(p + '/'));
};

/**
 * Helper to check if a path is a public route served by Vite (Proxy)
 * Returns TRUE for exact matches AND subpaths
 * Example: /preview → TRUE, /preview/wedding-123 → TRUE
 */
export const isVitePublicPath = (pathname: string): boolean => {
    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
    return VITE_PUBLIC_PATHS.some(p => cleanPath === p || cleanPath.startsWith(p + '/'));
};

/**
 * Helper to check if a path is a native Next.js page
 * Returns TRUE for exact matches AND subpaths
 * Example: /blog → TRUE, /blog/my-post → TRUE
 */
export const isNextjsPath = (pathname: string): boolean => {
    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
    return NEXTJS_PUBLIC_PATHS.some(p => cleanPath === p || cleanPath.startsWith(p + '/'));
};

/**
 * Helper to determine which domain a path should live on
 * Returns: 'app' | 'public' | 'vite-public'
 */
export const getTargetDomain = (pathname: string): 'app' | 'public' | 'vite-public' => {
    if (isAppPath(pathname)) return 'app';
    if (isVitePublicPath(pathname)) return 'vite-public';
    return 'public';
};
