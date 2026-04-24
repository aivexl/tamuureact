"use client";

import React, { useState } from 'react';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
    products: any[];
    title: string;
}

export const ProductGrid = ({ products, title }: ProductGridProps) => {
    // Logic asli dari legacy commit 313ce3e
    const [visibleCount, setVisibleCount] = useState(10);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-6 px-4">
                <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-[#0A1128]">{title}</h2>
            </div>

            <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 md:gap-8 px-4">
                {products.slice(0, visibleCount).map((p: any) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>

            {visibleCount < products.length && (
                <div className="flex justify-center pt-12">
                    <button
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="px-10 py-4 bg-[#0A1128] text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-indigo-100"
                    >
                        Tampilkan Lebih Banyak
                    </button>
                </div>
            )}
        </div>
    );
};

