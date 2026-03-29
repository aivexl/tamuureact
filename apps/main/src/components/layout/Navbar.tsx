import React from 'react';
import Link from 'next/link';
import { Menu, Search, User } from 'lucide-react';

export const Navbar = () => {
    // 100% Static Server Logic
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Undangan Digital', path: '/undangan-digital' },
        { name: 'Invitations', path: '/invitations' },
        { name: 'Dashboard', path: '/dashboard' },
    ];

    return (
        <header className="sticky top-0 z-[100] w-full bg-white border-b border-slate-100 h-16 md:h-20">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                <Link href="/" className="shrink-0">
                    <img src="/images/logo-tamuu-vfinal-v1.webp" alt="Tamuu" className="h-7 md:h-9 w-auto" />
                </Link>

                <div className="hidden md:flex flex-1 max-w-xl items-center bg-slate-50 rounded-full px-4 py-2 border border-slate-100">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <input type="text" placeholder="Cari vendor..." className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full" readOnly />
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 text-slate-600">
                        <User className="w-5 h-5" />
                    </Link>
                    <button className="md:hidden p-2 text-slate-600">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <nav className="hidden md:flex items-center justify-center gap-8 h-10 border-t border-slate-50 bg-white">
                {navLinks.map(link => (
                    <Link key={link.name} href={link.path} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#0A1128]">
                        {link.name}
                    </Link>
                ))}
            </nav>
        </header>
    );
};
