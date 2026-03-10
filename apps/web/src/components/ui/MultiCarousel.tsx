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

    // Peeking effect: Center image is 80% width on Desktop, 90% on Mobile.
    // This makes the rectangle large enough while allowing the sides to peek (10% or 5% each side).
    const itemWidthPercent = isMobile ? 90 : 80; 
    const itemWidthPx = containerWidth > 0 
        ? (containerWidth * itemWidthPercent) / 100 
        : (typeof window !== 'undefined' ? window.innerWidth * (itemWidthPercent / 100) : 1200);
    
    const centerOffsetPx = containerWidth > 0 
        ? (containerWidth - itemWidthPx) / 2 
        : (typeof window !== 'undefined' ? (window.innerWidth - itemWidthPx) / 2 : 0);

    const translateX = centerOffsetPx - (currentIndex * itemWidthPx);

    return (
        <div 
            ref={containerRef}
            // Murni mengikuti lebar parent (pastikan dipanggil di luar div max-w)
            className="relative w-full overflow-hidden group py-4 md:py-8"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div 
                className="flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ transform: `translateX(${translateX}px)` }}
            >
                {items.map((item, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                        <div 
                            key={`${item.id}-${idx}`} 
                            style={{ width: `${itemWidthPx}px` }}
                            className={`flex-shrink-0 px-2 sm:px-4 transition-all duration-1000 ${isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.92]'}`}
                        >
                            <div 
                                // Aspect ratio 16:9 Desktop (Cinematic Lebar) & 4:3 Mobile
                                className="w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-slate-100 cursor-pointer shadow-2xl border border-slate-100/50"
                                onClick={() => item.link_url && (window.location.href = item.link_url)}
                            >
                                <img src={item.image_url} alt="Carousel Banner" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Chevrons - Muncul saat hover */}
            {items.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10 shadow-2xl hover:scale-105">
                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <button onClick={next} className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10 shadow-2xl hover:scale-105">
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
