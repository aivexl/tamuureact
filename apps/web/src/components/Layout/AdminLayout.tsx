import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Smartphone,
    Monitor,
    Users,
    LogOut,
    Menu,
    X,
    Settings,
    Activity,
    CreditCard,
    Music,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { AdminChatSidebar } from './AdminChatSidebar';

interface SidebarItemProps {
    href: string;
    icon: any;
    label: string;
    active: boolean;
    sidebarOpen: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, active, sidebarOpen }: SidebarItemProps) => (
    <Link
        to={href}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${active
            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.1)]'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
    >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${active ? 'bg-teal-500 text-slate-900' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'
            }`}>
            <Icon className="w-4 h-4" />
        </div>
        {sidebarOpen && (
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-semibold tracking-wide"
            >
                {label}
            </motion.span>
        )}
    </Link>
);

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const { user, logout } = useStore();

    const hasPermission = (perm: string) => {
        if (!user) return false;
        if (user.role === 'admin' && (user.permissions.includes('all') || user.permissions.length === 0)) return true;
        return user.permissions.includes(perm);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-outfit flex overflow-hidden">

            {/* ADMIN SIDEBAR */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 flex flex-col bg-[#0F0F0F] border-r border-white/5 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
                    } h-screen`}
            >
                {/* Brand */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <span className="font-black text-slate-900 text-lg">T</span>
                        </div>
                        {sidebarOpen && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h1 className="font-bold text-lg tracking-tight">Tamuu Admin</h1>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Control Center</p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        {sidebarOpen ? 'Overview' : '...'}
                    </div>

                    <SidebarItem
                        href="/admin/dashboard"
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={location.pathname === '/admin/dashboard'}
                        sidebarOpen={sidebarOpen}
                    />

                    <div className="px-4 py-2 mt-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        {sidebarOpen ? 'Management' : '...'}
                    </div>

                    <SidebarItem
                        href="/admin/templates/invitation"
                        icon={Smartphone}
                        label="Undangan Digital"
                        active={location.pathname === '/admin/templates/invitation' || location.pathname === '/admin/templates'}
                        sidebarOpen={sidebarOpen}
                    />

                    <SidebarItem
                        href="/admin/templates/display"
                        icon={Monitor}
                        label="Layar Sapaan"
                        active={location.pathname === '/admin/templates/display'}
                        sidebarOpen={sidebarOpen}
                    />

                    {hasPermission('management:music') && (
                        <SidebarItem
                            href="/admin/music"
                            icon={Music}
                            label="Music Library"
                            active={location.pathname.startsWith('/admin/music')}
                            sidebarOpen={sidebarOpen}
                        />
                    )}

                    {hasPermission('management:admins') && (
                        <SidebarItem
                            href="/admin/admins"
                            icon={ShieldCheck}
                            label="Admins"
                            active={location.pathname === '/admin/admins'}
                            sidebarOpen={sidebarOpen}
                        />
                    )}

                    {hasPermission('management:resellers') && (
                        <SidebarItem
                            href="/admin/resellers"
                            icon={Briefcase}
                            label="Resellers"
                            active={location.pathname === '/admin/resellers'}
                            sidebarOpen={sidebarOpen}
                        />
                    )}

                    {hasPermission('management:users') && (
                        <SidebarItem
                            href="/admin/users"
                            icon={Users}
                            label="Users"
                            active={location.pathname === '/admin/users'}
                            sidebarOpen={sidebarOpen}
                        />
                    )}
                    <SidebarItem
                        href="/admin/transactions"
                        icon={CreditCard}
                        label="Transactions"
                        active={location.pathname.startsWith('/admin/transactions')}
                        sidebarOpen={sidebarOpen}
                    />

                    <div className="px-4 py-2 mt-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        {sidebarOpen ? 'System' : '...'}
                    </div>

                    <SidebarItem
                        href="/admin/activity"
                        icon={Activity}
                        label="Live Activity"
                        active={location.pathname.startsWith('/admin/activity')}
                        sidebarOpen={sidebarOpen}
                    />
                    <SidebarItem
                        href="/admin/settings"
                        icon={Settings}
                        label="Settings"
                        active={location.pathname.startsWith('/admin/settings')}
                        sidebarOpen={sidebarOpen}
                    />
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="text-sm font-bold">Sign Out</span>}
                    </button>

                    {/* Size Toggle (Desktop only) */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0A0A0A] border border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        {sidebarOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0F0F0F]">
                    <div className="font-bold">Tamuu Admin</div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto bg-[#0A0A0A] p-6 lg:p-10 relative">
                    {/* Glossy ambient background */}
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </main>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* AI CHATBOT SIDEBAR (PHASE 1) */}
            <AdminChatSidebar />
        </div>
    );
};
