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
        const queryParams = new URLSearchParams(window.location.search);
        const isDebug = queryParams.get('debug_popup') === 'true';
        
        // Removed sessionStorage check - now shows on every refresh

        const fetchPopups = async () => {
            try {
                const path = pathname;
                const isAdminPath = path.startsWith('/admin');
                
                // CRITICAL: Exclude Invitation & Preview Pages (Ads not allowed here)
                const isInvitation = path.startsWith('/v/') || path.startsWith('/preview/') || (path.split('/').length <= 3 && path !== '/' && !['/shop', '/blog', '/admin', '/dashboard', '/profile', '/billing', '/onboarding', '/upgrade', '/guests', '/wishes', '/editor', '/vendor', '/terms', '/privacy', '/about'].some(p => path.startsWith(p)));
                
                if (isInvitation && !isDebug) return;

                // Determine placement based on path
                let placement = 'all';
                if (path === '/') placement = 'homepage';
                else if (path.startsWith('/shop')) placement = 'shop';
                else if (isAdminPath) placement = 'admin';
                else if (path.startsWith('/dashboard')) placement = 'dashboard';
                else if (path.startsWith('/v/')) placement = 'user';

                let data = await shop.getPopups(placement);
                
                // Client-side Filter: If we are in ADMIN, and the popup is marked 'all', 
                // exclude it unless specifically marked 'admin'.
                if (isAdminPath) {
                    data = data.filter((p: any) => p.placements.includes('admin'));
                }

                if (data && data.length > 0) {
                    setPopups(data);
                    setTimeout(() => setIsVisible(true), 500);
                }
            } catch (error) {
                console.error('Failed to fetch promo popups', error);
            }
        };

        fetchPopups();
    }, [pathname]);

    const handleClose = () => {
        setIsVisible(false);
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
                                    {(() => {
                                        const rawUrl = popups[currentIndex].image_url;
                                        const isUnsplash = rawUrl?.includes('unsplash.com');
                                        const imageUrl = (isUnsplash || !rawUrl || rawUrl === 'https://tamuu.id/tamuu-logo.png' || rawUrl === 'https://api.tamuu.id/assets/tamuu-logo-header.png') 
                                            ? '/images/logo-tamuu-vfinal-v1.webp' 
                                            : rawUrl;
                                        const isLogo = imageUrl.includes('logo');

                                        const imgElement = (
                                            <div className={`w-full h-full ${isLogo ? 'bg-slate-900 flex items-center justify-center p-12 md:p-20' : ''}`}>
                                                <img 
                                                    src={imageUrl} 
                                                    alt="Promo" 
                                                    className={`w-full h-full rounded-[2rem] ${isLogo ? 'object-contain opacity-20 grayscale brightness-200' : 'object-cover'}`}
                                                />
                                            </div>
                                        );

                                        if (popups[currentIndex].link_url) {
                                            return (
                                                <a 
                                                    href={popups[currentIndex].link_url} 
                                                    target={popups[currentIndex].link_url.startsWith('http') ? '_blank' : '_self'}
                                                    rel="noopener noreferrer"
                                                    className="block w-full h-full"
                                                >
                                                    {imgElement}
                                                </a>
                                            );
                                        }
                                        return imgElement;
                                    })()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
