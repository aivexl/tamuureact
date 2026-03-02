import React, { useEffect, useState } from 'react';
import { motion as m, animate } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    image?: string;
}

const CountingNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 2.5,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayValue(Math.floor(latest))
        });
        return () => controls.stop();
    }, [value]);

    return <span>{displayValue.toLocaleString()}</span>;
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
    image = "/images/hero-bride.webp"
}) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A1128] flex overflow-hidden">
            <Helmet>
                <link rel="preload" as="image" href={image} fetchPriority="high" />
            </Helmet>
            {/* Left Pane: Immersive Visual (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[60%] relative items-center justify-center overflow-hidden">
                {/* Dynamic Multi-layered Overlay for Maximum Legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1128]/95 via-[#0A1128]/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/80 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(0,0,0,0.4),transparent_70%)] z-10" />

                <m.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={image}
                    alt="Tamuu Premium Authentication"
                    className="absolute inset-0 w-full h-full object-cover object-center grayscale-[15%] contrast-[105%]"
                />

                {/* Floating Brand Content */}
                <div className="relative z-20 text-white p-16 max-w-2xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex flex-col items-center text-center"
                    >
                        <a href="https://tamuu.id" className="inline-block mb-12 group">
                            <img src="/images/logo-tamuu-vfinal-v1.webp" alt="Tamuu Logo" className="h-16 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                        </a>

                        <h1 className="text-6xl font-black leading-[0.9] mb-8 tracking-tighter">
                            Tingkatkan <br />
                            <span className="text-premium-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Momen Spesial</span> <br />
                            Anda.
                        </h1>
                        <p className="text-xl text-white/80 font-semibold leading-relaxed max-w-md drop-shadow-md mx-auto">
                            Bergabunglah dengan ribuan pasangan yang telah menciptakan undangan digital paling eksklusif di dunia.
                        </p>
                    </m.div>
                </div>

                {/* Glassmorphism Counting Card - Professional Redesign */}
                <div className="absolute bottom-16 left-16 z-20">
                    <m.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="backdrop-blur-2xl bg-white/5 border border-white/10 p-8 rounded-[2rem] flex flex-col gap-4 shadow-2xl overflow-hidden relative group"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex flex-col gap-2 mt-4">
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                                Bergabunglah Bersama
                            </p>
                            <span className="text-6xl font-black tracking-tighter text-white flex items-center gap-1 drop-shadow-lg">
                                <CountingNumber value={10000} />
                                <span className="text-premium-accent">+</span>
                            </span>
                            <span className="text-sm font-black uppercase tracking-[0.4em] text-teal-400">
                                Pengguna
                            </span>
                        </div>
                    </m.div>
                </div>
            </div>

            {/* Right Pane: Action Area */}
            <div className="w-full lg:w-[40%] bg-[#0A1128] relative flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-8 lg:py-12">
                {/* Premium Back Button */}
                <div className="absolute top-8 right-6 lg:left-20 lg:right-auto z-30">
                    <m.button
                        whileHover={{ x: -4, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:text-premium-accent transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-widest">Kembali</span>
                    </m.button>
                </div>

                {/* Mobile Header (Only visible on small screens) */}
                <div className="lg:hidden absolute top-8 left-6">
                    <a href="https://tamuu.id" className="flex items-center gap-3">
                        <img src="/images/logo-tamuu-vfinal-v1.webp" alt="Tamuu Logo" className="h-8 w-auto object-contain drop-shadow-md" />
                    </a>
                </div>

                <m.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-sm mx-auto"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">{title}</h2>
                        <p className="text-white/50 text-base font-medium leading-relaxed">{subtitle}</p>
                    </div>

                    <div className="space-y-6">
                        {children}
                    </div>

                    <div className="mt-12 text-center text-xs text-white/20 font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} Tamuu Platform &bull; Made with Love
                    </div>
                </m.div>
            </div>
        </div>
    );
};
