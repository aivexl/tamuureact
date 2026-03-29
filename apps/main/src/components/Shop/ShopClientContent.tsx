"use client";

import React, { useState } from 'react';
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
import { SpecialAdsScroller } from '@/components/Shop/SpecialAdsScroller';

const categoryConfig = [
    { name: 'All', icon: LayoutGrid, slug: 'all' },
    { name: 'MUA', icon: Sparkles, slug: 'mua' },
    { name: 'Wedding Organizer', icon: Heart, slug: 'wedding-organizer' },
    { name: 'Catering', icon: Utensils, slug: 'catering' },
    { name: 'Fotografi', icon: Camera, slug: 'fotografi' },
    { name: 'Dekorasi', icon: Palette, slug: 'dekorasi' },
    { name: 'Venue', icon: Building2, slug: 'venue' },
];

export default function ShopClientContent({ initialProducts }: { initialProducts: any[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');
    
    const currentCategory = searchParams.get('category') || 'All';
    const searchQuery = searchParams.get('q') || '';

    const handleCategoryClick = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug === 'all') params.delete('category');
        else params.set('category', slug);
        router.push(`/?${params.toString()}`); 
    };

    return (
        <div className="space-y-16">
            {/* Filter Header */}
            <section className="max-w-4xl mx-auto text-center space-y-8">
                <div className="inline-flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <button 
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-400 hover:text-[#0A1128]'}`}
                    >
                        <ShoppingBag className="w-4 h-4" /> Produk
                    </button>
                    <button 
                        onClick={() => setActiveTab('stores')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stores' ? 'bg-[#0A1128] text-white shadow-lg' : 'text-slate-400 hover:text-[#0A1128]'}`}
                    >
                        <Store className="w-4 h-4" /> Vendor
                    </button>
                </div>

                <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar justify-center">
                    {categoryConfig.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => handleCategoryClick(cat.slug)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                                currentCategory.toLowerCase() === cat.slug 
                                ? 'bg-white border-[#FFBF00] text-[#0A1128] shadow-sm' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                            }`}
                        >
                            <cat.icon className={`w-4 h-4 ${currentCategory.toLowerCase() === cat.slug ? 'text-[#FFBF00]' : 'text-slate-300'}`} />
                            {cat.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* Content Grid */}
            <section className="space-y-20">
                {activeTab === 'products' ? (
                    <div className="space-y-20">
                        <SpecialAdsScroller />
                        
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                <Heading level={2} className="uppercase tracking-tighter">
                                    {searchQuery ? `Hasil Cari: ${searchQuery}` : 'Koleksi Produk'}
                                </Heading>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {initialProducts.length} Results</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                                {initialProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>

                            {/* Standard Load More (Pure CSS/HTML feel) */}
                            <div className="pt-20 flex justify-center">
                                <button className="px-12 py-5 bg-white border-2 border-slate-900 text-[#0A1128] font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all active:scale-95">
                                    Tampilkan Lebih Banyak
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1,2,3].map((i) => (
                            <div key={i} className="bg-slate-50 h-64 rounded-[2rem] border border-slate-100" />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
