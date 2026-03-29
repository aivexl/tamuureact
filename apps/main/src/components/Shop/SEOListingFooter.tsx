"use client";

import React from 'react';
import Link from 'next/link';
import { MapPin, Tag } from 'lucide-react';

const MAJOR_CITIES = [
    'Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 
    'Palembang', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Cirebon', 
    'Yogyakarta', 'Solo', 'Malang', 'Denpasar'
];

const TOP_CATEGORIES = [
    { label: 'Wedding Organizer', slug: 'wedding-organizer' },
    { label: 'MUA', slug: 'mua' },
    { label: 'Fotografer', slug: 'fotografi' },
    { label: 'Catering', slug: 'catering' }
];

export const SEOListingFooter = () => {
    return (
        <section className="mt-32 pt-20 border-t border-slate-100 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Wilayah Populer */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <MapPin className="w-4 h-4 text-[#FFBF00]" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1128]">Vendor Per Wilayah</h4>
                    </div>
                    <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                        {MAJOR_CITIES.map(city => (
                            <li key={city}>
                                <Link 
                                    href={`/location/${city.toLowerCase()}`}
                                    prefetch={false}
                                    className="text-[9px] font-bold text-slate-400 hover:text-[#0A1128] transition-colors uppercase tracking-tight"
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
                                    href={`/c/${cat.slug}`}
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
                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1128] mb-6">Pencarian Populer</h4>
                        <div className="flex flex-wrap gap-2">
                            {['Murah', 'Promo', 'Terbaik', 'Estetik'].map(intent => (
                                MAJOR_CITIES.slice(0, 5).map(city => (
                                    <Link 
                                        key={`${intent}-${city}`}
                                        href={`/c/wedding-organizer/${city.toLowerCase()}/${intent.toLowerCase()}`}
                                        prefetch={false}
                                        className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[8px] font-black text-slate-400 hover:text-[#0A1128] hover:border-[#FFBF00] transition-all uppercase tracking-widest"
                                    >
                                        WO {city} {intent}
                                    </Link>
                                ))
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
