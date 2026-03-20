import React from 'react';
import { m } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shop } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useTrackAdClick } from '../../hooks/queries/useShop';

export const SpecialAdsScroller: React.FC = () => {
    const { data: adsRes, isLoading } = useQuery({
        queryKey: ['active_special_ads'],
        queryFn: () => shop.getAds('SPECIAL_FOR_YOU_HOME')
    });

    const trackClick = useTrackAdClick();
    const ads = adsRes?.ads || [];

    if (isLoading || ads.length === 0) return null;

    const handleAdClick = (ad: any) => {
        trackClick.mutate(ad.id);
    };

    return (
        <section className="py-12 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-[#0A1128] flex items-center justify-center shadow-xl shadow-[#0A1128]/10 text-[#FFBF00]">
                            <Sparkles className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black italic text-[#0A1128]">Special <span className="text-[#FFBF00]">For You</span></h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Handpicked market highlights</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar snap-x -mx-4 px-4 md:mx-0 md:px-0">
                    {ads.slice(0, 10).map((ad: any, idx: number) => (
                        <m.div
                            key={ad.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="min-w-[260px] md:min-w-[300px] snap-start"
                        >
                            <Link 
                                to={`/shop/${ad.vendor_slug}/${ad.product_slug}`}
                                onClick={() => handleAdClick(ad)}
                                className="group block bg-[#FBFBFB] rounded-[2.5rem] border border-slate-100 hover:border-[#FFBF00] transition-all hover:shadow-2xl hover:shadow-slate-200/50 overflow-hidden"
                            >
                                <div className="aspect-[4/3] overflow-hidden relative">
                                    <img 
                                        src={ad.image_url || '/placeholder-product.png'} 
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                        alt={ad.title} 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            View Insight <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-black text-[#0A1128] truncate leading-tight group-hover:text-[#FFBF00] transition-colors">{ad.nama_produk || ad.title}</h3>
                                        <span className="px-2 py-0.5 rounded bg-[#FFBF00]/10 text-[#FFBF00] text-[7px] font-black uppercase tracking-widest">Featured</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-black text-[#FFBF00] italic">{formatCurrency(ad.harga_estimasi || 0)}</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded-full bg-slate-200 overflow-hidden shadow-sm">
                                                <img src={ad.logo_url} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[80px]">{ad.nama_toko}</span>
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
