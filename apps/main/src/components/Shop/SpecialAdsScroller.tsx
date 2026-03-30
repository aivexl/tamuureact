"use client";

import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useRouter } from 'next/navigation';
import { trackAdClick, trackAdView } from '@/lib/api';

// Tracking Hook for Impressions
const useTrackImpression = (adId: string) => {
    const hasTracked = useRef(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!adId || hasTracked.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasTracked.current) {
                    trackAdView(adId);
                    hasTracked.current = true;
                    observer.disconnect();
                }
            },
            { threshold: 0.5 } // Track if 50% of the ad is visible
        );

        if (elementRef.current) observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, [adId]);

    return elementRef;
};

const TrackableAdCard = ({ ad, onAdClick }: { ad: any, onAdClick: (id: string) => void }) => {
    const ref = useTrackImpression(ad.id);
    return (
        <div ref={ref} className="snap-start flex-shrink-0">
            <ProductCard 
                product={{
                    ...ad,
                    productId: ad.target_id,
                    isAd: true,
                    images: [{ image_url: ad.image_url }]
                }} 
                isSmall={true}
                onAdClick={onAdClick}
            />
        </div>
    );
};

export const SpecialAdsScroller = ({ 
    biddingAds = [], 
    specialBanner = null,
    specialProducts = []
}: { 
    biddingAds?: any[], 
    specialBanner?: any,
    specialProducts?: any[]
}) => {
    const router = useRouter();
    const bannerRef = useTrackImpression(specialBanner?.id || '');

    const handleScroll = useCallback((distance: number) => {
        const el = document.getElementById('special-ads-scroll');
        if (el) el.scrollBy({ left: distance, behavior: 'smooth' });
    }, []);

    const handleAdClick = async (adId: string) => {
        await trackAdClick(adId);
    };

    const scrollItems = useMemo(() => {
        const ads = biddingAds.map((ad: any) => ({
            ...ad,
            isAd: true,
        }));

        const combined = [...ads];
        specialProducts.forEach((p: any) => {
            if (!combined.some(item => (item.productId === p.id || item.id === p.id))) {
                combined.push(p);
            }
        });
        return combined;
    }, [biddingAds, specialProducts]);

    if (scrollItems.length === 0 && !specialBanner) return null;

    return (
        <section className="mb-20">
            <div className="bg-[#0A1128] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden group/special">
                <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
                    <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight italic">Spesial Untuk Kamu</h2>
                    <button 
                        onClick={() => router.push('/')}
                        className="text-[#FFBF00] text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors p-0 h-auto"
                    >
                        Lihat Semua
                    </button>
                </div>

                <div className="relative">
                    <div 
                        id="special-ads-scroll"
                        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 relative z-10 snap-x snap-mandatory scroll-smooth"
                    >
                        {/* 1. THE DYNAMIC BANNER CARD */}
                        {specialBanner && (
                            <div 
                                ref={bannerRef}
                                onClick={() => {
                                    if (specialBanner?.id) handleAdClick(specialBanner.id);
                                    if (specialBanner?.link_url) window.location.href = specialBanner.link_url;
                                }}
                                className="w-[160px] md:w-[195px] h-[300px] md:h-[380px] rounded-[1.5rem] md:rounded-[2rem] bg-white flex-shrink-0 relative overflow-hidden snap-start cursor-pointer group border border-slate-100"
                            >
                                {specialBanner?.image_url ? (
                                    <img src={specialBanner.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Promo Banner" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-8 md:p-12">
                                        <img 
                                            src="/images/logo-tamuu-vfinal-v1.webp" 
                                            className="w-full h-full object-contain opacity-20 grayscale transition-all duration-700 group-hover:opacity-40 group-hover:scale-110" 
                                            alt="Tamuu Logo" 
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. THE COMBINED ITEMS (ADS + SPECIAL) */}
                        {scrollItems.map((item: any) => (
                            item.isAd ? (
                                <TrackableAdCard key={item.id} ad={item} onAdClick={handleAdClick} />
                            ) : (
                                <div key={item.id} className="snap-start flex-shrink-0">
                                    <ProductCard product={item} isSmall={true} />
                                </div>
                            )
                        ))}
                    </div>

                    <button 
                        onClick={() => handleScroll(-300)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[#FFBF00] hover:text-[#0A1128] transition-all shadow-2xl z-20 hidden md:flex"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button 
                        onClick={() => handleScroll(300)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[#FFBF00] hover:text-[#0A1128] transition-all shadow-2xl z-20 hidden md:flex"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        </section>
    );
};
