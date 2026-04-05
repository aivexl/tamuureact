import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isAppPath } from './routing-policy';

/**
 * TAMUU DOMAIN ENFORCER (CTO Level Strictness)
 * ═══════════════════════════════════════════════════════════════════════════════
 * Ensures that pages are only accessible on their designated domain.
 * This is called at the TOP of page.tsx server components for instant redirection.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function enforceDomain(type: 'public' | 'app') {
    const headersList = await headers();
    const host = (headersList.get('host') || '').toLowerCase().split(':')[0];
    const xForwardedHost = headersList.get('x-forwarded-host');
    
    // Normalize hostname
    const hostname = (xForwardedHost || host).toLowerCase().split(':')[0];
    
    const isDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('pages.dev');
    if (isDev) return;

    const isAppHost = hostname.startsWith('app.');
    const isPublicHost = hostname === 'tamuu.id' || hostname === 'www.tamuu.id';

    // Log for debugging in Cloudflare logs
    console.log(`[Domain Enforcer] Host: ${hostname}, Type: ${type}, isApp: ${isAppHost}, isPublic: ${isPublicHost}`);

    if (type === 'public' && isAppHost) {
        const path = headersList.get('x-invoke-path') || '/';
        const query = headersList.get('x-invoke-query') || '';
        console.log(`[Domain Enforcer] Ejecting PUBLIC route to tamuu.id: ${path}`);
        redirect(`https://tamuu.id${path}${query ? `?${query}` : ''}`);
    }

    if (type === 'app' && isPublicHost) {
        const path = headersList.get('x-invoke-path') || '/dashboard';
        const query = headersList.get('x-invoke-query') || '';
        console.log(`[Domain Enforcer] Ejecting APP route to app.tamuu.id: ${path}`);
        redirect(`https://app.tamuu.id${path}${query ? `?${query}` : ''}`);
    }
}
