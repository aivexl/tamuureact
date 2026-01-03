import React from 'react';
import { m } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const pricingPlans = [
    {
        name: "Basic",
        price: 150000,
        features: [
            "Aktif 1 bulan",
            "100+ tema pilihan",
            "Unlimited tamu",
            "RSVP & ucapan",
            "Google Maps",
            "Musik latar",
        ],
    },
    {
        name: "Premium",
        price: 250000,
        popular: true,
        features: [
            "Aktif 3 bulan",
            "450+ tema pilihan",
            "Unlimited tamu",
            "RSVP & ucapan",
            "QR Code check-in",
            "Custom domain",
            "WhatsApp broadcast",
            "Priority support",
        ],
    },
    {
        name: "Prioritas",
        price: 500000,
        features: [
            "Aktif 6 bulan",
            "Semua fitur Premium",
            "Custom theme",
            "Video invitation",
            "Live streaming",
            "Dedicated support",
            "Export data",
        ],
    },
];

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID").format(price);
};

const PricingSection: React.FC = () => {
    return (
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 bg-white">
            <div className="text-center mb-16 space-y-4">
                <span className="text-amber-900 font-black uppercase tracking-widest text-sm block">Investasi Terbaik</span>
                <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Pilih Paket Kebahagiaan</h2>
                <div className="w-20 h-1.5 bg-[#FFBF00] mx-auto rounded-full" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 xl:gap-8 items-center max-w-lg lg:max-w-none mx-auto">
                {pricingPlans.map((plan, index) => (
                    <m.div
                        key={index}
                        whileHover={{ y: -8 }}
                        className={`relative p-8 sm:p-10 rounded-[2.5rem] transition-all duration-500 ${plan.popular
                            ? 'bg-slate-900 text-white shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] lg:scale-105 z-10'
                            : 'bg-[#F8FAFC] text-slate-900 border border-slate-200 shadow-md hover:shadow-2xl'
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#FFBF00] text-[#0A1128] text-[10px] font-black tracking-[0.2em] uppercase py-2 px-6 rounded-full shadow-lg">
                                Rekomendasi Utama
                            </div>
                        )}

                        <h3 className="text-2xl font-black mb-2 tracking-tight">{plan.name}</h3>
                        <div className="flex items-baseline flex-wrap gap-1 mb-8">
                            <span className="text-sm font-bold opacity-60 flex-shrink-0">Rp</span>
                            <span className="text-3xl sm:text-5xl font-black tracking-tighter leading-none">{formatPrice(plan.price)}</span>
                            <span className="text-xs sm:text-sm font-medium opacity-60 flex-shrink-0">/acara</span>
                        </div>

                        <div className={`h-[1px] w-full mb-8 ${plan.popular ? 'bg-white/10' : 'bg-slate-200'}`} />

                        <ul className="space-y-4 mb-10">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-semibold">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-amber-400/20 text-amber-400' : 'bg-[#0A1128]/5 text-[#0A1128]/60'
                                        }`}>
                                        <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="opacity-90">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 transform active:scale-95 ${plan.popular
                                ? 'bg-[#FFBF00] text-[#0A1128] hover:bg-[#FFD700]'
                                : 'bg-[#0A1128] text-white shadow-lg shadow-[#0A1128]/20 hover:bg-slate-800'
                                }`}
                            aria-label={`Pilih paket ${plan.name}`}
                        >
                            Pilih Sekarang
                        </button>
                    </m.div>
                ))}
            </div>
        </section>
    );
};

export default PricingSection;
