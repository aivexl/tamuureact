import React from 'react';
import { m } from 'framer-motion';
import {
    Star, Zap, Globe, Users, Scan, Sparkles,
    Image as ImageIcon, Quote as QuoteIcon, MapPin, Music,
    MessageCircle, Share2, Gift, CreditCard, Video,
    Trophy, BookOpen, Monitor, BarChart3
} from 'lucide-react';

const features = [
    {
        title: "Tema Premium",
        description: "Desain eksklusif terinspirasi estetika Apple untuk keanggunan tertinggi.",
        icon: Star,
        size: "2x2",
        color: "bg-blue-600",
        iconColor: "text-white"
    },
    {
        title: "Edit Mudah",
        description: "Kustomisasi instan langsung dari genggaman Anda.",
        icon: Zap,
        size: "2x1",
        color: "bg-amber-500",
        iconColor: "text-white"
    },
    {
        title: "RSVP & Guest Book",
        description: "Kelola kehadiran dan tanda tangan digital dengan alur yang mulus.",
        icon: Users,
        size: "2x2",
        color: "bg-[#0A1128]",
        iconColor: "text-white"
    },
    {
        title: "WhatsApp Broadcast",
        description: "Satu klik untuk jangkauan tak terbatas.",
        icon: Sparkles,
        size: "1x1"
    },
    {
        title: "QR Check-in",
        description: "Sistem registrasi tamu modern.",
        icon: Scan,
        size: "1x1"
    },
    {
        title: "Galeri Foto & Video",
        description: "Abadikan setiap detil indah dalam resolusi tinggi.",
        icon: ImageIcon,
        size: "2x1"
    },
    {
        title: "Musik Latar",
        description: "Harmoni melodi pilihan.",
        icon: Music,
        size: "1x1"
    },
    {
        title: "Navigasi Alamat",
        description: "Presisi lokasi lokasi.",
        icon: MapPin,
        size: "1x1"
    },
    {
        title: "Custom Domain",
        description: "Identitas personal wedding.com.",
        icon: Globe,
        size: "2x1"
    },
    {
        title: "Ayat & Quote",
        description: "Kalam indah menyentuh hati.",
        icon: QuoteIcon,
        size: "1x1"
    },
    {
        title: "Ucapan & Wishes",
        description: "Doa terbaik dari tamu.",
        icon: MessageCircle,
        size: "1x1"
    },
    {
        title: "Social Media Share",
        description: "Berbagi kebahagiaan luas.",
        icon: Share2,
        size: "2x1"
    },
    {
        title: "Amplop Digital",
        description: "Praktis & aman.",
        icon: Gift,
        size: "1x1"
    },
    {
        title: "E-Gift Payment",
        description: "Digital gifting modern.",
        icon: CreditCard,
        size: "1x1"
    },
    {
        title: "Live Streaming",
        description: "Hadirkan tamu virtual secara real-time.",
        icon: Video,
        size: "2x1",
        special: "LIVE"
    },
    {
        title: "Undian Doorprize",
        description: "Kemeriahan interaktif.",
        icon: Trophy,
        size: "1x1"
    },
    {
        title: "Love Story",
        description: "Narasi perjalanan cinta.",
        icon: BookOpen,
        size: "1x1"
    },
    {
        title: "Wedding Display",
        description: "Visualisasi layar besar.",
        icon: Monitor,
        size: "1x1"
    },
    {
        title: "Analitik Tamu",
        description: "Insight data kunjungan.",
        icon: BarChart3,
        size: "1x1"
    },
];

const FeaturesSection: React.FC = () => {
    return (
        <section id="features" className="max-w-7xl mx-auto px-6 py-32 bg-white">
            <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
                <m.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-black text-[#0A1128] tracking-tighter leading-tight"
                >
                    Premium Bento Experience.
                </m.h2>
                <m.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-slate-500 font-medium"
                >
                    Discover high-end features designed for your special day.
                </m.p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-[160px] md:auto-rows-[180px]">
                {features.map((feature, index) => (
                    <m.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.02 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`
                            relative overflow-hidden group p-6 rounded-[2.5rem] 
                            flex flex-col justify-between transition-all duration-300
                            ${feature.size === '2x2' ? 'col-span-2 row-span-2' : ''}
                            ${feature.size === '2x1' ? 'col-span-2' : ''}
                            ${feature.size === '1x1' ? 'col-span-1' : ''}
                            ${feature.color || 'bg-[#FBFBFB] border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'}
                            ${!feature.color && 'hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]'}
                        `}
                    >
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center mb-4
                                    transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3
                                    ${feature.iconColor ? 'bg-white/10' : 'bg-white shadow-sm border border-slate-100'}
                                `}>
                                    <feature.icon className={`w-6 h-6 ${feature.iconColor || 'text-[#0A1128]'}`} />
                                </div>

                                <h3 className={`
                                    font-black tracking-tight mb-2
                                    ${feature.size === '2x2' ? 'text-2xl md:text-3xl' : 'text-base md:text-lg'}
                                    ${feature.iconColor ? 'text-white' : 'text-[#0A1128]'}
                                `}>
                                    {feature.title}
                                </h3>

                                <p className={`
                                    font-medium leading-tight
                                    ${feature.size === '2x2' ? 'text-sm md:text-base max-w-[90%]' : 'text-[10px] md:text-xs text-slate-400'}
                                    ${feature.iconColor ? 'text-white/80' : ''}
                                `}>
                                    {feature.description}
                                </p>
                            </div>

                            {feature.special === 'LIVE' && (
                                <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full w-fit">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live</span>
                                </div>
                            )}
                        </div>

                        {/* Subtle Glass Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </m.div>
                ))}
            </div>

            <m.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-32 text-center"
            >
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-[#FBFBFB] rounded-full border border-slate-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[10px]">
                        Tamuu Premium Design Core 2026
                    </span>
                </div>
            </m.div>
        </section>
    );
};

export default FeaturesSection;
