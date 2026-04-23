"use client";

import React from 'react';
import { MapPin, Tag, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency, formatAbbreviatedNumber } from '@tamuu/shared';
import { StarRating } from './StarRating';

interface ProductCardProps {
    product: any;
    isSmall?: boolean;
    onAdClick?: (adId: string) => void;
    priority?: boolean;
}

export const ProductCard = ({ product, isSmall = false, onAdClick, priority = false }: ProductCardProps) => {
    const router = useRouter();

    const handleProductClick = () => {
        if (product.isAd && onAdClick) {
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

    // IMAGE LOGIC (Strict Fix): 
    // 1. If it's Unsplash -> Force Logo Fallback
    // 2. If it's missing -> Force Logo Fallback
    // 3. Else (Manual Upload) -> Use Original URL
    const rawUrl = product.images?.[0]?.image_url;
    const isUnsplash = rawUrl?.includes('unsplash.com');
    
    const imageUrl = (isUnsplash || !rawUrl) 
        ? '/images/logo-tamuu-vfinal-v1.webp' 
        : rawUrl;

    return (
        <div
            onClick={handleProductClick}
            className={`group bg-white border border-[#F1F5F9] rounded-[1rem] md:rounded-[1.5rem] overflow-hidden flex flex-col hover:border-[#FFBF00]/30 transition-all duration-500 cursor-pointer flex-shrink-0 relative ${
                isSmall 
                ? 'w-[110px] md:w-[130px] h-[240px] md:h-[310px]' 
                : 'w-full md:w-[195px] h-[320px] md:h-[380px]'
            }`}
        >
            <div className={`relative overflow-hidden flex-shrink-0 bg-slate-50 ${isSmall ? 'h-[100px] md:h-[150px]' : 'h-[160px] md:h-[180px]'}`}>
                <Image
                    src={imageUrl}
                    alt={product.nama_produk || 'Produk Tamuu'}
                    fill
                    sizes={isSmall ? "130px" : "200px"}
                    priority={priority}
                    className={`transition-transform duration-700 ${imageUrl.includes('logo') ? 'object-contain p-4 md:p-8 opacity-30' : 'object-cover group-hover:scale-105'}`}
                />
                
                {product.isAd && (
                    <div className={`${isSmall ? 'top-2 left-2 px-1.5 py-0.5 text-[7px]' : 'top-4 left-4 px-3 py-1 text-[10px]'} absolute bg-[#FFBF00] text-[#0A1128] font-black uppercase tracking-widest rounded-full z-10 shadow-md`}>
                        Promoted
                    </div>
                )}
            </div>
            
            <div className={`${isSmall ? 'p-2 md:p-3' : 'p-3 md:p-4'} flex flex-col flex-1 min-w-0 overflow-hidden bg-white`}>
                <h4 className={`${isSmall ? 'text-[8px] md:text-[10px] mb-1 line-clamp-2 min-h-[1.8rem] md:min-h-[2.4rem]' : 'text-[10px] md:text-xs mb-1 md:mb-2 line-clamp-3 min-h-[2.2rem] md:min-h-[2.8rem]'} font-black text-[#0A1128] uppercase group-hover:text-[#FFBF00] transition-colors leading-tight pb-1`}>
                    {product.nama_produk}
                </h4>
                
                <StarRating 
                    rating={product.avg_rating || 0} 
                    count={product.review_count || 0} 
                    size={isSmall ? 8 : 10} 
                    className={isSmall ? 'mb-1' : 'mb-1.5'}
                />
                
                <div className={`${isSmall ? 'space-y-1' : 'space-y-1.5 md:space-y-3'} mt-auto`}>
                    <div className={`${isSmall ? 'pt-1' : 'pt-1.5 md:pt-3'} border-t border-slate-50`}>
                        <div className={`${isSmall ? 'h-3' : 'h-4'} flex items-center mb-0.5`}>
                            {product.wishlist_count > 0 ? (
                                <div className="flex items-center gap-0.5 text-rose-500">
                                    <Heart className={`${isSmall ? 'w-1.5 h-1.5' : 'w-2 md:w-2.5 h-2 md:h-2.5'} fill-current`} />
                                    <span className={`${isSmall ? 'text-[7px]' : 'text-[8px] md:text-[9px]'} font-black`}>{formatAbbreviatedNumber(product.wishlist_count)}</span>
                                </div>
                            ) : null}
                        </div>

                        <p className={`${isSmall ? 'text-[9px] md:text-xs' : 'text-[11px] md:text-sm'} font-black text-[#0A1128] truncate`}>
                            {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) && Number(product.harga_estimasi) !== 0
                                ? formatCurrency(product.harga_estimasi) 
                                : 'Hubungi Vendor'}
                        </p>
                        
                        <p className={`${isSmall ? 'text-[6px] md:text-[7px]' : 'text-[7px] md:text-[8px]'} font-black text-[#FFBF00] uppercase tracking-widest mt-0.5 truncate`}>
                            {product.isAd ? 'Sponsored' : (product.nama_toko || product.custom_store_name || '')}
                        </p>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <span className={`${isSmall ? 'text-[5px] md:text-[6px]' : 'text-[6px] md:text-[7px]'} flex items-center gap-1 font-black text-slate-400 uppercase tracking-widest truncate`}>
                            <MapPin className={`${isSmall ? 'w-1.5 h-1.5' : 'w-1.5 md:w-2 h-1.5 md:h-2'} text-[#FFBF00]`} />
                            {product.kota?.replace(/^(kota|kab\.)\s+/gi, '') || 'Nasional'}
                        </span>
                        <span className={`${isSmall ? 'text-[5px] md:text-[6px]' : 'text-[6px] md:text-[7px]'} flex items-center gap-1 font-black text-slate-400 uppercase tracking-widest truncate`}>
                            <Tag className={`${isSmall ? 'w-1.5 h-1.5' : 'w-1.5 md:w-2 h-1.5 md:h-2'}`} />
                            {product.kategori_produk || 'Umum'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
