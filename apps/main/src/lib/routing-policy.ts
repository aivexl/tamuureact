/**
 * TAMUU MASTER ROUTING POLICY
 * ═══════════════════════════════════════════════════════════════════════════════
 * Single Source of Truth for domain and framework delegation.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// 1. APP DOMAIN PATHS (MUST live on app.tamuu.id)
export const APP_PATHS = [
    '/login',
    '/signup',
    '/forgot-password',
    '/auth',
    '/onboarding',
    '/dashboard',
    '/editor',
    '/profile',
    '/billing',
    '/upgrade',
    '/guests',
    '/wishes',
    '/vendor',
    '/admin',
];

// 2. PUBLIC VITE PATHS (Served by Vite but MUST live on tamuu.id)
export const VITE_PUBLIC_PATHS = [
    '/invitations',
    '/preview',
    '/v/',
    '/c/',
    '/product', // Future-proofing for product details in Vite
    '/templates',
];

// 3. NEXT.js NATIVE PATHS (Marketing/SEO pages on tamuu.id)
export const NEXTJS_PUBLIC_PATHS = [
    '/',
    '/undangan-digital',
    '/blog',
    '/shop',
    '/support',
    '/about',
    '/terms',
    '/privacy',
];

/**
 * Helper to check if a path belongs to the Application Hub
 */
export const isAppPath = (pathname: string): boolean => {
    return APP_PATHS.some(p => pathname.startsWith(p));
};

/**
 * Helper to check if a path is a public route served by Vite
 */
export const isVitePublicPath = (pathname: string): boolean => {
    return VITE_PUBLIC_PATHS.some(p => pathname.startsWith(p));
};
