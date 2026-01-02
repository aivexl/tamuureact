import React from 'react';
import { motion } from 'framer-motion';
import {
    Star,
    ArrowRight,
    Smartphone,
    Share2,
    Palette,
    Lock,
    Zap,
    Play
} from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { Footer } from '../components/Layout/Footer';
import { WordRoller } from '../components/Landing/WordRoller';
import { Link } from 'react-router-dom';

const testimonials = [
    {
        name: "Elias Decker",
        role: "Event Organizer",
        content: "Undangan Tamuu Studio membantu saya memberikan pengalaman berkelas untuk klien. Dashboard editornya sangat intuitif dan hasilnya selalu memukau. Klien saya naik 140% sejak pakai platform ini.",
        avatar: "https://i.pravatar.cc/150?u=elias",
        rating: 5
    },
    {
        name: "Marcus Rodriguez",
        role: "Wedding Photographer",
        content: "Platform ini memberikan sisi kreatif yang tidak terbatas. Visualisasinya sangat pas untuk audiens saya, dan presisi desainnya tak tertandingi oleh kompetitor lain.",
        avatar: "https://i.pravatar.cc/150?u=marcus",
        rating: 5
    },
    {
        name: "Jade Thompson",
        role: "Digital Artist",
        content: "Sebagai konten kreator, saya butuh platform yang bisa dipercaya. AI background remover di sini benar-benar game-changer, memudahkan saya kustomisasi foto prewedding klien dengan cepat.",
        avatar: "https://i.pravatar.cc/150?u=jade",
        rating: 5
    },
    {
        name: "Alex Park",
        role: "Groom-to-be",
        content: "Real-time alerts dan kemudahan sharing lewat WhatsApp sangat membantu koordinasi tamu. Saya bisa fokus ke persiapan acara sementara Tamuu mengurus RSVP dengan otomatis.",
        avatar: "https://i.pravatar.cc/150?u=alex",
        rating: 5
    },
    {
        name: "Nina Patel",
        role: "Minimalist Designer",
        content: "Dulu saya butuh berjam-jam untuk coding undangan custom. Sekarang dengan Tamuu, semua dikerjakan oleh sistem dan saya cukup drag-and-drop elemen desain favorit saya.",
        avatar: "https://i.pravatar.cc/150?u=nina",
        rating: 5
    },
    {
        name: "Jordan Lee",
        role: "Influencer",
        content: "Prediksi analitik tamu di dashboard sangat membantu. Saya jadi lebih cerdas dalam mengatur catering dan kuota tamu karena datanya sangat akurat. Wajib coba buat yang mau nikah!",
        avatar: "https://i.pravatar.cc/150?u=jordan",
        rating: 5
    }
];

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#FDFDFD] text-gray-900 overflow-x-hidden font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-50">
                    <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-premium-accent/10 blur-[120px] rounded-full" />
                    <div className="absolute top-[20%] right-[5%] w-[35%] h-[35%] bg-blue-100/40 blur-[100px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-premium-accent/10 text-premium-accent text-xs font-bold tracking-wider uppercase mb-8 border border-premium-accent/20"
                    >
                        <Zap className="w-3 h-3 fill-premium-accent" />
                        <span>Visual Editor No. 1 di Indonesia</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8"
                    >
                        Satu kali sentuh, <br className="hidden md:block" />
                        undangan <WordRoller words={['pernikahan', 'sunatan', 'ulang tahun', 'wisuda', 'mewah']} /> <br className="hidden md:block" />
                        Anda selesai.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        Platform pembuatan undangan digital hiper-interaktif dengan visual editor revolusioner. Desain tanpa batas, fitur tanpa ribet, momen tak terlupakan.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6"
                    >
                        <Link
                            to="/editor"
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gray-900 text-white font-bold text-lg hover:bg-black transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            Buat Sekarang <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href="#demo"
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-gray-900 border border-gray-100 font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Play className="w-5 h-5 fill-gray-900" /> Lihat Demo
                        </a>
                    </motion.div>

                    {/* App Mockup Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="mt-20 relative px-4"
                    >
                        <div className="max-w-5xl mx-auto p-4 rounded-[2.5rem] bg-gray-100 border border-white shadow-2xl overflow-hidden aspect-video bg-[url('https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80')] bg-cover bg-center">
                            <div className="w-full h-full bg-black/20 backdrop-blur-[2px] flex items-center justify-center group cursor-pointer transition-all hover:backdrop-blur-0">
                                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-all">
                                    <Play className="w-8 h-8 text-premium-accent fill-premium-accent" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-premium-accent font-bold uppercase tracking-widest text-sm mb-4">Fitur Utama</h2>
                            <p className="text-4xl md:text-5xl font-black leading-tight">Membangun Masa Depan Undangan Digital.</p>
                        </div>
                        <p className="text-gray-500 max-w-sm font-medium mb-1">
                            Semua yang Anda butuhkan untuk membuat undangan yang berkesan bagi para tamu.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Palette className="w-6 h-6" />,
                                title: "Visual Editor",
                                description: "Drag-and-drop elemen sesuka hati. Tanpa coding, tanpa batas. Desain seperti profesional sekejap mata."
                            },
                            {
                                icon: <Smartphone className="max-w-6 h-6" />,
                                title: "Mobile Optimized",
                                description: "Undangan Anda akan terlihat memukau di semua perangkat, mulai dari smartphone hingga desktop."
                            },
                            {
                                icon: <Share2 className="max-w-6 h-6" />,
                                title: "Instant Sharing",
                                description: "Bagikan lewat WhatsApp, Telegram, atau e-mail dengan manajemen daftar tamu yang cerdas."
                            },
                            {
                                icon: <Zap className="max-w-6 h-6" />,
                                title: "Real-time Update",
                                description: "Ubah data undangan kapan saja. Perubahan akan langsung terlihat oleh semua tamu Anda."
                            },
                            {
                                icon: <Lock className="max-w-6 h-6" />,
                                title: "Keamanan Data",
                                description: "Data Anda dan tamu terenkripsi. Kami menghargai privasi dan keamanan momen penting Anda."
                            },
                            {
                                icon: <Star className="max-w-6 h-6" />,
                                title: "Fitur Interaktif",
                                description: "Konfirmasi kehadiran (RSVP), amplop digital, hingga musik latar yang terintegrasi."
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -8 }}
                                className="p-10 rounded-[2rem] bg-gray-50 border border-gray-50 transition-all hover:bg-white hover:border-gray-100 hover:shadow-xl group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-premium-accent mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-normal">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className="py-16 bg-white border-y border-gray-50 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 opacity-30 grayscale hover:grayscale-0 transition-all">
                    <div className="text-sm font-bold tracking-widest uppercase text-gray-400">Trusted By</div>
                    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
                        <span className="text-2xl font-black italic">Cloudflare</span>
                        <span className="text-2xl font-black italic">Supabase</span>
                        <span className="text-2xl font-black italic">Google</span>
                        <span className="text-2xl font-black italic">Framer</span>
                        <span className="text-2xl font-black italic">Vercel</span>
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Dark Mode for Impact */}
            <section id="testimonials" className="py-32 bg-[#0A0A0A] px-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-premium-accent/10 blur-[150px] rounded-full" />

                <div className="max-w-7xl mx-auto text-center mb-24 relative z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-white/70 text-xs font-bold tracking-wider uppercase mb-8 border border-white/10"
                    >
                        <Zap className="w-3 h-3 fill-white" />
                        <span>Testimonial</span>
                    </motion.div>
                    <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white leading-tight">See How We Help <br /> Creators Win</h2>
                    <p className="text-white/40 max-w-xl mx-auto font-medium text-lg">Hear from traders and creators who've accelerated their success with our AI-powered design analytics.</p>
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
                                    <Star key={starI} className="w-4 h-4 fill-premium-accent text-premium-accent" />
                                ))}
                            </div>
                            <blockquote className="text-white/80 font-medium leading-relaxed mb-10 flex-1 italic text-lg">
                                "{t.content}"
                            </blockquote>
                            <div className="flex items-center gap-4 border-t border-white/5 pt-8 mt-auto">
                                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full ring-2 ring-premium-accent/30" />
                                <div className="text-left">
                                    <h4 className="font-bold text-white group-hover:text-premium-accent transition-colors">{t.name}</h4>
                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto rounded-[3.5rem] bg-gray-900 p-12 md:p-24 text-center overflow-hidden relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-premium-accent/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1]">Siap Untuk Membuat Momen Tak Terlupakan?</h2>
                        <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto font-medium">Buat undangan premium Anda hari ini. Mulai gratis, tanpa kartu kredit.</p>
                        <Link
                            to="/editor"
                            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-premium-accent text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-premium-accent/20"
                        >
                            Daftar Sekarang <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};
