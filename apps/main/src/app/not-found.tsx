"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import Link from "next/link";

/**
 * TAMUU SMART 404 & REDIRECTOR
 * ═══════════════════════════════════════════════════════════════════════════════
 * This page serves two purposes:
 * 1. Catching app routes that leaked to the public domain and redirecting them.
 * 2. Showing a beautiful premium 404 page for actual missing content.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export default function NotFound() {
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const APP_PATHS = [
      '/login', '/signup', '/forgot-password', '/auth',
      '/dashboard', '/editor', '/profile', '/billing',
      '/upgrade', '/guests', '/wishes', '/admin',
      '/vendor', '/onboarding', '/invitations'
    ];

    const isAppPath = APP_PATHS.some(p => pathname.startsWith(p));
    const hostname = window.location.hostname;
    
    // We only redirect if we are on the public domain but trying to access an app path
    const isPublicHost = hostname === 'tamuu.id' || hostname === 'www.tamuu.id';

    if (isPublicHost && isAppPath) {
      console.log('[Smart 404] Intercepted app route on public domain. Redirecting...');
      setIsRedirecting(true);
      
      // Force immediate relocation to the correct domain
      const targetUrl = `https://app.tamuu.id${pathname}${window.location.search}`;
      window.location.replace(targetUrl);
    }
  }, [pathname]);

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-[999] bg-white flex items-center justify-center">
        <PremiumLoader variant="full" showLabel label="Menuju Halaman Aplikasi..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 relative">
        <div className="text-[12rem] font-black text-slate-50 leading-none select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-[#FFBF00] text-[#0A1128] px-6 py-2 rounded-full font-black text-sm tracking-widest uppercase shadow-xl rotate-[-5deg]">
            Oops! Tersesat?
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-black text-[#0A1128] mb-4 uppercase tracking-tight">Halaman Tidak Ditemukan</h1>
      <p className="text-slate-500 max-w-md mb-10 font-medium">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan ke alamat lain.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/" 
          className="px-10 py-4 bg-[#0A1128] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
        >
          Kembali ke Beranda
        </Link>
        <Link 
          href="/support" 
          className="px-10 py-4 bg-white text-[#0A1128] border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-[#FFBF00] transition-all active:scale-95"
        >
          Hubungi Bantuan
        </Link>
      </div>
    </div>
  );
}
