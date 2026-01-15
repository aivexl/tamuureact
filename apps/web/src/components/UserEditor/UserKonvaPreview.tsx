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

    const CANVAS_WIDTH = 414;
    const SECTION_HEIGHT = 896;

    // CTO FIX: Dynamic scaling based on container width
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                setScale(width / CANVAS_WIDTH);
            }
        };

        updateScale();
        const resizeObserver = new ResizeObserver(updateScale);
        if (containerRef.current) resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    if (!section && canvasType === 'main') return null;

    const elements = canvasType === 'main' ? (section?.elements || []) : (orbitCanvas?.elements || []);
    const backgroundColor = canvasType === 'main' ? (section?.backgroundColor || '#0a0a0a') : (orbitCanvas?.backgroundColor || 'transparent');
    const backgroundUrl = canvasType === 'main' ? section?.backgroundUrl : orbitCanvas?.backgroundUrl;

    return (
        <div ref={containerRef} className={`relative w-full h-full flex items-start justify-center overflow-visible ${canvasType === 'main' ? 'bg-slate-950' : 'bg-transparent'}`}>
            {/* The scaled viewport */}
            <div
                style={{
                    width: canvasType === 'main' ? CANVAS_WIDTH : '100%',
                    height: canvasType === 'main' ? SECTION_HEIGHT : '100%',
                    backgroundColor: backgroundColor,
                    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: canvasType === 'main' ? `scale(${scale})` : 'none',
                    transformOrigin: 'top center', // Changed to center to allow symmetrical bleed
                    position: 'relative',
                    overflow: 'visible' // CRITICAL: Allow elements to bleed out
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
                                zIndex: element.zIndex
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
            <div className="absolute bottom-2 right-2 pointer-events-none">
                <p className="text-[6px] font-black text-white/10 uppercase tracking-[0.2em]">
                    TAMUU V3 ENGINE
                </p>
            </div>
        </div>
    );
};
