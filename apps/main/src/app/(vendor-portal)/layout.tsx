"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    BarChart3, 
    Settings, 
    LogOut,
    Menu,
    Plus,
    Zap,
    MessageSquare,
    Store
} from 'lucide-react';
import { useStore } from '@tamuu/shared';

export default function VendorPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useStore();
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const vendorSlug = params.slug || 'dashboard';

    const sidebarLinks = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: `/vendor/${vendorSlug}` },
        { id: 'products', label: 'Produk', icon: ShoppingBag, path: `/vendor/${vendorSlug}/products` },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: `/vendor/${vendorSlug}/analytics` },
        { id: 'ads', label: 'Ads Center', icon: Zap, path: `/vendor/${vendorSlug}/ads` },
        { id: 'messages', label: 'Pesan', icon: MessageSquare, path: `/vendor/${vendorSlug}/messages` },
        { id: 'settings', label: 'Pengaturan', icon: Settings, path: `/vendor/${vendorSlug}/settings` },
    ];

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar */}
            <aside className={`hidden md:flex flex-col w-72 bg-white border-r border-slate-100 transition-all duration-300 ${isSidebarOpen ? '' : '-ml-72'}`}>
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/images/logo-tamuu-vfinal-v1.webp" alt="Tamuu" className="h-8 w-auto" />
                        <span className="bg-amber-100 text-[#FFBF00] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Vendor</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.id}
                            href={link.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                                pathname === link.path
                                    ? 'bg-[#0A1128] text-white shadow-xl shadow-indigo-950/20'
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-[#0A1128]'
                            }`}
                        >
                            <link.icon className={`w-5 h-5 ${pathname === link.path ? 'text-[#FFBF00]' : ''}`} />
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-50">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-[#0A1128] transition-all mb-2"
                    >
                        <Store className="w-5 h-5" />
                        User Portal
                    </Link>
                    <button
                        onClick={() => {
                            logout(async () => {});
                            router.push('/');
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        <Link href={`/vendor/${vendorSlug}/products/new`} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#FFBF00] text-[#0A1128] font-black rounded-xl text-xs uppercase tracking-widest hover:shadow-lg transition-all">
                            <Plus className="w-4 h-4" /> Produk Baru
                        </Link>
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg">
                            {user?.name?.charAt(0) || 'V'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
