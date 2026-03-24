import React from 'react';
import { m } from 'framer-motion';
import { MapPin, Tag, Heart } from 'lucide-react';
import { formatCurrency, formatAbbreviatedNumber } from '../../lib/utils';
import { StarRating } from './StarRating';

interface ProductCardProps {
    product: any;
    navigate: (path: string) => void;
    isSmall?: boolean;
    onAdClick?: (adId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate, isSmall = false, onAdClick }) => {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
                if (product.isAd && onAdClick) {
                    onAdClick(product.id);
                }
                
                if (product.url) {
                    if (product.url.startsWith('http')) {
                        window.open(product.url, '_blank');
                    } else {
                        navigate(product.url);
                    }
                } else {
                    const mSlug = product.vendor_slug === 'admin' ? 'umum' : (product.vendor_slug || (product.is_admin_listing ? 'umum' : 'unknown'));
                    const pSlug = product.slug || product.id;
                    navigate(`/shop/${mSlug}/${pSlug}`);
                }
            }}
            className={`group bg-white border border-[#F1F5F9] rounded-[1rem] md:rounded-[1.5rem] overflow-hidden flex flex-col hover:shadow-2xl hover:border-[#FFBF00]/30 transition-all duration-500 cursor-pointer flex-shrink-0 relative ${
                isSmall 
                ? 'w-[110px] md:w-[130px] h-[220px] md:h-[280px]' 
                : 'w-full md:w-[195px] h-[320px] md:h-[380px]'
            }`}
        >
            <div className={`relative overflow-hidden flex-shrink-0 ${isSmall ? 'h-[100px] md:h-[150px]' : 'h-[160px] md:h-[180px]'}`}>
                <img
                    src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                    alt={product.nama_produk}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {product.isAd && (
                    <div className={`${isSmall ? 'top-2 left-2 px-1.5 py-0.5 text-[7px]' : 'top-4 left-4 px-3 py-1 text-[10px]'} absolute bg-[#FFBF00] text-[#0A1128] font-black uppercase tracking-widest rounded-full z-10 shadow-md`}>
                        Promoted
                    </div>
                )}
            </div>
            <div className={`${isSmall ? 'p-2 md:p-3' : 'p-3 md:p-4'} flex flex-col flex-1 min-w-0`}>
                <h4 className={`${isSmall ? 'text-[8px] md:text-[10px] mb-1 line-clamp-2 min-h-[1.8rem] md:min-h-[2.4rem]' : 'text-[10px] md:text-xs mb-1 md:mb-2 line-clamp-3 min-h-[2.2rem] md:min-h-[2.8rem]'} font-black text-[#0A1128] uppercase group-hover:text-[#FFBF00] transition-colors leading-tight pb-1`}>
                    {product.nama_produk}
                </h4>
                
                <StarRating 
                    rating={product.avg_rating || 0} 
                    count={product.review_count || 0} 
                    size={isSmall ? 8 : 10} 
                    className="mb-1.5"
                />
                
                <div className={`${isSmall ? 'space-y-1' : 'space-y-1.5 md:space-y-3'} mt-auto`}>
                    <div className={`${isSmall ? 'pt-1' : 'pt-1.5 md:pt-3'} border-t border-slate-50`}>
                        {product.wishlist_count > 0 && (
                            <div className="flex items-center gap-0.5 text-rose-500 mb-0.5">
                                <Heart className={`${isSmall ? 'w-1.5 h-1.5' : 'w-2 md:w-2.5 h-2 md:h-2.5'} fill-current`} />
                                <span className={`${isSmall ? 'text-[7px]' : 'text-[8px] md:text-[9px]'} font-black`}>{formatAbbreviatedNumber(product.wishlist_count)}</span>
                            </div>
                        )}

                        <p className={`${isSmall ? 'text-[9px] md:text-xs' : 'text-[11px] md:text-sm'} font-black text-[#0A1128] truncate`}>
                            {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) 
                                ? formatCurrency(product.harga_estimasi) 
                                : (product.harga_estimasi || 'Tanya Harga')}
                        </p>
                        
                        <p className={`${isSmall ? 'text-[6px] md:text-[7px]' : 'text-[7px] md:text-[8px]'} font-black text-[#FFBF00] uppercase tracking-widest mt-0.5 truncate`}>
                            {product.isAd ? 'Sponsored' : (product.is_admin_listing ? (product.custom_store_name || 'Admin') : product.nama_toko)}
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
        </m.div>
    );
};
