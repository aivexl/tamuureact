"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MultiCarouselProps {
    items: { id: string; image_url: string; link_url?: string }[];
}

export const MultiCarousel = ({ items }: MultiCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        setContainerWidth(containerRef.current.offsetWidth);
    }, []);

    const maxIndex = items.length - 1;

    useEffect(() => {
        if (isPaused || items.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused, items.length, maxIndex]);

    if (!items || items.length === 0) return null;

    const itemWidthPercent = isMobile ? 85 : 75; 
    const itemWidthPx = containerWidth > 0 ? (containerWidth * itemWidthPercent) / 100 : 1000;
    const gapPx = isMobile ? 12 : 24; 
    const slideDistance = itemWidthPx + gapPx;
    const baseOffset = containerWidth > 0 ? (containerWidth - itemWidthPx) / 2 : 0;
    const translateX = baseOffset - (currentIndex * slideDistance);

    return (
        <div 
            ref={containerRef}
            className="relative w-full overflow-hidden group py-6 md:py-10 min-h-[250px] md:min-h-[400px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(${translateX}px)`, gap: `${gapPx}px` }}
            >
                {items.map((item, idx) => (
                    <div 
                        key={`${item.id}-${idx}`} 
                        style={{ width: `${itemWidthPx}px` }}
                        className="flex-shrink-0"
                    >
                        <div 
                            className="w-full aspect-[21/9] lg:aspect-[24/7] xl:aspect-[28/8] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 cursor-pointer"
                            onClick={() => item.link_url && (window.location.href = item.link_url)}
                        >
                            <img 
                                src={item.image_url} 
                                alt={`Banner ${idx}`}
                                className="w-full h-full object-cover"
                                // First image is eager for LCP, others lazy
                                loading={idx === 0 ? "eager" : "lazy"}
                                decoding="async"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-4 md:px-10">
                <button 
                    onClick={() => setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1)}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border border-slate-200 shadow-xl flex items-center justify-center text-[#0A1128] pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button 
                    onClick={() => setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1)}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border border-slate-200 shadow-xl flex items-center justify-center text-[#0A1128] pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
        </div>
    );
};
