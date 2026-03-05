import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { AnimatedLayer } from '../Preview/AnimatedLayer';

interface UserKonvaPreviewProps {
    sectionId?: string;
    canvasType?: 'main' | 'orbit-left' | 'orbit-right';
}

/**
 * UserKonvaPreview
 * High-fidelity preview of a section or cinematic stage.
 * CTO ENTERPRISE LEVEL: Pure Math-Driven Liquid Rendering.
 * Decoupled from DOM height to prevent chaotic jumps during accordion transitions.
 */
export const UserKonvaPreview: React.FC<UserKonvaPreviewProps> = ({ sectionId, canvasType = 'main' }) => {
    const { sections, orbit } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const section = sectionId ? sections.find(s => s.id === sectionId) : null;
    const orbitCanvas = canvasType === 'orbit-left' ? orbit.left : (canvasType === 'orbit-right' ? orbit.right : null);

    // CTO ENTERPRISE PURE MATH CONSTANTS
    // Because the parent container strictly enforces aspect-[9/20.5] for 'main'
    // and aspect-[800/896] for 'orbit', the internal design space is a mathematical constant!
    const DESIGN_WIDTH = canvasType === 'main' ? 414 : 800;
    const DESIGN_HEIGHT = 896;
    
    // coverHeight = DESIGN_WIDTH * ASPECT_RATIO
    // Main Aspect: 20.5 / 9. Orbit Aspect: 896 / 800.
    const CONSTANT_COVER_HEIGHT = canvasType === 'main' ? (414 * 20.5 / 9) : 896; // 943 for main, 896 for orbit
    const CONSTANT_EXTRA_HEIGHT = Math.max(0, CONSTANT_COVER_HEIGHT - DESIGN_HEIGHT); // 47 for main, 0 for orbit

    // Only track scale for visual transform mapping. 
    // Layout math is now completely immune to DOM fluctuations!
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const width = rect.width;

                // Safety: Ignore 0 width during unmounted states
                if (width <= 0) return;

                // Scale is simply DOM Width / Design Width
                const newScale = width / DESIGN_WIDTH;

                if (newScale > 0) {
                    setScale(newScale);
                }
            }
        };

        updateScale();
        const resizeObserver = new ResizeObserver(updateScale);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [DESIGN_WIDTH]);

    if (!section && canvasType === 'main') {
        return (
            <div className="w-full h-full bg-slate-900/50 flex flex-col items-center justify-center p-8 text-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-slate-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initializing Engine...</p>
            </div>
        );
    }

    const elements = canvasType === 'main' ? (section?.elements || []) : (orbitCanvas?.elements || []);
    const backgroundColor = canvasType === 'main' ? (section?.backgroundColor || '#0a0a0a') : (orbitCanvas?.backgroundColor || 'transparent');
    const backgroundUrl = canvasType === 'main' ? section?.backgroundUrl : orbitCanvas?.backgroundUrl;

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full flex items-start justify-start overflow-hidden bg-[#0a0a0a]"
            style={{ transition: 'none' }} // Disable top-level transition to keep math pure
        >
            {/* The Scaled Render Viewport */}
            <div
                style={{
                    width: DESIGN_WIDTH,
                    // Use Math.ceil to prevent the "sisa ruang kosong" sub-pixel bleed issue
                    height: Math.ceil(CONSTANT_COVER_HEIGHT), 
                    backgroundColor: backgroundColor,
                    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left', // PURE SYNC
                    position: 'relative',
                    overflow: 'visible',
                    boxShadow: canvasType === 'main' ? 'none' : '0 20px 50px rgba(0,0,0,0.3)',
                    borderRadius: canvasType === 'main' ? 0 : '2rem',
                    flexShrink: 0
                }}
            >
                {/* Element Mapper - LIQUID STRETCHING ENGINE V3.4 */}
                {(elements || [])
                    .filter(el => el.isVisible !== false)
                    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map((element) => {
                        const elAny = element as any;
                        const elementHeight = element.height || elAny.size?.height || (elAny.textStyle?.fontSize) || 0;
                        const maxTop = DESIGN_HEIGHT - elementHeight;

                        let progress = maxTop > 0 ? element.y / maxTop : 0;
                        progress = Math.max(0, Math.min(1, progress));

                        // Pure deterministic math! 
                        const adjustedY = element.y + (CONSTANT_EXTRA_HEIGHT * progress);

                        return (
                            <AnimatedLayer
                                key={element.id}
                                layer={element}
                                adjustedY={adjustedY} // THE MAGIC PARITY FIX
                                isOpened={true}
                                isEditor={false}
                                forceTrigger={true}
                            />
                        );
                    })}

                {/* Section Overlay (if any) */}
                {section?.overlayOpacity ? (
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundColor: `rgba(0,0,0,${section.overlayOpacity / 100})` }}
                    />
                ) : null}
            </div>

            {/* Hint for developers (minimalist) */}
            <div className="absolute bottom-2 right-2 pointer-events-none opacity-20">
                <p className="text-[6px] font-black text-white uppercase tracking-[0.2em]">
                    TAMUU V3 PURE MATH ENGINE
                </p>
            </div>
        </div>
    );
};


