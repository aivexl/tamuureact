import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useMerchantProfile } from '../../hooks/queries/useShop';
import { getPublicDomain } from '../../lib/utils';
import { m } from 'framer-motion';

// ============================================
// INLINE ICONS
// ============================================
const StoreIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
);
const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
);
const ExternalLinkIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);
const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);

export const SmartMerchantCard: React.FC = () => {
    const user = useStore(s => s.user);
    const navigate = useNavigate();
    const { data: merchantData, isLoading } = useMerchantProfile(user?.id);

    // Render loading skeleton
    if (isLoading) {
        return (
            <div className="bg-white rounded-[2rem] p-7 md:p-8 border border-slate-100 shadow-sm animate-pulse space-y-4">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl mb-4"></div>
                <div className="h-6 bg-slate-200 rounded-md w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-12 bg-slate-200 rounded-2xl w-full mt-4"></div>
            </div>
        );
    }

    // STATE 2: ACTIVE MERCHANT / MINI STORE MANAGER
    if (merchantData?.isMerchant && merchantData.merchant) {
        const { merchant, stats } = merchantData;
        const storeUrl = `${getPublicDomain()}/shop/${merchant.slug}`;

        return (
            <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-7 md:p-8 border border-slate-200 shadow-xl shadow-slate-900/5 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex gap-4 items-center">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-slate-900/10">
                                {merchant.logo_url ? (
                                    <img src={merchant.logo_url} alt={merchant.nama_toko} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <StoreIcon className="w-7 h-7" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 leading-tight">{merchant.nama_toko}</h4>
                                <span className="inline-block mt-0.5 px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                                    {merchant.nama_kategori || 'Merchant'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Store URL</p>
                            <a href={`/shop/${merchant.slug}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1.5 truncate">
                                {storeUrl} <ExternalLinkIcon className="w-3.5 h-3.5" />
                            </a>
                        </div>
                        <div className="text-right border-l border-slate-200 pl-4 ml-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profile Views</p>
                            <p className="text-sm font-bold text-slate-900 flex items-center justify-end gap-1.5">
                                <TrendingUpIcon className="w-3.5 h-3.5 text-emerald-500" /> {stats?.views || 0}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/store/${merchant.slug}/dashboard`)}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 text-sm"
                    >
                        Kelola Toko <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </m.div>
        );
    }

    // STATE 1: NON-MERCHANT (PROSPECT)
    return (
        <m.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-teal-50 to-emerald-50/50 rounded-[2rem] p-7 md:p-8 border border-teal-100 relative overflow-hidden group shadow-lg shadow-teal-500/5 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500"
        >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-400/20 blur-3xl rounded-full group-hover:bg-teal-400/30 transition-colors duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm">
                    <StoreIcon className="w-6 h-6 text-teal-600" />
                </div>

                <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-2 leading-tight">
                    Buka Toko Jasa Anda
                </h4>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Kembangkan bisnis event/wedding Anda bersama Tamuu Nexus. Klaim URL kustom dan jangkau lebih banyak klien.
                </p>

                <button
                    onClick={() => navigate('/shop/onboarding')}
                    className="mt-auto w-full py-4 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 active:scale-95 text-sm flex justify-center items-center gap-2"
                >
                    Mulai Berjualan <ArrowRightIcon className="w-4 h-4" />
                </button>
            </div>
        </m.div>
    );
};
