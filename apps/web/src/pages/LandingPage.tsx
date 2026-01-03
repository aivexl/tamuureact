import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Star,
    ArrowRight,
    Zap,
    CheckCircle,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================
// TESTIMONIALS DATA - Indonesian Wedding Users
// ============================================
const testimonials = [
    {
        name: "Rina Santika",
        role: "Pasangan Pengantin",
        content: "Undangan digital dari Tamuu benar-benar memukau! Tamu-tamu kami kagum dengan desainnya yang elegan. Fitur RSVP sangat membantu kami menghitung jumlah tamu dengan akurat.",
        avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&h=150&fit=crop",
        rating: 5
    },
    {
        name: "Dewi Anggraini",
        role: "Calon Pengantin Wanita",
        content: "Awalnya ragu pakai undangan digital, tapi setelah lihat hasilnya, saya sangat puas! Tamu-tamu langsung bisa konfirmasi kehadiran dan kirim ucapan. Praktis sekali!",
        avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop",
        rating: 5
    },
    {
        name: "Budi Santoso",
        role: "Calon Pengantin Pria",
        content: "Proses pembuatan undangan sangat mudah, cukup dari HP saja. Tema-temanya premium dan modern. Sangat membantu untuk persiapan pernikahan kami yang mendadak.",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
        rating: 5
    },
    {
        name: "Siti Aminah",
        role: "Ibu Mempelai",
        content: "Fitur WhatsApp broadcast sangat membantu! Saya bisa kirim undangan ke keluarga besar dalam sekali klik. Hemat waktu dan tidak perlu repot antar undangan fisik.",
        avatar: "https://images.unsplash.com/photo-1509460913899-515f1df34fed?w=150&h=150&fit=crop",
        rating: 5
    },
    {
        name: "Hendra Wijaya",
        role: "Ayah Mempelai",
        content: "Untuk acara syukuran keluarga, Tamuu memberikan solusi undangan yang modern. Musik latar dan animasinya membuat undangan terasa hidup dan sangat eksklusif.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        rating: 5
    },
    {
        name: "Maya Putri",
        role: "Calon Pengantin Wanita",
        content: "Dashboard analitik tamu sangat membantu koordinasi dengan vendor catering. Kami tahu persis berapa tamu yang akan hadir. Acara jadi lebih terorganisir!",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        rating: 5
    }
];

// ============================================
// FEATURES DATA (FROM LEGACY)
// ============================================
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

// ============================================
// PRICING DATA (FROM LEGACY)
// ============================================
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

// ============================================
// WORD ROLLER COMPONENT
// ============================================
const eventTypes = ["Pernikahan", "Ulang Tahun", "Sunatan", "Syukuran", "Aqiqah", "Tunangan"];
const ITEM_HEIGHT_EM = 1.7;

const WordRoller: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const displayList = [...eventTypes, eventTypes[0]];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                if (prev < eventTypes.length) {
                    return prev + 1;
                }
                return prev;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentIndex === eventTypes.length) {
            const timeout = setTimeout(() => {
                setTransitionEnabled(false);
                setCurrentIndex(0);

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        setTransitionEnabled(true);
                    }, 50);
                });
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex]);

    return (
        <div className="flex items-center justify-center lg:justify-start overflow-visible" style={{ height: `${ITEM_HEIGHT_EM}em` }}>
            <span className="relative overflow-hidden inline-flex flex-col items-center lg:items-start min-w-[200px] sm:min-w-[400px]" style={{ height: `${ITEM_HEIGHT_EM}em` }}>
                <span
                    className={`flex flex-col w-full whitespace-nowrap ${transitionEnabled ? 'transition-transform duration-700 ease-in-out' : ''}`}
                    style={{ transform: `translateY(-${currentIndex * ITEM_HEIGHT_EM}em)` }}
                >
                    {displayList.map((event, i) => (
                        <span
                            key={i}
                            className="flex items-center justify-center lg:justify-start text-[#FFBF00]"
                            style={{ height: `${ITEM_HEIGHT_EM}em` }}
                        >
                            {event}
                        </span>
                    ))}
                </span>
            </span>
        </div>
    );
};

// ============================================
// MAIN LANDING PAGE COMPONENT
// ============================================
export const LandingPage: React.FC = () => {
    return (
        <div className="bg-white text-gray-900 overflow-visible font-sans">

            {/* Hero Section - Dark Navy Background */}
            <section className="relative pt-24 pb-0 sm:pt-32 overflow-hidden" style={{ backgroundColor: '#0A1128' }}>
                {/* Decorative Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center lg:items-end min-h-[500px] lg:h-[600px]">
                        {/* Left Column: Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-center lg:text-left space-y-8 pb-32 sm:pb-40 lg:pb-60 order-1"
                        >
                            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-black text-white flex flex-col items-center lg:items-start gap-2 md:gap-4 w-full tracking-tight leading-[1.05]">
                                <span className="break-words max-w-full">Platform Undangan Digital Premium</span>
                                <WordRoller />
                            </h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="text-lg md:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed tracking-wide"
                            >
                                Ciptakan kesan pertama yang tak terlupakan dengan desain eksklusif, fitur tercanggih, dan kualitas premium.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.5 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
                            >
                                <Link
                                    to="/editor"
                                    className="group relative inline-flex items-center gap-3 px-7 py-4 sm:px-10 sm:py-5 bg-white text-slate-900 font-black rounded-2xl shadow-2xl shadow-indigo-950/20 hover:bg-slate-50 hover:scale-105 transition-all duration-300 w-full sm:w-auto justify-center"
                                >
                                    Mulai Sekarang
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/admin/templates"
                                    className="px-7 py-4 sm:px-10 sm:py-5 bg-white/10 text-white border border-white/20 font-bold rounded-2xl shadow-sm hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto text-center"
                                >
                                    Lihat Undangan
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Right Column: Visual (Bride) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative flex justify-center lg:justify-end items-end order-2 mt-8 lg:mt-0"
                        >
                            {/* Backing Glow */}
                            <div className="absolute bottom-0 right-0 w-[120%] h-[120%] bg-rose-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />

                            {/* Bride Image */}
                            <div className="relative w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[420px] xl:max-w-[450px] flex items-end">
                                <img
                                    src="/images/hero-bride.png"
                                    alt="Tamuu Premium Guest"
                                    className="w-full h-auto object-contain object-bottom"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="max-w-7xl mx-auto px-6 py-24 bg-white">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-[#FFBF00] font-black uppercase tracking-widest text-sm">Fitur Masa Depan</h2>
                    <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Eksklusif Untuk Anda</h2>
                    <div className="w-20 h-1.5 bg-[#FFBF00] mx-auto rounded-full" />
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -8 }}
                            className="group p-10 bg-[#F8FAFC] rounded-[2.5rem] border border-slate-200/50 shadow-md hover:shadow-2xl hover:shadow-[#0A1128]/10 transition-all duration-500"
                        >
                            <div className="w-16 h-16 bg-[#0A1128]/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <feature.icon className="w-8 h-8 text-[#0A1128]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#0A1128] mb-4 tracking-tight">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 bg-white">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-[#FFBF00] font-black uppercase tracking-widest text-sm">Investasi Terbaik</h2>
                    <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Pilih Paket Kebahagiaan</h2>
                    <div className="w-20 h-1.5 bg-[#FFBF00] mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 xl:gap-8 items-center max-w-lg lg:max-w-none mx-auto">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
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
                            >
                                Pilih Sekarang
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section - Matching Hero Style */}
            <section id="testimonials" className="py-32 px-6 overflow-hidden relative" style={{ backgroundColor: '#0A1128' }}>
                {/* Decorative Glows - Same as Hero */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
                </div>

                <div className="max-w-7xl mx-auto text-center mb-24 relative z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[#FFBF00] text-xs font-bold tracking-wider uppercase mb-8 border border-[#FFBF00]/20"
                    >
                        <Star className="w-3 h-3 fill-[#FFBF00]" />
                        <span>Kesan Pelanggan</span>
                    </motion.div>
                    <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white leading-tight">Apa Kata <br /><span className="text-[#FFBF00]">Mempelai Tamuu</span></h2>
                    <p className="text-white/50 max-w-xl mx-auto font-medium text-lg">Dengarkan kebahagiaan mereka yang telah mempercayakan momen spesial kepada layanan kami.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 flex flex-col hover:bg-white/[0.08] transition-all group"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(t.rating)].map((_, starI) => (
                                    <Star key={starI} className="w-4 h-4 fill-[#FFBF00] text-[#FFBF00]" />
                                ))}
                            </div>
                            <blockquote className="text-white/80 font-medium leading-relaxed mb-10 flex-1 italic text-lg">
                                "{t.content}"
                            </blockquote>
                            <div className="flex items-center gap-4 border-t border-white/10 pt-8 mt-auto">
                                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full ring-2 ring-[#FFBF00]/30" />
                                <div className="text-left">
                                    <h4 className="font-bold text-white group-hover:text-[#FFBF00] transition-colors">{t.name}</h4>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-5xl mx-auto rounded-[3.5rem] bg-[#0A1128] p-12 md:p-24 text-center overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-500/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1]">Siap Untuk Membuat Momen Tak Terlupakan?</h2>
                        <p className="text-white/50 text-lg mb-12 max-w-xl mx-auto font-medium">Buat undangan premium Anda hari ini. Mulai gratis, tanpa kartu kredit.</p>
                        <Link
                            to="/editor"
                            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-[#FFBF00] text-[#0A1128] font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#FFBF00]/20"
                        >
                            Daftar Sekarang <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};
