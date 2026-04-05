"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// ============================================
// SMART DOMAIN REDIRECT (CTO Level Robustness)
// ============================================
export function SmartDomainRedirect() {
  const pathname = usePathname();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hostname = window.location.hostname;
    const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isDev) return;

    const APP_PATHS = [
      '/login', '/signup', '/forgot-password', '/auth',
      '/dashboard', '/editor', '/profile', '/billing',
      '/upgrade', '/guests', '/wishes', '/admin',
      '/vendor', '/onboarding', '/invitations'
    ];
    
    const isAppPath = APP_PATHS.some(p => pathname.startsWith(p));
    const isPublicHost = hostname === 'tamuu.id' || hostname === 'www.tamuu.id';

    // Enforcement: If we land on Public domain but it's an App path, move to App domain
    if (isPublicHost && isAppPath) {
      console.log('[Smart Redirect] Moving to app domain...');
      window.location.replace(`https://app.tamuu.id${pathname}${window.location.search}`);
    }
  }, [pathname]);

  return null;
}
