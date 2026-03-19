import React from 'react';
import { m } from 'framer-motion';
import { MapPin, Tag, Heart } from 'lucide-react';
import { formatCurrency, formatAbbreviatedNumber } from '../../lib/utils';
import { StarRating } from './StarRating';

interface ProductCardProps {
    product: any;
    navigate: (path: string) => void;
    isSmall?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate, isSmall = false }) => {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
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
            className={`group bg-white border border-[#F1F5F9] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col hover:shadow-2xl hover:border-[#FFBF00]/30 transition-all duration-500 cursor-pointer flex-shrink-0 relative ${
                isSmall 
                ? 'w-[160px] md:w-[195px] h-[300px] md:h-[380px]' 
                : 'w-full md:w-[195px] h-[320px] md:h-[380px]'
            }`}
        >
            <div className={`relative overflow-hidden flex-shrink-0 ${isSmall ? 'h-[140px] md:h-[180px]' : 'h-[160px] md:h-[180px]'}`}>
                <img
                    src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                    alt={product.nama_produk}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {product.isAd && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#FFBF00] text-[#0A1128] text-[10px] font-black uppercase tracking-widest rounded-full z-10 shadow-md">
                        Promoted
                    </div>
                )}
            </div>
            <div className="p-3 md:p-4 flex flex-col flex-1 min-w-0">
                <h4 className="text-[10px] md:text-xs font-black text-[#0A1128] mb-1 md:mb-2 line-clamp-3 uppercase group-hover:text-[#FFBF00] transition-colors leading-tight min-h-[2.2rem] md:min-h-[2.8rem] pb-1">
                    {product.nama_produk}
                </h4>
                
                <StarRating 
                    rating={product.avg_rating || 0} 
                    count={product.review_count || 0} 
                    size={10} 
                    className="mb-2"
                />
                
                <div className="mt-auto space-y-1.5 md:space-y-3">
                    <div className="pt-1.5 md:pt-3 border-t border-slate-50">
                        {/* Wishlist positioned ABOVE price */}
                        {product.wishlist_count > 0 && (
                            <div className="flex items-center gap-0.5 text-rose-500 mb-1">
                                <Heart className="w-2 md:w-2.5 h-2 md:h-2.5 fill-current" />
                                <span className="text-[8px] md:text-[9px] font-black">{formatAbbreviatedNumber(product.wishlist_count)}</span>
                            </div>
                        )}

                        <p className="text-[11px] md:text-sm font-black text-[#0A1128] truncate">
                            {product.harga_estimasi && !isNaN(Number(product.harga_estimasi)) 
                                ? formatCurrency(product.harga_estimasi) 
                                : (product.harga_estimasi || 'Tanya Harga')}
                        </p>
                        
                        <p className="text-[7px] md:text-[8px] font-black text-[#FFBF00] uppercase tracking-widest mt-0.5 md:mt-1 truncate">
                            {product.isAd ? 'Sponsored' : (product.is_admin_listing ? (product.custom_store_name || 'Admin') : product.nama_toko)}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-[6px] md:text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">
                            <MapPin className="w-1.5 md:w-2 h-1.5 md:h-2 text-[#FFBF00]" />
                            {product.kota?.replace(/^(kota|kab\.)\s+/gi, '') || 'Nasional'}
                        </span>
                        <span className="flex items-center gap-1 text-[6px] md:text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">
                            <Tag className="w-1.5 md:w-2 h-1.5 md:h-2" />
                            {product.kategori_produk || 'Umum'}
                        </span>
                    </div>
                </div>
            </div>
        </m.div>
    );
};
