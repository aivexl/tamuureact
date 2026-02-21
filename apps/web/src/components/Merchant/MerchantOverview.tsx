import React from 'react';
import { useStore } from '../../store/useStore';
import { useMerchantProfile, useMerchantAnalytics } from '../../hooks/queries/useShop';
import { m } from 'framer-motion';

const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const LockOpenIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
);
const PackageIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const StarIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const SettingsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);
const ZapIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.71 12 2.5V11h8l-8 12.5V13H4Z" /></svg>
);

export const MerchantOverview: React.FC<{ setTab?: (tab: string) => void }> = ({ setTab }) => {
    const user = useStore(s => s.user);
    const { data: merchantData, isLoading: profileLoading } = useMerchantProfile(user?.id);
    const merchant = merchantData?.merchant;

    // Fetch real metrics
    const { data: analyticsRes, isLoading: analyticsLoading } = useMerchantAnalytics(merchant?.id);
    const totals = analyticsRes?.totals || { profileViews: 0, contactClicks: 0, favorites: 0 };
    const chartData = analyticsRes?.chartData || [];

    if (profileLoading || analyticsLoading) {
        return (
            <div className="flex flex-col h-full bg-[#050505] items-center justify-center p-10">
                <div className="w-12 h-12 rounded-full border-t-2 border-[#FFBF00] animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Loading Workspace</p>
            </div>
        );
    }

    const metricCards = [
        { title: 'Store Activity', value: totals.profileViews, icon: EyeIcon, color: 'text-amber-400', label: 'Views' },
        { title: 'Direct Leads', value: totals.contactClicks, icon: LockOpenIcon, color: 'text-[#FFBF00]', label: 'Unlocks' },
        { title: 'Shop Favorites', value: totals.favorites, icon: StarIcon, color: 'text-orange-400', label: 'Stars' },
    ];

    // Minimal sparkline generator
    const generatePath = (key: 'views' | 'clicks') => {
        if (!chartData.length) return '';
        const maxVal = Math.max(10, ...chartData.flatMap((d: any) => [d.views, d.clicks])) * 1.2;
        const width = 100;
        const height = 100;
        const step = width / (chartData.length - 1 || 1);

        return chartData.map((d: any, i: number) => {
            const x = i * step;
            const y = height - ((d[key] / maxVal) * height);
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        }).join(' ');
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 pb-32 bg-white">
            <header className="mb-12 relative">
                <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-20 -left-20 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-[100px] pointer-events-none"
                />
                <m.h1
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black text-[#0A1128] mb-3 tracking-tight flex items-center gap-4"
                >
                    Hello, <span className="text-[#FFBF00]">{merchant?.nama_toko || 'Merchant'}</span>
                    {merchant?.is_sponsored && (
                        <m.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFBF00]/10 border border-[#FFBF00]/30 shadow-[0_4px_10px_rgba(255,191,0,0.1)]"
                        >
                            <ZapIcon className="w-3 h-3 text-[#FFBF00]" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#FFBF00]">Boosted</span>
                        </m.div>
                    )}
                </m.h1>
                <m.p
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="text-slate-500 text-sm font-medium"
                >
                    Monitor your store performance and manage your assets from one premium command center.
                </m.p>
            </header>

            {/* QUICK STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metricCards.map((card, idx) => (
                    <m.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="bg-[#FBFBFB] border border-slate-100 rounded-3xl p-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FFBF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{card.title}</h3>
                            <div className={`p-2.5 rounded-xl bg-white border border-slate-100 ${card.color}`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-black text-[#0A1128] tracking-tight">{card.value.toLocaleString()}</span>
                            <span className="text-xs font-bold text-slate-400">{card.label}</span>
                        </div>
                        <div className="h-1 w-12 bg-[#FFBF00] rounded-full mt-4" />
                    </m.div>
                ))}
            </div>

            {/* MAIN CHART & ACTION AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area */}
                <m.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-[#FBFBFB] border border-slate-100 rounded-3xl p-8 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div>
                            <h3 className="text-[#0A1128] font-bold text-lg tracking-tight">Traffic Overview</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[#FFBF00] mt-1">Real-time Trends</p>
                        </div>
                        <button
                            onClick={() => setTab && setTab('analytics')}
                            className="text-[11px] font-bold text-[#FFBF00] bg-[#FFBF00]/5 px-5 py-2.5 rounded-full hover:bg-[#FFBF00] hover:text-[#0A1128] transition-all duration-300 border border-[#FFBF00]/20"
                        >
                            Advanced Hub
                        </button>
                    </div>

                    <div className="flex-1 relative flex items-end">
                        {/* Grid Lines mockup */}
                        <div className="absolute inset-0 grid grid-rows-4 opacity-[0.05] pointer-events-none">
                            {[...Array(4)].map((_, i) => <div key={i} className="border-t border-slate-400" />)}
                        </div>

                        {chartData.length > 0 && generatePath('clicks') ? (
                            <svg className="absolute inset-0 w-full h-full pb-4" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#FFBF00" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="#FFBF00" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={generatePath('views')} fill="none" stroke="rgba(10,17,40,0.05)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d={generatePath('clicks')} fill="none" stroke="#FFBF00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                <path d={`${generatePath('clicks')} L100,100 L0,100 Z`} fill="url(#grad1)" />
                            </svg>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold uppercase tracking-[0.2em] text-[10px]">
                                Insufficient Data for Trends
                            </div>
                        )}
                    </div>
                </m.div>

                {/* Quick Actions */}
                <m.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col"
                >
                    <h3 className="text-[#0A1128] font-bold text-lg mb-8 tracking-tight">Express Tools</h3>

                    <div className="space-y-4 flex-1">
                        <button
                            onClick={() => setTab && setTab('products')}
                            className="w-full group flex items-center justify-center gap-3 bg-[#FFBF00] hover:bg-[#FFD700] text-[#0A1128] font-black py-5 px-6 rounded-2xl transition-all shadow-md active:scale-95 text-xs uppercase tracking-widest"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Global Inventory
                        </button>

                        <button
                            onClick={() => setTab && setTab('settings')}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-[#0A1128] font-bold py-5 px-6 rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-widest"
                        >
                            <SettingsIcon className="w-5 h-5 text-slate-400" />
                            Shop Config
                        </button>
                    </div>

                    <div className="mt-8 p-6 bg-[#FBFBFB] border border-slate-100 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <TrendingUpIcon className="w-12 h-12 text-[#FFBF00]" />
                        </div>
                        <h4 className="text-[10px] font-black text-[#FFBF00] uppercase tracking-widest mb-3">Merchant Tip</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
                            {merchant?.is_sponsored
                                ? "Your shop is currently boosted! You're receiving 10x more visibility across the marketplace."
                                : "Premium merchants who update their inventory weekly see 42% higher engagement rates. Keep your shop fresh!"}
                        </p>
                        {!merchant?.is_sponsored && (
                            <button
                                onClick={() => setTab && setTab('ads')}
                                className="text-[9px] font-black uppercase tracking-widest text-[#FFBF00] flex items-center gap-2 hover:gap-3 transition-all"
                            >
                                Boost Reach Now <PlusIcon className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </m.div>
            </div>
        </div>
    );
};
