import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shop } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useTrackAdClick, useFeaturedProducts } from '../../hooks/queries/useShop';
import { ProductCard } from './ProductCard';

export const FeaturedAdsScroller: React.FC = () => {
    const navigate = useNavigate();
    const { data: adsRes, isLoading: isLoadingAds } = useQuery({
        queryKey: ['active_featured_ads_detail'],
        queryFn: () => shop.getAds('FEATURED_PRODUCT_DETAIL')
    });

    const { data: featuredProductsRes = [], isLoading: isLoadingProducts } = useFeaturedProducts();

    const trackClick = useTrackAdClick();

    const items = useMemo(() => {
        const ads = (adsRes?.ads || []).map((ad: any) => ({
            id: ad.id,
            productId: ad.target_id,
            isAd: true,
            nama_produk: ad.nama_produk || ad.title,
            harga_estimasi: ad.harga_estimasi || 0,
            images: [{ image_url: ad.image_url }],
            nama_toko: ad.nama_toko,
            logo_url: ad.logo_url,
            vendor_slug: ad.vendor_slug,
            slug: ad.product_slug,
            kota: ad.kota
        }));

        const products = Array.isArray(featuredProductsRes) ? featuredProductsRes : [];
        
        // Merge ads at the front, then unique products
        const combined = [...ads];
        products.forEach((p: any) => {
            if (!combined.some(item => item.productId === p.id || item.id === p.id)) {
                combined.push({
                    ...p,
                    image_url: p.images?.[0]?.image_url
                });
            }
        });
        return combined;
    }, [adsRes, featuredProductsRes]);

    if ((isLoadingAds && isLoadingProducts) || items.length === 0) return null;

    const handleAdClick = (item: any) => {
        if (item.isAd) {
            trackClick.mutate(item.id);
        }
    };

    return (
        <section className="mb-12 py-8 border-y border-slate-50 bg-[#FBFBFB]/50">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-1.5 bg-[#FFBF00] rounded-full" />
                        <h2 className="text-xl font-black uppercase tracking-tighter italic text-[#0A1128]">Featured Product</h2>
                    </div>
                </div>

                <div className="relative group/featured">
                    <div 
                        id="featured-ads-scroll"
                        className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar snap-x no-scrollbar scroll-smooth"
                    >
                        {items.map((item: any, idx: number) => (
                            <m.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="snap-start"
                            >
                                <ProductCard 
                                    product={item}
                                    navigate={navigate}
                                    isSmall={true}
                                    onAdClick={() => handleAdClick(item)}
                                />
                            </m.div>
                        ))}
                    </div>

                    {/* Scroll Buttons - Always Visible */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            const el = document.getElementById('featured-ads-scroll');
                            if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                        }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] transition-all z-20 hidden md:flex"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            const el = document.getElementById('featured-ads-scroll');
                            if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                        }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] transition-all z-20 hidden md:flex"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};
