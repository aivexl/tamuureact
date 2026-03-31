"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    ShoppingBag, 
    Users, 
    BarChart3, 
    ArrowUpRight,
    Star,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function VendorOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;

    const stats = [
        { label: 'Total Sales', value: 'Rp 12.5M', icon: ShoppingBag, color: 'indigo' },
        { label: 'Profile Views', value: '1,240', icon: Users, color: 'blue' },
        { label: 'Avg Rating', value: '4.9', icon: Star, color: 'amber' },
        { label: 'Active Ads', value: '3', icon: Zap, color: 'orange' },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-[#0A1128] mb-1 italic uppercase tracking-tighter">Vendor Overview</h2>
                    <p className="text-slate-500 font-medium">Monitor performa toko Anda hari ini.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#FFBF00] transition-colors duration-500`}>
                                <stat.icon className={`w-6 h-6 text-[#0A1128] group-hover:text-white transition-colors`} />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                <ArrowUpRight className="w-3 h-3" />
                                12%
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-[#0A1128]">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-80 flex flex-col justify-center items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <BarChart3 className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Analytics Chart Placeholder</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-[#0A1128] uppercase tracking-tighter mb-6">Produk Terlaris</h3>
                        <div className="space-y-4">
                            {[1,2,3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-100" />
                                        <div>
                                            <p className="text-sm font-black text-[#0A1128]">Paket Wedding {i}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">Sold: 12</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-[#0A1128]">Rp 15M</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-[#0A1128] p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFBF00]/10 rounded-full blur-3xl -mr-10 -mt-10" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-[#FFBF00]" />
                            </div>
                            <h4 className="text-2xl font-black italic">Boost Storefront</h4>
                            <p className="text-white/50 text-sm font-medium leading-relaxed">
                                Tingkatkan visibilitas toko Anda dengan kampanye iklan tertarget.
                            </p>
                            <button 
                                onClick={() => router.push(`/vendor/${slug}/ads`)}
                                className="w-full py-4 bg-[#FFBF00] text-[#0A1128] font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                            >
                                Mulai Kampanye
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
