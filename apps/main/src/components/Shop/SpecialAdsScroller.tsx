"use client";

import React, { useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useRouter } from 'next/navigation';
import { trackAdClick } from '@/lib/api';

export const SpecialAdsScroller = ({ biddingAds = [], specialBanner = null }: { biddingAds?: any[], specialBanner?: any }) => {
    const router = useRouter();

    const handleScroll = useCallback((distance: number) => {
        const el = document.getElementById('special-ads-scroll');
        if (el) el.scrollBy({ left: distance, behavior: 'smooth' });
    }, []);

    const handleAdClick = async (adId: string) => {
        await trackAdClick(adId);
    };

    if (biddingAds.length === 0 && !specialBanner) return null;

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
                        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 relative z-10 snap-x scroll-smooth"
                    >
                        {/* THE BANNER CARD (DYNAMIC FROM API) */}
                        <div 
                            onClick={() => {
                                if (specialBanner?.id) handleAdClick(specialBanner.id);
                                specialBanner?.link_url && (window.location.href = specialBanner.link_url);
                            }}
                            className="w-[160px] md:w-[195px] h-[300px] md:h-[380px] rounded-[1.5rem] md:rounded-[2rem] bg-slate-800 flex-shrink-0 relative overflow-hidden snap-start cursor-pointer group"
                        >
                            {specialBanner?.image_url ? (
                                <img src={specialBanner.image_url} className="absolute inset-0 w-full h-full object-cover" alt="Promo Banner" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center p-4 text-center">
                                    <p className="text-white/20 text-[8px] font-black uppercase tracking-widest italic leading-tight">Tamuu<br/>Premium<br/>Partner</p>
                                </div>
                            )}
                        </div>

                        {/* THE PRODUCT CARDS (PAID ADS) */}
                        {biddingAds.map((ad: any) => (
                            <div key={ad.id} className="snap-start flex-shrink-0">
                                <ProductCard 
                                    product={{
                                        ...ad,
                                        productId: ad.target_id,
                                        isAd: true,
                                        images: [{ image_url: ad.image_url }]
                                    }} 
                                    onAdClick={(id) => handleAdClick(id)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Scroll Buttons */}
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
