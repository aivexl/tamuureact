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
 * CTO ENTERPRISE LEVEL: Fixed Coordinate Parity & Reliable Selection Engine.
 * Reverts stretching logic to match Admin Editor (DisplayCanvas) 1:1.
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
    const [scale, setScale] = useState(1);

    const section = sectionId ? sections.find(s => s.id === sectionId) : null;
    const orbitCanvas = canvasType === 'orbit-left' ? orbit.left : (canvasType === 'orbit-right' ? orbit.right : null);

    // CTO ENTERPRISE DIMENSIONS (Standardized)
    const DESIGN_WIDTH = canvasType === 'main' ? 414 : 800;
    const DESIGN_HEIGHT = 896;

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                setScale(width / DESIGN_WIDTH);
            }
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [DESIGN_WIDTH]);

    if (!section && canvasType === 'main') return null;

    const elements = canvasType === 'main' ? (section?.elements || []) : (orbitCanvas?.elements || []);
    const backgroundColor = canvasType === 'main' ? (section?.backgroundColor || '#0a0a0a') : (orbitCanvas?.backgroundColor || 'transparent');
    const backgroundUrl = canvasType === 'main' ? section?.backgroundUrl : orbitCanvas?.backgroundUrl;

    // INTERACTION LOGIC
    const [target, setTarget] = useState<HTMLElement | null>(null);

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
            className="relative w-full aspect-[9/19.5] sm:aspect-[9/20.5] flex items-start justify-start overflow-hidden bg-[#0a0a0a]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    selectLayer(null);
                    setTarget(null);
                }
            }}
        >
            {/* VIEWPORT - ABSOLUTE 1:1 PARITY WITH ADMIN */}
            <div
                style={{
                    width: DESIGN_WIDTH,
                    height: DESIGN_HEIGHT,
                    backgroundColor: backgroundColor,
                    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            >
                {elements
                    .filter(el => el.isVisible !== false)
                    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map((element) => {
                        const canEdit = element.permissions?.canEditPosition || element.permissions?.canEditStyle || (element as any).canEditContent;

                        return (
                            <div
                                key={element.id}
                                id={`user-el-${element.id}`}
                                className={`absolute ${selectedLayerId === element.id ? 'z-[1000]' : ''}`}
                                style={{
                                    left: element.x,
                                    top: element.y, // CTO FIX: No more stretching, matches database 1:1
                                    width: element.width,
                                    height: element.height,
                                    zIndex: element.zIndex,
                                    cursor: canEdit ? 'grab' : 'default',
                                    pointerEvents: 'auto'
                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    selectLayer(element.id);
                                    if (canEdit) {
                                        setTarget(e.currentTarget);
                                    } else {
                                        setTarget(null);
                                    }
                                }}
                            >
                                <AnimatedLayer
                                    layer={element}
                                    adjustedY={0}
                                    isOpened={true}
                                    isEditor={true} // Fixed coordinate internal calculations
                                    forceTrigger={true}
                                />
                            </div>
                        );
                    })}

                {/* INTERACTIVE BOX (Moveable) */}
                {target && selectedLayerId && (
                    <Moveable
                        target={target}
                        draggable={true}
                        resizable={true}
                        rotatable={false}
                        snappable={true}
                        origin={false}
                        throttleDrag={1}
                        throttleResize={1}
                        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
                        zoom={1 / scale}
                        onDrag={({ left, top }) => {
                            target.style.left = `${left}px`;
                            target.style.top = `${top}px`;
                        }}
                        onDragEnd={({ lastEvent }) => {
                            if (lastEvent) handleUpdate({ x: lastEvent.left, y: lastEvent.top });
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
                    />
                )}
            </div>
        </div>
    );
};
