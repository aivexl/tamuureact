import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MultiCarouselProps {
    items: { id: string; image_url: string; link_url?: string }[];
}

export const MultiCarousel: React.FC<MultiCarouselProps> = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    // Determine items per slide based on window width
    const [itemsPerSlide, setItemsPerSlide] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerSlide(window.innerWidth < 768 ? 1 : 3);
        };
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, items.length - itemsPerSlide);

    useEffect(() => {
        if (isPaused || items.length <= itemsPerSlide) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 4000);
        return () => clearInterval(timer);
    }, [isPaused, items.length, maxIndex, itemsPerSlide]);

    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    if (!items || items.length === 0) return null;

    return (
        <div 
            className="relative w-full overflow-hidden group py-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (100 / itemsPerSlide)}%)` }}
            >
                {items.map((item, idx) => (
                    <div 
                        key={`${item.id}-${idx}`} 
                        className={`w-full md:w-1/3 flex-shrink-0 px-2`}
                    >
                        <div 
                            className="w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-slate-100 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                            onClick={() => item.link_url && (window.location.href = item.link_url)}
                        >
                            {/* No zoom/scale effect as requested, strictly static image on hover */}
                            <img src={item.image_url} alt="Carousel" className="w-full h-full object-cover" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Chevrons */}
            {items.length > itemsPerSlide && (
                <>
                    <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-slate-200 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10 shadow-lg hover:scale-105">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-slate-200 flex items-center justify-center text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10 shadow-lg hover:scale-105">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* Dots */}
            {items.length > itemsPerSlide && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                    {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${i === currentIndex ? 'w-6 bg-[#0A1128]' : 'w-2 bg-white/80 hover:bg-white'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
