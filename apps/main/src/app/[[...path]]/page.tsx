import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isAppPath, isVitePublicPath, isNextjsPath } from "@/lib/routing-policy";
import { enforceDomain } from "@/lib/domain-enforcer";
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import HomeClient from '../HomeClient';

/**
 * TAMUU UNIVERSAL SMART ROUTER v5.0.0 (SSR Brain)
 * ═══════════════════════════════════════════════════════════════════════════════
 * This is the SINGLE entry point for all dynamic routes in Tamuu.
 * It handles:
 * 1. Homepage (/) with domain enforcement.
 * 2. Redirections for App Hub routes (dashboard, editor, etc).
 * 3. Proxy safety for Vite public routes.
 * 4. Automatic 404 for unmapped paths.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface Props {
    params: Promise<{ path?: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { path } = await params;
    const pathname = path ? `/${path.join('/')}` : '/';

    if (pathname === '/') {
        return {
            title: 'Tamuu - Platform Undangan Digital & Vendor Pernikahan Premium',
            description: 'Temukan vendor pernikahan terbaik dan buat undangan digital eksklusif hanya di Tamuu.',
        };
    }

    return {
        title: 'Tamuu',
    };
}

export default async function UniversalRouter({ params }: Props) {
    const { path } = await params;
    const pathname = path ? `/${path.join('/')}` : '/';
    
    console.log(`[Universal Router] Routing path: ${pathname}`);

    // 1. HOMEPAGE SPECIAL CASE
    if (pathname === '/') {
        await enforceDomain('public');
        return (
            <Suspense fallback={<PremiumLoader variant="full" showLabel label="Loading Tamuu..." />}>
                <HomeClient />
            </Suspense>
        );
    }

    // 2. APP HUB ROUTES (Must move to app.tamuu.id)
    if (isAppPath(pathname)) {
        console.log(`[Universal Router] App Path detected: ${pathname}. Enforcing domain...`);
        await enforceDomain('app');
        return null;
    }

    // 3. VITE PUBLIC ROUTES (Handled by Middleware Proxy)
    if (isVitePublicPath(pathname)) {
        console.log(`[Universal Router] Vite Public Path detected: ${pathname}. Checking domain...`);
        await enforceDomain('public');
        // If we reach here, we are on the correct domain, but the middleware 
        // should have already intercepted and proxied this to Vite.
        // If Next.js still hits this, it means the middleware rewrite failed or 
        // we are in a state where we need to render a fallback.
        return null; 
    }

    // 4. NEXT.JS NATIVE ROUTES
    // Note: Specific Next.js folders (like /blog) will take precedence over this router.
    // This part only runs if the path matches the Next.js list but doesn't have a folder.
    if (isNextjsPath(pathname)) {
        await enforceDomain('public');
        // If it's a known Next.js path but we are here, it means the specific folder 
        // might be missing or we want a centralized way to handle them.
        // For now, let Next.js handle it if the folder exists, otherwise it might 404 here.
    }

    // 5. FALLBACK TO 404
    console.warn(`[Universal Router] Unmapped or Shadowed route: ${pathname}. Showing 404.`);
    notFound();
}
