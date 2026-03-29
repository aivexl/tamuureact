"use client";

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
    MapPin, 
    ShoppingBag, 
    Star,
    ChevronRight
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Typography';
import { ProductCard } from '@/components/Shop/ProductCard';

export default function StorefrontPage() {
    const params = useParams();
    const vendorSlug = params.vendor as string;

    // Mock data for initial refactor, will be replaced with Server Fetching in production
    const vendor = {
        nama_toko: "Nusantara Wedding",
        deskripsi: "Vendor pernikahan terbaik dengan layanan profesional dan hasil yang memuaskan untuk hari spesial Anda.",
        kota: "Jakarta",
        avg_rating: 4.9,
        review_count: 120,
        logo_url: null,
        banner_url: null
    };

    const products = [
        { id: '1', nama_produk: 'Paket Wedding Premium', harga_estimasi: 25000000, avg_rating: 4.9, review_count: 45, kota: 'Jakarta' },
        { id: '2', nama_produk: 'Dekorasi Pelaminan Adat', harga_estimasi: 15000000, avg_rating: 4.8, review_count: 32, kota: 'Jakarta' },
    ];

    return (
        <div className="min-h-screen bg-white">
            <main className="pt-32 pb-40">
                {/* Banner */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
                    <div className="h-48 md:h-80 bg-[#0A1128] rounded-[2.5rem] overflow-hidden shadow-sm">
                        {/* Banner Image Placeholder */}
                    </div>
                </div>

                {/* Profile Hub */}
                <Container className="-mt-20 md:-mt-24 relative z-10">
                    <div className="flex flex-col items-center md:items-start gap-8">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] border-[8px] border-white shadow-2xl bg-slate-50 overflow-hidden">
                            {/* Logo Placeholder */}
                        </div>

                        <div className="space-y-4 text-center md:text-left">
                            <h1 className="text-3xl md:text-6xl font-black text-[#0A1128] uppercase italic tracking-tighter leading-none">
                                {vendor.nama_toko}
                            </h1>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                <div className="flex items-center gap-1.5">
                                    <Star className="w-5 h-5 text-[#FFBF00] fill-[#FFBF00]" />
                                    <span className="text-lg font-black text-[#0A1128]">{vendor.avg_rating}</span>
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">({vendor.review_count} Reviews)</span>
                                </div>
                                <div className="w-px h-4 bg-slate-200 hidden md:block" />
                                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <MapPin className="w-4 h-4 text-[#FFBF00]" />
                                    {vendor.kota}
                                </div>
                                <div className="w-px h-4 bg-slate-200 hidden md:block" />
                                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <ShoppingBag className="w-4 h-4 text-[#FFBF00]" />
                                    {products.length} Katalog
                                </div>
                            </div>

                            <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-3xl pt-2">
                                {vendor.deskripsi}
                            </p>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="mt-32 space-y-12">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-[#0A1128]">Katalog Produk</h2>
                            <div className="flex gap-4">
                                {/* Sort Dropdown placeholder */}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
                            {products.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    );
}
