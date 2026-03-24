import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shop } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useTrackAdClick, useFeaturedProducts } from '../../hooks/queries/useShop';

export const FeaturedAdsScroller: React.FC = () => {
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
            image_url: ad.image_url,
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
                            <Link 
                                to={`/shop/${item.vendor_slug}/${item.slug || item.id}`}
                                onClick={() => handleAdClick(item)}
                                className="group block bg-white p-3 rounded-[2rem] border border-slate-50 hover:shadow-2xl hover:shadow-slate-100 transition-all"
                            >
                                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-4 relative">
                                    <img 
                                        src={item.image_url || '/placeholder-product.png'} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        alt={item.nama_produk} 
                                    />
                                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur shadow-sm text-[7px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                        {item.isAd ? 'Ad' : 'Featured'}
                                    </div>
                                </div>
                                <div className="px-1 space-y-1">
                                    <h3 className="text-[11px] font-black text-[#0A1128] uppercase truncate leading-tight group-hover:text-[#FFBF00] transition-colors">
                                        {item.nama_produk}
                                    </h3>
                                    <p className="text-[10px] font-bold text-[#FFBF00]">
                                        {item.harga_estimasi && !isNaN(Number(item.harga_estimasi)) ? formatCurrency(item.harga_estimasi) : (item.harga_estimasi || 'Tanya Harga')}
                                    </p>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <div className="w-3.5 h-3.5 rounded-full bg-slate-100 overflow-hidden">
                                            <img src={item.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.nama_toko}`} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase truncate">{item.nama_toko}</span>
                                    </div>
                                </div>
                            </Link>
                        </m.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
