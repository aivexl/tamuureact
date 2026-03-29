"use client";

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Mail, 
    Users, 
    Eye, 
    Calendar,
    Plus,
    ExternalLink,
    Edit3,
    Copy,
    Trash2,
    Sparkles
} from 'lucide-react';
import { useStore } from '@tamuu/shared';

// Mock Stats
const mockStats = {
    invitations: 2,
    guests: 150,
    views: 1240,
    rsvp: 85
};

// Mock Invitations
const mockInvitations = [
    { id: '1', name: 'The Wedding of Rizky & Sarah', slug: 'rizky-sarah', thumbnail: null, is_published: true },
    { id: '2', name: 'Engagement of Budi & Ani', slug: 'budi-ani', thumbnail: null, is_published: false },
];

function DashboardContent() {
    const { user } = useStore();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const stats = [
        { label: 'Undangan', value: mockStats.invitations, icon: Mail, color: 'teal', badge: 'Total' },
        { label: 'Tamu', value: mockStats.guests, icon: Users, color: 'emerald', badge: 'Pax' },
        { label: 'Visitor', value: mockStats.views, icon: Eye, color: 'blue', badge: 'Views' },
        { label: 'RSVP', value: mockStats.rsvp, icon: Calendar, color: 'purple', badge: 'Conf' },
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 leading-tight">
                        Selamat datang,<br className="md:hidden" /> {user?.name || 'User'}
                    </h2>
                    <p className="text-slate-500 text-sm md:text-lg font-medium">Berikut ringkasan performa hari ini.</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-4 md:py-3.5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all active:scale-95 text-sm md:text-base">
                    <Plus className="w-5 h-5" /> Buat Undangan Baru
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-white rounded-3xl p-5 md:p-7 border border-slate-100 shadow-sm hover:-translate-y-1 transition-all duration-500"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center`}>
                                <stat.icon className="w-5 h-5 md:w-7 md:h-7 text-slate-600" />
                            </div>
                            <span className="text-[8px] md:text-xs font-black text-slate-600 px-2 py-0.5 bg-slate-50 rounded-full uppercase tracking-wider">
                                {stat.badge}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl md:text-4xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg md:text-xl font-black text-slate-900">Undangan Terbaru</h3>
                        <button className="text-xs font-black text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest">
                            Lihat Semua
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {mockInvitations.map((inv) => (
                            <div key={inv.id} className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
                                <div className="h-48 relative overflow-hidden bg-slate-100">
                                    <div className="absolute top-4 right-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md ${inv.is_published ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                            {inv.is_published ? 'Live' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h5 className="text-sm font-black text-[#0A1128] mb-1 uppercase line-clamp-1">{inv.name}</h5>
                                    <p className="text-xs text-slate-400 font-bold mb-6">tamuu.id/{inv.slug}</p>
                                    
                                    <div className="mt-auto grid grid-cols-4 gap-2">
                                        <button className="flex items-center justify-center p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-[#FFBF00] hover:text-white transition-all">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                        <button className="flex items-center justify-center p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button className="flex items-center justify-center p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button className="flex items-center justify-center p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg md:text-xl font-black text-slate-900 px-1">Layanan & Akun</h3>
                    <div className="bg-slate-900 text-white rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl shadow-slate-900/40">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                <Sparkles className="w-6 h-6 text-teal-400" />
                            </div>
                            <h4 className="text-2xl font-black mb-2">Upgrade ke PRO</h4>
                            <p className="text-slate-400 mb-8 text-sm font-medium leading-relaxed">
                                Buka fitur premium, domain kustom, & kapasitas tamu tanpa batas.
                            </p>
                            <button className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 active:scale-95 text-sm uppercase tracking-widest">
                                Upgrade Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
