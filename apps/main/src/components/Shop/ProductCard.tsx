import React from 'react';
import { MapPin, Heart } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
    product: any;
    isSmall?: boolean;
}

export const ProductCard = ({ product, isSmall = false }: ProductCardProps) => {
    const mSlug = product.vendor_slug === 'admin' ? 'umum' : (product.vendor_slug || (product.is_admin_listing ? 'umum' : 'unknown'));
    const pSlug = product.slug || product.id;
    const href = `/shop/${mSlug}/${pSlug}`;

    // LOCK DIMENSIONS - Mencegah Browser melakukan un-painting saat scroll
    const containerStyle = isSmall 
        ? { width: '130px', minHeight: '310px' } 
        : { width: '100%', minHeight: '380px' };
    
    const imgHeight = isSmall ? 150 : 180;
    const imgWidth = isSmall ? 130 : 200;

    return (
        <Link href={href} prefetch={false} className="block">
            <div 
                style={containerStyle}
                className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden flex flex-col hover:border-amber-200 transition-colors duration-200"
            >
                {/* IMAGE HUB - Fixed Hard Dimensions */}
                <div style={{ height: `${imgHeight}px` }} className="relative overflow-hidden bg-slate-50 shrink-0">
                    <img
                        src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'}
                        alt={product.nama_produk}
                        width={imgWidth}
                        height={imgHeight}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        style={{ contentVisibility: 'auto' }}
                    />
                    {product.isAd && (
                        <div className="absolute top-2 left-2 bg-[#FFBF00] text-[#0A1128] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                            AD
                        </div>
                    )}
                </div>

                {/* CONTENT HUB */}
                <div className="p-3 flex flex-col flex-1 min-w-0">
                    <h4 className="text-[10px] md:text-xs font-black text-[#0A1128] uppercase leading-tight line-clamp-2 mb-1">
                        {product.nama_produk}
                    </h4>
                    
                    <div className="flex items-center gap-1 mb-1">
                        <span className="text-[#FFBF00] font-black text-[8px]">★</span>
                        <span className="text-[8px] font-black text-[#0A1128]">{product.avg_rating || 0}</span>
                    </div>
                    
                    <div className="mt-auto border-t border-slate-50 pt-2">
                        <p className="text-xs md:text-sm font-black text-[#0A1128] tracking-tighter">
                            {product.harga_estimasi ? `Rp ${product.harga_estimasi.toLocaleString()}` : 'Tanya Harga'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-2 h-2 text-slate-300" />
                            <span className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{product.kota || 'Nasional'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
