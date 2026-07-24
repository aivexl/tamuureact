import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, Search } from 'lucide-react';
import { cities } from '@/lib/api';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

export const metadata: Metadata = {
    title: 'Lokasi Layanan Undangan Digital Seluruh Indonesia - Tamuu',
    description: 'Temukan jasa undangan digital premium di kota Anda. Kami melayani pembuatan undangan pernikahan digital di 500+ kota/kabupaten seluruh Indonesia.',
};

export default async function CitiesDirectoryPage() {
    const activeCities = await cities.list();

    return (
        <div className="bg-[#0A1128] min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <header className="text-center mb-20 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#FFBF00] text-sm font-bold backdrop-blur-md">
                        <MapPin className="w-4 h-4" />
                        Directory Lokasi
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                        Layanan Kami di <span className="text-[#FFBF00]">Seluruh Indonesia</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        Pilih kota Anda untuk mendapatkan penawaran undangan digital premium dengan fitur terlengkap dan desain eksklusif.
                    </p>
                </header>

                <Suspense fallback={<PremiumLoader />}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {activeCities.map((city: any) => (
                            <Link
                                key={city.city_name}
                                href={`/undangan-digital/${city.city_name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-[#FFBF00] hover:border-[#FFBF00] transition-all duration-300"
                            >
                                <div className="space-y-2">
                                    <h3 className="font-bold text-white group-hover:text-slate-900 transition-colors">
                                        {city.city_name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#FFBF00] group-hover:text-slate-800 transition-colors">
                                        Eksplor <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Suspense>

                <section className="mt-32 p-12 rounded-[40px] bg-gradient-to-br from-indigo-600 to-blue-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                                Tidak Menemukan Kota Anda?
                            </h2>
                            <p className="text-white/80 text-lg">
                                Jangan khawatir, layanan kami berbasis digital dan dapat diakses dari mana saja, bahkan dari luar negeri.
                            </p>
                        </div>
                        <div className="flex justify-start lg:justify-end">
                            <Link
                                href="/signup"
                                className="px-10 py-5 bg-white text-slate-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                Buat Sekarang
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
