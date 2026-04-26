"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { shop } from '../lib/api';
import { usePathname } from 'next/navigation';

export const PromoPopup: React.FC = () => {
    const [popups, setPopups] = useState<any[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        // Only show once per session
        const hasShown = sessionStorage.getItem('tamuu_promo_shown');
        if (hasShown) return;

        const fetchPopups = async () => {
            try {
                // Determine placement based on path
                let placement = 'all';
                const path = pathname;
                
                if (path === '/') placement = 'homepage';
                else if (path.startsWith('/shop')) placement = 'shop';
                else if (path.startsWith('/admin')) placement = 'admin';
                else if (path.startsWith('/dashboard')) placement = 'dashboard';
                else if (path.startsWith('/v/')) placement = 'user';

                const data = await shop.getPopups(placement);
                if (data && data.length > 0) {
                    setPopups(data);
                    // Add a small delay for better impact
                    setTimeout(() => setIsVisible(true), 1500);
                }
            } catch (error) {
                console.error('Failed to fetch promo popups', error);
            }
        };

        fetchPopups();
    }, [pathname]);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('tamuu_promo_shown', 'true');
    };

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % popups.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + popups.length) % popups.length);
    };

    if (popups.length === 0) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Content Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg aspect-square md:aspect-[4/5] bg-transparent rounded-[2rem] overflow-hidden shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all border border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Slider Controls */}
                        {popups.length > 1 && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all border border-white/5"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all border border-white/5"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                
                                {/* Indicators */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                                    {popups.map((_, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`h-1 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-[#FFBF00]' : 'w-2 bg-white/30'}`} 
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Current Slide */}
                        <div className="w-full h-full relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="w-full h-full"
                                >
                                    {popups[currentIndex].link_url ? (
                                        <a 
                                            href={popups[currentIndex].link_url} 
                                            target={popups[currentIndex].link_url.startsWith('http') ? '_blank' : '_self'}
                                            rel="noopener noreferrer"
                                            className="block w-full h-full"
                                        >
                                            <img 
                                                src={popups[currentIndex].image_url} 
                                                alt="Promo" 
                                                className="w-full h-full object-cover rounded-[2rem]"
                                            />
                                        </a>
                                    ) : (
                                        <img 
                                            src={popups[currentIndex].image_url} 
                                            alt="Promo" 
                                            className="w-full h-full object-cover rounded-[2rem]"
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
