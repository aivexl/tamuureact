"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Tag, ChevronDown } from 'lucide-react';
import { INDONESIA_REGIONS } from '@/constants/regions';

const MAJOR_CITIES = [
    'Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar',
    'Palembang', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Cirebon',
    'Yogyakarta', 'Solo', 'Malang', 'Denpasar'
];

// SEO Core: Ambil 500+ Kota di Indonesia dan bersihkan prefix "Kab./Kota"
const ALL_INDONESIA_CITIES = Array.from(new Set(
    INDONESIA_REGIONS.map(region => region.replace(/^(Kab\.|Kota)\s+/i, ''))
)).sort();

const TOP_CATEGORIES = [
    { label: 'Wedding Organizer', slug: 'wedding-organizer' },
    { label: 'MUA', slug: 'mua' },
    { label: 'Fotografer', slug: 'fotografer' },
    { label: 'Catering', slug: 'catering' },
    { label: 'Gedung', slug: 'gedung' },
    { label: 'Sewa Baju Adat', slug: 'sewa-baju-pengantin' },
    { label: 'Dekorasi', slug: 'dekorasi' },
    { label: 'Seserahan', slug: 'seserahan' },
    { label: 'Sound Sistem', slug: 'sound-sistem' }
];

export const SEOListingFooter = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="mt-32 pt-20 border-t border-slate-100 pb-20">
            <div className="w-full">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A1128]">
                        Jelajahi Kategori & Wilayah Populer
                    </h3>
                    <ChevronDown
                        className={`w-5 h-5 text-[#0A1128] transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
                    />
                </button>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen mt-8' : 'max-h-0'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {/* Undangan Digital per Wilayah (pSEO) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-6">
                                <MapPin className="w-4 h-4 text-[#FFBF00]" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1128]">Undangan Digital Populer</h4>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-y-3 gap-x-4">
                                    {MAJOR_CITIES.slice(0, 20).map((city) => (
                                        <Link
                                            key={city}
                                            href={`/undangan-digital/${city.toLowerCase().replace(/\s+/g, '-')}`}
                                            prefetch={false}
                                            className="text-[9px] font-bold text-slate-400 hover:text-[#0A1128] transition-colors uppercase tracking-tight block truncate"
                                            title={`Undangan Digital ${city}`}
                                        >
                                            {city}
                                        </Link>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <Link href="/undangan-digital" className="text-[9px] font-black text-[#FFBF00] hover:text-[#0A1128] transition-colors uppercase tracking-widest">
                                        Lihat Semua Wilayah →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Wilayah Jangkauan Vendor */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1128]">Vendor Seluruh Indonesia</h4>
                            </div>

                            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                                {ALL_INDONESIA_CITIES.map(city => (
                                    <li key={city}>
                                        <Link
                                            href={`/katalog/wedding-organizer/${city.toLowerCase().replace(/\s+/g, '-')}`}
                                            prefetch={false}
                                            className="text-[9px] font-bold text-slate-400 hover:text-[#0A1128] transition-colors uppercase tracking-tight block truncate"
                                            title={`Vendor ${city}`}
                                        >
                                            Vendor {city}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Kategori Populer */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Tag className="w-4 h-4 text-[#FFBF00]" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1128]">Kategori Terpopuler</h4>
                            </div>
                            <ul className="space-y-3">
                                {TOP_CATEGORIES.map(cat => (
                                    <li key={cat.slug}>
                                        <Link
                                            href={`/katalog/${cat.slug}/jakarta`}
                                            prefetch={false}
                                            className="text-[9px] font-bold text-slate-400 hover:text-[#0A1128] transition-colors uppercase tracking-tight"
                                        >
                                            {cat.label} Terbaik
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quick Permutations (Intent Based) */}
                        <div className="lg:col-span-2">
                             <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 h-full">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1128] mb-6">Pencarian Populer</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['Murah', 'Promo', 'Terbaik', 'Estetik'].map(intent => (
                                        MAJOR_CITIES.slice(0, 5).map(city => {
                                            const intentMap: Record<string, string> = {
                                                'Murah': 'CHEAP',
                                                'Promo': 'PROMO',
                                                'Terbaik': 'BEST',
                                                'Estetik': 'ESTETIK'
                                            };
                                            const intentKey = intentMap[intent] || 'BEST';
                                            return (
                                                <Link
                                                    key={`${intent}-${city}`}
                                                    href={`/katalog/wedding-organizer/${city.toLowerCase().replace(/\s+/g, '-')}?intent=${intentKey}`}
                                                    prefetch={false}
                                                    className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[8px] font-black text-slate-400 hover:text-[#0A1128] hover:border-[#FFBF00] transition-all uppercase tracking-widest"
                                                >
                                                    WO {city} {intent}
                                                </Link>
                                            );
                                        })
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
