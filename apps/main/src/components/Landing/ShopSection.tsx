"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Store, MapPin, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data for now, in a real scenario these would come from props or a fetch hook
const mockVendors = [
    { id: '1', store_name: 'Nusantara Wedding', logo_url: null, kota: 'Jakarta', rating: 4.9, review_count: 120, categories: ['Wedding Organizer'] },
    { id: '2', store_name: 'Griya MUA', logo_url: null, kota: 'Bandung', rating: 4.8, review_count: 85, categories: ['Makeup Artist'] },
    { id: '3', store_name: 'Capture Moment', logo_url: null, kota: 'Surabaya', rating: 5.0, review_count: 45, categories: ['Photography'] },
];

const mockProducts = [
    { id: '1', name: 'Paket Wedding Premium', price: 25000000, image_url: null, store_name: 'Nusantara Wedding', rating: 4.9 },
    { id: '2', name: 'Makeup Resepsi', price: 5000000, image_url: null, store_name: 'Griya MUA', rating: 4.8 },
    { id: '3', name: 'Pre-wedding Session', price: 3500000, image_url: null, store_name: 'Capture Moment', rating: 5.0 },
];

export const ShopSection = ({ initialProducts = [], initialSlides = [] }: { initialProducts?: any[], initialSlides?: any[] }) => {
    const router = useRouter();
    const vendorScrollRef = useRef<HTMLDivElement | null>(null);

    // Filter vendor unik dari produk jika data vendor tidak ada di API terpisah
    const vendors = initialProducts.reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.store_name === current.store_name);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []).slice(0, 6);

    return (
        <section id="shop" className="max-w-7xl mx-auto py-12">
            <div className="px-6 py-12">
                {/* VENDOR SECTION */}
                <div className="bg-[#FBFBFB] rounded-[48px] p-8 md:p-12 border border-slate-100 shadow-sm relative">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Tamuu Vendor.</h2>
                            <p className="text-slate-500 max-w-xl font-medium leading-relaxed">
                                Temukan ribuan vendor pilihan dari MUA, Fotografer, hingga Venue terbaik untuk menyempurnakan momen spesial Anda.
                            </p>
                        </div>

                        <Link
                            href="/shop"
                            className="group inline-flex items-center gap-2 px-6 py-3 bg-[#0A1128] text-white rounded-2xl font-bold hover:bg-[#152042] transition-all flex-shrink-0 z-20"
                        >
                            Lihat Semua
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="relative group">
                        <div 
                            ref={vendorScrollRef}
                            className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x"
                        >
                            {vendors.length > 0 ? vendors.map((vendor) => (
                                <div key={vendor.id} className="min-w-[280px] sm:min-w-[320px] snap-start bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden">
                                            {vendor.logo_url ? (
                                                <img src={vendor.logo_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <Store className="w-6 h-6 text-slate-300" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-[#0A1128] leading-tight uppercase tracking-tight">{vendor.store_name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vendor.kota || 'Nasional'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-[#FFBF00] fill-[#FFBF00]" />
                                            <span className="text-sm font-black text-[#0A1128]">{vendor.avg_rating || 5.0}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">({vendor.review_count || 0} reviews)</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="w-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada vendor terpilih</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
