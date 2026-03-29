"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    Mail, 
    Users, 
    MessageSquare, 
    Heart, 
    CreditCard, 
    User, 
    LogOut,
    Menu,
    X,
    Plus,
    Scan
} from 'lucide-react';
import { useStore } from '@tamuu/shared';

const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'invitations', label: 'Undangan', icon: Mail, path: '/dashboard?tab=invitations' },
    { id: 'guests', label: 'Buku Tamu', icon: Users, path: '/dashboard?tab=guests' },
    { id: 'messages', label: 'Pesan', icon: MessageSquare, path: '/dashboard?tab=messages' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/dashboard?tab=wishlist' },
    { id: 'billing', label: 'Billing', icon: CreditCard, path: '/dashboard?tab=billing' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useStore();
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar - Desktop */}
            <aside className={`hidden md:flex flex-col w-72 bg-white border-r border-slate-200 transition-all duration-300 ${isSidebarOpen ? '' : '-ml-72'}`}>
                <div className="p-8">
                    <Link href="/" className="block">
                        <img src="/images/logo-tamuu-vfinal-v1.webp" alt="Tamuu" className="h-8 w-auto" />
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.id}
                            href={link.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                                pathname === link.path || (link.id === 'dashboard' && pathname === '/dashboard')
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
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
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        <Link href="/onboarding" className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                            <Plus className="w-4 h-4" /> Baru
                        </Link>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white text-xs font-black shadow-lg">
                            {user?.name?.charAt(0) || 'U'}
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
