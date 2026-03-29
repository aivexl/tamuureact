"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Star, Zap, Globe, Users, Scan, Sparkles,
    Image as ImageIcon, Quote as QuoteIcon, MapPin, Music,
    MessageCircle, Share2, Gift, CreditCard, Video,
    Trophy, BookOpen
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
        description: "Kirim undangan ke tam dengan satu klik.",
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
];

export const FeaturesSection = () => {
    return (
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 bg-white">
            <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-black text-[#0A1128] tracking-tighter leading-tight"
                >
                    Exclusively Designed.
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-slate-500 font-medium"
                >
                    Hadirkan kemewahan dan fungsionalitas dalam satu genggaman untuk momen tak terlupakan Anda.
                </motion.p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
                {features.map((feature, idx) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="group space-y-4"
                    >
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0A1128] group-hover:bg-[#FFBF00] group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100">
                            <feature.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-[#0A1128] tracking-tight">{feature.title}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
