import React from 'react';
import { m } from 'framer-motion';
import { Star, Zap, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

const features = [
    {
        title: "450+ Tema Premium",
        description: "Pilihan tema beragam kategori untuk berbagai jenis acara",
        icon: Star,
    },
    {
        title: "Edit Mudah",
        description: "Cukup dari HP, edit undangan dalam hitungan menit",
        icon: Zap,
    },
    {
        title: "Custom Domain",
        description: "Tampil unik dengan domain atas nama pribadi atau brand",
        icon: Sparkles,
    },
    {
        title: "RSVP & Guest Book",
        description: "Kelola konfirmasi tamu dan ucapan dengan mudah",
        icon: CheckCircle,
    },
    {
        title: "QR Code Check-in",
        description: "Sistem check-in modern untuk acara Anda",
        icon: ShieldCheck,
    },
    {
        title: "WhatsApp Broadcast",
        description: "Kirim undangan ke semua tamu dalam sekali klik",
        icon: Sparkles,
    },
];

const FeaturesSection: React.FC = () => {
    return (
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 bg-white">
            <div className="text-center mb-20 space-y-4">
                <span className="text-amber-900 font-black uppercase tracking-widest text-sm block">Fitur Masa Depan</span>
                <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Eksklusif Untuk Anda</h2>
                <div className="w-20 h-1.5 bg-[#FFBF00] mx-auto rounded-full" aria-hidden="true" />
            </div>

            <div className="grid md:grid-cols-3 gap-10">
                {features.map((feature, index) => (
                    <m.div
                        key={index}
                        whileHover={{ y: -8 }}
                        className="group p-10 bg-[#F8FAFC] rounded-[2.5rem] border border-slate-200/50 shadow-md hover:shadow-2xl hover:shadow-[#0A1128]/10 transition-all duration-500"
                    >
                        <div className="w-16 h-16 bg-[#0A1128]/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <feature.icon className="w-8 h-8 text-[#0A1128]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0A1128] mb-4 tracking-tight">{feature.title}</h3>
                        <p className="text-slate-600 leading-relaxed font-medium">{feature.description}</p>
                    </m.div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;
