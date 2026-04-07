"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Store,
    ShoppingBag,
    LayoutGrid,
    Sparkles,
    Heart,
    Utensils,
    Camera,
    Palette,
    Building2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { MultiCarousel } from '@/components/ui/MultiCarousel';
import { ProductCard } from '@/components/Shop/ProductCard';
import { ProductGrid } from '@/components/Shop/ProductGrid';
import { SpecialAdsScroller } from '@/components/Shop/SpecialAdsScroller';
import { SEOListingFooter } from '@/components/Shop/SEOListingFooter';
import { Breadcrumbs } from '@/components/Shop/Breadcrumbs';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import Link from 'next/link';

const categoryConfig = [
    { name: 'All', icon: LayoutGrid, slug: 'all' },
    { name: 'MUA', icon: Sparkles, slug: 'mua' },
    { name: 'Wedding Organizer', icon: Heart, slug: 'wedding-organizer' },
    { name: 'Catering', icon: Utensils, slug: 'catering' },
    { name: 'Fotografi', icon: Camera, slug: 'fotografi' },
    { name: 'Dekorasi', icon: Palette, slug: 'dekorasi' },
    { name: 'Venue', icon: Building2, slug: 'venue' },
];

export default function HomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');
    const [data, setData] = useState<any>({ slides: [], products: [], featured: [], blog: [] });
    const [isLoading, setIsLoading] = useState(true);

    const currentCategory = (searchParams.get('category') || 'all').toLowerCase();
    const currentCity = (searchParams.get('city') || 'all').toLowerCase();

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const API_BASE = 'https://api.tamuu.id';
                const discoveryUrl = new URL(`${API_BASE}/api/shop/products/discovery`);
                if (currentCategory !== 'all') discoveryUrl.searchParams.append('category', currentCategory);
                if (currentCity !== 'all') discoveryUrl.searchParams.append('city', currentCity);

                const [slidesRes, productsRes, blogRes, adsBannerRes, specialProductsRes, featuredProductsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/shop/carousel`).then(res => res.json()),
                    fetch(discoveryUrl.toString()).then(res => res.json()),
                    fetch(`${API_BASE}/api/blog?limit=6`).then(res => res.json()),
                    fetch(`${API_BASE}/api/shop/ads?position=SHOP_SPECIAL_FOR_YOU`).then(res => res.json()),
                    fetch(`${API_BASE}/api/shop/products/special`).then(res => res.json()),
                    fetch(`${API_BASE}/api/shop/products/featured`).then(res => res.json())
                ]);
                
                const products = productsRes.products || productsRes.items || [];
                const blogArray = Array.isArray(blogRes) ? blogRes : (blogRes.posts || blogRes.items || []);

                setData({ 
                    slides: (slidesRes.slides || []).slice(0, 6), 
                    products: products, 
                    featured: featuredProductsRes.products || featuredProductsRes || [],
                    blog: blogArray,
                    specialAds: [],
                    specialBanner: adsBannerRes.ads?.[0] || null,
                    specialProducts: specialProductsRes.products || specialProductsRes || []
                });
            } catch (err) {
                console.error("[Fetch Error]", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    const filteredProducts = data.products.filter((p: any) => {
        const matchesCategory = currentCategory === 'all' || p.kategori_produk?.toLowerCase().includes(currentCategory);
        const matchesCity = currentCity === 'all' || (p.kota || '').toLowerCase().includes(currentCity);
        return matchesCategory && matchesCity;
    });

    const handleCategoryClick = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug === 'all') params.delete('category');
        else params.set('category', slug);
        router.push(`/?${params.toString()}`);
    };

    const handleScroll = (id: string, distance: number) => {
        const el = document.getElementById(id);
        if (el) el.scrollBy({ left: distance, behavior: 'smooth' });
    };

    if (isLoading) {
        return <PremiumLoader variant="full" showLabel label="Loading Tamuu..." />;
    }

    return (
        <div className="bg-white min-h-screen text-[#0A1128] font-sans overflow-x-hidden">
            <Container className="pt-32 pb-20">
                <Breadcrumbs />
                
                <section className="mb-12">
                    <MultiCarousel items={data.slides} />
                </section>

                {/* FILTERS */}
                <section className="max-w-4xl mx-auto mb-16 text-center space-y-8">
                    <div className="inline-flex p-1.5 bg-slate-50 rounded-2xl border border-[#F1F5F9]">
                        <button 
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-[#0A1128]'}`}
                        >
                            <ShoppingBag className="w-4 h-4" /> Produk
                        </button>
                        <button 
                            onClick={() => setActiveTab('stores')}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stores' ? 'bg-[#0A1128] text-white shadow-xl' : 'text-slate-400 hover:text-[#0A1128]'}`}
                        >
                            <Store className="w-4 h-4" /> Vendor
                        </button>
                    </div>

                    <div className="relative group">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                            <button 
                                onClick={() => handleScroll('category-scroll', -200)}
                                className="p-2 rounded-full bg-white shadow-lg border border-slate-100 hover:bg-[#FFBF00] transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div 
                            id="category-scroll"
                            className="flex overflow-x-auto gap-3 pb-4 no-scrollbar scroll-smooth px-4 -mx-4 snap-x"
                        >
                            {categoryConfig.map((cat) => {
                                const isActive = currentCategory === cat.slug;
                                return (
                                    <button
                                        key={cat.slug}
                                        onClick={() => handleCategoryClick(cat.slug)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap snap-start ${
                                            isActive 
                                            ? 'bg-white border-[#FFBF00] text-[#0A1128] shadow-lg shadow-[#FFBF00]/10' 
                                            : 'bg-white border-[#F1F5F9] text-slate-400 hover:border-slate-200'
                                        }`}
                                    >
                                        <cat.icon className={`w-4 h-4 ${isActive ? 'text-[#FFBF00]' : 'text-slate-300'}`} />
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                            <button 
                                onClick={() => handleScroll('category-scroll', 200)}
                                className="p-2 rounded-full bg-white shadow-lg border border-slate-100 hover:bg-[#FFBF00] transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>

                <div className="space-y-24">
                    <SpecialAdsScroller 
                        biddingAds={data.specialAds} 
                        specialBanner={data.specialBanner} 
                        specialProducts={data.specialProducts} 
                    />
                    
                    {/* Featured Products (Restored 1:1) */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-6 px-2">
                            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-[#0A1128]">Produk Featured</h2>
                            <div className="flex gap-2">
                                <button onClick={() => handleScroll('featured-products-scroll', -300)} className="p-2 rounded-full bg-slate-50 border border-[#F1F5F9] hover:bg-[#FFBF00] transition-all shadow-sm"><ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /></button>
                                <button onClick={() => handleScroll('featured-products-scroll', 300)} className="p-2 rounded-full bg-slate-50 border border-[#F1F5F9] hover:bg-[#FFBF00] transition-all shadow-sm"><ChevronRight className="w-4 h-4 md:w-5 md:h-5" /></button>
                            </div>
                        </div>
                        <div 
                            id="featured-products-scroll" 
                            className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory scroll-smooth px-2"
                        >
                            {data.featured.map((p: any) => (
                                <div key={p.id} className="snap-start flex-shrink-0">
                                    <ProductCard key={p.id} product={p} isSmall={true} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <ProductGrid 
                        products={filteredProducts} 
                        title={activeTab === 'products' ? 'Semua Produk' : 'Semua Vendor'} 
                    />

                    {/* RESTORED BLOG SECTION (FIXED DATA MAPPING) */}
                    {data.blog.length > 0 && (
                        <section className="mt-20 pt-20 border-t border-[#F1F5F9]">
                            <div className="flex items-center justify-between mb-8 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-[#FFBF00] rounded-full" />
                                    <h2 className="text-lg md:text-2xl font-black text-[#0A1128] uppercase tracking-tight italic">Tamuu Blog</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleScroll('blog-scroll', -300)} className="p-2 rounded-full bg-slate-50 border border-slate-100 hover:bg-[#FFBF00] transition-all"><ChevronLeft className="w-4 h-4" /></button>
                                    <button onClick={() => handleScroll('blog-scroll', 300)} className="p-2 rounded-full bg-slate-50 border border-slate-100 hover:bg-[#FFBF00] transition-all"><ChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div 
                                id="blog-scroll"
                                className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-4 snap-x scroll-smooth"
                            >
                                {data.blog.map((post: any) => {
                                    const isLogo = !post.featured_image || post.featured_image.includes('logo-tamuu');
                                    return (
                                        <Link key={post.id} href={`/blog/${post.slug}`} prefetch={false} className="group cursor-pointer min-w-[280px] md:min-w-[320px] snap-start">
                                            <div className="aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 bg-slate-50 border border-[#F1F5F9] relative shadow-sm">
                                                <img 
                                                    src={post.featured_image || '/images/logo-tamuu-vfinal-v1.webp'} 
                                                    className={`w-full h-full transition-transform duration-700 ${isLogo ? 'object-contain p-12 opacity-20' : 'object-cover group-hover:scale-105'}`} 
                                                    alt={post.title} 
                                                />
                                                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[8px] font-black text-[#0A1128] uppercase tracking-widest">
                                                    Inspirasi
                                                </div>
                                            </div>
                                            <div className="px-2">
                                                <h3 className="text-sm md:text-base font-black leading-tight uppercase tracking-tight text-[#0A1128] group-hover:text-[#FFBF00] transition-colors line-clamp-2">{post.title}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Read Article</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>

                <SEOListingFooter />
            </Container>
        </div>
    );
}
