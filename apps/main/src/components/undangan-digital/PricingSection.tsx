"use client";

import React, { useState, useEffect } from 'react';
import { motion as m } from 'framer-motion';
import { Check, Zap, Crown, Star, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

// ============================================
// MIDTRANS CONFIG
// ============================================
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-aVS390dhMuLvPXMa';
const MIDTRANS_IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
const SNAP_URL = MIDTRANS_IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

// ============================================
// HELPER: Load Snap Script
// ============================================
const loadSnapScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if ((window as any).snap) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = SNAP_URL;
        script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Gagal memuat sistem pembayaran Midtrans'));
        document.body.appendChild(script);
    });
};

interface MidtransResponse {
    token: string;
    error?: string;
    error_messages?: string[];
}

const pricingPlans = [
    {
        tier: "basic",
        name: "BASIC",
        price: "Rp 49k",
        originalPrice: "Rp 99k",
        duration: "30 hari",
        icon: Zap,
        features: [
            "1 Undangan Aktif",
            "Masa Aktif 30 Hari",
            "Link Undangan Custom",
            "Template Dasar",
            "Buku Tamu Digital",
            "RSVP Dasar",
        ],
        urgency: { left: 14, total: 20 }
    },
    {
        tier: "pro",
        name: "PRO",
        price: "Rp 149k",
        originalPrice: "Rp 199k",
        duration: "90 hari",
        icon: Crown,
        features: [
            "1 Undangan Aktif",
            "Masa Aktif 90 Hari",
            "Link Undangan Custom",
            "Semua Template Premium",
            "Orbit Dynamic Animations",
            "Digital Gift & Angpao",
        ],
        urgency: { left: 9, total: 15 }
    },
    {
        tier: "ultimate",
        name: "ULTIMATE",
        price: "Rp 199k",
        originalPrice: "Rp 399k",
        duration: "365 hari",
        icon: Star,
        popular: true,
        features: [
            "1 Undangan Aktif",
            "Masa Aktif 365 Hari",
            "Semua Fitur Pro",
            "Sistem Check-in & Out",
            "QR Code per Tamu",
            "Smart Welcome Display",
        ],
        urgency: { left: 6, total: 10 }
    },
    {
        tier: "elite",
        name: "ELITE",
        price: "Rp 999k",
        originalPrice: "Rp 1.499rb",
        duration: "selamanya",
        icon: Crown,
        features: [
            "1 Undangan Aktif",
            "Masa Aktif Selamanya",
            "Semua Fitur Ultimate",
            "Custom Domain Pribadi",
            "Advanced Import/Export",
            "Eksklusivitas Layanan",
        ],
        urgency: { left: 3, total: 5 }
    },
];

const UrgencyBar = ({ count, tier }: { count: number, tier: string }) => {
    const ranges: Record<string, [number, number]> = {
        basic: [12, 18], pro: [8, 12], ultimate: [5, 9], elite: [2, 4]
    };
    const [min, max] = ranges[tier] || [2, 20];
    const redWidth = 98 - ((count - min) / (max - min || 1)) * 5;

    return (
        <div className="mt-6 mb-2">
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[8px] sm:text-[9px] font-black text-[#EF4444] uppercase tracking-[0.2em] flex items-center gap-1.5 animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-[#EF4444]" />
                    Hampir Habis
                </span>
                <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Tersisa {count} Slot Promo</span>
            </div>
            <div className="h-1.5 w-full bg-emerald-500 rounded-full overflow-hidden flex shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] border border-slate-100/30">
                {/* Red Area (The Pressure Container) */}
                <m.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${redWidth}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-[#EF4444] relative overflow-hidden"
                >
                    {/* Layer 1: Left to Right Pressure Wave (The "Push") */}
                    <m.div 
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full skew-x-[-20deg] z-10"
                    />

                    {/* Layer 2: Right to Left Flash (The "Reflection") */}
                    <m.div 
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
                        className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent w-full z-20"
                    />
                    
                    {/* Layer 3: Pulsing Base Glow */}
                    <m.div 
                        animate={{ opacity: [0.85, 1, 0.85] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-[#EF4444]"
                    />
                </m.div>
            </div>
        </div>
    );
};

const PricingSection: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [processingTier, setProcessingTier] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Randomized urgency data
    const [urgencyData, setUrgencyData] = useState<Record<string, { left: number, total: number }>>({});

    useEffect(() => {
        setUrgencyData({
            basic: { left: Math.floor(Math.random() * (18 - 12 + 1)) + 12, total: 20 },
            pro: { left: Math.floor(Math.random() * (12 - 8 + 1)) + 8, total: 15 },
            ultimate: { left: Math.floor(Math.random() * (9 - 5 + 1)) + 5, total: 10 },
            elite: { left: Math.floor(Math.random() * (4 - 2 + 1)) + 2, total: 5 }
        });
    }, []);

    const handleAction = async (tier: string) => {
        if (!isAuthenticated || !user) {
            router.push(`/login?tier=${tier}`);
            return;
        }

        // Direct Payment Logic
        setProcessingTier(tier);
        setError(null);

        try {
            // Step 1: Load Snap script if not already loaded
            await loadSnapScript();

            // Step 2: Get Midtrans token from API
            const pricing: Record<string, number> = {
                'basic': 49000,
                'pro': 149000,
                'ultimate': 199000,
                'elite': 999000
            };
            const amount = pricing[tier] || 49000;

            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tamuu.id';
            const response = await fetch(`${API_BASE}/api/billing/midtrans/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tamuu_token') || ''}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    tier,
                    amount,
                    email: user.email,
                    name: user.full_name || user.name
                })
            });

            const data: MidtransResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal memproses pembayaran');
            }

            if (!data.token) {
                throw new Error(data.error_messages?.join(', ') || 'Token pembayaran tidak ditemukan');
            }

            // Step 3: Launch Snap modal
            (window as any).snap.pay(data.token, {
                onSuccess: (result: any) => {
                    router.push('/dashboard?payment=success');
                },
                onPending: (result: any) => {
                    router.push('/dashboard?payment=pending');
                },
                onError: (result: any) => {
                    setError('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
                    setProcessingTier(null);
                },
                onClose: () => {
                    setProcessingTier(null);
                }
            });

        } catch (err: any) {
            console.error('[Pricing] Payment failed:', err);
            setError(err.message || 'Sistem pembayaran tidak dapat dimuat.');
            setProcessingTier(null);
        }
    };

    return (
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 bg-white">
            <div className="text-center mb-16 space-y-4">
                <m.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight"
                >
                    Mulai buat undangan impian Anda sekarang.
                </m.h2>
                <div className="w-20 h-1.5 bg-[#FFBF00] mx-auto rounded-full" aria-hidden="true" />
            </div>

            {/* Error Display */}
            {error && (
                <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-black text-rose-500 uppercase tracking-widest">Payment Error</p>
                        <p className="text-xs text-rose-900/70 font-medium leading-relaxed">{error}</p>
                    </div>
                </m.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch max-w-lg md:max-w-none mx-auto">
                {pricingPlans.map((plan, index) => {
                    const Icon = plan.icon;
                    const isProcessing = processingTier === plan.tier;
                    
                    // Normalize tiers for comparison (handling legacy names if any)
                    const normalizedUserTier = (user?.tier || 'basic').toLowerCase();
                    const isCurrent = normalizedUserTier === plan.tier.toLowerCase();
                    const urgency = urgencyData[plan.tier];

                    return (
                        <m.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-8 rounded-3xl border transition-all duration-300 ${isCurrent 
                                ? 'bg-white border-emerald-500 ring-2 ring-emerald-500 ring-offset-4 shadow-xl'
                                : plan.popular
                                    ? 'bg-white border-[#FFBF00] z-10 shadow-xl'
                                    : 'bg-white border-slate-200'
                                }`}
                        >
                            {isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg">
                                    Plan Aktif
                                </div>
                            )}

                            {!isCurrent && plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFBF00] text-[#0A1128] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                    Recommend
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-8">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCurrent ? 'bg-emerald-100 text-emerald-600' : plan.popular ? 'bg-[#FFBF00] text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[#0A1128] uppercase tracking-wider">{plan.name}</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{plan.duration}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#0A1128] tracking-tighter">{plan.price}</span>
                                    {plan.originalPrice && (
                                        <span className="text-sm text-slate-400 line-through font-medium tracking-tight">{plan.originalPrice}</span>
                                    )}
                                </div>
                            </div>

                            {/* Apple-style Urgency Bar */}
                            {urgency && (
                                <UrgencyBar count={urgency.left} max={urgency.total} />
                            )}

                            <ul className="space-y-4 mb-10 mt-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${isCurrent ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                            <Check className={`w-3 h-3 ${isCurrent ? 'text-emerald-600' : 'text-[#FFBF00]'}`} strokeWidth={3} />
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleAction(plan.tier)}
                                disabled={!!processingTier || isCurrent}
                                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${isCurrent
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#0A1128] text-white hover:bg-slate-800 shadow-lg shadow-indigo-950/20 hover:scale-[1.02]'
                                    } ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isProcessing ? (
                                    <>
                                        Processing...
                                        <PremiumLoader variant="inline" size="sm" color="currentColor" />
                                    </>
                                ) : isCurrent ? (
                                    'Plan Aktif'
                                ) : (
                                    'Pilih Paket'
                                )}
                            </button>
                        </m.div>
                    );
                })}
            </div>
        </section>
    );
};

export default PricingSection;
