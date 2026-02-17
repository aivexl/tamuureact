import React from 'react';
import { m } from 'framer-motion';
import {
    Star, Zap, Sparkles, CheckCircle, ShieldCheck,
    Image as ImageIcon, Quote as QuoteIcon, MapPin, Music,
    MessageSquare, Share2, Gift, CreditCard, Video,
    Trophy, BookOpen, Monitor, BarChart3, Radio
} from 'lucide-react';

const features = [
    {
        title: "Tema Premium",
        description: "Pilihan tema eksklusif untuk berbagai jenis acara spesial Anda.",
        icon: Star,
        size: "large"
    },
    {
        title: "Edit Mudah",
        description: "Kustomisasi penuh langsung dari smartphone Anda.",
        icon: Zap,
        size: "small"
    },
    {
        title: "Custom Domain",
        description: "Gunakan identitas unik Anda sendiri.",
        icon: Radio,
        size: "small"
    },
    {
        title: "RSVP & Guest Book",
        description: "Manajemen tamu dan ucapan yang terintegrasi secara cerdas.",
        icon: CheckCircle,
        size: "medium"
    },
    {
        title: "QR Code Check-in",
        description: "Sistem registrasi tamu modern yang cepat dan aman.",
        icon: ShieldCheck,
        size: "medium"
    },
    {
        title: "Galeri & Media",
        description: "Abadikan momen indah dalam resolusi tinggi.",
        icon: ImageIcon,
        size: "small"
    },
    {
        title: "Quote Eksklusif",
        description: "Rangkaian kata indah yang menyentuh hati.",
        icon: QuoteIcon,
        size: "small"
    },
    {
        title: "Alamat & Peta",
        description: "Navigasi presisi ke lokasi acara Anda.",
        icon: MapPin,
        size: "small"
    },
    {
        title: "Musik Latar",
        description: "Alunan melodi yang menyempurnakan suasana.",
        icon: Music,
        size: "small"
    },
    {
        title: "Wishes & Doa",
        description: "Ruang bagi tamu untuk mengirimkan doa terbaik.",
        icon: MessageSquare,
        size: "small"
    },
    {
        title: "Social Media Share",
        description: "Bagikan kebahagiaan ke jejaring sosial Anda.",
        icon: Share2,
        size: "small"
    },
    {
        title: "E-Gift & Angpao",
        description: "Media pemberian hadiah digital yang praktis.",
        icon: CreditCard,
        size: "medium"
    },
    {
        title: "Live Streaming",
        description: "Hadirkan tamu dari mana saja secara real-time.",
        icon: Video,
        size: "medium"
    },
    {
        title: "Undian Digital",
        description: "Fitur interaktif untuk kemeriahan acara Anda.",
        icon: Trophy,
        size: "small"
    },
    {
        title: "Story & Journey",
        description: "Ceritakan perjalanan cinta atau sejarah Anda.",
        icon: BookOpen,
        size: "small"
    },
    {
        title: "Display TV/Monitor",
        description: "Visualisasi data tamu langsung di layar besar.",
        icon: Monitor,
        size: "small"
    },
    {
        title: "Analitik Canggih",
        description: "Statistik lengkap kunjungan dan interaksi tamu.",
        icon: BarChart3,
        size: "small"
    },
    {
        title: "WhatsApp Broadcast",
        description: "Undang ribuan tamu dengan efisiensi tinggi.",
        icon: Sparkles,
        size: "medium"
    },
];

const FeaturesSection: React.FC = () => {
    return (
        <section id="features" className="max-w-7xl mx-auto px-6 py-32 bg-white">
            <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
                <m.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-6xl font-black text-[#0A1128] tracking-tight leading-tight"
                >
                    Teknologi Terbaik untuk Momen Spesial Anda.
                </m.h2>
                <m.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-slate-500 font-medium"
                >
                    Didesain dengan presisi tinggi untuk menghadirkan pengalaman undangan digital kelas dunia.
                </m.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[280px]">
                {features.map((feature, index) => (
                    <m.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`
                            relative overflow-hidden group p-8 bg-[#FBFBFB] rounded-[2.5rem] 
                            border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] 
                            hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] 
                            hover:bg-white transition-all duration-300
                            ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                            ${feature.size === 'medium' ? 'md:col-span-2' : ''}
                        `}
                    >
                        {/* Background subtle gradient for depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative z-10 h-full flex flex-col">
                            <div className={`
                                w-14 h-14 rounded-2xl flex items-center justify-center mb-6
                                shadow-sm transition-all duration-500
                                ${feature.size === 'large' ? 'bg-[#0A1128] text-white' : 'bg-white text-[#0A1128] border border-slate-100'}
                                group-hover:scale-110 group-hover:-rotate-3
                            `}>
                                <feature.icon className={`w-7 h-7 ${feature.size === 'large' ? 'text-white' : 'text-[#0A1128]'}`} />
                            </div>

                            <h3 className={`
                                font-black text-[#0A1128] mb-3 tracking-tight
                                ${feature.size === 'large' ? 'text-3xl lg:text-4xl' : 'text-xl md:text-2xl'}
                            `}>
                                {feature.title}
                            </h3>

                            <p className={`
                                text-slate-500 leading-relaxed font-medium
                                ${feature.size === 'large' ? 'text-lg max-w-md' : 'text-sm md:text-base'}
                            `}>
                                {feature.description}
                            </p>
                        </div>

                        {/* Decoration for large card */}
                        {feature.size === 'large' && (
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        )}
                    </m.div>
                ))}
            </div>

            <m.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1 }}
                className="mt-20 text-center"
            >
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">
                    TAMUU PREMIUM EXPERIENCE 2026
                </p>
            </m.div>
        </section>
    );
};

export default FeaturesSection;
