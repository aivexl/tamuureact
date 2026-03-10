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
        }, 4000);
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

    // Calculations for the "Peeking" effect (1 full center, 2 partial sides)
    const itemWidthPercent = isMobile ? 85 : 65; 
    const itemWidthPx = containerWidth > 0 
        ? (containerWidth * itemWidthPercent) / 100 
        : (typeof window !== 'undefined' ? window.innerWidth * (itemWidthPercent / 100) : 1000);
    
    const centerOffsetPx = containerWidth > 0 
        ? (containerWidth - itemWidthPx) / 2 
        : (typeof window !== 'undefined' ? (window.innerWidth - itemWidthPx) / 2 : 0);

    const translateX = centerOffsetPx - (currentIndex * itemWidthPx);

    return (
        <div 
            ref={containerRef}
            className="relative w-full overflow-hidden group py-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div 
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ transform: `translateX(${translateX}px)` }}
            >
                {items.map((item, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                        <div 
                            key={`${item.id}-${idx}`} 
                            style={{ width: `${itemWidthPx}px` }}
                            className={`flex-shrink-0 px-2 sm:px-4 transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-50 scale-[0.92]'}`}
                        >
                            <div 
                                className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-slate-100 cursor-pointer shadow-2xl border border-slate-100/50"
                                onClick={() => item.link_url && (window.location.href = item.link_url)}
                            >
                                {/* No hover effect on image as requested, strictly pure view */}
                                <img src={item.image_url} alt="Carousel Banner" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Chevrons - Muncul saat hover */}
            {items.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10 shadow-xl hover:scale-105">
                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <button onClick={next} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10 shadow-xl hover:scale-105">
                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                </>
            )}

            {/* Dots - Berubah warna Navy (#0A1128) saat aktif */}
            {items.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2.5 z-10 py-1">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                            className={`h-2 md:h-2.5 rounded-full transition-all duration-500 shadow-sm ${i === currentIndex ? 'w-8 md:w-10 bg-[#0A1128]' : 'w-2 md:w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
