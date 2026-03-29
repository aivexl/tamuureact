"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
    MapPin, 
    Star,
    ChevronRight,
    Heart,
    Share2,
    MessageSquare,
    ShoppingBag,
    ShieldAlert
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Typography';

export default function ProductDetailPage() {
    const params = useParams();
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Mock data for initial refactor
    const product = {
        id: '1',
        nama_produk: "Paket Wedding Premium Gold",
        harga_estimasi: 25000000,
        deskripsi: "Paket pernikahan lengkap mencakup katering, dekorasi, dokumentasi, dan MUA profesional. Dirancang khusus untuk memberikan pengalaman mewah dan tak terlupakan di hari spesial Anda.",
        avg_rating: 4.9,
        review_count: 45,
        images: [{ image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200' }],
        vendor: {
            nama_toko: "Nusantara Wedding",
            kota: "Jakarta Selatan"
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <main className="pt-32 pb-40">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
                        {/* Left: Gallery */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative group">
                                <img 
                                    src={product.images[0].image_url} 
                                    alt={product.nama_produk}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-8 right-8 flex gap-3">
                                    <button className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-xl flex items-center justify-center text-[#0A1128] shadow-xl hover:bg-[#FFBF00] transition-all">
                                        <Share2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div className="lg:col-span-5 space-y-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                    <span>{product.vendor.nama_toko}</span>
                                    <ChevronRight className="w-3 h-3" />
                                    <span className="text-[#FFBF00]">Katalog</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-[#0A1128] uppercase italic tracking-tighter leading-tight">
                                    {product.nama_produk}
                                </h1>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-5 h-5 text-[#FFBF00] fill-[#FFBF00]" />
                                        <span className="text-lg font-black text-[#0A1128]">{product.avg_rating}</span>
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">({product.review_count} Reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                        <MapPin className="w-4 h-4 text-[#FFBF00]" />
                                        {product.vendor.kota}
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Estimasi Harga</p>
                                <p className="text-4xl font-black text-[#0A1128] tracking-tighter">
                                    Rp {product.harga_estimasi.toLocaleString()}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <Heading level={3} className="uppercase tracking-widest text-xs">Deskripsi Produk</Heading>
                                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                                    {product.deskripsi}
                                </p>
                            </div>

                            <div className="pt-10 flex gap-4 border-t border-slate-100">
                                <button 
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${isWishlisted ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-white border-slate-100 text-slate-300 hover:text-rose-500'}`}
                                >
                                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                                <button className="flex-1 h-16 bg-[#0A1128] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-indigo-100">
                                    <MessageSquare className="w-5 h-5 text-[#FFBF00]" /> Hubungi Vendor
                                </button>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    );
}
