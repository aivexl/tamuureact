"use client";

import React from 'react';
import { MapPin, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    product: any;
    isSmall?: boolean;
    onAdClick?: (adId: string) => void;
}

export const ProductCard = ({ product, isSmall = false, onAdClick }: ProductCardProps) => {
    const router = useRouter();

    const handleProductClick = () => {
        if (product.isAd && onAdClick && product.id) {
            onAdClick(product.id);
        }
        
        if (product.url) {
            if (product.url.startsWith('http')) {
                window.open(product.url, '_blank');
            } else {
                router.push(product.url);
            }
        } else {
            const mSlug = product.vendor_slug === 'admin' ? 'umum' : (product.vendor_slug || (product.is_admin_listing ? 'umum' : 'unknown'));
            const pSlug = product.slug || product.id;
            router.push(`/shop/${mSlug}/${pSlug}`);
        }
    };

    return (
        <div
            onClick={handleProductClick}
            className={`group bg-white border border-slate-100 rounded-[1rem] md:rounded-[1.5rem] overflow-hidden flex flex-col hover:border-slate-200 cursor-pointer flex-shrink-0 relative ${
                isSmall 
                ? 'w-[110px] md:w-[130px] h-[240px] md:h-[310px]' 
                : 'w-full md:w-[195px] h-[320px] md:h-[380px]'
            }`}
        >
            <div className={`relative overflow-hidden flex-shrink-0 bg-slate-50 ${isSmall ? 'h-[100px] md:h-[150px]' : 'h-[160px] md:h-[180px]'}`}>
                <img
                    src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                    alt={product.nama_produk}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                {product.isAd && (
                    <div className={`${isSmall ? 'top-2 left-2 px-1.5 py-0.5 text-[7px]' : 'top-4 left-4 px-3 py-1 text-[10px]'} absolute bg-[#FFBF00] text-[#0A1128] font-black uppercase tracking-widest rounded-full z-10 shadow-sm`}>
                        Promoted
                    </div>
                )}
            </div>
            <div className={`${isSmall ? 'p-2 md:p-3' : 'p-3 md:p-4'} flex flex-col flex-1 min-w-0 overflow-hidden`}>
                <h4 className={`${isSmall ? 'text-[8px] md:text-[10px] mb-1 line-clamp-2 min-h-[1.8rem] md:min-h-[2.4rem]' : 'text-[10px] md:text-xs mb-1 md:mb-2 line-clamp-3 min-h-[2.2rem] md:min-h-[2.8rem]'} font-black text-[#0A1128] uppercase leading-tight pb-1`}>
                    {product.nama_produk}
                </h4>
                
                <div className="flex items-center gap-1 mb-1">
                    <span className="text-[#FFBF00] font-black text-[8px]">★</span>
                    <span className="text-[8px] font-black text-[#0A1128]">{product.avg_rating || 0}</span>
                </div>
                
                <div className={`${isSmall ? 'space-y-1' : 'space-y-1.5 md:space-y-3'} mt-auto`}>
                    <div className={`${isSmall ? 'pt-1' : 'pt-1.5 md:pt-3'} border-t border-slate-50`}>
                        <div className={`${isSmall ? 'h-3' : 'h-4'} flex items-center mb-0.5`}>
                            {(product.wishlist_count ?? 0) > 0 && (
                                <div className="flex items-center gap-0.5 text-rose-500">
                                    <Heart className={`${isSmall ? 'w-1.5 h-1.5' : 'w-2 md:w-2.5 h-2 md:h-2.5'} fill-current`} />
                                    <span className={`${isSmall ? 'text-[7px]' : 'text-[8px] md:text-[9px]'} font-black`}>{product.wishlist_count}</span>
                                </div>
                            )}
                        </div>
                        <p className={`${isSmall ? 'text-[10px]' : 'text-xs md:text-sm'} font-black text-[#0A1128] tracking-tighter`}>
                            {product.harga_estimasi ? `Rp ${product.harga_estimasi.toLocaleString()}` : 'Tanya Harga'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="w-2 h-2 text-slate-300" />
                        <span className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{product.kota || 'Nasional'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
