import React from 'react';
import { Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { shop } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useTrackAdClick } from '../../hooks/queries/useShop';
import { Card } from '../ui/shadcn/Card';
import { Ad } from '../../constants/types';

export const PromotedAdsBar = React.memo(() => {
    const { data: adsRes, isLoading } = useQuery<{ ads: Ad[] }>({
        queryKey: ['active_promoted_ads'],
        queryFn: () => shop.getAds('PROMOTED_PRODUCT')
    });

    const trackClick = useTrackAdClick();
    const ads = adsRes?.ads || [];

    if (isLoading || ads.length === 0) return null;

    const handleAdClick = (adId: string) => {
        trackClick.mutate(adId);
    };

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFBF00]/10 flex items-center justify-center shadow-sm">
                        <Zap className="w-5 h-5 text-[#FFBF00] fill-[#FFBF00]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic text-[#0A1128]">Tamuu <span className="text-[#FFBF00]">Promoted</span></h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sponsored Selection</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                {ads.map((ad) => (
                    <div key={ad.id}>
                        <Card
                            className="group relative bg-white rounded-[2rem] border-2 border-slate-100 hover:border-[#FFBF00] transition-all p-3 shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
                        >
                            <Link 
                                to={ad.product_slug ? `/shop/${ad.vendor_slug}/${ad.product_slug}` : `/shop/${ad.vendor_slug}`}
                                onClick={() => handleAdClick(ad.id)}
                                className="block space-y-3"
                            >
                                <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-slate-100 relative">
                                    <img 
                                        src={ad.image_url || '/placeholder-product.png'} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        alt={ad.title} 
                                    />
                                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/90 backdrop-blur shadow-sm text-[8px] font-black uppercase tracking-widest text-[#FFBF00] flex items-center gap-1">
                                        <Zap className="w-2.5 h-2.5 fill-current" />
                                        Promoted
                                    </div>
                                </div>
                                <div className="px-1 space-y-1">
                                    <h3 className="text-[11px] font-black text-[#0A1128] truncate leading-tight group-hover:text-[#FFBF00] transition-colors">{ad.nama_produk || ad.title}</h3>
                                    <p className="text-[10px] font-black text-[#FFBF00] italic">{formatCurrency(ad.harga_estimasi || 0)}</p>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <div className="w-4 h-4 rounded-full bg-slate-100 overflow-hidden">
                                            {ad.logo_url && <img src={ad.logo_url} className="w-full h-full object-cover" alt="Logo" />}
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase truncate">{ad.nama_toko}</span>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    </div>
                ))}
            </div>
        </section>
    );
});
