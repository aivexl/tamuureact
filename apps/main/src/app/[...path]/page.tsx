import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAppPath, isVitePublicPath } from "@/lib/routing-policy";
import { enforceDomain } from "@/lib/domain-enforcer";

/**
 * TAMUU GLOBAL SMART ROUTING BRAIN
 * ═══════════════════════════════════════════════════════════════════════════════
 * This catch-all page handles any route that doesn't have a physical file.
 * It automatically decides whether to redirect to the app domain or 
 * stay on the public domain (serving Vite content via proxy).
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export default async function GlobalCatchAll() {
    const headersList = await headers();
    const pathname = headersList.get('x-invoke-path') || '';
    
    // 1. If it's an App Path (Dashboard, Upgrade, etc.)
    // We force move to app.tamuu.id instantly.
    if (isAppPath(pathname)) {
        console.log(`[Global Brain] App Path detected: ${pathname}. Enforcing App Domain...`);
        await enforceDomain('app');
        return null;
    }

    // 2. If it's a Public Vite Path (Invitations, Product Detail, etc.)
    // We stay on tamuu.id and let the Middleware handle the Vite proxy.
    if (isVitePublicPath(pathname)) {
        console.log(`[Global Brain] Vite Public Path detected: ${pathname}. Staying on Public Domain.`);
        await enforceDomain('public');
        // We return null because the Middleware will rewrite this to Vite
        // If the middleware didn't rewrite, this will show a blank page or 404.
        // But the middleware IS configured to rewrite these.
        return null;
    }

    // 3. If it's none of the above, it's a real 404
    console.log(`[Global Brain] Unmapped route: ${pathname}. Showing 404.`);
    notFound();
}
