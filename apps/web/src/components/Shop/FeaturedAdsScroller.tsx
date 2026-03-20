import React from 'react';
import { m } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shop } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useTrackAdClick } from '../../hooks/queries/useShop';

export const FeaturedAdsScroller: React.FC = () => {
    const { data: adsRes, isLoading } = useQuery({
        queryKey: ['active_featured_ads'],
        queryFn: () => shop.getAds('FEATURED_PRODUCT_DETAIL')
    });

    const trackClick = useTrackAdClick();
    const ads = adsRes?.ads || [];

    if (isLoading || ads.length === 0) return null;

    const handleAdClick = (ad: any) => {
        trackClick.mutate(ad.id);
    };

    return (
        <section className="mb-12 py-8 border-y border-slate-50 bg-[#FBFBFB]/50">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shadow-sm">
                            <Star className="w-5 h-5 text-rose-500 fill-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic text-[#0A1128]">Premium <span className="text-rose-500">Selections</span></h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Curated for you</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
                    {ads.map((ad: any, idx: number) => (
                        <m.div
                            key={ad.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="min-w-[200px] md:min-w-[240px] snap-start"
                        >
                            <Link 
                                to={`/shop/${ad.vendor_slug}/${ad.product_slug}`}
                                onClick={() => handleAdClick(ad)}
                                className="group block bg-white p-3 rounded-[2rem] border border-slate-100 hover:border-rose-500 transition-all shadow-sm hover:shadow-xl hover:shadow-rose-500/5"
                            >
                                <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-slate-100 relative mb-3">
                                    <img 
                                        src={ad.image_url || '/placeholder-product.png'} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        alt={ad.title} 
                                    />
                                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/90 backdrop-blur shadow-sm text-[7px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1">
                                        Featured
                                    </div>
                                </div>
                                <div className="px-1 space-y-1">
                                    <h3 className="text-xs font-black text-[#0A1128] truncate group-hover:text-rose-500 transition-colors">{ad.nama_produk || ad.title}</h3>
                                    <p className="text-[10px] font-black text-rose-500 italic">{formatCurrency(ad.harga_estimasi || 0)}</p>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <div className="w-4 h-4 rounded-full bg-slate-100 overflow-hidden">
                                            <img src={ad.logo_url} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase truncate">{ad.nama_toko}</span>
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
