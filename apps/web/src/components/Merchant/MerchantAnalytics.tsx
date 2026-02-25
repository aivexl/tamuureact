import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useMerchantProfile, useMerchantAnalytics, useMerchantProducts } from '../../hooks/queries/useShop';

// Icons
const PackageIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
);
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
    const totals = data.totals || { profileViews: 0, contactClicks: 0, favorites: 0, productViews: 0 };
    const chartData = data.chartData || [];

    const { data: productsData } = useMerchantProducts(merchantId);
    const products = productsData?.products || [];

    if (!merchantId) return null;

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-white items-center justify-center p-10">
                <div className="w-12 h-12 rounded-full border-t-2 border-[#FFBF00] animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Syncing Telemetry</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full relative bg-white text-[#0A1128]">
            <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 max-w-7xl mx-auto w-full pb-32 space-y-10">

                {/* Header & Controls */}
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                    <div className="space-y-3">
                        <m.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black tracking-tight text-[#0A1128] italic">Analytics <span className="text-[#FFBF00]">Hub</span></m.h1>
                        <m.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-slate-500 text-sm max-w-xl font-medium">
                            Premium business intelligence and real-time storefront telemetry.
                        </m.p>
                    </div>

                    <m.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
                        <div className="relative">
                            <select className="bg-[#FBFBFB] border border-slate-200 rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-widest text-[#0A1128] focus:ring-1 focus:ring-[#FFBF00] focus:outline-none appearance-none cursor-pointer hover:border-[#FFBF00]/30 transition-all pr-12">
                                <option>Rolling 7 Days</option>
                            </select>
                            <svg className="absolute right-5 top-4 text-[#FFBF00] pointer-events-none w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                        <button className="p-3 bg-[#FBFBFB] border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-[#FFBF00]" title="Export Raw Telemetry">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </m.div>
                </header>

                {/* KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Metric A */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-[#FBFBFB] rounded-3xl border border-slate-100 p-8 space-y-5 shadow-sm relative group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <EyeIcon className="w-32 h-32 text-slate-400 -mt-10 -mr-10" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Store Presence</h3>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400"><EyeIcon className="w-5 h-5" /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-5xl font-black text-[#0A1128] tracking-tighter">{totals.profileViews?.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Visits</p>
                        </div>
                    </m.div>

                    {/* Metric New: Total Impressions */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                        className="bg-[#FBFBFB] rounded-3xl border border-slate-100 p-8 space-y-5 shadow-sm relative group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <EyeIcon className="w-32 h-32 text-slate-400 -mt-10 -mr-10" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Product Reach</h3>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400"><EyeIcon className="w-5 h-5" /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-5xl font-black text-[#0A1128] tracking-tighter">{totals.productViews?.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Total Impressions</p>
                        </div>
                    </m.div>

                    {/* Metric B - Core Metric */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="bg-[#FFBF00]/5 rounded-3xl border border-[#FFBF00]/30 p-8 space-y-5 shadow-sm relative group overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                            <LockOpenIcon className="w-32 h-32 text-[#FFBF00] -mt-10 -mr-10" />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-[10px] font-black text-[#FFBF00] uppercase tracking-[0.2em]">Contact Leads</h3>
                            <div className="p-2.5 rounded-xl bg-white text-[#FFBF00] border border-[#FFBF00]/20"><LockOpenIcon className="w-5 h-5 shadow-[0_0_10px_rgba(255,191,0,0.3)]" /></div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-5xl font-black text-[#0A1128] tracking-tighter">{totals.contactClicks?.toLocaleString()}</p>
                            <p className="text-[10px] text-[#FFBF00]/60 font-bold uppercase tracking-widest mt-2">Unlocked</p>
                        </div>
                    </m.div>

                    {/* System Status Minimalist Info Card */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                        className="bg-emerald-50 rounded-3xl border border-emerald-100 p-8 flex flex-col justify-center items-center text-center shadow-sm"
                    >
                        <div className="p-3 bg-emerald-100 rounded-full mb-4 relative">
                            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-sm opacity-40 animate-pulse" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500 relative z-10" />
                        </div>
                        <h3 className="text-sm font-black text-emerald-900 tracking-tight">System Online</h3>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-2">Telemetry Active</p>
                    </m.div>
                </div>

                {/* Main Visualizations Row */}
                <div className="flex flex-col gap-8">
                    {/* PRODUCT LIST */}
                    <div className="bg-[#FBFBFB] border border-slate-100 rounded-3xl p-8 shadow-sm">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h3 className="text-[#0A1128] font-bold text-lg tracking-tight">Kinerja Produk/Jasa</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Views Per Item</p>
                            </div>
                        </div>
                        {products.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-sm font-medium">Belum ada produk/jasa.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map((prod: any) => {
                                    const impressions = analyticsRes?.productImpressions?.find((p: any) => p.product_id === prod.id)?.views || 0;
                                    return (
                                        <div key={prod.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-[#FFBF00]/30 transition-colors shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                                    {prod.images && prod.images[0] ? (
                                                        <img src={prod.images[0].image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <PackageIcon className="w-6 h-6 m-3 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#0A1128] line-clamp-1 break-all">{prod.nama_produk}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{prod.kategori_produk || 'Umum'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 bg-[#FBFBFB] px-3 py-1.5 rounded-lg border border-slate-100">
                                                <EyeIcon className="w-4 h-4 text-[#FFBF00]" />
                                                <span className="text-sm font-black text-[#0A1128]">{impressions}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
