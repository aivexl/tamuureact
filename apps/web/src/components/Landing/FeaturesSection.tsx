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
        description: "Desain eksklusif dengan estetika tinggi untuk keanggunan momen spesial Anda.",
        icon: Star,
    },
    {
        title: "Edit Mudah",
        description: "Kustomisasi instan dan intuitif langsung dari genggaman Anda.",
        icon: Zap,
    },
    {
        title: "Custom Domain",
        description: "Gunakan identitas unik wedding.com untuk impresi yang lebih personal.",
        icon: Globe,
    },
    {
        title: "WhatsApp Broadcast",
        description: "Kirim undangan ke tamu secara dengan satu klik.",
        icon: Sparkles,
    },
    {
        title: "QR Code Check-in",
        description: "Sistem registrasi tamu modern untuk manajemen kehadiran yang efisien.",
        icon: Scan,
    },
    {
        title: "RSVP & Guest Book",
        description: "Kelola konfirmasi hadir dan buku tamu digital secara real-time.",
        icon: Users,
    },
    {
        title: "Galeri",
        description: "Abadikan dan bagikan setiap momen indah dalam resolusi tinggi.",
        icon: ImageIcon,
    },
    {
        title: "Quote",
        description: "Rangkaian kata indah dan ayat suci yang menyentuh hati para tamu.",
        icon: QuoteIcon,
    },
    {
        title: "Alamat",
        description: "Navigasi presisi dengan integrasi peta ke lokasi acara Anda.",
        icon: MapPin,
    },
    {
        title: "Musik",
        description: "Alunan melodi pilihan yang menyempurnakan suasana undangan.",
        icon: Music,
    },
    {
        title: "Wishes",
        description: "Ruang bagi tamu untuk mengirimkan doa dan ucapan terbaik.",
        icon: MessageCircle,
    },
    {
        title: "Social Media Share",
        description: "Kemudahan berbagi momen bahagia ke seluruh jejaring sosial.",
        icon: Share2,
    },
    {
        title: "Gift",
        description: "Kelola daftar kado fisik dengan cara yang terorganisir.",
        icon: Gift,
    },
    {
        title: "E-Gift",
        description: "Media pemberian amplop digital yang praktis, aman, dan modern.",
        icon: CreditCard,
    },
    {
        title: "Live Streaming",
        description: "Hadirkan tamu virtual secara langsung dari mana saja di dunia.",
        icon: Video,
    },
    {
        title: "Undian",
        description: "Fitur interaktif untuk memeriahkan acara dengan doorprize digital.",
        icon: Trophy,
    },
    {
        title: "Story",
        description: "Narasi perjalanan cinta yang disajikan secara sinematik.",
        icon: BookOpen,
    },
    {
        title: "Display",
        description: "Visualisasi data dan foto tamu langsung di layar besar lokasi.",
        icon: Monitor,
    },
];

const FeaturesSection: React.FC = () => {
    return (
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 bg-white">
            <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
                <m.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-black text-[#0A1128] tracking-tighter leading-tight"
                >
                    Exclusively Designed.
                </m.h2>
                <m.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-slate-500 font-medium"
                >
                    Designed with precision for your most precious moments.
                </m.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <m.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.02 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="relative p-10 bg-[#FBFBFB] rounded-apple border border-[#EDEDED] flex flex-col items-start h-full group transition-all duration-300 hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-[#EDEDED] flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                            <feature.icon className="w-7 h-7 text-[#0A1128]" />
                        </div>

                        <h3 className="text-2xl font-black text-[#0A1128] tracking-tight mb-4">
                            {feature.title}
                        </h3>

                        <p className="text-slate-500 font-medium leading-[1.6] text-[15px]">
                            {feature.description}
                        </p>
                    </m.div>
                ))}
            </div>

        </section>
    );
};

export default FeaturesSection;
