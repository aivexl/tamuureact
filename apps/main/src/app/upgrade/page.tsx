"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Star, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
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

// ============================================
// TYPES
// ============================================
interface TierCardProps {
    name: string;
    price: string;
    originalPrice?: string;
    duration: string;
    features: string[];
    isPopular?: boolean;
    isCurrent?: boolean;
    icon: React.ElementType;
    color: string;
    buttonText: string;
    onSelect: () => void;
    isLoading?: boolean;
}

interface MidtransResponse {
    token: string;
    error?: string;
    error_messages?: string[];
}

// ============================================
// TIER CARD COMPONENT
// ============================================
const TierCard: React.FC<TierCardProps> = ({
    name,
    price,
    originalPrice,
    duration,
    features,
    isPopular,
    isCurrent,
    icon: Icon,
    color,
    buttonText,
    onSelect,
    isLoading
}) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`relative p-8 rounded-3xl border ${isPopular
            ? 'bg-white border-[#FFBF00] shadow-[0_20px_50px_rgba(255,191,0,0.15)] z-10'
            : 'bg-white/50 border-white/20 backdrop-blur-xl'
            } ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
    >
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFBF00] text-[#0A1128] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                Recommended
            </div>
        )}

        {isCurrent && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                Current Plan
            </div>
        )}

        <h3 className="text-2xl font-black text-[#0A1128] mb-2">{name}</h3>
        <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-black text-[#0A1128]">{price}</span>
            <span className="text-slate-400 text-sm font-medium">/{duration}</span>
        </div>
        {originalPrice && (
            <span className="text-slate-400 line-through text-sm font-medium mb-6 block">
                Regular {originalPrice}
            </span>
        )}

        <div className="space-y-4 mb-8 mt-6">
            {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-100 rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-slate-600 text-sm leading-tight">{feature}</span>
                </div>
            ))}
        </div>

        <button
            onClick={onSelect}
            disabled={isCurrent || isLoading}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${isCurrent
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isPopular
                    ? 'bg-[#FFBF00] text-[#0A1128] hover:shadow-[0_10px_20px_rgba(255,191,0,0.3)]'
                    : 'bg-[#0A1128] text-white hover:bg-[#152042]'
                } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
        >
            {isLoading ? (
                <>
                    Processing...
                    <PremiumLoader variant="inline" size="sm" color="currentColor" />
                </>
            ) : (
                <>
                    {buttonText}
                    {!isCurrent && <ArrowRight className="w-4 h-4" />}
                </>
            )}
        </button>
    </motion.div>
);

// ============================================
// UPGRADE CONTENT
// ============================================
function UpgradeContent() {
    const router = useRouter();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [processingTier, setProcessingTier] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load user from localStorage
    useEffect(() => {
        const userData = localStorage.getItem('tamuu_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Auto-trigger payment if tier is specified in URL
    useEffect(() => {
        const tier = searchParams.get('tier');
        if (tier && user && !processingTier) {
            const validTiers = ['pro', 'ultimate', 'elite'];
            if (validTiers.includes(tier)) {
                setTimeout(() => {
                    handlePayment(tier);
                }, 800);
            }
        }
    }, [searchParams, user]);

    const handlePayment = async (tier: string) => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent('/upgrade?tier=' + tier)}`);
            return;
        }

        setProcessingTier(tier);
        setError(null);

        try {
            // Step 1: Load Snap script if not already loaded
            await loadSnapScript();

            // Step 2: Get Midtrans token from API
            const pricing: Record<string, number> = {
                'pro': 99000,
                'ultimate': 149000,
                'elite': 199000
            };
            const amount = pricing[tier] || 99000;

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
            console.log('[Upgrade] Launching Snap with token:', data.token);
            (window as any).snap.pay(data.token, {
                onSuccess: (result: any) => {
                    console.log('[Upgrade] Payment success:', result);
                    router.push('/dashboard?payment=success');
                },
                onPending: (result: any) => {
                    console.log('[Upgrade] Payment pending:', result);
                    router.push('/dashboard?payment=pending');
                },
                onError: (result: any) => {
                    console.error('[Upgrade] Payment error:', result);
                    setError('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
                    setProcessingTier(null);
                },
                onClose: () => {
                    console.log('[Upgrade] Snap closed');
                    setProcessingTier(null);
                }
            });

        } catch (err: any) {
            console.error('[Upgrade] Payment failed:', err);
            setError(err.message || 'Sistem pembayaran tidak dapat dimuat. Hubungi admin.');
            setProcessingTier(null);
        }
    };

    const currentTier = user?.tier || 'free';

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-[#0A1128] mb-6 leading-tight"
                    >
                        Elevate Your <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFBF00] to-[#FF8C00]">
                            Celebration
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg max-w-2xl mx-auto"
                    >
                        Pilih paket terbaik untuk membuat momen kebahagiaan Anda tak terlupakan.
                    </motion.p>
                </div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-black text-rose-500 uppercase tracking-widest">Konfigurasi Error</p>
                            <p className="text-xs text-rose-200/70 font-medium leading-relaxed">{error}</p>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start relative">
                    {/* Free Tier */}
                    <TierCard
                        name="FREE"
                        price="Rp 0"
                        duration="selamanya"
                        icon={Zap}
                        color="bg-slate-400"
                        isCurrent={currentTier === 'free'}
                        features={[
                            "1 Undangan Aktif",
                            "Masa Aktif 30 Hari",
                            "Template Dasar",
                            "Buku Tamu Digital",
                            "RSVP Dasar",
                            "Watermark Tamuu",
                        ]}
                        buttonText={currentTier === 'free' ? "Current Plan" : "Get Started"}
                        onSelect={() => router.push('/dashboard')}
                        isLoading={processingTier === 'free'}
                    />

                    {/* Pro Tier */}
                    <TierCard
                        name="PRO"
                        price="Rp 99k"
                        originalPrice="Rp 149k"
                        duration="90 hari"
                        icon={Crown}
                        color="bg-indigo-600"
                        isCurrent={currentTier === 'pro'}
                        features={[
                            "1 Undangan Aktif",
                            "Masa Aktif 90 Hari",
                            "Semua Template Premium",
                            "Orbit Dynamic Animations",
                            "Premium Music Library",
                            "Digital Gift & Angpao",
                            "Smart WhatsApp Sharing",
                        ]}
                        buttonText={currentTier === 'pro' ? "Active" : "Go Pro"}
                        onSelect={() => handlePayment('pro')}
                        isLoading={processingTier === 'pro'}
                    />

                    {/* Ultimate Tier */}
                    <TierCard
                        name="ULTIMATE"
                        price="Rp 149k"
                        originalPrice="Rp 249k"
                        duration="180 hari"
                        icon={Star}
                        color="bg-emerald-600"
                        isPopular={true}
                        isCurrent={currentTier === 'ultimate'}
                        features={[
                            "1 Undangan Aktif",
                            "Masa Aktif 180 Hari",
                            "Semua Fitur Pro",
                            "Sistem Check-in & Out",
                            "QR Code per Tamu",
                            "Lucky Draw / Undian",
                            "Dashboard Analytics",
                            "Social Media Management",
                        ]}
                        buttonText={currentTier === 'ultimate' ? "Active" : "Go Ultimate"}
                        onSelect={() => handlePayment('ultimate')}
                        isLoading={processingTier === 'ultimate'}
                    />

                    {/* Elite Tier */}
                    <TierCard
                        name="ELITE"
                        price="Rp 199k"
                        originalPrice="Rp 299k"
                        duration="per tahun"
                        icon={Crown}
                        color="bg-[#FFBF00]"
                        isCurrent={currentTier === 'elite'}
                        features={[
                            "1 Undangan Aktif",
                            "Masa Aktif 365 Hari",
                            "Semua Fitur Ultimate",
                            "Advanced Import/Export",
                            "Eksklusivitas Layanan",
                        ]}
                        buttonText={currentTier === 'elite' ? "Active" : "Go Elite"}
                        onSelect={() => handlePayment('elite')}
                        isLoading={processingTier === 'elite'}
                    />
                </div>

                <div className="mt-24 mb-12 text-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Pilihan Metode Pembayaran</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {["BNI", "CIMB", "ShopeePay", "Permata", "BRI", "QRIS", "BSI", "GoPay", "Mandiri", "DANA"].map(logo => (
                            <span key={logo} className="text-lg font-black text-slate-800 tracking-tighter">{logo}</span>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-8 rounded-3xl bg-[#0A1128] text-white overflow-hidden relative"
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-2xl font-black mb-2">Need a custom solution?</h2>
                            <p className="text-white/60">We offer special packages for wedding organizers and agencies.</p>
                        </div>
                        <Link
                            href="/contact"
                            className="bg-white text-[#0A1128] px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors shrink-0"
                        >
                            Contact Sales
                        </Link>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFBF00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </motion.div>
            </div>
        </div>
    );
}

// ============================================
// UPGRADE PAGE (with Suspense)
// ============================================
export default function UpgradePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <PremiumLoader variant="full" />
            </div>
        }>
            <UpgradeContent />
        </Suspense>
    );
}
