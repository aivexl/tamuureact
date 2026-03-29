"use client";

import React from 'react';
import { ProductCard } from './ProductCard';

export const SpecialAdsScroller = () => {
    // Mock data for now
    const items = [
        { id: 'ad1', nama_produk: 'Special Wedding Deal', harga_estimasi: 10000000, isAd: true, avg_rating: 5.0, kota: 'Jakarta' },
        { id: 'ad2', nama_produk: 'Premium MUA Package', harga_estimasi: 5000000, isAd: true, avg_rating: 4.9, kota: 'Bandung' },
    ];

    return (
        <section className="mb-20">
            <div className="bg-[#0A1128] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight italic">Spesial Untuk Kamu</h2>
                </div>

                <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 relative z-10 snap-x">
                    {items.map((item) => (
                        <div key={item.id} className="snap-start flex-shrink-0">
                            <ProductCard product={item} isSmall={true} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
