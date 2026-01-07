import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { m, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import { WelcomeDisplaysTab } from '../components/Dashboard/WelcomeDisplaysTab';

// ============================================
// INLINE SVG ICONS (Zero external dependency)
// ============================================
const LayoutDashboardIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
);
const MailIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);
const UsersIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const FileTextIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
);
const MessageSquareIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const GraduationCapIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
);
const UserIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const LogOutIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
);
const SearchIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);
const BellIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const Edit3Icon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
);
const CopyIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
);
const SparklesIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);
const MenuIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
    </svg>
);
const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);
const Trash2Icon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
    </svg>
);
const ExternalLinkIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" />
    </svg>
);
const MonitorIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" />
    </svg>
);


// ============================================
// DUMMY DATA
// ============================================
const DUMMY_USER = {
    name: 'Anisa Rahma',
    email: 'anisa@gmail.com',
    plan: 'Premium',
    avatar: null,
};

const DUMMY_INVITATIONS = [
    { id: '1', name: 'Pernikahan Anisa & Budi', slug: 'anisa-budi', status: 'published', thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop' },
    { id: '2', name: 'Akad Nikah Siti', slug: 'siti-wedding', status: 'draft', thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop' },
    { id: '3', name: 'Resepsi Ahmad', slug: 'ahmad-resepsi', status: 'published', thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop' },
];

const DUMMY_STATS = {
    invitations: 3,
    guests: 156,
    views: 1420,
    rsvp: 89,
};

// ============================================
// MENU ITEMS
// ============================================
type TabId = 'dashboard' | 'invitations' | 'displays' | 'guests' | 'wishes' | 'invoice' | 'tutorial';

const menuItems: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
    { id: 'invitations', label: 'Undangan Saya', icon: MailIcon },
    { id: 'displays', label: 'Desain Layar', icon: MonitorIcon },
    { id: 'guests', label: 'Buku Tamu', icon: UsersIcon },
    { id: 'wishes', label: 'Ucapan Tamu', icon: MessageSquareIcon },
    { id: 'invoice', label: 'Invoice', icon: FileTextIcon },
    { id: 'tutorial', label: 'Tutorial', icon: GraduationCapIcon },
];


// ============================================
// MAIN COMPONENT
// ============================================
export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useSEO({
        title: 'Dashboard - Tamuu',
        description: 'Kelola undangan digital Anda dengan mudah.',
    });

    const filteredInvitations = DUMMY_INVITATIONS.filter(inv =>
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex pt-14">
            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-14 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'} h-[calc(100vh-3.5rem)] overflow-hidden`}>
                {/* User Profile Card */}
                {sidebarOpen && (
                    <div className="p-6">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-teal-200 transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                                {DUMMY_USER.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate leading-tight">{DUMMY_USER.name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mt-0.5">{DUMMY_USER.plan} Plan</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarOpen && <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Menu Utama</p>}
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'wishes') {
                                    navigate('/wishes');
                                } else {
                                    setActiveTab(item.id);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${activeTab === item.id ? 'bg-teal-500 text-slate-900' : 'bg-slate-100 text-slate-400'}`}>
                                <item.icon className="w-4 h-4" />
                            </div>
                            {sidebarOpen && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                        </button>
                    ))}


                </nav>


                {/* Account Section */}
                <div className="p-4 border-t border-slate-100 mt-auto">
                    {sidebarOpen && <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Layanan</p>}
                    <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group">
                        <UserIcon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                        {sidebarOpen && <span className="text-sm font-bold tracking-tight">Edit Profil</span>}
                    </Link>
                    <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-rose-600 hover:bg-rose-50 transition-all">
                        <LogOutIcon className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="text-sm font-bold tracking-tight">Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} style={{ top: '3.5rem' }} />}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-[calc(100vh-3.5rem)]">
                {/* Content Area */}
                <div className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
                    <AnimatePresence mode="wait">
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <m.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                                {/* Welcome Section */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat datang, {DUMMY_USER.name} ✨</h2>
                                        <p className="text-slate-500 text-lg">Berikut adalah ringkasan performa undangan Anda hari ini.</p>
                                    </div>
                                    <Link to="/onboarding" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-semibold rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all active:scale-95">
                                        <PlusIcon className="w-5 h-5" /> Buat Undangan Baru
                                    </Link>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Undangan Saya', value: DUMMY_STATS.invitations, icon: MailIcon, color: 'teal', badge: 'Total' },
                                        { label: 'Total Tamu', value: DUMMY_STATS.guests, icon: UsersIcon, color: 'emerald', badge: 'Pax' },
                                        { label: 'Pengunjung', value: DUMMY_STATS.views, icon: EyeIcon, color: 'blue', badge: 'Views' },
                                        { label: 'RSVP Terkirim', value: DUMMY_STATS.rsvp, icon: CalendarIcon, color: 'purple', badge: 'Confirm' },
                                    ].map((stat, i) => (
                                        <m.div
                                            key={stat.label}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="group bg-white/70 backdrop-blur-xl rounded-3xl p-7 border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                                    <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
                                                </div>
                                                <span className={`text-xs font-bold text-${stat.color}-600 px-3 py-1 bg-${stat.color}-50 rounded-full uppercase tracking-wider`}>{stat.badge}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                                <p className="text-4xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                                            </div>
                                        </m.div>
                                    ))}
                                </div>

                                {/* Recent Invitations */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-slate-900">Undangan Terbaru</h3>
                                            <button onClick={() => setActiveTab('invitations')} className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">Lihat Semua</button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {DUMMY_INVITATIONS.slice(0, 3).map(inv => (
                                                <div key={inv.id} className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-xl hover:border-teal-400/30 transition-all duration-500">
                                                    <div className="aspect-video relative overflow-hidden">
                                                        <img src={inv.thumbnail} alt={inv.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                                                            <div className="flex gap-2">
                                                                <button className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl hover:bg-white text-slate-900 transition-all">
                                                                    <EyeIcon className="w-5 h-5" />
                                                                </button>
                                                                <Link to={`/editor/${inv.id}`} className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl hover:bg-white text-slate-900 transition-all">
                                                                    <Edit3Icon className="w-5 h-5" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        <h5 className="font-bold text-slate-900 truncate mb-1 text-sm">{inv.name}</h5>
                                                        <p className="text-[10px] text-slate-500 truncate mb-3 capitalize">tamuu.id/{inv.slug}</p>
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${inv.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{inv.status}</span>
                                                            <button className="text-xs font-bold text-slate-900 hover:text-teal-600 transition-colors flex items-center gap-1.5">
                                                                <UsersIcon className="w-3.5 h-3.5" /> Tamu
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Upgrade Card */}
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-slate-900">Layanan & Akun</h3>
                                        <div className="bg-slate-900 text-white rounded-[2rem] p-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700" />
                                            <div className="relative z-10 flex flex-col h-full">
                                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                                    <SparklesIcon className="w-6 h-6 text-teal-400" />
                                                </div>
                                                <h4 className="text-2xl font-bold mb-4">Ganti ke Priority</h4>
                                                <p className="text-slate-400 mb-8 leading-relaxed text-sm">Buka semua fitur mewah, domain kustom, dan kapasitas tamu tanpa batas.</p>
                                                <Link to="/onboarding" className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 active:scale-95">
                                                    <PlusIcon className="w-5 h-5" />
                                                    Mulai Buat Undangan Pertama
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </m.div>
                        )}

                        {/* Invitations Tab */}
                        {activeTab === 'invitations' && (
                            <m.div key="invitations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                                {/* Search & Actions */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="relative flex-1 max-w-xl w-full">
                                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Cari undangan digital Anda..."
                                            className="w-full pl-12 pr-6 py-4 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 font-semibold rounded-2xl hover:bg-slate-50 transition-all text-sm">
                                            <MenuIcon className="w-4 h-4" /> Filter
                                        </button>
                                        <Link to="/onboarding" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white font-semibold rounded-2xl hover:shadow-xl transition-all text-sm">
                                            <PlusIcon className="w-4 h-4" /> Baru
                                        </Link>
                                    </div>
                                </div>

                                {/* Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {filteredInvitations.map(inv => (
                                        <div key={inv.id} className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:border-teal-400/30 transition-all duration-700">
                                            <div className="aspect-[4/3] relative overflow-hidden">
                                                <img src={inv.thumbnail} alt={inv.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4">
                                                    <div className="flex gap-4">
                                                        <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-90" title="Preview">
                                                            <EyeIcon className="w-6 h-6 text-slate-900" />
                                                        </button>
                                                        <Link to={`/editor/${inv.id}`} className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-90" title="Edit">
                                                            <Edit3Icon className="w-6 h-6 text-slate-900" />
                                                        </Link>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-90" title="Salin Link">
                                                            <CopyIcon className="w-6 h-6 text-slate-900" />
                                                        </button>
                                                        <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-90" title="Buku Tamu">
                                                            <UsersIcon className="w-6 h-6 text-slate-900" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <h3 className="text-base font-bold text-slate-900 truncate tracking-tight">{inv.name}</h3>
                                                    <button className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                                                        <Trash2Icon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-slate-400 text-[10px] font-medium mb-4 uppercase tracking-[0.1em] truncate">tamuu.id/{inv.slug}</p>
                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-md ${inv.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{inv.status}</span>
                                                    <button className="text-[10px] font-black text-slate-400 hover:text-teal-600 flex items-center gap-1.5 transition-colors">
                                                        <UsersIcon className="w-3.5 h-3.5" /> Tamu
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </m.div>
                        )}

                        {/* Displays Tab */}
                        {activeTab === 'displays' && (
                            <WelcomeDisplaysTab />
                        )}

                        {/* Guests Tab */}
                        {activeTab === 'guests' && (
                            <m.div key="guests" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Kelola Buku Tamu</h2>
                                        <p className="text-slate-500">Pilih undangan untuk mengelola daftar tamu Anda.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {DUMMY_INVITATIONS.map(inv => (
                                        <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                                                    <MailIcon className="w-6 h-6 text-teal-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-800 truncate">{inv.name}</h3>
                                                    <p className="text-xs text-slate-400">{inv.status.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/guests/${inv.id}`)}
                                                className="w-full py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all"
                                            >
                                                Buka Buku Tamu
                                            </button>

                                        </div>
                                    ))}
                                </div>
                            </m.div>
                        )}

                        {/* Invoice Tab */}
                        {activeTab === 'invoice' && (
                            <m.div key="invoice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                    <FileTextIcon className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">Belum Ada Invoice</h3>
                                <p className="text-slate-500 text-center">Riwayat pembayaran & invoice akan muncul di sini</p>
                            </m.div>
                        )}

                        {/* Tutorial Tab */}
                        {activeTab === 'tutorial' && (
                            <m.div key="tutorial" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                    <GraduationCapIcon className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">Tutorial</h3>
                                <p className="text-slate-500 text-center">Video tutorial cara menggunakan Tamuu akan segera hadir</p>
                            </m.div>
                        )}


                    </AnimatePresence>

                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
