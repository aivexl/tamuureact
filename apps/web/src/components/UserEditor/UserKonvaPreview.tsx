import React, { useRef, useState, useEffect } from 'react';
import Moveable from 'react-moveable';
import { useStore } from '@/store/useStore';
import { AnimatedLayer } from '../Preview/AnimatedLayer';

interface UserKonvaPreviewProps {
    sectionId?: string;
    canvasType?: 'main' | 'orbit-left' | 'orbit-right';
}

/**
 * UserKonvaPreview
 * High-fidelity preview of a section or cinematic stage with Interactive Transformation support.
 * CTO ENTERPRISE LEVEL: Fixed coordinate parity and robust permission handling.
 */
export const UserKonvaPreview: React.FC<UserKonvaPreviewProps> = ({ sectionId, canvasType = 'main' }) => {
    const { 
        sections, 
        orbit, 
        selectedLayerId, 
        selectLayer, 
        updateElementInSection,
        updateOrbitCanvas
    } = useStore();
    
    const containerRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
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

    // INTERACTION LOGIC
    const targetMap = useRef<Map<string, HTMLDivElement>>(new Map());
    const [target, setTarget] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (selectedLayerId && targetMap.current.has(selectedLayerId)) {
            const el = targetMap.current.get(selectedLayerId);
            const layer = elements.find(e => e.id === selectedLayerId);
            
            // CTO ROBUST PERMISSION CHECK: Matches UserElementEditor logic
            const p = layer?.permissions;
            const canEdit = p?.canEditPosition || p?.canEditStyle || p?.canEditContent || 
                            (layer as any)?.canEditPosition || (layer as any)?.canEditStyle || (layer as any)?.canEditContent;
            
            if (canEdit) {
                setTarget(el || null);
            } else {
                setTarget(null);
            }
        } else {
            setTarget(null);
        }
    }, [selectedLayerId, elements]);

    const handleUpdate = (updates: any) => {
        if (!selectedLayerId) return;
        if (canvasType === 'main' && sectionId) {
            updateElementInSection(sectionId, selectedLayerId, updates);
        } else if (canvasType.startsWith('orbit')) {
            const side = canvasType === 'orbit-left' ? 'left' : 'right';
            const updatedElements = orbit[side].elements.map(el => 
                el.id === selectedLayerId ? { ...el, ...updates } : el
            );
            updateOrbitCanvas(side, { elements: updatedElements });
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full flex items-start justify-start overflow-hidden bg-[#0a0a0a] transition-all duration-1000"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) selectLayer(null);
            }}
        >
            {/* The Scaled Render Viewport */}
            <div
                ref={viewportRef}
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
                        const elAny = element as any;
                        const elementHeight = element.height || elAny.size?.height || (elAny.textStyle?.fontSize) || 0;
                        const maxTop = DESIGN_HEIGHT - elementHeight;

                        let progress = maxTop > 0 ? element.y / maxTop : 0;
                        progress = Math.max(0, Math.min(1, progress));

                        const adjustedY = element.y + (extraHeight * progress);

                        // CTO ROBUST PERMISSION CHECK: Identical to target logic
                        const p = element.permissions;
                        const canInteract = p?.canEditPosition || p?.canEditStyle || p?.canEditContent || 
                                          (element as any)?.canEditPosition || (element as any)?.canEditStyle || (element as any)?.canEditContent;

                        return (
                            <div
                                key={element.id}
                                ref={(el) => {
                                    if (el) targetMap.current.set(element.id, el);
                                    else targetMap.current.delete(element.id);
                                }}
                                className="absolute pointer-events-auto"
                                style={{
                                    left: element.x,
                                    top: adjustedY,
                                    width: element.width,
                                    height: element.height,
                                    zIndex: element.zIndex,
                                    cursor: canInteract ? 'grab' : 'default',
                                    // Visual guard for selected item
                                    outline: selectedLayerId === element.id ? '1px solid rgba(191, 161, 129, 0.5)' : 'none'
                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    selectLayer(element.id);
                                }}
                            >
                                <AnimatedLayer
                                    layer={element}
                                    adjustedY={0} // CTO FIX: Set to 0 because parent handles adjustedY
                                    isOpened={true}
                                    isEditor={true} // CTO FIX: Essential to prevent double-positioning (resets internal x/y)
                                    forceTrigger={true}
                                />
                            </div>
                        );
                    })}

                {/* Moveable Interaction Layer */}
                {target && (
                    <Moveable
                        target={target}
                        draggable={true}
                        resizable={true}
                        rotatable={true}
                        snappable={true}
                        origin={false}
                        useResizeObserver={true}
                        useMutationObserver={true}
                        throttleDrag={1}
                        throttleResize={1}
                        throttleRotate={1}
                        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
                        zoom={1 / scale} // CTO FIX: Correct handle scaling
                        onDrag={({ left, top }) => {
                            target.style.left = `${left}px`;
                            target.style.top = `${top}px`;
                        }}
                        onDragEnd={({ lastEvent }) => {
                            if (lastEvent) {
                                handleUpdate({ x: lastEvent.left, y: lastEvent.top });
                            }
                        }}
                        onResize={({ width, height, drag }) => {
                            target.style.width = `${width}px`;
                            target.style.height = `${height}px`;
                            target.style.transform = drag.transform;
                        }}
                        onResizeEnd={({ lastEvent }) => {
                            if (lastEvent) {
                                handleUpdate({
                                    width: lastEvent.width,
                                    height: lastEvent.height,
                                    x: lastEvent.drag.left,
                                    y: lastEvent.drag.top
                                });
                            }
                        }}
                        onRotate={({ transform }) => {
                            target.style.transform = transform;
                        }}
                        onRotateEnd={({ lastEvent }) => {
                            if (lastEvent) {
                                handleUpdate({ rotation: lastEvent.rotate });
                            }
                        }}
                    />
                )}

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
                    TAMUU V3 INTERACTIVE ENGINE
                </p>
            </div>
        </div>
    );
};
