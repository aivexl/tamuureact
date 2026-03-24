import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
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

                <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar snap-x">
                    {items.map((item: any, idx: number) => (
                        <m.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="w-48 flex-shrink-0 snap-start"
                        >
                            <ProductCard 
                                product={item}
                                navigate={navigate}
                                onAdClick={() => handleAdClick(item)}
                            />
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
