"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Rina Santika",
        role: "Pasangan Pengantin",
        content: "Undangan digital dari Tamuu benar-benar memukau! Tamu-tamu kami kagum dengan desainnya yang elegan. Fitur RSVP sangat membantu kami menghitung jumlah tamu dengan akurat.",
        rating: 5
    },
    {
        name: "Dewi Anggraini",
        role: "Calon Pengantin Wanita",
        content: "Awalnya ragu pakai undangan digital, tapi setelah lihat hasilnya, saya sangat puas! Tamu-tamu langsung bisa konfirmasi kehadiran and kirim ucapan. Praktis sekali!",
        rating: 5
    },
    {
        name: "Budi Santoso",
        role: "Calon Pengantin Pria",
        content: "Proses pembuatan undangan sangat mudah, cukup dari HP saja. Tema-temanya premium dan modern. Sangat membantu untuk persiapan pernikahan kami yang mendadak.",
        rating: 5
    },
    {
        name: "Siti Aminah",
        role: "Ibu Mempelai",
        content: "Fitur WhatsApp broadcast sangat membantu! Saya bisa kirim undangan ke keluarga besar dalam sekali klik. Hemat waktu dan tidak perlu repot antar undangan fisik.",
        rating: 5
    },
    {
        name: "Hendra Wijaya",
        role: "Ayah Mempelai",
        content: "Untuk acara syukuran keluarga, Tamuu memberikan solusi undangan yang modern. Musik latar dan animasinya membuat undangan terasa hidup dan sangat eksklusif.",
        rating: 5
    },
    {
        name: "Maya Putri",
        role: "Calon Pengantin Wanita",
        content: "Dashboard analitik tamu sangat membantu koordinasi dengan vendor catering. Kami tahu persis berapa tamu yang akan hadir. Acara jadi lebih terorganisir!",
        rating: 5
    }
];

export const TestimonialsSection = () => {
    return (
        <section id="testimonials" className="py-32 px-6 overflow-hidden relative" style={{ backgroundColor: '#0A1128' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-7xl mx-auto text-center mb-24 relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[#FFBF00] text-xs font-bold tracking-[0.2em] uppercase mb-10 border border-white/10"
                >
                    <Star className="w-3 h-3 fill-[#FFBF00]" />
                    <span>Kesan Pelanggan</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto px-4"
                >
                    <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight leading-tight text-center">
                        Dengarkan kebahagiaan mereka yang telah mempercayakan momen spesial kepada layanan Tamuu.
                    </h2>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                {testimonials.map((t, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 backdrop-blur-sm flex flex-col justify-between group hover:bg-white/10 transition-all duration-500"
                    >
                        <div className="space-y-6">
                            <div className="flex gap-1">
                                {[...Array(t.rating)].map((_, idx) => (
                                    <Star key={idx} className="w-4 h-4 text-[#FFBF00] fill-[#FFBF00]" />
                                ))}
                            </div>
                            <p className="text-slate-300 leading-relaxed font-medium italic">"{t.content}"</p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <h4 className="text-white font-bold">{t.name}</h4>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">{t.role}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
