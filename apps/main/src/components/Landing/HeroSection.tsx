"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@tamuu/shared';
import { WordRoller } from './WordRoller';

export const HeroSection = () => {
    const router = useRouter();
    const { isAuthenticated } = useStore();

    return (
        <section className="relative pt-[140px] md:pt-40 pb-0 overflow-hidden hero-section" style={{ backgroundColor: '#0A1128' }}>
            {/* Decorative Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full animate-soft-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-soft-float animation-delay-4000" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/20 blur-[100px] rounded-full animate-soft-float animation-delay-8000" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative">
                <div className="grid lg:grid-cols-2 gap-16 sm:gap-20 lg:gap-8 items-center lg:items-end min-h-[500px] lg:h-[600px]">
                    {/* Left Column: Content */}
                    <div className="text-center lg:text-left pb-12 sm:pb-20 lg:pb-60 relative z-10 w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-black text-white flex flex-col items-center lg:items-start gap-2 md:gap-4 w-full tracking-tight leading-[1.05]">
                            <span className="break-words max-w-full">Platform Undangan Digital Premium</span>
                            <WordRoller />
                        </h1>

                        <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed tracking-wide font-sans animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
                            Ciptakan kesan pertama yang tak terlupakan dengan desain eksklusif, fitur tercanggih, dan kualitas premium.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-in fade-in slide-in-from-bottom-16 duration-700 delay-500">
                            <button
                                onClick={() => {
                                    if (isAuthenticated) {
                                        router.push('/onboarding');
                                    } else {
                                        router.push('/signup');
                                    }
                                }}
                                className="group relative inline-flex items-center gap-3 px-7 py-4 sm:px-10 sm:py-5 bg-white text-slate-900 font-black rounded-2xl shadow-2xl shadow-indigo-950/20 hover:bg-slate-50 hover:scale-105 transition-all duration-300 w-full sm:w-auto justify-center"
                            >
                                Mulai Sekarang
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                            </button>
                            <Link
                                href="/invitations"
                                className="px-7 py-4 sm:px-10 sm:py-5 bg-white/10 text-white border border-white/20 font-bold rounded-2xl shadow-sm hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto text-center"
                            >
                                Lihat Undangan
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Visual (Bride) */}
                    <div className="relative flex justify-center lg:justify-end items-end order-2 mt-0 lg:mt-0 mx-auto lg:mx-0">
                        <div className="absolute bottom-0 right-0 w-[120%] h-[120%] bg-rose-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
                        <div className="relative w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[420px] xl:max-w-[450px] flex items-end">
                            <Image
                                src="/images/hero-bride.webp"
                                alt="Mempelai Premium Tamuu"
                                width={450}
                                height={660}
                                className="w-full h-auto object-contain object-bottom"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
