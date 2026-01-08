import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { useStore } from '../store/useStore';

// Lazy load non-critical sections to improve TBT and FCP
// Eagerly load the first section below the fold to improve Speed Index
import FeaturesSection from '../components/Landing/FeaturesSection';

// Lazy load non-critical sections further down
const PricingSection = lazy(() => import('../components/Landing/PricingSection'));
const TestimonialsSection = lazy(() => import('../components/Landing/TestimonialsSection'));
const CTASection = lazy(() => import('../components/Landing/CTASection'));

const SectionLoader = () => (
    <div className="py-20 flex justify-center items-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#FFBF00] rounded-full animate-spin"></div>
    </div>
);

// ============================================
// WORD ROLLER COMPONENT (Eagerly Loaded for Hero)
// ============================================
const eventTypes = ["Pernikahan", "Ulang Tahun", "Sunatan", "Syukuran", "Aqiqah", "Tunangan", "Pertunangan"];
const ITEM_HEIGHT_EM = 1.7;

const WordRoller: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const displayList = [...eventTypes, eventTypes[0]];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                if (prev < eventTypes.length) {
                    return prev + 1;
                }
                return prev;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentIndex === eventTypes.length) {
            const timeout = setTimeout(() => {
                setTransitionEnabled(false);
                setCurrentIndex(0);

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        setTransitionEnabled(true);
                    }, 50);
                });
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex]);

    return (
        <div className="flex items-center justify-center lg:justify-start overflow-visible" style={{ height: `${ITEM_HEIGHT_EM}em` }}>
            <span className="relative overflow-hidden inline-flex flex-col items-center lg:items-start min-w-[200px] sm:min-w-[400px]" style={{ height: `${ITEM_HEIGHT_EM}em` }}>
                <span
                    className={`flex flex-col w-full whitespace-nowrap ${transitionEnabled ? 'transition-transform duration-700 ease-in-out' : ''}`}
                    style={{ transform: `translateY(-${currentIndex * ITEM_HEIGHT_EM}em)` }}
                >
                    {displayList.map((event, i) => (
                        <span
                            key={i}
                            className="flex items-center justify-center lg:justify-start text-[#FFBF00]"
                            style={{ height: `${ITEM_HEIGHT_EM}em` }}
                        >
                            {event}
                        </span>
                    ))}
                </span>
            </span>
        </div>
    );
};

// ============================================
// MAIN LANDING PAGE COMPONENT
// ============================================
export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useStore();

    useEffect(() => {
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500); // Wait for lazy sections to potentially load
        }
    }, []);
    useSEO({
        title: 'Platform Undangan Digital Premium & Eksklusif',
        description: 'Tingkatkan momen spesial Anda dengan undangan digital premium dari Tamuu. Desain eksklusif, fitur RSVP modern, dan kemudahan bagi para pasangan pengantin.'
    });

    return (
        <div className="bg-white text-gray-900 overflow-visible font-sans">

            {/* Hero Section - Dark Navy Background */}
            <section className="relative pt-24 pb-0 sm:pt-32 overflow-hidden hero-section" style={{ backgroundColor: '#0A1128' }}>
                {/* Decorative Glows - Legacy animate-soft-float restored */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full animate-soft-float" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-soft-float animation-delay-4000" />
                    <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/20 blur-[100px] rounded-full animate-soft-float animation-delay-8000" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center lg:items-end min-h-[500px] lg:h-[600px]">
                        {/* Left Column: Content - Legacy positioning and entry animations */}
                        <div className="text-center lg:text-left pb-32 sm:pb-40 lg:pb-60 relative z-10 w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-black text-white flex flex-col items-center lg:items-start gap-2 md:gap-4 w-full tracking-tight leading-[1.05]">
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
                                            navigate('/onboarding');
                                        } else {
                                            navigate('/login?redirect=/onboarding');
                                        }
                                    }}
                                    className="group relative inline-flex items-center gap-3 px-7 py-4 sm:px-10 sm:py-5 bg-white text-slate-900 font-black rounded-2xl shadow-2xl shadow-indigo-950/20 hover:bg-slate-50 hover:scale-105 transition-all duration-300 w-full sm:w-auto justify-center"
                                >
                                    Mulai Sekarang
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                                </button>
                                <Link
                                    to="/invitations"
                                    className="px-7 py-4 sm:px-10 sm:py-5 bg-white/10 text-white border border-white/20 font-bold rounded-2xl shadow-sm hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto text-center"
                                >
                                    Lihat Undangan
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Visual (Bride) */}
                        <div className="relative flex justify-center lg:justify-end items-end order-2 mt-8 lg:mt-0">
                            {/* Backing Glow */}
                            <div className="absolute bottom-0 right-0 w-[120%] h-[120%] bg-rose-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />

                            {/* Bride Image */}
                            <div className="relative w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[420px] xl:max-w-[450px] flex items-end">
                                <img
                                    src="/images/hero-bride.webp"
                                    alt="Mempelai Premium Tamuu"
                                    width={450}
                                    height={660}
                                    className="w-full h-auto object-contain object-bottom"
                                    fetchPriority="high"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Suspense wrapped lazy sections */}
            <FeaturesSection />

            <Suspense fallback={<SectionLoader />}>
                <PricingSection />
                <TestimonialsSection />
                <CTASection />
            </Suspense>

        </div>
    );
};
