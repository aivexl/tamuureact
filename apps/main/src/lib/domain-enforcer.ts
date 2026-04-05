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
        const pathname = headersList.get('x-invoke-path') || headersList.get('x-next-url') || '/';
        const search = headersList.get('x-invoke-query') || '';
        const redirectUrl = `https://tamuu.id${pathname}${search ? `?${search}` : ''}`;
        console.log(`[Domain Enforcer] Ejecting PUBLIC route to tamuu.id: ${redirectUrl}`);
        redirect(redirectUrl);
    }

    if (type === 'app' && isPublicHost) {
        const pathname = headersList.get('x-invoke-path') || headersList.get('x-next-url') || '/dashboard';
        const search = headersList.get('x-invoke-query') || '';
        const redirectUrl = `https://app.tamuu.id${pathname}${search ? `?${search}` : ''}`;
        console.log(`[Domain Enforcer] Ejecting APP route to app.tamuu.id: ${redirectUrl}`);
        redirect(redirectUrl);
    }
}
