import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MultiCarouselProps {
    items: { id: string; image_url: string; link_url?: string }[];
}

export const MultiCarousel: React.FC<MultiCarouselProps> = ({ items }) => {
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

    // True Peeking Film-Strip Architecture:
    // Center item is 75% width (desktop) or 85% width (mobile).
    // The rest is precisely calculated to bleed off the edges of the device screen.
    const itemWidthPercent = isMobile ? 85 : 75; 
    const itemWidthPx = containerWidth > 0 
        ? (containerWidth * itemWidthPercent) / 100 
        : (typeof window !== 'undefined' ? window.innerWidth * (itemWidthPercent / 100) : 1000);
    
    const gapPx = isMobile ? 12 : 24; 
    const slideDistance = itemWidthPx + gapPx;

    const baseOffset = containerWidth > 0 ? (containerWidth - itemWidthPx) / 2 : 0;
    const translateX = baseOffset - (currentIndex * slideDistance);

    return (
        <div 
            ref={containerRef}
            // Full bleed 100vw breaks out of any max-w container
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
                                // Cinematic ratio
                                className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-slate-100 cursor-pointer shadow-2xl border border-slate-100/10"
                                onClick={() => item.link_url && (window.location.href = item.link_url)}
                            >
                                {/* Static image, no zoom effects to maintain silent elegance */}
                                <img src={item.image_url} alt={`Carousel ${idx}`} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Chevrons - Muncul saat hover */}
            {items.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10 shadow-2xl hover:scale-105">
                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <button onClick={next} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10 shadow-2xl hover:scale-105">
                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                </>
            )}

            {/* Dots - Berubah warna Navy (#0A1128) saat aktif */}
            {items.length > 1 && (
                <div className="absolute bottom-2 md:bottom-4 left-0 right-0 flex justify-center gap-2 md:gap-3 z-10">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                            className={`h-2 md:h-2.5 rounded-full transition-all duration-500 shadow-sm ${i === currentIndex ? 'w-8 md:w-12 bg-[#0A1128]' : 'w-2 md:w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
