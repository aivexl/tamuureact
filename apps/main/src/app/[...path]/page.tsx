import { notFound } from "next/navigation";
import { isAppPath, isVitePublicPath } from "@/lib/routing-policy";
import { enforceDomain } from "@/lib/domain-enforcer";

/**
 * TAMUU GLOBAL SMART ROUTING BRAIN v4.7.1
 * ═══════════════════════════════════════════════════════════════════════════════
 * Handles dynamic routes and enforces domain policy using native Next.js params.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
interface Props {
    params: Promise<{ path: string[] }>;
}

export default async function GlobalCatchAll({ params }: Props) {
    const { path } = await params;
    const pathname = `/${path.join('/')}`;
    
    // 1. If it's an App Path -> Redirect to app.tamuu.id
    if (isAppPath(pathname)) {
        console.log(`[Global Brain] App Path detected: ${pathname}. Redirecting...`);
        await enforceDomain('app');
        return null;
    }

    // 2. If it's a Public Vite Path -> Proxy handled by Middleware
    if (isVitePublicPath(pathname)) {
        await enforceDomain('public');
        return null;
    }

    // 3. Fallback to 404
    console.log(`[Global Brain] Unmapped route: ${pathname}. Showing 404.`);
    notFound();
}
