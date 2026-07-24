"use client";

import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { SearchX } from 'lucide-react';
import Link from 'next/link';

interface ProductGridProps {
    products: any[];
    title: string;
    fallbackProducts?: any[];
}

export const ProductGrid = ({ products, title, fallbackProducts = [] }: ProductGridProps) => {
    // [ENTERPRISE STANDARD] Initial 30 + Increment 10 Logic
    // Disesuaikan untuk memaksimalkan First Contentful Paint & User Retention
    const [visibleCount, setVisibleCount] = useState(30);

    const isEmpty = !products || products.length === 0;
    const displayProducts = isEmpty && fallbackProducts.length > 0 ? fallbackProducts : (products || []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-6 px-4">
                <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-[#0A1128]">{title}</h2>
            </div>

            {isEmpty && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 rounded-[2rem] border border-slate-100 mx-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                        <SearchX className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-[#0A1128] uppercase tracking-tight mb-3">Belum Ada Vendor Spesifik</h3>
                    <p className="text-sm text-slate-500 max-w-md font-medium">
                        Saat ini belum ada vendor yang pas, namun Anda bisa menjelajahi rekomendasi vendor premium kami lainnya di bawah ini.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 md:gap-8 px-4">
                {displayProducts.slice(0, visibleCount).map((p: any) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>

            {visibleCount < displayProducts.length && (
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
