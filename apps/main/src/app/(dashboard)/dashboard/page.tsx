"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion as m } from 'framer-motion';
import { 
    LayoutDashboard, 
    Mail, 
    Users, 
    MessageSquare, 
    Heart, 
    CreditCard 
} from 'lucide-react';

function DashboardContent() {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'overview';

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                    {currentTab === 'overview' ? 'Dashboard Overview' : currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
                </h1>
                <p className="text-slate-500 font-medium mt-1">Next.js Unified v2.1.0 — Dashboard Engine</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Undangan', value: '0', icon: Mail, color: 'blue' },
                    { label: 'Total Tamu', value: '0', icon: Users, color: 'emerald' },
                    { label: 'Pesan Baru', value: '0', icon: MessageSquare, color: 'orange' },
                ].map((stat, idx) => (
                    <m.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                    >
                        <div className={`w-12 h-12 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center text-${stat.color}-500 mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-4xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    </m.div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                    <LayoutDashboard className="w-10 h-10 text-slate-200" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Belum Ada Data</h2>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">
                    Modul <span className="text-slate-900 font-bold">{currentTab}</span> sedang disinkronkan dari platform utama.
                </p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
