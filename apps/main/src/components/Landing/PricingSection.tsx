"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@tamuu/shared';

const pricingPlans = [
    {
        tier: "free",
        name: "FREE",
        price: "Rp 0",
        duration: "selamanya",
        icon: Zap,
        features: [
            "1 Undangan Aktif",
            "Masa Aktif 30 Hari",
            "Template Dasar",
            "Buku Tamu Digital",
            "RSVP Dasar",
            "Watermark Tamuu",
        ],
    },
    {
        tier: "pro",
        name: "PRO",
        price: "Rp 99k",
        originalPrice: "Rp 149k",
        duration: "90 hari",
        icon: Crown,
        features: [
            "1 Undangan Aktif",
            "Masa Aktif 90 Hari",
            "Semua Template Premium",
            "Orbit Dynamic Animations",
            "Premium Music Library",
            "Digital Gift & Angpao",
            "Smart WhatsApp Sharing",
        ],
    },
    {
        tier: "ultimate",
        name: "ULTIMATE",
        price: "Rp 149k",
        originalPrice: "Rp 249k",
        duration: "180 hari",
        icon: Star,
        popular: true,
        features: [
            "1 Undangan Aktif",
            "Masa Aktif 180 Hari",
            "Semua Fitur Pro",
            "Sistem Check-in & Out",
            "QR Code per Tamu",
            "Lucky Draw / Undian",
            "Dashboard Analytics",
            "Social Media Management",
        ],
    },
    {
        tier: "elite",
        name: "ELITE",
        price: "Rp 199k",
        originalPrice: "Rp 299k",
        duration: "per tahun",
        icon: Crown,
        features: [
            "1 Undangan Aktif",
            "Masa Aktif 365 Hari",
            "Semua Fitur Ultimate",
            "Advanced Import/Export",
            "Eksklusivitas Layanan",
        ],
    },
];

export const PricingSection = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useStore();

    const handleAction = (tier: string) => {
        if (!isAuthenticated) {
            router.push('/signup');
            return;
        }

        if (tier === 'free') {
            router.push('/dashboard');
        } else {
            // For now redirect to billing
            router.push('/billing');
        }
    };

    return (
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 bg-white">
            <div className="text-center mb-16 space-y-4">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight"
                >
                    Mulai buat undangan impian Anda sekarang.
                </motion.h2>
                <div className="w-20 h-1.5 bg-[#FFBF00] mx-auto rounded-full" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch max-w-lg md:max-w-none mx-auto">
                {pricingPlans.map((plan, index) => {
                    const isCurrent = user?.tier === plan.tier;
                    const Icon = plan.icon;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-8 rounded-3xl border transition-all duration-300 ${plan.popular
                                ? 'bg-white border-[#FFBF00] z-10 shadow-xl'
                                : 'bg-white border-slate-200'
                                } ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFBF00] text-[#0A1128] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                    Recommend
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-8">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.popular ? 'bg-[#FFBF00] text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[#0A1128] uppercase tracking-wider">{plan.name}</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{plan.duration}</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#0A1128] tracking-tighter">{plan.price}</span>
                                    {plan.originalPrice && (
                                        <span className="text-sm text-slate-400 line-through font-medium tracking-tight">{plan.originalPrice}</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0 mt-0.5 border border-slate-100">
                                            <Check className="w-3 h-3 text-[#FFBF00]" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleAction(plan.tier)}
                                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${plan.popular
                                    ? 'bg-[#0A1128] text-white hover:bg-slate-800 shadow-lg shadow-indigo-950/20 hover:scale-[1.02]'
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#0A1128]'
                                    }`}
                            >
                                {isCurrent ? 'Plan Aktif' : 'Pilih Paket'}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};
