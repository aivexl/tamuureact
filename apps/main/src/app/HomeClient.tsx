"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Store,
    ShoppingBag,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Star,
    ArrowRight
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { MultiCarousel } from '@/components/ui/MultiCarousel';
import { ProductCard } from '@/components/Shop/ProductCard';
import { ProductGrid } from '@/components/Shop/ProductGrid';
import { SpecialAdsScroller } from '@/components/Shop/SpecialAdsScroller';
import { SEOListingFooter } from '@/components/Shop/SEOListingFooter';
import { Breadcrumbs } from '@/components/Shop/Breadcrumbs';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import BlogSection from '@/components/undangan-digital/BlogSection';
import { ShopIcon } from '@tamuu/ui';
import Link from 'next/link';

export default function HomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');
    const [data, setData] = useState<any>({ 
        slides: [], 
        products: [], 
        featured: [], 
        blog: [],
        categories: [],
        specialAds: [],
        specialBanner: null,
        specialProducts: []
    });
    const [isLoading, setIsLoading] = useState(true);

    const currentCategory = (searchParams.get('category') || 'all').toLowerCase();
    const currentCity = (searchParams.get('city') || 'all').toLowerCase();

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                // Fetch comprehensive home data
                const [slidesRes, productsRes, featuredRes, blogRes, catRes, adsSpecialRes, adsBannerRes, specialProductsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/carousel`).then(r => r.json()),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/products/discovery?limit=50`).then(r => r.json()),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/products/featured`).then(r => r.json()),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog?limit=6`).then(r => r.json()),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/categories`).then(r => r.json()),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/ads?position=SPECIAL_FOR_YOU_HOME`).then(r => r.json()),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/ads?position=SHOP_SPECIAL_FOR_YOU`).then(r => r.json()),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/products/special`).then(r => r.json())
                ]);

                setData({
                    slides: slidesRes?.slides || [],
                    products: productsRes?.products || [],
                    featured: featuredRes?.products || [],
                    blog: blogRes || [],
                    categories: catRes?.categories || [],
                    specialAds: adsSpecialRes?.ads || [],
                    specialBanner: adsBannerRes?.ads?.[0] || null,
                    specialProducts: specialProductsRes?.products || specialProductsRes || []
                });
            } catch (err) {
                console.error('Failed to fetch home data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    const categoryConfig = useMemo(() => {
        const ALL_CAT = { name: 'All', icon: 'LayoutGrid', slug: 'all' };
        const dynamicCats = data.categories.map((c: any) => ({
            name: c.name,
            icon: c.icon,
            slug: c.slug
        }));
        return [ALL_CAT, ...dynamicCats];
    }, [data.categories]);

    const filteredProducts = useMemo(() => {
        return data.products.filter((p: any) => {
            const matchesCategory = currentCategory === 'all' || p.kategori_produk?.toLowerCase().includes(currentCategory);
            return matchesCategory;
        });
    }, [data.products, currentCategory]);

    const handleCategoryClick = useCallback((slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug === 'all') params.delete('category');
        else params.set('category', slug);
        router.push(`/?${params.toString()}`);
    }, [router, searchParams]);

    const handleScroll = (id: string, distance: number) => {
        const el = document.getElementById(id);
        if (el) el.scrollBy({ left: distance, behavior: 'smooth' });
    };

    if (isLoading) return <PremiumLoader variant="full" label="Sinkronisasi Ekosistem Tamuu..." showLabel />;

    return (
        <main className="min-h-screen bg-white">
            <Container className="pt-24 pb-32">
                <Breadcrumbs />

                {/* Hero Carousel */}
                <section className="mb-12">
                    {data.slides.length > 0 && <MultiCarousel items={data.slides} />}
                </section>

                {/* Search & Tabs */}
                <section className="max-w-5xl mx-auto mb-16 px-4">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 w-fit mx-auto">
                            <button 
                                onClick={() => setActiveTab('products')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-400 hover:text-[#0A1128]'}`}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Produk
                            </button>
                            <button 
                                onClick={() => setActiveTab('stores')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stores' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-400 hover:text-[#0A1128]'}`}
                            >
                                <Store className="w-3.5 h-3.5" />
                                Vendor
                            </button>
                        </div>

                        {/* Category Scroller */}
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
                                            <ShopIcon 
                                                name={cat.icon} 
                                                size={16} 
                                                className={isActive ? 'text-[#FFBF00]' : 'text-slate-300'} 
                                            />
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
                    </div>
                </section>

                {/* Ads Section */}
                <section className="mb-20">
                    <SpecialAdsScroller 
                        biddingAds={data.specialAds}
                        specialBanner={data.specialBanner}
                        specialProducts={data.specialProducts}
                    />
                </section>

                {/* Featured Products */}
                <section className="mb-20">
                    <div className="flex items-center justify-between mb-8 px-4">
                        <h2 className="text-2xl font-black text-[#0A1128] uppercase tracking-tight italic underline decoration-[#FFBF00] decoration-4 underline-offset-8">Produk Featured</h2>
                        <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest text-[#FFBF00] flex items-center gap-2 hover:text-[#0A1128] transition-colors">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
                        {data.featured.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>

                {/* All Products Grid with Load More */}
                <section className="mb-32">
                    <ProductGrid 
                        products={filteredProducts}
                        title={activeTab === 'products' ? 'Semua Produk' : 'Semua Vendor'}
                    />
                </section>

                {/* Blog Section */}
                <BlogSection />

                <SEOListingFooter />
            </Container>
        </main>
    );
}
