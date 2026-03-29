"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
    Building2
} from 'lucide-react';
import { Heading } from '@/components/ui/Typography';
import { ProductCard } from '@/components/Shop/ProductCard';
import { VendorCard } from '@/components/Shop/VendorCard';
import { SpecialAdsScroller } from '@/components/Shop/SpecialAdsScroller';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from "@/components/ui/Button"

const categoryConfig = [
    { name: 'All', icon: LayoutGrid, slug: 'all' },
    { name: 'MUA', icon: Sparkles, slug: 'mua' },
    { name: 'Wedding Organizer', icon: Heart, slug: 'wedding-organizer' },
    { name: 'Catering', icon: Utensils, slug: 'catering' },
    { name: 'Fotografi', icon: Camera, slug: 'fotografi' },
    { name: 'Dekorasi', icon: Palette, slug: 'dekorasi' },
    { name: 'Venue', icon: Building2, slug: 'venue' },
];

const LazyItem = ({ children, height = 350 }: { children: React.ReactNode, height?: number }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '400px' } 
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ minHeight: `${height}px` }}>
            {isVisible ? children : <Skeleton className={`w-full h-[${height}px] rounded-[2rem] border border-slate-100`} />}
        </div>
    );
};

function ShopFilter() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentCategory = searchParams.get('category') || 'All';

    const handleCategoryClick = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug === 'all') params.delete('category');
        else params.set('category', slug);
        router.push(`/?${params.toString()}`, { scroll: false }); 
    };

    return (
        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar justify-center">
            {categoryConfig.map((cat) => (
                <button
                    key={cat.slug}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                        currentCategory.toLowerCase() === cat.slug 
                        ? 'bg-white border-amber-400 text-[#0A1128] shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                >
                    <cat.icon className={`w-4 h-4 ${currentCategory.toLowerCase() === cat.slug ? 'text-[#FFBF00]' : 'text-slate-300'}`} />
                    {cat.name}
                </button>
            ))}
        </div>
    );
}

export default function ShopClientContent({ initialProducts }: { initialProducts: any[] }) {
    const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');

    // Mock vendors for demo
    const mockVendors = [
        { id: '1', store_name: 'Nusantara Wedding', slug: 'nusantara-wedding', kota: 'Jakarta', rating: 4.9, review_count: 120 },
        { id: '2', store_name: 'Griya MUA', slug: 'griya-mua', kota: 'Bandung', rating: 4.8, review_count: 85 },
        { id: '3', store_name: 'Capture Moment', slug: 'capture-moment', kota: 'Surabaya', rating: 5.0, review_count: 45 },
    ];

    return (
        <div className="space-y-16">
            {/* Filter Header */}
            <section className="max-w-4xl mx-auto text-center space-y-8">
                <div className="inline-flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <Button 
                        variant={activeTab === 'products' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('products')}
                        className={`rounded-xl text-[10px] font-black uppercase tracking-widest px-8 ${activeTab === 'products' ? 'bg-[#0A1128] text-white shadow-lg hover:bg-[#0A1128]' : 'text-slate-400 hover:text-[#0A1128]'}`}
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" /> Produk
                    </Button>
                    <Button 
                        variant={activeTab === 'stores' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('stores')}
                        className={`rounded-xl text-[10px] font-black uppercase tracking-widest px-8 ${activeTab === 'stores' ? 'bg-[#0A1128] text-white shadow-lg hover:bg-[#0A1128]' : 'text-slate-400 hover:text-[#0A1128]'}`}
                    >
                        <Store className="w-4 h-4 mr-2" /> Vendor
                    </Button>
                </div>

                <Suspense fallback={<Skeleton className="h-12 w-full max-w-lg mx-auto rounded-full" />}>
                    <ShopFilter />
                </Suspense>
            </section>

            {/* Content Grid */}
            <section className="space-y-20">
                {activeTab === 'products' ? (
                    <div className="space-y-20">
                        <SpecialAdsScroller />
                        
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                <Heading level={2} className="uppercase tracking-tighter italic">Koleksi Produk</Heading>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {initialProducts.length} Results</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                                {initialProducts.map((p) => (
                                    <LazyItem key={p.id}>
                                        <ProductCard product={p} />
                                    </LazyItem>
                                ))}
                            </div>

                            <div className="pt-20 flex justify-center">
                                <Button variant="outline" className="px-12 py-6 border-2 border-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all active:scale-95">
                                    Tampilkan Lebih Banyak
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {mockVendors.map((vendor) => (
                            <LazyItem key={vendor.id} height={200}>
                                <VendorCard vendor={vendor} />
                            </LazyItem>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
