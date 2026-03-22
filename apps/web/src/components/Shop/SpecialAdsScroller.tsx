import React from 'react';
import { m } from 'framer-motion';
import { Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shop } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useTrackAdClick, useSpecialProducts } from '../../hooks/queries/useShop';

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

    // CTO HYBRID LOGIC: Replicating "3 Days Ago" Layout
    // Priority to Paid Ads, fallback to Curated Special Products
    const scrollItems = biddingAds.length > 0 
        ? biddingAds.map((ad: any) => ({
            id: ad.id,
            isAd: true,
            title: ad.nama_produk || ad.title,
            price: ad.harga_estimasi || 0,
            image: ad.image_url || (ad.images?.[0]?.image_url),
            vendorName: ad.nama_toko,
            vendorLogo: ad.logo_url,
            link: `/shop/${ad.vendor_slug}/${ad.product_slug}`,
            badge: 'Featured'
        }))
        : specialProducts.map((p: any) => ({
            id: p.id,
            isAd: false,
            title: p.nama_produk,
            price: p.harga_estimasi || 0,
            image: p.images?.[0]?.image_url,
            vendorName: p.nama_toko,
            vendorLogo: p.logo_url,
            link: `/shop/${p.vendor_slug}/${p.slug}`,
            badge: 'Special'
        }));

    if ((isLoadingAds && isLoadingProducts) || (scrollItems.length === 0 && !specialBanner)) return null;

    const handleItemClick = (item: any) => {
        if (item.isAd) {
            trackClick.mutate(item.id);
        }
    };

    return (
        <section className="mb-20">
            <div className="bg-[#0A1128] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden">
                {/* Visual Background Accents */}
                <div className="absolute top-[-10%] -right-[5%] w-[40%] h-[40%] bg-[#FFBF00]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] -left-[5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-[1.25rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 text-[#FFBF00]">
                            <Sparkles className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Spesial <span className="text-[#FFBF00]">Untuk Kamu</span></h2>
                            <p className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mt-1">Handpicked market highlights</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/shop/discovery')}
                        className="text-[#FFBF00] text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                    >
                        Lihat Semua <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 relative z-10 snap-x -mx-2 px-2">
                    {/* THE BANNER CARD (Manual Setup from Admin Dashboard) */}
                    <m.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => specialBanner?.link_url && (window.location.href = specialBanner.link_url)}
                        className="w-[160px] md:w-[220px] h-[280px] md:h-[340px] rounded-[1.5rem] md:rounded-[2rem] bg-slate-800 flex-shrink-0 relative overflow-hidden snap-start cursor-pointer group border border-white/10 hover:border-[#FFBF00]/50 transition-all duration-500"
                    >
                        {specialBanner?.image_url ? (
                            <img src={specialBanner.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Promo Banner" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center p-4">
                                <div className="text-center">
                                    <ShoppingBag className="w-8 h-8 text-white/10 mx-auto mb-3" />
                                    <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">Sponsorship Slot</p>
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-4 left-4 right-4">
                            <span className="text-white text-[8px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-500">Discover More</span>
                        </div>
                    </m.div>

                    {/* THE PRODUCT CARDS (Manual Special Products fallback or Ads) */}
                    {scrollItems.slice(0, 10).map((item: any, idx: number) => (
                        <m.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="snap-start flex-shrink-0"
                        >
                            <Link 
                                to={item.link}
                                onClick={() => handleItemClick(item)}
                                className="group block w-[160px] md:w-[220px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden hover:border-[#FFBF00]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#FFBF00]/5"
                            >
                                <div className="aspect-[4/5] relative overflow-hidden">
                                    {item.image ? (
                                        <img 
                                            src={item.image} 
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                            alt={item.title} 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <ShoppingBag className="w-8 h-8 text-white/10" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2.5 py-1 rounded-full bg-[#0A1128]/80 backdrop-blur-md text-[#FFBF00] text-[7px] font-black uppercase tracking-widest border border-[#FFBF00]/20">
                                            {item.badge}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-4 md:p-5 space-y-3">
                                    <h3 className="text-xs md:text-sm font-bold text-white truncate leading-tight group-hover:text-[#FFBF00] transition-colors">{item.title}</h3>
                                    
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[10px] md:text-xs font-black text-[#FFBF00]">{formatCurrency(item.price)}</p>
                                        
                                        <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                                                {item.vendorLogo && <img src={item.vendorLogo} className="w-full h-full object-cover" />}
                                            </div>
                                            <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase truncate">{item.vendorName}</span>
                                        </div>
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
