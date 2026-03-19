import React, { useState, useMemo, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
    Building2,
    AlertCircle
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
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { useSEO } from '../../hooks/useSEO';
import { formatCurrency, formatAbbreviatedNumber, parseUTCDate } from '../../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { blog, shop } from '../../lib/api';
import { Breadcrumbs } from '../../components/Shop/Breadcrumbs';
import { SEOListingFooter } from '../../components/Shop/SEOListingFooter';
import { assembleSEOTemplate } from '../../lib/seo-permutation';
import { MultiCarousel } from '../../components/ui/MultiCarousel';
import { ProductCard } from '../../components/Shop/ProductCard';
import { StarRating } from '../../components/Shop/StarRating';

export const ShopPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { category, city, intent } = useParams<{ category?: string; city?: string; intent?: string }>();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(category || 'All');
    const [selectedCity, setSelectedCity] = useState(city || 'All');
    const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');
    
    const [visibleCount, setVisibleCount] = useState(10);

    // Sync state when URL params change
    useEffect(() => {
        if (category) setSelectedCategory(category);
        if (city) setSelectedCity(city);
        
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q !== null) {
            setSearchQuery(q);
        } else {
            setSearchQuery('');
        }
    }, [category, city, location.search]);

    // Queries
    const { data: products = [], isLoading: isLoadingProducts } = useProductDiscovery({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        query: searchQuery,
        city: selectedCity === 'All' ? undefined : selectedCity
    });

    const { data: vendorsData, isLoading: isLoadingVendors } = useShopDirectory(
        selectedCategory,
        searchQuery
    );

    const { data: remoteSlides = [] } = useShopCarousel();
    const slides = useMemo(() => {
        const fallbackSlides = [
            { id: '1', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', link_url: '#' },
            { id: '2', image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800', link_url: '#' },
            { id: '3', image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800', link_url: '#' },
            { id: '4', image_url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800', link_url: '#' },
            { id: '5', image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800', link_url: '#' },
            { id: '6', image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800', link_url: '#' }
        ];

        if (remoteSlides && remoteSlides.length > 0) {
            let finalSlides = [...remoteSlides];
            if (finalSlides.length < 6) {
                const padding = fallbackSlides.slice(0, 6 - finalSlides.length);
                finalSlides = [...finalSlides, ...padding];
            }
            return finalSlides.slice(0, 6);
        }
        return fallbackSlides;
    }, [remoteSlides]);

    const { data: specialProducts = [] } = useSpecialProducts();
    const { data: featuredProducts = [] } = useFeaturedProducts();
    const { data: randomProducts = [] } = useRandomProducts();
    
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
    const vendors = Array.isArray(vendorsData) ? vendorsData : [];

    // ============================================
    // DYNAMIC SEO ASSEMBLY (THE BRAIN)
    // ============================================
    const seoContent = useMemo(() => {
        const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date());
        const currentYear = new Date().getFullYear().toString();
        
        const data = {
            category: selectedCategory !== 'All' ? selectedCategory : 'Vendor Event',
            city: selectedCity !== 'All' ? selectedCity : 'Indonesia',
            count: products.length || 0,
            minPrice: products.length > 0 ? formatCurrency(Math.min(...products.map((p: any) => Number(p.harga_estimasi) || 99999999))) : 'Terjangkau'
        };

        const isHomePage = location.pathname === '/';

        const titleTemplate = isHomePage
            ? 'Tamuu - Platform Undangan Digital & Vendor Pernikahan Premium'
            : (intent?.toUpperCase() === 'CHEAP' 
                ? 'Paket {Category} Murah di {City} Mulai {MinPrice} | Tamuu'
                : '{Category} {City} Terbaik {Year} - Rating Bintang 5 | Tamuu');

        const descTemplate = isHomePage
            ? 'Temukan vendor pernikahan, katering, dan MUA terbaik, serta buat undangan digital premium eksklusif hanya di Tamuu.'
            : 'Daftar vendor {Category} profesional di {City}. Temukan {Count} pilihan terbaik dengan harga mulai {MinPrice}. Update {Month} {Year}.';

        return {
            title: assembleSEOTemplate(titleTemplate, data),
            description: assembleSEOTemplate(descTemplate, data),
            h1: assembleSEOTemplate('{Category} di {City}', data),
        };
    }, [selectedCategory, selectedCity, products, intent, location.pathname]);

    useSEO({
        title: seoContent.title,
        description: seoContent.description
    });

    const categoryConfig = useMemo(() => [
        { name: 'All', icon: LayoutGrid, slug: 'all' },
        { name: 'MUA', icon: Sparkles, slug: 'mua' },
        { name: 'Wedding Organizer', icon: Heart, slug: 'wedding-organizer' },
        { name: 'Catering', icon: Utensils, slug: 'catering' },
        { name: 'Fotografi', icon: Camera, slug: 'fotografi' },
        { name: 'Dekorasi', icon: Palette, slug: 'dekorasi' },
        { name: 'Venue', icon: Building2, slug: 'venue' },
    ], []);

    return (
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            <main className="max-w-7xl mx-auto px-6 pb-32">
                {/* Breadcrumbs & Header */}
                <section className="pt-[140px] md:pt-40">
                    <Breadcrumbs />
                </section>

                {/* Multi Carousel Section */}
                <section className="pb-12">
                    {slides.length > 0 && <MultiCarousel items={slides} />}
                </section>

                {/* Search & Filter */}
                <section className="max-w-5xl mx-auto mb-16 px-4">
                    <div className="flex flex-col gap-8">
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

                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                            {categoryConfig.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = selectedCategory === cat.name;
                                return (
                                    <button
                                        key={cat.name}
                                        onClick={() => {
                                            const citySlug = selectedCity === 'All' ? '' : `/${selectedCity.toLowerCase().replace(/\s+/g, '-')}`;
                                            navigate(`/c/${cat.slug}${citySlug}`);
                                        }}
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

                {/* PRODUCT-ONLY SECTIONS (Hide when Stores tab is active or searching) */}
                {activeTab === 'products' && !searchQuery && selectedCategory === 'All' && selectedCity === 'All' && (
                    <>
                        {/* SECTION 1: Spesial Untuk Kamu */}
                        <section className="mb-20">
                            <div className="bg-[#0A1128] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
                                    <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">Spesial Untuk Kamu</h2>
                                    <button className="text-[#FFBF00] text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Lihat Semua</button>
                                </div>
                                <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 relative z-10 snap-x">
                                    <div 
                                        onClick={() => specialBanner?.link_url && (window.location.href = specialBanner.link_url)}
                                        className="w-[160px] md:w-[195px] h-[300px] md:h-[380px] rounded-[1.5rem] md:rounded-[2rem] bg-slate-800 flex-shrink-0 relative overflow-hidden snap-start cursor-pointer group"
                                    >
                                        {specialBanner?.image_url ? (
                                            <img src={specialBanner.image_url} className="absolute inset-0 w-full h-full object-cover" alt="Promo Banner" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center p-4">
                                                <p className="text-white/20 text-[8px] font-black uppercase tracking-widest text-center">Sponsorship Slot</p>
                                            </div>
                                        )}
                                    </div>
                                    {specialProducts.length > 0 ? specialProducts.slice(0, 10).map((product: any) => (
                                        <div key={product.id} className="snap-start flex-shrink-0">
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

                        {/* SECTION 2: Produk Featured */}
                        {featuredProducts.length > 0 && (
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
                        {randomProducts.length > 0 && (
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
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] transition-all shadow-sm"
                                        >
                                            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const el = document.getElementById('recommendations-scroll');
                                                if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                                            }}
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] transition-all shadow-sm"
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
                                        <div key={product.id} className="snap-start flex-shrink-0">
                                            <ProductCard product={product} navigate={navigate} isSmall={true} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* MAIN GRID CONTENT */}
                <m.div layout className="w-full">
                    {activeTab === 'products' ? (
                        <>
                            <div className="w-full flex items-center justify-between mb-6 px-4">
                                <h2 className="text-lg md:text-xl font-black text-[#0A1128] uppercase tracking-tight">
                                    {searchQuery ? 'Hasil Pencarian' : (selectedCategory !== 'All' || selectedCity !== 'All' ? 'Hasil Filter Produk' : 'Semua Produk')}
                                </h2>
                            </div>
                            
                            {/* SEARCH RESULTS: Toko Identik Section */}
                            {searchQuery && !isLoadingVendors && vendors.length > 0 && (
                                <div className="mb-12 border-b border-slate-100 pb-12 px-2">
                                    <div className="flex items-center justify-between mb-6 px-2">
                                        <h3 className="text-sm md:text-base font-black text-[#0A1128] uppercase tracking-widest flex items-center gap-2">
                                            <Store className="w-4 h-4 text-[#FFBF00]" />
                                            Toko yang Paling Identik
                                        </h3>
                                        {vendors.length > 2 && (
                                            <button 
                                                onClick={() => setActiveTab('stores')}
                                                className="text-[10px] font-black uppercase tracking-widest text-[#FFBF00] hover:text-[#0A1128] transition-colors flex items-center gap-1"
                                            >
                                                Lihat Semua Toko <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {vendors.slice(0, 2).map((vendor: any) => (
                                            <VendorCard key={vendor.id} vendor={vendor} navigate={navigate} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SEARCH RESULTS: Produk Identik Section */}
                            {searchQuery && (
                                <div className="w-full flex items-center justify-between mb-6 px-4 mt-4">
                                    <h3 className="text-sm md:text-base font-black text-[#0A1128] uppercase tracking-widest flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-[#FFBF00]" />
                                        Produk yang Paling Identik
                                    </h3>
                                </div>
                            )}

                            {isLoadingProducts ? (
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
                            )}
                        </>
                    ) : (
                        <>
                            <div className="w-full flex items-center justify-between mb-6 px-4">
                                <h2 className="text-lg md:text-xl font-black text-[#0A1128] uppercase tracking-tight">
                                    {searchQuery ? 'Hasil Pencarian Toko' : (selectedCategory !== 'All' || selectedCity !== 'All' ? 'Hasil Filter Toko' : 'Semua Toko & Vendor')}
                                </h2>
                            </div>
                            <div className="px-2">
                                {isLoadingVendors ? (
                                    <div className="py-20 text-center w-full"><PremiumLoader variant="inline" /></div>
                                ) : vendors.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                        {vendors.map((vendor: any) => (
                                            <VendorCard key={vendor.id} vendor={vendor} navigate={navigate} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-32 text-center text-slate-300 font-bold uppercase tracking-widest w-full">No stores found</div>
                                )}
                            </div>
                        </>
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
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] transition-all shadow-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const el = document.getElementById('blog-scroll');
                                            if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                                        }}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] transition-all shadow-sm"
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
                                        <img src={post.featured_image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={post.title} />
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[8px] font-black text-[#0A1128] uppercase tracking-widest">
                                            {post.category || post.category?.name || 'Inspirasi'}
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <h3 className="text-sm md:text-base font-black text-[#0A1128] line-clamp-2 leading-tight group-hover:text-[#FFBF00] transition-colors">{post.title}</h3>
                                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                            {parseUTCDate(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <SEOListingFooter />
            </main>
        </div>
    );
};

// FULLY RESTORED VENDOR CARD FROM b3edcb0
const VendorCard: React.FC<{ vendor: any, navigate: any }> = ({ vendor, navigate }) => {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
                const targetSlug = vendor.slug === 'admin' ? 'official' : vendor.slug;
                navigate(`/shop/${targetSlug}`);
            }}
            className="group bg-white border border-slate-50 rounded-[2rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all cursor-pointer hover:border-[#0A1128]/20 relative w-full"
        >
            <div className="h-32 md:h-36 bg-slate-100 relative overflow-hidden">
                {vendor.banner_url ? (
                    <img src={vendor.banner_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Banner" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {/* Vendor Logo */}
            <div className="absolute top-20 md:top-24 left-6 md:left-8 w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg z-10 transition-transform duration-500 group-hover:scale-105">
                <img 
                    src={vendor.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${vendor.nama_toko}`} 
                    className="w-full h-full object-cover" 
                    alt="Logo"
                />
            </div>

            <div className="px-6 md:px-8 pt-12 md:pt-14 pb-6 md:pb-8 flex flex-col flex-1 bg-white">
                <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-base md:text-xl font-black text-[#0A1128] truncate flex-1 min-w-0 tracking-tight leading-none">{vendor.nama_toko}</h3>
                    {vendor.wishlist_count > 0 && (
                        <div className="flex items-center gap-1 text-[#FFBF00] flex-shrink-0 bg-[#FFBF00]/10 px-2.5 py-1 rounded-lg border border-[#FFBF00]/20">
                            <Heart className="w-3 h-3 fill-current" />
                            <span className="text-[9px] md:text-[10px] font-black">{formatAbbreviatedNumber(vendor.wishlist_count)}</span>
                        </div>
                    )}
                </div>
                
                <StarRating 
                    rating={vendor.avg_rating || 0} 
                    count={vendor.review_count || 0} 
                    size={12} 
                    className="mb-3"
                />

                <div className="flex flex-col gap-3">
                    <p className="text-[10px] md:text-[11px] font-bold text-[#FFBF00] uppercase tracking-[0.2em]">{vendor.nama_kategori || 'Professional Vendor'}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" />
                        </div>
                        <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate">
                            {vendor.kota ? vendor.kota.replace(/^(kota|kab\.)\s+/gi, '') : 'Nasional'}
                        </p>
                    </div>
                </div>
            </div>
        </m.div>
    );
};

export default ShopPage;
