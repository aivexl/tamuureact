"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

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

    const carouselItems = items && items.length > 0 ? items : [{ id: 'dummy-1', image_url: '/images/logo-tamuu-vfinal-v1.webp', link_url: '#' }];
    const maxIndex = carouselItems.length - 1;

    useEffect(() => {
        if (isPaused || carouselItems.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused, carouselItems.length, maxIndex]);

    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

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
                {carouselItems.map((item, idx) => {
                    // Use logo if image is unsplash or missing
                    const displayImage = (!item.image_url || item.image_url.includes('unsplash.com')) 
                        ? '/images/logo-tamuu-vfinal-v1.webp' 
                        : item.image_url;

                    return (
                        <div 
                            key={`${item.id}-${idx}`} 
                            style={{ width: `${itemWidthPx}px` }}
                            className="flex-shrink-0 opacity-100 transition-all duration-1000"
                        >
                            <div 
                                className="w-full aspect-[21/9] lg:aspect-[24/7] xl:aspect-[28/8] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white cursor-pointer border border-slate-200 relative"
                                onClick={() => item.link_url && (window.location.href = item.link_url)}
                            >
                                <Image 
                                    src={displayImage} 
                                    alt={`Banner ${idx}`} 
                                    fill
                                    priority={idx === 0}
                                    sizes="100vw"
                                    className={`transition-all duration-700 ${displayImage.includes('logo') ? 'object-contain p-12 md:p-24 opacity-20 bg-slate-50' : 'object-cover'}`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {carouselItems.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10">
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button onClick={next} className="absolute right-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10">
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </>
            )}

            {carouselItems.length > 1 && (
                <div className="absolute bottom-1 md:bottom-2 left-0 right-0 flex justify-center gap-2 z-10">
                    {carouselItems.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                            className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-6 md:w-8 bg-[#0A1128]' : 'w-1.5 md:w-2 bg-slate-300'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
