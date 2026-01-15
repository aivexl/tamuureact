import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ElementRenderer } from '../Canvas/ElementRenderer';

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

    const section = sectionId ? sections.find(s => s.id === sectionId) : null;
    const orbitCanvas = canvasType === 'orbit-left' ? orbit.left : (canvasType === 'orbit-right' ? orbit.right : null);

    // CTO ENTERPRISE DIMENSIONS (Matches engine standard)
    const DESIGN_WIDTH = canvasType === 'main' ? 414 : 800;
    const DESIGN_HEIGHT = 896;

    // CTO FIX: Multi-canvas Scaling Engine
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();

                // Calculate scale to fit width while maintaining aspect ratio
                const scaleW = width / DESIGN_WIDTH;
                const scaleH = height / DESIGN_HEIGHT;

                // For main, we usually scale to width. 
                // For orbit wings, we scale to fit whichever is tighter to ensure NO CUTOFF.
                const newScale = canvasType === 'main' ? scaleW : Math.min(scaleW, scaleH);

                setScale(newScale);
            }
        };

        updateScale();
        const resizeObserver = new ResizeObserver(updateScale);
        if (containerRef.current) resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, [canvasType, DESIGN_WIDTH, DESIGN_HEIGHT]);

    if (!section && canvasType === 'main') return null;

    const elements = canvasType === 'main' ? (section?.elements || []) : (orbitCanvas?.elements || []);
    const backgroundColor = canvasType === 'main' ? (section?.backgroundColor || '#0a0a0a') : (orbitCanvas?.backgroundColor || 'transparent');
    const backgroundUrl = canvasType === 'main' ? section?.backgroundUrl : orbitCanvas?.backgroundUrl;

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full flex justify-center overflow-visible bg-transparent transition-all duration-1000 ${canvasType === 'main' ? 'items-start' : 'items-center'
                }`}
        >
            {/* The Scaled Render Viewport */}
            <div
                style={{
                    width: DESIGN_WIDTH,
                    height: DESIGN_HEIGHT,
                    backgroundColor: backgroundColor,
                    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `scale(${scale})`,
                    transformOrigin: canvasType === 'main' ? 'top center' : 'center center', // Top-anchored for invitation
                    position: 'relative',
                    overflow: 'hidden', // Clip elements at canvas boundary
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: canvasType === 'main' ? 'none' : '0 20px 50px rgba(0,0,0,0.3)',
                    borderRadius: canvasType === 'main' ? 0 : '2rem',
                    flexShrink: 0
                }}
            >
                {/* Element Mapper */}
                {elements
                    .filter(el => el.isVisible !== false)
                    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map((element) => (
                        <div
                            key={element.id}
                            style={{
                                position: 'absolute',
                                left: element.x,
                                top: element.y,
                                width: element.width,
                                height: element.height,
                                transform: `rotate(${element.rotation || 0}deg) scale(${element.scale || 1})`,
                                opacity: element.opacity ?? 1,
                                zIndex: element.zIndex,
                                pointerEvents: 'none' // Previews are non-interactive
                            }}
                        >
                            <ElementRenderer layer={element} isEditor={false} />
                        </div>
                    ))}

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
