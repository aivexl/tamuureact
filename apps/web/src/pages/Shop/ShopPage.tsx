import React, { useState, useMemo, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Breadcrumbs } from '../../components/Shop/Breadcrumbs';
import { SEOListingFooter } from '../../components/Shop/SEOListingFooter';
import { assembleSEOTemplate } from '../../lib/seo-permutation';
import { MultiCarousel } from '../../components/ui/MultiCarousel';

export const ShopPage: React.FC = () => {
    const navigate = useNavigate();
    const { category, city, intent } = useParams<{ category?: string; city?: string; intent?: string }>();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(category || 'All');
    const [selectedCity, setSelectedCity] = useState(city || 'All');
    const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');
    
    // Location Search State
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(10);

    // Sync state when URL params change
    useEffect(() => {
        if (category) setSelectedCategory(category);
        if (city) setSelectedCity(city);
    }, [category, city]);

    // Queries
    const { data: products = [], isLoading: isLoadingProducts } = useProductDiscovery({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        query: searchQuery,
        city: selectedCity === 'All' ? undefined : selectedCity
    });

    const { data: merchantsData, isLoading: isLoadingMerchants } = useShopDirectory(
        selectedCategory,
        searchQuery
    );

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

        // Fallback templates jika API belum sedia
        const titleTemplate = intent?.toUpperCase() === 'CHEAP' 
            ? 'Paket {Category} Murah di {City} Mulai {MinPrice} | Tamuu'
            : '{Category} {City} Terbaik {Year} - Rating Bintang 5 | Tamuu';

        const descTemplate = 'Daftar vendor {Category} profesional di {City}. Temukan {Count} pilihan terbaik dengan harga mulai {MinPrice}. Update {Month} {Year}.';

        // ItemList Schema for Google Rich Snippets
        const itemListSchema = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": `${data.category} di ${data.city}`,
            "description": `Daftar vendor ${data.category} terbaik di wilayah ${data.city} update ${currentMonth} ${currentYear}.`,
            "numberOfItems": products.length,
            "itemListElement": products.slice(0, 10).map((p: any, i: number) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": `https://tamuu.id/shop/s/${p.merchant_slug}/${p.slug || p.id}`,
                "name": p.nama_produk
            }))
        };

        // FAQ Schema for AI & SGE (Search Generative Experience)
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": `Siapa ${data.category} terbaik di ${data.city}?`,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": `Berdasarkan data Tamuu per ${currentMonth} ${currentYear}, terdapat ${data.count} vendor ${data.category} profesional di ${data.city}. Vendor terpopuler saat ini menawarkan layanan dengan harga mulai dari ${data.minPrice}.`
                    }
                },
                {
                    "@type": "Question",
                    "name": `Bagaimana cara memesan jasa ${data.category} di ${data.city} lewat Tamuu?`,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": `Anda dapat langsung mengunjungi profil vendor di platform Tamuu, melihat portfolio terbaru mereka, membandingkan harga paket, dan melakukan booking langsung secara online dengan aman.`
                    }
                }
            ]
        };

        return {
            title: assembleSEOTemplate(titleTemplate, data),
            description: assembleSEOTemplate(descTemplate, data),
            h1: assembleSEOTemplate('{Category} di {City}', data),
            schemas: [itemListSchema, faqSchema]
        };
    }, [selectedCategory, selectedCity, products, intent]);

    useSEO({
        title: seoContent.title,
        description: seoContent.description
    });

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
    
    const { data: blogData } = useQuery({
        queryKey: ['latest_blog_posts'],
        queryFn: () => blog.list({ limit: 4 })
    });
    const latestBlogs = Array.isArray(blogData) ? blogData : (blogData?.posts || []);
    const merchants = Array.isArray(merchantsData) ? merchantsData : [];

    const categoryConfig = useMemo(() => [
        { name: 'All', icon: LayoutGrid, slug: 'all' },
        { name: 'MUA', icon: Sparkles, slug: 'mua' },
        { name: 'Wedding Organizer', icon: Heart, slug: 'wedding-organizer' },
        { name: 'Catering', icon: Utensils, slug: 'catering' },
        { name: 'Fotografi', icon: Camera, slug: 'fotografi' },
        { name: 'Dekorasi', icon: Palette, slug: 'dekorasi' },
        { name: 'Venue', icon: Building2, slug: 'venue' },
    ], []);

    const filteredCities = useMemo(() => {
        const cleanQuery = citySearchQuery.trim().toLowerCase();
        const baseCities = ['All', ...INDONESIA_REGIONS];
        if (!cleanQuery) return baseCities;
        return baseCities.filter(city => city.toLowerCase().includes(cleanQuery));
    }, [citySearchQuery]);

    return (
        <div className="min-h-screen bg-white text-[#0A1128] font-sans selection:bg-[#FFBF00] selection:text-[#0A1128]">
            {seoContent.schemas.map((s, i) => (
                <script key={i} type="application/ld+json">
                    {JSON.stringify(s)}
                </script>
            ))}
            <main className="max-w-7xl mx-auto px-6 pb-32">
                {/* Breadcrumbs & Header */}
                <section className="pt-32 md:pt-40">
                    <Breadcrumbs />
                    <div className="mb-12">
                        <m.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-6xl font-black text-[#0A1128] uppercase tracking-tighter leading-none mb-4"
                        >
                            {seoContent.h1}
                        </m.h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] max-w-2xl leading-relaxed">
                            {seoContent.description}
                        </p>
                    </div>
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

                        <div className="relative group">
                            <div className="flex flex-col md:flex-row items-center w-full bg-white border border-slate-100 rounded-[2.5rem] p-2.5 shadow-xl transition-all duration-700 gap-2">
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
                                                                const citySlug = city.toLowerCase().replace(/\s+/g, '-');
                                                                navigate(`/shop/${selectedCategory.toLowerCase()}/${citySlug}`);
                                                                setIsLocationOpen(false);
                                                            }}
                                                            className="w-full text-left px-5 py-3.5 rounded-xl hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#0A1128]"
                                                        >
                                                            {city === 'All' ? 'Seluruh Indonesia' : city}
                                                        </button>
                                                    ))}
                                                </div>
                                            </m.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="hidden md:block w-px h-8 bg-slate-100 mx-2" />
                                <div className="flex items-center flex-1 w-full px-4">
                                    <Search className="w-4 h-4 text-slate-300 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Cari produk, jasa, catering..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-[#0A1128] py-4 px-3 font-semibold"
                                    />
                                </div>
                            </div>
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
                                            navigate(`/shop/${cat.slug}${citySlug}`);
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

                {/* Content Grid */}
                <m.div layout className="w-full">
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
                                        <MerchantCard key={merchant.id} merchant={merchant} navigate={navigate} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center text-slate-300 font-bold uppercase tracking-widest w-full">No stores found</div>
                            )}
                        </div>
                    )}
                </m.div>

                {/* SEO Listing Footer */}
                <SEOListingFooter />
            </main>
        </div>
    );
};

// Reverted ProductCard Component to b3edcb0
const ProductCard: React.FC<{ product: any, navigate: any, isSmall?: boolean }> = ({ product, navigate }) => (
    <div 
        onClick={() => navigate(`/shop/s/${product.merchant_slug}/${product.slug || product.id}`)}
        className="group bg-white border border-slate-50 rounded-3xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all w-full md:w-[195px]"
    >
        <div className="aspect-square bg-slate-100">
            <img src={product.images?.[0]?.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.nama_produk} />
        </div>
        <div className="p-4">
            <h4 className="text-[10px] font-black text-[#0A1128] uppercase line-clamp-2 mb-2 leading-tight">{product.nama_produk}</h4>
            <p className="text-[11px] font-black text-[#FFBF00]">{formatCurrency(product.harga_estimasi)}</p>
        </div>
    </div>
);

// Reverted MerchantCard Component to b3edcb0
const MerchantCard: React.FC<{ merchant: any, navigate: any }> = ({ merchant, navigate }) => (
    <div 
        onClick={() => navigate(`/shop/s/${merchant.slug}`)}
        className="bg-white border border-slate-50 rounded-[2rem] p-6 hover:shadow-xl transition-all cursor-pointer"
    >
        <div className="flex items-center gap-4">
            <img src={merchant.logo_url} className="w-12 h-12 rounded-full object-cover" alt={merchant.nama_toko} />
            <div>
                <h4 className="text-sm font-black text-[#0A1128] uppercase tracking-tight">{merchant.nama_toko}</h4>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{merchant.nama_kategori}</p>
            </div>
        </div>
    </div>
);

export default ShopPage;
