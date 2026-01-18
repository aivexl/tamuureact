/**
 * AnalyticsPanel - Invitation Insights
 * Displays RSVP statistics and guest presence data.
 */

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    TrendingUp,
    UserCheck,
    PieChart as PieChartIcon,
    ArrowUpRight
} from 'lucide-react';
import { analytics as analyticsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';

interface AnalyticsData {
    rsvp: {
        total: number;
        attending: number;
        notAttending: number;
        maybe: number;
        totalPax: number;
    };
    guests: {
        total: number;
        checkedIn: number;
        presenceRatio: number;
    };
}

export const AnalyticsPanel: React.FC = () => {
    const { id: invitationId } = useStore();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (invitationId) {
            fetchAnalytics();
        }
    }, [invitationId]);

    const fetchAnalytics = async () => {
        if (!invitationId) return;
        setIsLoading(true);
        try {
            const result = await analyticsApi.get(invitationId);
            setData(result);
        } catch (error) {
            console.error('[AnalyticsPanel] Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Menganalisis Data...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-1"
            >
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Dashboard Akumulasi</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Laporan Real-time Undangan Anda</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-2xl transition-all"
                    title="Refresh Data"
                >
                    <TrendingUp className="w-5 h-5" />
                </button>
            </m.div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* RSVP Stats Card */}
                <m.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm hover:shadow-md transition-all duration-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                            <PieChartIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RSVP Konfirmasi</span>
                            <h4 className="text-lg font-black text-slate-800 leading-none mt-1">{data.rsvp.total} Total Respon</h4>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <StatBar
                            label="Hadir"
                            count={data.rsvp.attending}
                            total={data.rsvp.total}
                            color="bg-emerald-500"
                            icon={<CheckCircle className="w-3.5 h-3.5" />}
                        />
                        <StatBar
                            label="Tidak Hadir"
                            count={data.rsvp.notAttending}
                            total={data.rsvp.total}
                            color="bg-rose-500"
                            icon={<XCircle className="w-3.5 h-3.5" />}
                        />
                        <StatBar
                            label="Mungkin"
                            count={data.rsvp.maybe}
                            total={data.rsvp.total}
                            color="bg-amber-500"
                            icon={<Clock className="w-3.5 h-3.5" />}
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimasi Pax Hadir</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-slate-800">{data.rsvp.totalPax}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Orang</span>
                        </div>
                    </div>
                </m.div>

                {/* Presence Stats Card */}
                <m.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm hover:shadow-md transition-all duration-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kehadiran Tamu</span>
                            <h4 className="text-lg font-black text-slate-800 leading-none mt-1">Sistem Check-in</h4>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-4 space-y-4">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle
                                    className="text-slate-50"
                                    strokeWidth="10"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                />
                                <m.circle
                                    className="text-teal-500"
                                    strokeWidth="10"
                                    strokeDasharray={2 * Math.PI * 40}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - data.guests.presenceRatio / 100) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-slate-800">{data.guests.presenceRatio}%</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hadir</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xl font-black text-slate-800">{data.guests.checkedIn}</span>
                                <span className="text-slate-300 font-bold">/</span>
                                <span className="text-sm font-bold text-slate-400">{data.guests.total}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Tamu yang hadir</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic text-center">
                            Data ini disinkronkan langsung dari panel Manajemen Tamu & Scan QR Code.
                        </p>
                    </div>
                </m.div>
            </div>

            {/* Action Card */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900 rounded-[2.5rem] p-8 flex items-center justify-between text-white overflow-hidden relative group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-teal-500/30 transition-all duration-700" />

                <div className="relative z-10 space-y-2">
                    <h4 className="text-lg font-black tracking-tight uppercase">Kelola Daftar Tamu</h4>
                    <p className="text-slate-400 text-xs font-medium max-w-xs">Update daftar tamu Anda atau bagikan link undangan sekarang juga.</p>
                </div>

                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all cursor-pointer">
                        <ArrowUpRight className="w-6 h-6 text-white" />
                    </div>
                </div>
            </m.div>
        </div>
    );
};

interface StatBarProps {
    label: string;
    count: number;
    total: number;
    color: string;
    icon: React.ReactNode;
}

const StatBar: React.FC<StatBarProps> = ({ label, count, total, color, icon }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <span className={color.replace('bg-', 'text-')}>{icon}</span>
                    <span className="text-slate-600">{label}</span>
                </div>
                <span className="text-slate-400">{count} Respon ({Math.round(percentage)}%)</span>
            </div>
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color} rounded-full`}
                />
            </div>
        </div>
    );
};

export default AnalyticsPanel;
