import React from 'react';
import { ProductCard } from './ProductCard';

export const SpecialAdsScroller = ({ ads = [] }: { ads?: any[] }) => {
    // Statis - tidak ada interaksi JS di sini untuk kestabilan rendering
    const items = ads.length > 0 ? ads : [
        { id: 'ad1', nama_produk: 'Promo Unggulan', harga_estimasi: 10000000, isAd: true, avg_rating: 5.0, kota: 'Jakarta' },
        { id: 'ad2', nama_produk: 'Paket Spesial', harga_estimasi: 5000000, isAd: true, avg_rating: 4.9, kota: 'Bandung' },
    ];

    return (
        <section className="mb-20">
            <div className="bg-[#0A1128] rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight italic">Spesial Untuk Kamu</h2>
                </div>

                <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x">
                    {items.map((item) => (
                        <div key={item.id} className="snap-start shrink-0">
                            <ProductCard product={item} isSmall={true} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
