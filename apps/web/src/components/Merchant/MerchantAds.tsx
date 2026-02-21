import React from 'react';
import { m } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useMerchantProfile, useBoostShop } from '../../hooks/queries/useShop';

// Icons
const ZapIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.71 12 2.5V11h8l-8 12.5V13H4Z" /></svg>
);
const TrendingUpIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const MousePointerClickIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 9 5 12 1.774-5.226L21 14Z" /><path d="m16.071 16.071 4.243 4.243" /><path d="m7.188 2.239.777 2.897" /><path d="m5.136 7.965-2.898-.777" /><path d="m2 4.75 2.75 2.75" /></svg>
);
const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
);

export const MerchantAds: React.FC = () => {
    const user = useStore(s => s.user);
    const { data: merchantData, isLoading } = useMerchantProfile(user?.id);
    const { mutateAsync: boostShop, isPending } = useBoostShop();

    const merchant = merchantData?.merchant;
    const isBoosted = merchant?.is_sponsored;

    const handleBoost = async () => {
        if (!merchant?.id || !user?.id) return;
        try {
            await boostShop({ merchantId: merchant.id, userId: user.id });
            alert('Your shop has been successfully boosted! (Mock Payment Complete)');
        } catch (error: any) {
            console.error('Boost failed:', error);
            alert(error.message || 'Failed to boost shop.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#050505]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#FFBF00]"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full relative bg-white text-slate-900">
            <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 max-w-6xl mx-auto w-full pb-32 space-y-16">

                {/* Header */}
                <header className="space-y-3">
                    <m.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-black italic tracking-tight text-[#0A1128]">
                        Ads & <span className="text-[#FFBF00]">Growth Hub</span>
                    </m.h1>
                    <m.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] max-w-xl">
                        Amplify your visibility and capture premium marketplace real estate.
                    </m.p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Col: Main Engine */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Status Card */}
                        <m.section
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-[#FBFBFB] rounded-[40px] border border-slate-100 p-10 relative overflow-hidden shadow-sm"
                        >
                            <div className={`absolute top-0 right-0 w-64 h-64 ${isBoosted ? 'bg-[#FFBF00]/10' : 'bg-slate-500/5'} rounded-full blur-[100px]`} />

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <ZapIcon className={`w-5 h-5 ${isBoosted ? 'text-[#FFBF00]' : ''}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Sponsorship Engine</span>
                                    </div>
                                    <h2 className="text-3xl font-black italic text-[#0A1128] leading-tight">
                                        Shop <span className={isBoosted ? 'text-[#FFBF00]' : 'text-slate-400'}>{isBoosted ? 'Amplified' : 'Standby'}</span>
                                    </h2>
                                    <p className="text-slate-500 text-xs font-medium max-w-sm leading-relaxed">
                                        {isBoosted
                                            ? 'Your brand is currently prioritized in the global directory and category searches.'
                                            : 'Scale your reach by boosting your shop to the top tier of our discovery algorithm.'}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <div className={`w-32 h-32 rounded-full border-2 ${isBoosted ? 'border-[#FFBF00] shadow-[0_4px_20px_rgba(255,191,0,0.15)]' : 'border-slate-100'} flex items-center justify-center relative bg-white`}>
                                        <div className={`absolute inset-2 rounded-full ${isBoosted ? 'bg-[#FFBF00]/5 animate-pulse' : 'bg-slate-50'}`} />
                                        <div className="text-center">
                                            <div className={`text-2xl font-black italic ${isBoosted ? 'text-[#FFBF00]' : 'text-slate-300'}`}>
                                                {isBoosted ? '10x' : '1x'}
                                            </div>
                                            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Reach</div>
                                        </div>
                                    </div>
                                    {isBoosted ? (
                                        <div className="px-4 py-1.5 rounded-full bg-[#FFBF00]/10 border border-[#FFBF00]/30 text-[9px] font-black uppercase tracking-widest text-[#FFBF00]">Active Tier One</div>
                                    ) : (
                                        <div className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400">Dormant Phase</div>
                                    )}
                                </div>
                            </div>
                        </m.section>

                        {/* Telemetry Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <TelemetryCard
                                icon={EyeIcon}
                                label="Total Impressions"
                                value={isBoosted ? "42,891" : "1,204"}
                                trend="+240%"
                                color="#FFBF00"
                                delay={0.3}
                            />
                            <TelemetryCard
                                icon={MousePointerClickIcon}
                                label="Click Throughs"
                                value={isBoosted ? "852" : "14"}
                                trend="+180%"
                                color="#FF007F"
                                delay={0.4}
                            />
                            <TelemetryCard
                                icon={TrendingUpIcon}
                                label="Inquiry Velocity"
                                value={isBoosted ? "18/day" : "1/wk"}
                                trend="+310%"
                                color="#11b4d4"
                                delay={0.5}
                            />
                        </div>

                        {/* Boost Plans */}
                        {!isBoosted && (
                            <m.section
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-4 text-white italic">
                                    <ShieldCheckIcon className="w-5 h-5 text-[#FFBF00]" />
                                    <h2 className="text-xl font-black">Capital <span className="text-[#FFBF00]">Configurations</span></h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <PlanCard
                                        title="Velocity Boost"
                                        price="Rp 250.000"
                                        period="/ month"
                                        features={["Featured in Directory", "Golden Badge", "Basic Interaction Insights"]}
                                        onSelect={handleBoost}
                                        loading={isPending}
                                    />
                                    <PlanCard
                                        title="Dominion Tier"
                                        price="Rp 750.000"
                                        period="/ month"
                                        features={["Top SEO Placement", "Diamond Aura Logo", "Full Telemetry Package", "VIP Priority Support"]}
                                        primary
                                        onSelect={handleBoost}
                                        loading={isPending}
                                    />
                                </div>
                            </m.section>
                        )}
                    </div>

                    {/* Right Col: Performance Breakdown */}
                    <div className="lg:col-span-4 space-y-10">
                        <m.section
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                            className="bg-[#FBFBFB] backdrop-blur-xl rounded-[40px] border border-slate-100 p-8 space-y-8 shadow-sm sticky top-10"
                        >
                            <h3 className="text-sm font-black italic text-[#0A1128] uppercase tracking-widest">Growth <span className="text-[#FFBF00]">Diagnostics</span></h3>

                            <div className="space-y-6">
                                <DiagnosticBar label="Category Dominance" value={78} color="#FFBF00" />
                                <DiagnosticBar label="Discovery Rate" value={45} color="#FF007F" />
                                <DiagnosticBar label="Lead Conversion" value={22} color="#11b4d4" />
                            </div>

                            <div className="pt-8 border-t border-slate-100 space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FFBF00]/5 border border-[#FFBF00]/10">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-[#FFBF00] shadow-[0_0_10px_#FFBF00]" />
                                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                                        "Boosting your shop increases lead generation by an average of 850% in the first 48 hours."
                                    </p>
                                </div>
                            </div>
                        </m.section>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TelemetryCard = ({ icon: Icon, label, value, trend, color, delay }: any) => (
    <m.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="bg-white border border-slate-100 rounded-[32px] p-6 space-y-4 shadow-sm group hover:shadow-md transition-all"
    >
        <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">{trend}</span>
        </div>
        <div>
            <div className="text-2xl font-black italic text-[#0A1128]">{value}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</div>
        </div>
    </m.div>
);

const PlanCard = ({ title, price, period, features, onSelect, primary, loading }: any) => (
    <div className={`p-10 rounded-[40px] border relative overflow-hidden transition-all hover:scale-[1.02] ${primary ? 'bg-[#FFBF00] border-[#FFBF00] shadow-[0_10px_30px_rgba(255,191,0,0.2)]' : 'bg-white border-slate-100 shadow-sm'}`}>
        {primary && <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-[#0A1128] text-[8px] font-black uppercase tracking-widest text-[#FFBF00]">Popular</div>}

        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className={`text-xl font-black italic ${primary ? 'text-[#0A1128]' : 'text-[#0A1128]'}`}>{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${primary ? 'text-[#0A1128]' : 'text-[#0A1128]'}`}>{price}</span>
                    <span className={`text-[10px] font-bold ${primary ? 'text-[#0A1128]/60' : 'text-slate-400'}`}>{period}</span>
                </div>
            </div>

            <ul className="space-y-4">
                {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                        <ShieldCheckIcon className={`w-4 h-4 ${primary ? 'text-[#0A1128]' : 'text-[#FFBF00]'}`} />
                        <span className={`text-[11px] font-black tracking-tight ${primary ? 'text-[#0A1128]/80' : 'text-slate-500'}`}>{f}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={onSelect}
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2
                    ${primary ? 'bg-[#0A1128] text-white hover:bg-black' : 'bg-[#FFBF00] text-[#0A1128] hover:bg-[#FFD700]'}
                `}
            >
                {loading ? <div className={`animate-spin rounded-full h-4 w-4 border-t-2 ${primary ? 'border-white' : 'border-[#0A1128]'}`}></div> : null}
                {loading ? 'Processing...' : 'Deploy Capital'}
            </button>
        </div>
    </div>
);

const DiagnosticBar = ({ label, value, color }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
            <span className="text-slate-400">{label}</span>
            <span style={{ color }}>{value}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <m.div
                initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full" style={{ backgroundColor: color }}
            />
        </div>
    </div>
);
