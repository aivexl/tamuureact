import React from 'react';
import { m } from 'framer-motion';
import { Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shop } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useTrackAdClick, useSpecialProducts } from '../../hooks/queries/useShop';
import { ProductCard } from './ProductCard';

export const SpecialAdsScroller: React.FC = () => {
    const navigate = useNavigate();
    
    // 1. Fetch Bidding Ads (New System) - For the Main Scroller
    const { data: adsRes, isLoading: isLoadingAds } = useQuery({
        queryKey: ['active_special_ads_home'],
        queryFn: () => shop.getAds('SPECIAL_FOR_YOU_HOME')
    });

    // 2. Fetch Special Banner (Legacy Ad System) - Specifically for the FIRST CARD SLOT
    const { data: bannerRes } = useQuery({
        queryKey: ['shop_special_banner_home'],
        queryFn: () => shop.getAds('SHOP_SPECIAL_FOR_YOU')
    });

    // 3. Fetch Special Products (Legacy Fallback)
    const { data: specialProducts = [], isLoading: isLoadingProducts } = useSpecialProducts();

    const trackClick = useTrackAdClick();
    const biddingAds = adsRes?.ads || [];
    const specialBanner = bannerRes?.ads?.[0] || null;

    // CTO HYBRID LOGIC: Priority to Paid Ads, fallback to Curated Special Products
    const scrollItems = biddingAds.length > 0 
        ? biddingAds.map((ad: any) => ({
            id: ad.id,
            isAd: true,
            nama_produk: ad.nama_produk || ad.title,
            harga_estimasi: ad.harga_estimasi || 0,
            images: [{ image_url: ad.image_url }],
            nama_toko: ad.nama_toko,
            logo_url: ad.logo_url,
            vendor_slug: ad.vendor_slug,
            slug: ad.product_slug,
            avg_rating: ad.avg_rating,
            review_count: ad.review_count,
            wishlist_count: ad.wishlist_count
        }))
        : specialProducts;

    if ((isLoadingAds && isLoadingProducts) || (scrollItems.length === 0 && !specialBanner)) return null;

    const handleItemClick = (item: any) => {
        if (item.isAd) {
            trackClick.mutate(item.id);
        }
    };

    return (
        <section className="mb-20">
            <div className="bg-[#0A1128] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
                    <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">Spesial Untuk Kamu</h2>
                    <button 
                        onClick={() => navigate('/shop/discovery')}
                        className="text-[#FFBF00] text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Lihat Semua
                    </button>
                </div>

                <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 relative z-10 snap-x">
                    {/* THE BANNER CARD - EXACT DIMENSIONS FROM 3 DAYS AGO (731fb91) */}
                    <div 
                        onClick={() => specialBanner?.link_url && (window.location.href = specialBanner.link_url)}
                        className="w-[160px] md:w-[195px] h-[300px] md:h-[380px] rounded-[1.5rem] md:rounded-[2rem] bg-slate-800 flex-shrink-0 relative overflow-hidden snap-start cursor-pointer group"
                    >
                        {specialBanner?.image_url ? (
                            <img src={specialBanner.image_url} className="absolute inset-0 w-full h-full object-cover" alt="Promo Banner" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center p-4 text-center">
                                <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Sponsorship Slot</p>
                            </div>
                        )}
                    </div>

                    {/* THE PRODUCT CARDS - EXACT COMPONENT & SMALL PROP FROM 3 DAYS AGO (731fb91) */}
                    {scrollItems.slice(0, 10).map((product: any) => (
                        <div key={product.id} className="snap-start flex-shrink-0" onClick={() => handleItemClick(product)}>
                            <ProductCard product={product} navigate={navigate} isSmall={true} />
                        </div>
                    ))}

                    {/* FALLBACK PLACEHOLDER IF EMPTY */}
                    {scrollItems.length === 0 && !isLoadingAds && (
                        <div className="flex items-center justify-center w-[160px] md:w-[195px] h-[300px] md:h-[380px] border border-white/10 rounded-[1.5rem] md:rounded-[2rem] bg-white/5">
                            <p className="text-white/50 font-bold uppercase tracking-widest text-[8px] md:text-[10px] text-center px-4">Produk Segera Hadir</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
