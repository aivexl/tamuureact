import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Bell,
    Store,
    ArrowRight,
    MapPin,
    Star,
    Sparkles
} from 'lucide-react';
import { useShopDirectory } from '../../hooks/queries/useShop';
import { useCategories } from '../../hooks/queries';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useSEO } from '../../hooks/useSEO';

const CATEGORY_COLORS: Record<string, string> = {
    'Fotografi': '#FFBF00',
    'Katering': '#10B981',
    'Dekorasi': '#F43F5E',
    'Venue': '#8B5CF6',
    'MUA': '#EC4899',
    'Default': '#94A3B8'
};

const CAROUSEL_SLIDES = [
    {
        id: 'slide-1',
        // High fidelity MUA/Beauty
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80',
        link: '/shop?category=MUA'
    },
    {
        id: 'slide-2',
        // High fidelity Wedding Planner/Event
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
        link: '/shop?category=Wedding%20Organizer'
    },
    {
        id: 'slide-3',
        // High fidelity Catering/Dining
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80',
        link: '/shop?category=Catering'
    }
];

export const ShopPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play Logic
    React.useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
        }, 5000); // 5 seconds per slide
        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
        setIsAutoPlaying(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
        setIsAutoPlaying(false);
    };

    const { data: merchants = [], isLoading } = useShopDirectory(selectedCategory, searchQuery);

    // Strategic Master Data Categories
    const categories = ['All', 'MUA', 'Wedding Organizer', 'Catering', 'Fotografi', 'Dekorasi', 'Venue'];

    useSEO({
        title: 'Tamuu Nexus | Direktori Vendor Pernikahan & Event Terbaik',
        description: 'Temukan vendor profesional untuk pernikahan dan event Anda. Mulai dari fotografi, katering, hingga venue eksklusif di Tamuu Nexus.'
    });

    return (
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            <main className="max-w-7xl mx-auto px-6 pb-32">
                {/* Hero Carousel Section - Pure Image Fortune 500 Architecture */}
                <section className="pt-24 pb-16 relative">
                    <div className="relative w-full aspect-[21/9] md:aspect-[24/9] rounded-[2.5rem] overflow-hidden group border border-[#F1F5F9] shadow-sm bg-slate-50">
                        <AnimatePresence mode="wait">
                            <m.div
                                key={currentSlide}
                                initial={{ opacity: 0, scale: 1.02 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute inset-0 cursor-pointer"
                                onClick={() => navigate(CAROUSEL_SLIDES[currentSlide].link)}
                            >
                                <img
                                    src={CAROUSEL_SLIDES[currentSlide].image}
                                    alt={`Promotional Slide ${currentSlide + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </m.div>
                        </AnimatePresence>

                        {/* Apple-Grade Hover Navigation Arrows */}
                        <div className="absolute inset-y-0 left-0 flex items-center px-4 md:px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                className="w-12 h-12 rounded-full bg-white/30 hover:bg-white/90 backdrop-blur-md flex items-center justify-center text-[#0A1128] shadow-lg transition-all transform hover:scale-110 pointer-events-auto"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 md:px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="w-12 h-12 rounded-full bg-white/30 hover:bg-white/90 backdrop-blur-md flex items-center justify-center text-[#0A1128] shadow-lg transition-all transform hover:scale-110 pointer-events-auto"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </div>

                        {/* Landing Page Parity Pagination Dots */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                            {CAROUSEL_SLIDES.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentSlide(index);
                                        setIsAutoPlaying(false); // Pause auto-play on manual override
                                    }}
                                    className={`h-2 rounded-full transition-all duration-500 ease-out ${currentSlide === index
                                        ? 'w-8 bg-[#0A1128]'
                                        : 'w-2 bg-white/50 hover:bg-white/80'
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Subdued Search Bar Section */}
                <section className="max-w-3xl mx-auto mb-16">
                    <div className="relative group">
                        <div className="flex items-center w-full bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:shadow-md focus-within:border-[#FFBF00]/50 transition-all group">
                            <div className="pl-4 text-slate-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari vendor, jasa, atau inspirasi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-[#0A1128] placeholder:text-slate-300 text-base py-3 px-3 font-medium"
                            />
                            <button className="bg-[#FFBF00] text-[#0A1128] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                                Search
                            </button>
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className="mb-12">
                    <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-6 px-6">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border ${selectedCategory === cat
                                    ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-xl shadow-black/5 scale-105'
                                    : 'bg-white text-slate-500 border-slate-100 hover:border-[#FFBF00] hover:text-[#0A1128]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Merchant Grid */}
                <m.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            <div className="col-span-full py-20">
                                <PremiumLoader variant="inline" color="#0A1128" showLabel label="Elevating Catalogue..." />
                            </div>
                        ) : merchants.length > 0 ? (
                            merchants.map((merchant: any) => (
                                <m.div
                                    key={merchant.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={{ y: -8 }}
                                    className="group relative bg-white border border-[#F1F5F9] rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:border-[#FFBF00]/30"
                                >
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <img
                                            src={merchant.banner_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                                            alt={merchant.nama_toko}
                                            className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />

                                        {/* Merchant Logo Overlay */}
                                        <div className="absolute -bottom-6 left-6 w-14 h-14 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-lg">
                                            <img
                                                src={merchant.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${merchant.nama_toko}`}
                                                alt="Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="px-6 pt-10 pb-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-black tracking-tight text-[#0A1128] group-hover:text-[#FFBF00] transition-colors line-clamp-1">
                                                {merchant.nama_toko}
                                            </h3>
                                            <div className="flex items-center gap-1 text-[#FFBF00]">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span className="text-[10px] font-bold">4.9</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-8 text-slate-400">
                                            <MapPin className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Jakarta</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                {merchant.nama_kategori}
                                            </span>
                                        </div>

                                        <div className="mt-auto">
                                            <button
                                                onClick={() => navigate(`/shop/${merchant.slug}`)}
                                                className="w-full py-4 rounded-2xl bg-white border border-[#F1F5F9] group-hover:border-[#FFBF00] group-hover:text-[#FFBF00] text-[#0A1128] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 hover:gap-3"
                                            >
                                                Lihat Toko
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </m.div>
                            ))
                        ) : (
                            <div className="col-span-full py-32 text-center">
                                <div className="inline-flex p-8 rounded-full bg-slate-50 mb-6 text-slate-200">
                                    <Store className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-black mb-2 tracking-tight text-[#0A1128]">Vendor Tidak Ditemukan</h3>
                                <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">
                                    Coba ubah filter atau kata kunci untuk menemukan hasil lainnya.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </m.div>

                {/* Enterprise Footer CTA */}
                <section className="mt-40 p-16 rounded-[4rem] bg-[#0A1128] relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                        <div className="max-w-xl">
                            <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-white">Join the Elite Vendor Network</h3>
                            <p className="text-slate-400 font-semibold text-lg max-w-md">Bangun kehadiran digital vendor Anda bersama Tamuu Nexus.</p>
                        </div>
                        <button
                            onClick={() => navigate('/onboarding')}
                            className="px-12 py-6 bg-[#FFBF00] text-[#0A1128] font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-[#FFBF00]/10 hover:shadow-[#FFBF00]/30 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                        >
                            Daftar Sebagai Merchant
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ShopPage;
