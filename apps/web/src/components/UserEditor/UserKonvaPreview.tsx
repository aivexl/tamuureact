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
 * CTO ENTERPRISE LEVEL: Pure DOM-based high-performance rendering for previews.
 */
export const UserKonvaPreview: React.FC<UserKonvaPreviewProps> = ({ sectionId, canvasType = 'main' }) => {
    const { sections, orbit } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState(896);

    const section = sectionId ? sections.find(s => s.id === sectionId) : null;
    const orbitCanvas = canvasType === 'orbit-left' ? orbit.left : (canvasType === 'orbit-right' ? orbit.right : null);

    // CTO ENTERPRISE DIMENSIONS
    const DESIGN_WIDTH = canvasType === 'main' ? 414 : 800;
    const DESIGN_HEIGHT = 896;

    // CTO FIX: Multi-canvas Scaling Engine with Liquid Parity
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                if (width < 1 || height < 1) return;

                // FIX: Reject intermediate heights during AnimatePresence animation.
                // Parent uses aspect-[9/20.5] (ratio ≈ 2.28). During height:0→auto
                // animation, height/width drops far below 2.0. Accepting these small
                // heights causes negative extraHeight → elements crushed to top.
                // Skip until animation is near completion (ratio ≈ stable).
                if (canvasType === 'main' && height < width * 2) return;

                const scaleW = width / DESIGN_WIDTH;
                const scaleH = height / DESIGN_HEIGHT;

                // For main, we follow width (Liquid). For orbit, we fit.
                const newScale = canvasType === 'main' ? scaleW : Math.min(scaleW, scaleH);

                setScale(newScale);
                setContainerHeight(height);
            }
        };

        updateScale();
        const resizeObserver = new ResizeObserver(updateScale);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [canvasType, DESIGN_WIDTH, DESIGN_HEIGHT]);

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

    // LIQUID MATH: Calculate viewport expansion (Design Units)
    const coverHeight = containerHeight / (scale || 1);
    const extraHeight = coverHeight - DESIGN_HEIGHT;

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full flex items-start justify-start overflow-hidden bg-[#0a0a0a] transition-all duration-1000"
        >
            {/* The Scaled Render Viewport */}
            <div
                style={{
                    width: DESIGN_WIDTH,
                    height: coverHeight, // DESIGN UNITS VP HEIGHT
                    backgroundColor: backgroundColor,
                    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left', // PURE SYNC
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
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
                        // PORTED FROM PreviewView.tsx (LIVE ENGINE)
                        // Robust height detection for interpolation
                        const elAny = element as any;
                        const elementHeight = element.height || elAny.size?.height || (elAny.textStyle?.fontSize) || 0;
                        const maxTop = DESIGN_HEIGHT - elementHeight;

                        // Progress determines if the element is near the top (0) or bottom (1)
                        let progress = maxTop > 0 ? element.y / maxTop : 0;
                        progress = Math.max(0, Math.min(1, progress));

                        // Apply linear interpolation (LIQUID STRETCH)
                        const adjustedY = element.y + (extraHeight * progress);

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
                    TAMUU V3 ENGINE
                </p>
            </div>
        </div>
    );
};

