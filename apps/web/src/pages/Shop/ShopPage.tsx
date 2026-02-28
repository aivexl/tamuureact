import React, { useState, useMemo, useEffect } from 'react';
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
    ChevronLeft,
    Tag,
    ShoppingBag,
    Heart,
    LayoutGrid,
    Utensils,
    Camera,
    Palette,
    Building2
} from 'lucide-react';
import { INDONESIA_REGIONS } from '../../constants/regions';
import {
    useProductDiscovery,
    useShopDirectory,
    useShopCarousel,
    useSpecialProducts,
    useFeaturedProducts,
    useRandomProducts
} from '../../hooks/queries/useShop';
import { useCategories } from '../../hooks/queries';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useSEO } from '../../hooks/useSEO';
import { formatCurrency, formatAbbreviatedNumber } from '../../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { blog, shop } from '../../lib/api';
// Import ProductCard from internal components if needed, else it is declared at the bottom
// import { ProductCard } from '../../components/Shop/ProductCard';

export const ShopPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');
    
    // Location Search State
    const [selectedCity, setSelectedCity] = useState('All');
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(10);

    // Sync state from URL parameters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        const city = params.get('city');
        const category = params.get('category');
        
        if (q !== null) setSearchQuery(q);
        if (city !== null) setSelectedCity(city);
        if (category !== null) setSelectedCategory(category);
    }, [window.location.search]);

    // Carousel State
    const { data: remoteSlides = [] } = useShopCarousel();
    
    // CTO-Level Dummy Fallback for Instant Visual Stability
    const slides = useMemo(() => {
        if (remoteSlides && remoteSlides.length > 0) return remoteSlides;
        return [
            {
                id: 'dummy-1',
                image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000',
                link_url: '#'
            },
            {
                id: 'dummy-2',
                image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000',
                link_url: '#'
            }
        ];
    }, [remoteSlides]);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-play Logic
    useEffect(() => {
        if (isPaused || slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused, slides.length]);

    const nextSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

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

    const { data: specialProducts = [], isLoading: isSpecialLoading } = useSpecialProducts();
    const { data: featuredProducts = [], isLoading: isFeaturedLoading } = useFeaturedProducts();
    const { data: randomProducts = [], isLoading: isRandomLoading } = useRandomProducts();
    
    // Fetch Special Banner Ad
    const [specialBanner, setSpecialBanner] = useState<any>(null);
    useEffect(() => {
        const fetchAd = async () => {
            try {
                const ads = await shop.getAds('SHOP_SPECIAL_FOR_YOU');
                if (ads && ads.length > 0) setSpecialBanner(ads[0]);
            } catch (err) {
                console.error('Failed to fetch special banner:', err);
            }
        };
        fetchAd();
    }, []);

    const { data: blogData } = useQuery({
        queryKey: ['latest_blog_posts'],
        queryFn: () => blog.list({ limit: 4 })
    });
    const latestBlogs = Array.isArray(blogData) ? blogData : (blogData?.posts || []);

    const merchants = Array.isArray(merchantsData) ? merchantsData : [];

    // Categories with Icons Configuration
    const categoryConfig = useMemo(() => [
        { name: 'All', icon: LayoutGrid },
        { name: 'MUA', icon: Sparkles },
        { name: 'Wedding Organizer', icon: Heart },
        { name: 'Catering', icon: Utensils },
        { name: 'Fotografi', icon: Camera },
        { name: 'Dekorasi', icon: Palette },
        { name: 'Venue', icon: Building2 },
    ], []);

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
                {/* Carousel Section */}
                <section className="pt-32 md:pt-40 pb-12 relative">
                    {slides.length > 0 ? (
                        <div 
                            className="relative w-full aspect-[21/9] md:aspect-[24/7] rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 group shadow-sm"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            <AnimatePresence mode="wait">
                                <m.div
                                    key={slides[currentSlide].id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.7, ease: "easeInOut" }}
                                    className="absolute inset-0 cursor-pointer"
                                    onClick={() => slides[currentSlide].link_url && (window.location.href = slides[currentSlide].link_url)}
                                >
                                    <img
                                        src={slides[currentSlide].image_url}
                                        alt={`Slide ${currentSlide + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </m.div>
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {slides.length > 1 && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all hover:bg-white/80 z-10"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all hover:bg-white/80 z-10"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            {/* Pagination Dots */}
                            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-10">
                                {slides.map((_: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                            currentSlide === index ? 'w-8 bg-[#0A1128]' : 'w-1.5 bg-white/50 hover:bg-[#0A1128]/50'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-[21/9] md:aspect-[24/7] rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <PremiumLoader variant="inline" label="Loading Shop..." />
                        </div>
                    )}
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
                            {categoryConfig.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = selectedCategory === cat.name;
                                return (
                                    <button
                                        key={cat.name}
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${isActive
                                            ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-lg'
                                            : 'bg-white text-slate-400 border-slate-100 hover:border-[#FFBF00] hover:text-[#0A1128]'
                                        }`}
                                    >
                                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFBF00]' : 'text-slate-300'}`} />
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* SECTION 1: Spesial Untuk Kamu */}
                {!searchQuery && selectedCategory === 'All' && selectedCity === 'All' && (
                    <section className="mb-20">
                        <div className="bg-[#0A1128] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
                                <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">Spesial Untuk Kamu</h2>
                                <button className="text-[#FFBF00] text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Lihat Semua</button>
                            </div>
                            <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 relative z-10 snap-x">
                                {/* Banner Item - Width cut by half (card size), Height restored to full */}
                                <div 
                                    onClick={() => specialBanner?.link_url && (window.location.href = specialBanner.link_url)}
                                    className="w-[160px] md:w-[195px] h-[300px] md:h-[380px] rounded-[1.5rem] md:rounded-[2rem] bg-slate-800 flex-shrink-0 relative overflow-hidden snap-start cursor-pointer group"
                                >
                                    {specialBanner?.image_url ? (
                                        <img 
                                            src={specialBanner.image_url} 
                                            className="absolute inset-0 w-full h-full object-cover" 
                                            alt="Promo Banner" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center p-4">
                                            <p className="text-white/20 text-[8px] font-black uppercase tracking-widest text-center">Sponsorship Slot</p>
                                        </div>
                                    )}
                                </div>
                                {/* Products */}
                                {specialProducts.length > 0 ? specialProducts.slice(0, 10).map((product: any) => (
                                    <div key={product.id} className="snap-start">
                                        <ProductCard product={product} navigate={navigate} isSmall={true} />
                                    </div>
                                )) : (
                                    <div className="flex items-center justify-center w-[160px] md:w-[195px] h-[300px] md:h-[380px] border border-white/10 rounded-[1.5rem] md:rounded-[2rem] bg-white/5">
                                        <p className="text-white/50 font-bold uppercase tracking-widest text-[8px] md:text-[10px] text-center px-4">Produk Segera Hadir</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* SECTION 2: Produk Featured */}
                {featuredProducts.length > 0 && !searchQuery && selectedCategory === 'All' && selectedCity === 'All' && (
                    <section className="mb-20">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h2 className="text-lg md:text-2xl font-black text-[#0A1128] uppercase tracking-tight">Produk Featured</h2>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12">
                            <div className="flex flex-wrap justify-center gap-6">
                                {featuredProducts.map((product: any) => (
                                    <ProductCard key={product.id} product={product} navigate={navigate} isSmall={true} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* SECTION 3: Rekomendasi Untukmu */}
                {randomProducts.length > 0 && !searchQuery && selectedCategory === 'All' && selectedCity === 'All' && (
                    <section className="mb-20">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#FFBF00]" />
                                <h2 className="text-lg md:text-2xl font-black text-[#0A1128] uppercase tracking-tight">Rekomendasi Untukmu</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        const el = document.getElementById('recommendations-scroll');
                                        if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                                    }}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] hover:border-[#FFBF00] transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                <button 
                                    onClick={() => {
                                        const el = document.getElementById('recommendations-scroll');
                                        if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                                    }}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] hover:border-[#FFBF00] transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                        </div>
                        <div 
                            id="recommendations-scroll"
                            className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory scroll-smooth px-2"
                        >
                            {randomProducts.map((product: any) => (
                                <div key={product.id} className="snap-start">
                                    <ProductCard product={product} navigate={navigate} isSmall={true} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Content Grid (All Products / Search Results) */}
                <m.div layout className="w-full">
                    {searchQuery || selectedCategory !== 'All' || selectedCity !== 'All' ? (
                        <div className="w-full flex items-center justify-between mb-6 px-4">
                            <h2 className="text-lg md:text-xl font-black text-[#0A1128] uppercase tracking-tight">Hasil Pencarian</h2>
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-between mb-6 px-4">
                            <h2 className="text-lg md:text-xl font-black text-[#0A1128] uppercase tracking-tight">Semua Produk</h2>
                        </div>
                    )}
                    
                    {activeTab === 'products' ? (
                        isLoadingProducts ? (
                            <div className="py-20 text-center w-full"><PremiumLoader variant="inline" /></div>
                        ) : (
                            <div className="px-2">
                                {products.length > 0 ? (
                                    <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 md:gap-8">
                                        {products.slice(0, visibleCount).map((product: any) => (
                                            <ProductCard key={product.id} product={product} navigate={navigate} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-32 text-center text-slate-300 font-bold uppercase tracking-widest w-full">No products found</div>
                                )}
                                <div className="w-full flex justify-center mt-12 mb-4">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 10)}
                                        disabled={products.length === 0 || visibleCount >= products.length}
                                        className={`px-8 md:px-12 py-3.5 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                                            products.length === 0 || visibleCount >= products.length
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-[#0A1128] text-white shadow-xl hover:bg-indigo-900 hover:-translate-y-1'
                                        }`}
                                    >
                                        {products.length === 0 ? 'Load More' : (visibleCount >= products.length ? 'Semua Produk Ditampilkan' : 'Tampilkan Lebih Banyak')}
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="px-2">
                            {isLoadingMerchants ? (
                                <div className="py-20 text-center w-full"><PremiumLoader variant="inline" /></div>
                            ) : merchants.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {merchants.map((merchant: any) => (
                                        <m.div
                                            key={merchant.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => {
                                                const targetSlug = merchant.slug === 'admin' ? 'official' : merchant.slug;
                                                navigate(`/shop/${targetSlug}`);
                                            }}
                                            className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all cursor-pointer hover:border-[#0A1128]/20 relative w-full"
                                        >
                                            <div className="h-32 md:h-36 bg-slate-100 relative overflow-hidden">
                                                {merchant.banner_url ? (
                                                    <img src={merchant.banner_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Banner" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-100" />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </div>
                                            
                                            {/* Merchant Logo */}
                                            <div className="absolute top-20 md:top-24 left-6 md:left-8 w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg z-10 transition-transform duration-500 group-hover:scale-105">
                                                <img 
                                                    src={merchant.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${merchant.nama_toko}`} 
                                                    className="w-full h-full object-cover" 
                                                    alt="Logo"
                                                />
                                            </div>

                                            <div className="px-6 md:px-8 pt-12 md:pt-14 pb-6 md:pb-8 flex flex-col flex-1 bg-white">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <h3 className="text-base md:text-xl font-black text-[#0A1128] truncate flex-1 min-w-0 tracking-tight leading-none">{merchant.nama_toko}</h3>
                                                    {merchant.wishlist_count > 0 && (
                                                        <div className="flex items-center gap-1 text-[#FFBF00] flex-shrink-0 bg-[#FFBF00]/10 px-2.5 py-1 rounded-lg border border-[#FFBF00]/20">
                                                            <Heart className="w-3 h-3 fill-current" />
                                                            <span className="text-[9px] md:text-[10px] font-black">{formatAbbreviatedNumber(merchant.wishlist_count)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <p className="text-[10px] md:text-[11px] font-bold text-[#FFBF00] uppercase tracking-[0.2em]">{merchant.nama_kategori || 'Professional Vendor'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                                            <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" />
                                                        </div>
                                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate">
                                                            {merchant.kota ? merchant.kota.replace(/^(kota|kab\.)\s+/gi, '') : 'Nasional'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </m.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center text-slate-300 font-bold uppercase tracking-widest w-full">No stores found</div>
                            )}
                        </div>
                    )}
                </m.div>

                {/* SECTION 4: Tamuu Blog */}
                {latestBlogs.length > 0 && !searchQuery && selectedCategory === 'All' && selectedCity === 'All' && (
                    <section className="mt-20 pt-20 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-8 px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-[#FFBF00] rounded-full" />
                                <h2 className="text-lg md:text-2xl font-black text-[#0A1128] uppercase tracking-tight">Tamuu Blog</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('/blog')} className="hidden md:block text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-[#0A1128] transition-colors">Lihat Semua Blog</button>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            const el = document.getElementById('blog-scroll');
                                            if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                                        }}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const el = document.getElementById('blog-scroll');
                                            if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                                        }}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div 
                            id="blog-scroll"
                            className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto no-scrollbar pb-6 md:pb-0 snap-x"
                        >
                            {latestBlogs.map((post: any) => (
                                <div key={post.id} onClick={() => navigate(`/blog/${post.slug}`)} className="group cursor-pointer min-w-[280px] md:min-w-0 snap-start">
                                    <div className="aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 bg-slate-50 border border-slate-100 relative">
                                        <img src={post.cover_image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={post.title} />
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[8px] font-black text-[#0A1128] uppercase tracking-widest">
                                            {post.category?.name || 'Inspirasi'}
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <h3 className="text-sm md:text-base font-black text-[#0A1128] line-clamp-2 leading-tight group-hover:text-[#FFBF00] transition-colors">{post.title}</h3>
                                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                            {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

// Extracted ProductCard Component
const ProductCard: React.FC<{ product: any, navigate: any, isSmall?: boolean }> = ({ product, navigate, isSmall = false }) => {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
                const mSlug = product.merchant_slug === 'admin' ? 'umum' : (product.merchant_slug || (product.is_admin_listing ? 'umum' : 'unknown'));
                const pSlug = product.slug || product.id;
                navigate(`/shop/${mSlug}/${pSlug}`);
            }}
            className={`group bg-white border border-[#F1F5F9] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col hover:shadow-2xl hover:border-[#FFBF00]/30 transition-all duration-500 cursor-pointer flex-shrink-0 ${
                isSmall 
                ? 'w-[160px] md:w-[195px] h-[300px] md:h-[380px]' 
                : 'w-full md:w-[195px] h-[320px] md:h-[380px]'
            }`}
        >
            <div className={`relative overflow-hidden flex-shrink-0 ${isSmall ? 'h-[140px] md:h-[180px]' : 'h-[160px] md:h-[180px]'}`}>
                <img
                    src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                    alt={product.nama_produk}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>
            <div className="p-3 md:p-4 flex flex-col flex-1 min-w-0">
                <h4 className="text-[10px] md:text-xs font-black text-[#0A1128] mb-1 md:mb-2 line-clamp-3 uppercase group-hover:text-[#FFBF00] transition-colors leading-tight min-h-[2.2rem] md:min-h-[2.8rem] pb-1">
                    {product.nama_produk}
                </h4>
                
                <div className="mt-auto space-y-1.5 md:space-y-3">
                    <div className="pt-1.5 md:pt-3 border-t border-slate-50">
                        {/* Wishlist positioned ABOVE price */}
                        {product.wishlist_count > 0 && (
                            <div className="flex items-center gap-0.5 text-rose-500 mb-1">
                                <Heart className="w-2 md:w-2.5 h-2 md:h-2.5 fill-current" />
                                <span className="text-[8px] md:text-[9px] font-black">{formatAbbreviatedNumber(product.wishlist_count)}</span>
                            </div>
                        )}

                        <p className="text-[11px] md:text-sm font-black text-[#0A1128] truncate">
                            {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) 
                                ? formatCurrency(product.harga_estimasi) 
                                : (product.harga_estimasi || 'Tanya Harga')}
                        </p>
                        
                        <p className="text-[7px] md:text-[8px] font-black text-[#FFBF00] uppercase tracking-widest mt-0.5 md:mt-1 truncate">
                            {product.is_admin_listing ? (product.custom_store_name || 'Admin') : product.nama_toko}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-[6px] md:text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">
                            <MapPin className="w-1.5 md:w-2 h-1.5 md:h-2 text-[#FFBF00]" />
                            {product.kota?.replace(/^(kota|kab\.)\s+/gi, '') || 'Nasional'}
                        </span>
                        <span className="flex items-center gap-1 text-[6px] md:text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">
                            <Tag className="w-1.5 md:w-2 h-1.5 md:h-2" />
                            {product.kategori_produk || 'Umum'}
                        </span>
                    </div>
                </div>
            </div>
        </m.div>
    );
};

export default ShopPage;
