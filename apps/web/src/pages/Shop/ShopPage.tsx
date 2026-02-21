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

export const ShopPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const { data: merchants = [], isLoading } = useShopDirectory(selectedCategory, searchQuery);
    const { data: categoryList = [] } = useCategories();

    useSEO({
        title: 'Tamuu Nexus | Direktori Vendor Pernikahan & Event Terbaik',
        description: 'Temukan vendor profesional untuk pernikahan dan event Anda. Mulai dari fotografi, katering, hingga venue eksklusif di Tamuu Nexus.'
    });

    const categories = useMemo(() => {
        return ['All', ...categoryList.map(c => c.name)];
    }, [categoryList]);

    return (
        <div className="min-h-screen bg-[#0A1128] text-white font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-[#0A1128]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <m.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                >
                    <div className="w-10 h-10 bg-[#FFBF00] rounded-xl flex items-center justify-center shadow-lg shadow-[#FFBF00]/20">
                        <Store className="w-6 h-6 text-[#0A1128]" />
                    </div>
                    <h1 className="text-xl font-black tracking-tighter uppercase">
                        Tamuu <span className="text-[#FFBF00]">Nexus</span>
                    </h1>
                </m.div>

                <div className="flex items-center gap-4">
                    <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-all">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFBF00]/20 to-indigo-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tamuu"
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pb-32">
                {/* Hero Section */}
                <section className="relative pt-12 pb-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFBF00]/10 rounded-full blur-[120px] -mr-48 -mt-24 pointer-events-none" />

                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFBF00]/10 border border-[#FFBF00]/20 rounded-full mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-[#FFBF00]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFBF00]">Verified Ecosystem</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-10">
                            Jelajahi Ekosistem <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFBF00] to-amber-500">Vendor Terbaik</span>
                        </h2>

                        {/* Search Bar */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-[#FFBF00]/10 rounded-2xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                            <div className="relative bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl flex items-center shadow-2xl focus-within:border-[#FFBF00]/50 transition-all duration-300">
                                <div className="pl-4 text-[#FFBF00]">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari vendor impianmu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/30 w-full px-4 py-4 text-base font-medium"
                                />
                                <button className="bg-[#FFBF00] text-[#0A1128] p-3.5 rounded-xl hover:scale-105 transition-transform">
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </m.div>
                </section>

                {/* Categories */}
                <section className="mb-12">
                    <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-6 px-6">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-7 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border ${selectedCategory === cat
                                        ? 'bg-[#FFBF00] text-[#0A1128] border-[#FFBF00] shadow-xl shadow-[#FFBF00]/20 scale-105'
                                        : 'bg-white/5 text-white/70 border-white/10 hover:border-[#FFBF00]/30 hover:text-white'
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
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            <div className="col-span-full py-20">
                                <PremiumLoader variant="inline" color="#FFBF00" showLabel label="Mempersiapkan Katalog..." />
                            </div>
                        ) : merchants.length > 0 ? (
                            merchants.map((merchant: any) => (
                                <m.div
                                    key={merchant.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ y: -8 }}
                                    className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 hover:border-[#FFBF00]/30 hover:shadow-2xl hover:shadow-[#FFBF00]/10"
                                >
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <img
                                            src={merchant.banner_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                                            alt={merchant.nama_toko}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-[#0A1128]/20 to-transparent opacity-80" />

                                        {/* Merchant Logo Overlay */}
                                        <div className="absolute -bottom-6 left-6 w-14 h-14 rounded-2xl border-4 border-[#0A1128] overflow-hidden bg-white shadow-xl">
                                            <img
                                                src={merchant.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${merchant.nama_toko}`}
                                                alt="Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="px-6 pt-10 pb-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-black tracking-tight text-white group-hover:text-[#FFBF00] transition-colors line-clamp-1">
                                                {merchant.nama_toko}
                                            </h3>
                                            <div className="flex items-center gap-1 text-[#FFBF00]">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span className="text-[10px] font-bold">4.9</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-6 text-white/40">
                                            <MapPin className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Jakarta</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CATEGORY_COLORS[merchant.nama_kategori] || CATEGORY_COLORS.Default }}>
                                                {merchant.nama_kategori}
                                            </span>
                                        </div>

                                        <div className="mt-auto">
                                            <button
                                                onClick={() => navigate(`/shop/${merchant.slug}`)}
                                                className="w-full py-4 rounded-2xl bg-[#FFBF00] text-[#0A1128] text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-[#FFBF00]/20 hover:shadow-[#FFBF00]/40 transition-all flex items-center justify-center gap-2 hover:gap-3"
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
                                <div className="inline-flex p-6 rounded-full bg-white/5 mb-6 text-white/20">
                                    <Store className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-black mb-2 tracking-tight">Belum ada vendor ditemukan</h3>
                                <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed">
                                    Coba ubah kata kunci pencarian atau pilih kategori yang berbeda.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </m.div>

                {/* Enterprise Footer CTA */}
                <section className="mt-32 p-12 rounded-[3.5rem] bg-gradient-to-br from-indigo-600 to-indigo-950 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFBF00]/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform duration-700 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div>
                            <h3 className="text-3xl font-black tracking-tight mb-2">Punya Bisnis Pernikahan?</h3>
                            <p className="text-white/70 font-medium">Bergabunglah dengan ekosistem Tamuu Nexus & tingkatkan omzet Anda.</p>
                        </div>
                        <button
                            onClick={() => navigate('/onboarding')}
                            className="px-10 py-5 bg-white text-indigo-950 font-black rounded-2xl shadow-2xl hover:bg-slate-50 transition-all hover:scale-105"
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
