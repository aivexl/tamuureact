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
    Sparkles,
    ChevronDown,
    ChevronRight,
    Tag,
    ShoppingBag
} from 'lucide-react';
import { INDONESIA_REGIONS } from '../../constants/regions';
import { useProductDiscovery, useShopDirectory } from '../../hooks/queries/useShop';
import { useCategories } from '../../hooks/queries';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useSEO } from '../../hooks/useSEO';
import { formatCurrency } from '../../lib/utils';

export const ShopPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');
    
    // Location Search State
    const [selectedCity, setSelectedCity] = useState('All');
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Queries
    const { data: products = [], isLoading: isLoadingProducts } = useProductDiscovery({
        category: selectedCategory,
        query: searchQuery,
        city: selectedCity === 'All' ? undefined : selectedCity
    });

    const { data: merchantsData, isLoading: isLoadingMerchants } = useShopDirectory(
        selectedCategory,
        searchQuery
    );

    const merchants = Array.isArray(merchantsData) ? merchantsData : [];

    // Categories
    const categories = ['All', 'MUA', 'Wedding Organizer', 'Catering', 'Fotografi', 'Dekorasi', 'Venue'];

    const filteredCities = useMemo(() => {
        const cleanQuery = citySearchQuery.trim().toLowerCase();
        const baseCities = ['All', ...INDONESIA_REGIONS];
        if (!cleanQuery) return baseCities;
        return baseCities.filter(city => city.toLowerCase().includes(cleanQuery));
    }, [citySearchQuery]);

    useSEO({
        title: 'Tamuu Shop | Pusat Penemuan Vendor & Produk Event Terbaik',
        description: 'Jelajahi ribuan produk dan jasa vendor profesional untuk pernikahan dan event Anda di Tamuu Shop.'
    });

    return (
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            <main className="max-w-7xl mx-auto px-6 pb-32">
                {/* Hero section */}
                <section className="pt-32 md:pt-40 pb-16 relative">
                    <div className="text-center mb-12">
                        <m.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black tracking-tighter text-[#0A1128] mb-6 italic uppercase"
                        >
                            Elevate Your <span className="text-[#FFBF00]">Celebration</span>
                        </m.h1>
                    </div>
                </section>

                {/* Search & Filter */}
                <section className="max-w-5xl mx-auto mb-16 px-4">
                    <div className="flex flex-col gap-8">
                        {/* Tab Switcher */}
                        <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-50 rounded-2xl w-fit mx-auto border border-slate-100">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === 'products' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-400 hover:text-[#0A1128]'
                                }`}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Products
                            </button>
                            <button
                                onClick={() => setActiveTab('stores')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === 'stores' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-400 hover:text-[#0A1128]'
                                }`}
                            >
                                <Store className="w-3.5 h-3.5" />
                                Stores
                            </button>
                        </div>

                        <div className="relative group">
                            <div className="flex flex-col md:flex-row items-center w-full bg-white border border-slate-100 rounded-[2.5rem] p-2.5 shadow-xl transition-all duration-700 gap-2">
                                {/* Location Search */}
                                <div className="relative w-full md:w-[35%]">
                                    <div 
                                        onClick={() => setIsLocationOpen(!isLocationOpen)}
                                        className="flex items-center w-full bg-slate-50/50 hover:bg-slate-100/80 rounded-[1.8rem] px-6 py-4 cursor-pointer transition-all"
                                    >
                                        <MapPin className="w-4 h-4 text-[#FFBF00] shrink-0" />
                                        <span className="flex-1 ml-3 text-[#0A1128] font-bold text-sm truncate uppercase tracking-tight">
                                            {selectedCity === 'All' ? 'Seluruh Indonesia' : selectedCity}
                                        </span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    <AnimatePresence>
                                        {isLocationOpen && (
                                            <>
                                                <div className="fixed inset-0 z-[60]" onClick={() => setIsLocationOpen(false)} />
                                                <m.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] z-[70] overflow-hidden flex flex-col max-h-[400px]"
                                                >
                                                    <div className="p-4 border-b border-slate-50">
                                                        <input 
                                                            type="text"
                                                            placeholder="Cari wilayah..."
                                                            value={citySearchQuery}
                                                            onChange={(e) => setCitySearchQuery(e.target.value)}
                                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-semibold"
                                                        />
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                                                        {filteredCities.map((city) => (
                                                            <button
                                                                key={city}
                                                                onClick={() => {
                                                                    setSelectedCity(city);
                                                                    setIsLocationOpen(false);
                                                                }}
                                                                className="w-full text-left px-5 py-3.5 rounded-xl hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#0A1128]"
                                                            >
                                                                {city === 'All' ? 'Seluruh Indonesia' : city}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </m.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="hidden md:block w-px h-8 bg-slate-100 mx-2" />

                                {/* Search Input */}
                                <div className="flex items-center flex-1 w-full px-4">
                                    <Search className="w-4 h-4 text-slate-300 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={activeTab === 'products' ? "Cari produk, jasa, catering..." : "Cari nama toko/vendor..."}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-[#0A1128] py-4 px-3 font-semibold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat
                                        ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-lg'
                                        : 'bg-white text-slate-400 border-slate-100 hover:border-[#FFBF00] hover:text-[#0A1128]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Content Grid */}
                <m.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'products' ? (
                            isLoadingProducts ? (
                                <div className="col-span-full py-20 text-center"><PremiumLoader variant="inline" /></div>
                            ) : products.length > 0 ? (
                                products.map((product: any) => (
                                    <m.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => navigate(`/shop/${product.merchant_slug}/${product.id}`)}
                                        className="group bg-white border border-[#F1F5F9] rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-2xl hover:border-[#FFBF00]/30 transition-all duration-500 cursor-pointer"
                                    >
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                                                alt={product.nama_produk}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-[#0A1128] shadow-sm">
                                                    {product.nama_toko}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <h4 className="text-lg font-black text-[#0A1128] mb-4 line-clamp-1 italic uppercase group-hover:text-[#FFBF00] transition-colors">{product.nama_produk}</h4>
                                            
                                            <div className="mt-auto space-y-4">
                                                <div className="pt-4 border-t border-slate-50">
                                                    <p className="text-[8px] font-black text-[#FFBF00] uppercase tracking-widest mb-1">Harga Mulai</p>
                                                    <p className="text-xl font-black text-[#0A1128]">
                                                        {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) 
                                                            ? formatCurrency(product.harga_estimasi) 
                                                            : (product.harga_estimasi || 'Tanya Harga')}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Tag className="w-2.5 h-2.5" />
                                                        {product.kategori_produk || 'Umum'}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        {product.kota?.replace(/^(kota|kab\.)\s+/gi, '') || 'Nasional'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </m.div>
                                ))
                            ) : (
                                <div className="col-span-full py-32 text-center text-slate-300 font-bold uppercase tracking-widest">No products found</div>
                            )
                        ) : (
                            isLoadingMerchants ? (
                                <div className="col-span-full py-20 text-center"><PremiumLoader variant="inline" /></div>
                            ) : merchants.length > 0 ? (
                                merchants.map((merchant: any) => (
                                    <m.div
                                        key={merchant.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => navigate(`/shop/${merchant.slug}`)}
                                        className="group bg-white border border-[#F1F5F9] rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all cursor-pointer hover:border-[#FFBF00]/30 relative"
                                    >
                                        <div className="h-32 bg-slate-100 relative overflow-hidden">
                                            {merchant.banner_url && <img src={merchant.banner_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>
                                        
                                        {/* Merchant Logo - Moved outside overflow container and positioned with high z-index */}
                                        <div className="absolute top-24 left-6 w-16 h-16 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-xl z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                            <img 
                                                src={merchant.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${merchant.nama_toko}`} 
                                                className="w-full h-full object-cover" 
                                                alt="Logo"
                                            />
                                        </div>

                                        <div className="px-6 pt-12 pb-6 flex flex-col flex-1">
                                            <h3 className="text-xl font-black text-[#0A1128] mb-1 group-hover:text-[#FFBF00] transition-colors">{merchant.nama_toko}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-bold text-[#FFBF00] uppercase tracking-widest">{merchant.nama_kategori || 'Vendor'}</p>
                                                {merchant.kota && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{merchant.kota.replace(/^(kota|kab\.)\s+/gi, '')}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </m.div>
                                ))
                            ) : (
                                <div className="col-span-full py-32 text-center text-slate-300 font-bold uppercase tracking-widest">No stores found</div>
                            )
                        )}
                    </AnimatePresence>
                </m.div>
            </main>
        </div>
    );
};

export default ShopPage;

