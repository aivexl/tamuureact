import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useMerchantProfile, useMerchantAnalytics } from '../../hooks/queries/useShop';

// Minimalist Icons
const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const LockOpenIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
);
const StarIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const DownloadIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
);

export const MerchantAnalytics: React.FC = () => {
    const user = useStore(s => s.user);
    const { data: merchantData } = useMerchantProfile(user?.id);
    const merchantId = merchantData?.merchant?.id;

    const { data: analyticsRes, isLoading } = useMerchantAnalytics(merchantId);

    const data = analyticsRes || {};
    const totals = data.totals || { profileViews: 0, contactClicks: 0, favorites: 0 };
    const chartData = data.chartData || [];

    // Derive max value for chart scaling
    const maxVal = useMemo(() => {
        if (!chartData.length) return 100; // default scale
        const allVals = chartData.flatMap((d: any) => [d.views, d.clicks]);
        return Math.max(10, ...allVals) * 1.2; // Add 20% headroom
    }, [chartData]);

    const generatePath = (key: 'views' | 'clicks') => {
        if (!chartData.length) return '';
        const width = 100;
        const height = 100;
        const step = width / (chartData.length - 1 || 1);

        return chartData.map((d: any, i: number) => {
            const x = i * step;
            const y = height - ((d[key] / maxVal) * height);
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        }).join(' ');
    };

    if (!merchantId) return null;

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-[#050505] items-center justify-center p-10">
                <div className="w-12 h-12 rounded-full border-t-2 border-[#FFBF00] animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Syncing Telemetry</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full relative bg-[#050505] text-[#e5e5e5]">
            <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 max-w-7xl mx-auto w-full pb-32 space-y-10">

                {/* Header & Controls */}
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-10">
                    <div className="space-y-3">
                        <m.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black tracking-tight text-white italic">Analytics <span className="text-[#FFBF00]">Hub</span></m.h1>
                        <m.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-slate-500 text-sm max-w-xl font-medium">
                            Premium business intelligence and real-time storefront telemetry.
                        </m.p>
                    </div>

                    <m.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
                        <div className="relative">
                            <select className="bg-[#0A1128] border border-white/10 rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white focus:ring-1 focus:ring-[#FFBF00] focus:outline-none appearance-none cursor-pointer hover:border-[#FFBF00]/30 transition-all pr-12">
                                <option>Rolling 7 Days</option>
                            </select>
                            <svg className="absolute right-5 top-4 text-[#FFBF00] pointer-events-none w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                        <button className="p-3 bg-[#0A1128] border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-slate-400 hover:text-[#FFBF00]" title="Export Raw Telemetry">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </m.div>
                </header>

                {/* KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Metric A */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-[#0A1128] rounded-3xl border border-white/5 p-8 space-y-5 shadow-2xl relative group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <EyeIcon className="w-32 h-32 text-white -mt-10 -mr-10" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Store Presence</h3>
                            <div className="p-2.5 rounded-xl bg-white/5 text-white"><EyeIcon className="w-5 h-5" /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-5xl font-black text-white tracking-tighter">{totals.profileViews.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Total Impressions</p>
                        </div>
                    </m.div>

                    {/* Metric B - Core Metric */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="bg-[#0A1128] rounded-3xl border border-[#FFBF00]/20 p-8 space-y-5 shadow-[0_0_50px_rgba(255,191,0,0.05)] relative group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                            <LockOpenIcon className="w-32 h-32 text-[#FFBF00] -mt-10 -mr-10" />
                        </div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFBF00]/40 to-transparent" />

                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-[10px] font-black text-[#FFBF00] uppercase tracking-[0.2em]">Contact Conversions</h3>
                            <div className="p-2.5 rounded-xl bg-[#FFBF00]/10 text-[#FFBF00]"><LockOpenIcon className="w-5 h-5 shadow-[0_0_10px_#FFBF00]" /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-5xl font-black text-white tracking-tighter">{totals.contactClicks.toLocaleString()}</p>
                            <p className="text-[10px] text-[#FFBF00]/60 font-bold uppercase tracking-widest mt-2">Active Lead Intent</p>
                        </div>
                    </m.div>

                    {/* Metric C */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        className="bg-[#0A1128] rounded-3xl border border-white/5 p-8 space-y-5 shadow-2xl relative group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <StarIcon className="w-32 h-32 text-orange-400 -mt-10 -mr-10" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Engagement Affinity</h3>
                            <div className="p-2.5 rounded-xl bg-white/5 text-orange-400"><StarIcon className="w-5 h-5 shadow-[0_0_10px_rgba(251,146,60,0.3)]" /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-5xl font-black text-white tracking-tighter">{totals.favorites.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Shop Star Ratings</p>
                        </div>
                    </m.div>
                </div>

                {/* Main Visualizations Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Deep Dive Chart */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                        className="lg:col-span-2 bg-[#0A1128] rounded-[32px] border border-white/5 p-8 lg:p-10 flex flex-col shadow-2xl min-h-[450px] relative overflow-hidden"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 relative z-10">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Traffic & Lead Velocity</h3>
                                <p className="text-[10px] text-[#FFBF00] font-black uppercase tracking-[0.15em] mt-1">Rolling Period Insights</p>
                            </div>
                            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-white/10"></span> Impressions</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FFBF00] shadow-[0_0_10px_#FFBF00]"></span> Leads</div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="flex-1 relative w-full h-full border-l border-b border-white/5 mt-4 flex items-end">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 grid grid-rows-4 opacity-[0.02] pointer-events-none">
                                {[...Array(4)].map((_, i) => <div key={i} className="border-t border-white" />)}
                            </div>

                            {chartData.length > 0 ? (
                                <>
                                    <svg className="absolute inset-0 w-full h-full pb-6 px-2" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <defs>
                                            <linearGradient id="glowGold" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#FFBF00" stopOpacity="0.15" />
                                                <stop offset="100%" stopColor="#FFBF00" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Impression Path */}
                                        <path d={generatePath('views')} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                                        {/* Leads path with glow fill */}
                                        <path d={`${generatePath('clicks')} L100,100 L0,100 Z`} fill="url(#glowGold)" />
                                        <path d={generatePath('clicks')} fill="none" stroke="#FFBF00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_12px_rgba(255,191,0,0.6)]" />

                                        {/* Data points for Leads */}
                                        {chartData.map((d: any, i: number) => {
                                            const step = 100 / (chartData.length - 1 || 1);
                                            const x = i * step;
                                            const y = 100 - ((d.clicks / maxVal) * 100);
                                            return <circle key={`c-${i}`} cx={x} cy={y} r="3" fill="#0A1128" stroke="#FFBF00" strokeWidth="2" />
                                        })}
                                    </svg>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">
                                    Telemetry Pending
                                </div>
                            )}

                            {/* X-Axis labels */}
                            <div className="absolute -bottom-8 left-0 w-full flex justify-between text-[10px] font-black text-slate-500 tracking-widest px-4">
                                {chartData.map((d: any, i: number) => {
                                    if (i === 0 || i === chartData.length - 1 || i === Math.floor(chartData.length / 2)) {
                                        const dt = new Date(d.date);
                                        return <span key={i} className="uppercase">{dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>;
                                    }
                                    return <span key={i}></span>;
                                })}
                            </div>
                        </div>
                    </m.div>

                    {/* Status Console */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                        className="bg-[#0A1128] rounded-[32px] border border-white/5 p-0 flex flex-col shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/5">
                            <h3 className="text-lg font-black text-white tracking-tight italic">System <span className="text-[#FFBF00]">Status</span></h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Worker Telemetry</p>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-6 text-center">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-[#FFBF00]/10 rounded-full blur-xl animate-pulse" />
                                <div className="relative w-24 h-24 rounded-full bg-[#FFBF00]/5 flex items-center justify-center border border-[#FFBF00]/20">
                                    <svg className="w-12 h-12 text-[#FFBF00] drop-shadow-[0_0_10px_#FFBF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-white font-black tracking-widest uppercase text-xs mb-3">Nodes Online</h4>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                    All tracking events (Impression, Lead Intent, Interaction) are synchronized with the <span className="text-[#FFBF00]">Tamuu Nexus</span> D1 Distributed Architecture.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#FFBF00]/10 rounded-full border border-[#FFBF00]/20">
                                <div className="w-2 h-2 rounded-full bg-[#FFBF00] animate-pulse" />
                                <span className="text-[9px] font-black text-[#FFBF00] uppercase tracking-widest">Active Link</span>
                            </div>
                        </div>

                    </m.div>
                </div>

            </div>
        </div>
    );
};
