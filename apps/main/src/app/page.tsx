import React from 'react';
import Link from 'next/link';
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
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/Shop/Breadcrumbs';
import { MultiCarousel } from '@/components/ui/MultiCarousel';
import { SEOListingFooter } from '@/components/Shop/SEOListingFooter';
import { ProductCard } from '@/components/Shop/ProductCard';
import { SpecialAdsScroller } from '@/components/Shop/SpecialAdsScroller';
import { Heading } from '@/components/ui/Typography';
import { getShopData } from '@/lib/api';
import { cn } from '@/lib/utils';

const categoryConfig = [
    { name: 'All', icon: LayoutGrid, slug: 'all' },
    { name: 'MUA', icon: Sparkles, slug: 'mua' },
    { name: 'Wedding Organizer', icon: Heart, slug: 'wedding-organizer' },
    { name: 'Catering', icon: Utensils, slug: 'catering' },
    { name: 'Fotografi', icon: Camera, slug: 'fotografi' },
    { name: 'Dekorasi', icon: Palette, slug: 'dekorasi' },
    { name: 'Venue', icon: Building2, slug: 'venue' },
];

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const data = await getShopData();
    const params = await searchParams;
    
    const activeTab = (params.tab as string) || 'products';
    const currentCategory = (params.category as string) || 'all';

    return (
        <div className="bg-white min-h-screen">
            <Container className="pt-16 pb-20">
                <Breadcrumbs />
                
                <section className="mb-12">
                    <MultiCarousel items={data.slides} />
                </section>

                <div className="space-y-16">
                    {/* Filter - Murni Server Link */}
                    <section className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="inline-flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                            <Link 
                                href="/?tab=products"
                                prefetch={false}
                                className={cn(
                                    "inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                    activeTab === 'products' ? "bg-[#0A1128] text-white shadow-lg" : "text-slate-400"
                                )}
                            >
                                <ShoppingBag className="w-4 h-4" /> Produk
                            </Link>
                            <Link 
                                href="/?tab=stores"
                                prefetch={false}
                                className={cn(
                                    "inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                    activeTab === 'stores' ? "bg-[#0A1128] text-white shadow-lg" : "text-slate-400"
                                )}
                            >
                                <Store className="w-4 h-4" /> Vendor
                            </Link>
                        </div>

                        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar justify-center">
                            {categoryConfig.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/?tab=${activeTab}&category=${cat.slug}`}
                                    scroll={false}
                                    prefetch={false}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border whitespace-nowrap",
                                        currentCategory === cat.slug 
                                        ? "bg-white border-amber-400 text-[#0A1128] shadow-sm" 
                                        : "bg-white border-slate-100 text-slate-400"
                                    )}
                                >
                                    <cat.icon className={cn("w-4 h-4", currentCategory === cat.slug ? "text-[#FFBF00]" : "text-slate-300")} />
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Grid - Solid SSR Rendering */}
                    <section className="space-y-20">
                        {activeTab === 'products' ? (
                            <div className="space-y-20">
                                <SpecialAdsScroller ads={data.featuredAds} />
                                
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                        <Heading level={2} className="uppercase tracking-tighter italic">Koleksi Produk</Heading>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {data.products.length} Results</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                                        {data.products.map((p: any) => (
                                            <ProductCard key={p.id} product={p} />
                                        ))}
                                    </div>

                                    <div className="pt-20 flex justify-center">
                                        <button className="px-12 py-5 bg-white border-2 border-slate-900 text-[#0A1128] font-black rounded-2xl text-xs uppercase tracking-[0.2em] active:scale-95 transition-transform">
                                            Tampilkan Lebih Banyak
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-100 rounded-[3rem]">
                                    List Vendor SSR Mode
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                <SEOListingFooter />
            </Container>
        </div>
    );
}
