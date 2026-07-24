"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion as m } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface CityHeroProps {
    cityName: string;
    localFact?: string;
}

export default function CityHero({ cityName, localFact }: CityHeroProps) {
    const router = useRouter();

    return (
        <section className="relative pt-[140px] md:pt-40 pb-20 overflow-hidden hero-section" style={{ backgroundColor: '#0A1128' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full animate-soft-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-soft-float animation-delay-4000" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left relative z-10 w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium backdrop-blur-md mb-4">
                            <MapPin className="w-4 h-4 text-[#FFBF00]" />
                            Undangan Digital {cityName}
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
                            Jasa Undangan Digital <span className="text-[#FFBF00]">Terbaik</span> di {cityName}
                        </h1>

                        <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                            {localFact || `Platform pembuatan undangan digital premium #1 untuk warga ${cityName}. Desain eksklusif, fitur RSVP tercanggih, dan integrasi peta lokasi.`}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                            <button
                                onClick={() => router.push('/signup')}
                                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl hover:bg-slate-50 hover:scale-105 transition-all duration-300 w-full sm:w-auto justify-center"
                            >
                                Buat Undangan Sekarang
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                            </button>
                            <Link
                                href="/katalog"
                                className="px-8 py-4 bg-white/10 text-white border border-white/20 font-bold rounded-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto text-center"
                            >
                                Lihat Katalog
                            </Link>
                        </div>
                    </div>

                    <div className="relative flex justify-center lg:justify-end items-center">
                        <div className="relative w-full max-w-[500px] aspect-square">
                            {/* Visual representation - can be an image or illustration */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 rounded-3xl rotate-3 animate-pulse" />
                            <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/20 to-rose-500/20 rounded-3xl -rotate-3 blur-2xl" />
                            <div className="relative h-full w-full rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl flex items-center justify-center p-8">
                                <div className="text-center space-y-6">
                                    <div className="w-20 h-20 bg-[#FFBF00] rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-[#FFBF00]/20">
                                        <MapPin className="w-10 h-10 text-slate-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-white">Local Coverage</h3>
                                        <p className="text-white/60">Melayani ribuan pasangan di {cityName} dan sekitarnya.</p>
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-[#FFBF00]/40" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
