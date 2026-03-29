import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shop } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { useTrackAdClick, useSpecialProducts } from '../../hooks/queries/useShop';
import { ProductCard } from './ProductCard';
import { Button } from '../ui/shadcn/Button';

export const SpecialAdsScroller = React.memo(() => {
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

    // CTO HYBRID LOGIC: Priority to Paid Ads, then merge with Curated Special Products
    const scrollItems = useMemo(() => {
        const ads = biddingAds.map((ad: any) => ({
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
            avg_rating: ad.avg_rating,
            review_count: ad.review_count,
            wishlist_count: ad.wishlist_count,
            kota: ad.kota
        }));

        const combined = [...ads];
        
        // Merge special flag products that aren't already in ads
        specialProducts.forEach((p: any) => {
            if (!combined.some(item => item.productId === p.id || item.id === p.id)) {
                combined.push(p);
            }
        });

        return combined;
    }, [biddingAds, specialProducts]);

    const handleScroll = useCallback((distance: number) => {
        const el = document.getElementById('special-ads-scroll');
        if (el) el.scrollBy({ left: distance, behavior: 'smooth' });
    }, []);

    if ((isLoadingAds && isLoadingProducts) || (scrollItems.length === 0 && !specialBanner)) return null;

    return (
        <section className="mb-20">
            <div className="bg-[#0A1128] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden group/special">
                <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
                    <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">Spesial Untuk Kamu</h2>
                    <Button 
                        variant="link"
                        onClick={() => navigate('/shop/discovery')}
                        className="text-[#FFBF00] text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors p-0 h-auto"
                    >
                        Lihat Semua
                    </Button>
                </div>

                <div className="relative">
                    <div 
                        id="special-ads-scroll"
                        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 relative z-10 snap-x scroll-smooth"
                    >
                        {/* THE BANNER CARD */}
                        <div 
                            onClick={() => {
                                if (specialBanner?.id) trackClick.mutate(specialBanner.id);
                                specialBanner?.link_url && (window.location.href = specialBanner.link_url);
                            }}
                            className="w-[160px] md:w-[195px] h-[300px] md:h-[380px] rounded-[1.5rem] md:rounded-[2rem] bg-slate-800 flex-shrink-0 relative overflow-hidden snap-start cursor-pointer group"
                        >
                            {specialBanner?.image_url ? (
                                <img src={specialBanner.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Promo Banner" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center p-4 text-center">
                                    <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Sponsorship Slot</p>
                                </div>
                            )}
                        </div>

                        {/* THE PRODUCT CARDS */}
                        {scrollItems.slice(0, 10).map((product: any) => (
                            <div key={product.id} className="snap-start flex-shrink-0">
                                <ProductCard 
                                    product={product} 
                                    navigate={navigate} 
                                    isSmall={true} 
                                    onAdClick={(id) => trackClick.mutate(id)}
                                />
                            </div>
                        ))}

                        {/* FALLBACK PLACEHOLDER IF EMPTY */}
                        {scrollItems.length === 0 && !isLoadingAds && (
                            <div className="flex items-center justify-center w-[160px] md:w-[195px] h-[300px] md:h-[380px] border border-white/10 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 flex-shrink-0">
                                <p className="text-white/50 font-bold uppercase tracking-widest text-[8px] md:text-[10px] text-center px-4">Produk Segera Hadir</p>
                            </div>
                        )}
                    </div>

                    {/* Scroll Buttons */}
                    <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => handleScroll(-300)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[#FFBF00] hover:text-[#0A1128] transition-all shadow-2xl z-20 hidden md:flex"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </Button>
                    <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => handleScroll(300)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[#FFBF00] hover:text-[#0A1128] transition-all shadow-2xl z-20 hidden md:flex"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </Button>
                </div>
            </div>
        </section>
    );
});
