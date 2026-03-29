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
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const maxIndex = items.length - 1;

    // Auto-slide logic
    useEffect(() => {
        if (isPaused || items.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused, items.length, maxIndex]);

    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    if (!items || items.length === 0) return null;

    const itemWidthPercent = isMobile ? 85 : 75; 
    const itemWidthPx = containerWidth > 0 
        ? (containerWidth * itemWidthPercent) / 100 
        : 1000;
    
    const gapPx = isMobile ? 12 : 24; 
    const slideDistance = itemWidthPx + gapPx;

    const baseOffset = containerWidth > 0 ? (containerWidth - itemWidthPx) / 2 : 0;
    const translateX = baseOffset - (currentIndex * slideDistance);

    return (
        <div 
            ref={containerRef}
            className="relative w-[100vw] ml-[calc(50%-50vw)] overflow-hidden group py-6 md:py-10"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div 
                className="flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ transform: `translateX(${translateX}px)`, gap: `${gapPx}px` }}
            >
                {items.map((item, idx) => {
                    return (
                        <div 
                            key={`${item.id}-${idx}`} 
                            style={{ width: `${itemWidthPx}px` }}
                            className="flex-shrink-0 opacity-100 transition-all duration-1000"
                        >
                            <div 
                                className="w-full aspect-[21/9] lg:aspect-[24/7] xl:aspect-[28/8] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-slate-100 cursor-pointer border border-slate-200"
                                onClick={() => item.link_url && (window.location.href = item.link_url)}
                            >
                                <img 
                                    src={item.image_url} 
                                    className="w-full h-full object-cover" 
                                    alt={`Banner ${idx}`} 
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-4 md:px-10">
                <button 
                    onClick={prev}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200 shadow-xl flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] transition-all pointer-events-auto opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0 duration-500"
                >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button 
                    onClick={next}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200 shadow-xl flex items-center justify-center text-[#0A1128] hover:bg-[#FFBF00] transition-all pointer-events-auto opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 duration-500"
                >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>

            {/* Pagination Indicators */}
            <div className="flex justify-center gap-2 mt-6 md:mt-8">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-8 bg-[#0A1128]' : 'w-2 bg-slate-200'}`}
                    />
                ))}
            </div>
        </div>
    );
};
