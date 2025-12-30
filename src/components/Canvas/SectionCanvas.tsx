import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useStore } from '@/store/useStore';
import { CanvasElement } from './CanvasElement';
import { motion, AnimatePresence } from 'framer-motion';

const CANVAS_WIDTH = 414;
const CANVAS_HEIGHT = 896;

export const SectionCanvas: React.FC = () => {
    const {
        layers,
        selectedLayerId,
        selectLayer,
        updateLayer,
        updateSection,
        pathEditingId,
        setPathEditingId,
        zoom,
        setCanvasTransform,
        backgroundColor,
        sections,
        activeSectionId,
        updateElementInSection
    } = useStore();

    // 1. Find the active section
    const section = sections.find(s => s.id === activeSectionId);

    // 2. Determine which layers to render: Prioritize section elements if a section is active
    // This is critical for Motion Path editing to work for section-based elements.
    const canvasLayers = section?.elements || layers;

    // 3. Unified update handler - handles both global layers and section-specific elements
    // CTO Optimization: Using getState inside callback to ensure absolute identity stability
    // This prevents infinite loops when children trigger updates on mount (like image loading)
    const handleUpdateLayer = useCallback((layerId: string, updates: Partial<any>) => {
        const state = useStore.getState();
        const currentSection = state.sections.find(s => s.id === state.activeSectionId);

        if (currentSection && currentSection.elements.some(el => el.id === layerId)) {
            state.updateElementInSection(currentSection.id, layerId, updates);
        } else {
            state.updateLayer(layerId, updates);
        }
    }, []); // Zero dependencies = Infinite stability
    const canvasRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const transformRef = useRef<any>(null);
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    // Listen for space key to enable panning
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat) {
                if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setIsSpacePressed(true);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Sort layers by zIndex
    const sortedLayers = [...canvasLayers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // Handle element drag
    const handleElementDrag = useCallback((layerId: string, newPosition: { x: number; y: number }) => {
        handleUpdateLayer(layerId, { x: newPosition.x, y: newPosition.y });
    }, [handleUpdateLayer]);

    // Handle element resize
    const handleElementResize = useCallback((layerId: string, updates: any) => {
        handleUpdateLayer(layerId, updates);
    }, [handleUpdateLayer]);

    // Handle canvas click (deselect or add path point)
    // Modified to support clicks anywhere in the extended editing zone (padding)
    const handleCanvasClick = (e: React.MouseEvent) => {
        // Find if we clicked on a handle or interactive element first
        const isInteractive = (e.target as HTMLElement).closest('.canvas-element') ||
            (e.target as HTMLElement).closest('.path-handle');

        if (pathEditingId) {
            if (isInteractive) return; // Don't add point if clicking handle or element

            // Add point to motion path
            // We use the wrapperRef because it includes the 200px padding
            const rect = wrapperRef.current?.getBoundingClientRect();
            if (!rect) return;

            // Calculate x, y relative to the wrapper, accounting for zoom
            // The padding (200px) is INSIDE the zoomed area
            const x = (e.clientX - rect.left) / zoom - 200;
            const y = (e.clientY - rect.top) / zoom - 200;

            const layer = canvasLayers.find(l => l.id === pathEditingId);
            if (layer) {
                const points = [...(layer.motionPathConfig?.points || [])];
                points.push({ x, y });
                handleUpdateLayer(layer.id, {
                    motionPathConfig: {
                        ...layer.motionPathConfig!,
                        points
                    }
                });
            }
        } else if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-frame')) {
            selectLayer(null);
        }
    };

    const editingLayer = canvasLayers.find(l => l.id === pathEditingId);
    const selectedZoomPointIndex = section?.zoomConfig?.selectedPointIndex;
    const selectedZoomPoint = selectedZoomPointIndex !== undefined ? section?.zoomConfig?.points[selectedZoomPointIndex] : null;

    const handleUpdatePathPoint = (index: number, x: number, y: number) => {
        if (!editingLayer) return;
        const points = [...(editingLayer.motionPathConfig?.points || [])];
        points[index] = { ...points[index], x, y };
        handleUpdateLayer(editingLayer.id, {
            motionPathConfig: {
                ...editingLayer.motionPathConfig!,
                points
            }
        });
    };

    const handleUpdateZoomRegion = (updates: any) => {
        if (!section || selectedZoomPointIndex === undefined) return;
        const points = [...section.zoomConfig!.points];
        points[selectedZoomPointIndex] = {
            ...points[selectedZoomPointIndex],
            targetRegion: { ...points[selectedZoomPointIndex].targetRegion, ...updates }
        };
        updateSection(section.id, {
            zoomConfig: { ...section.zoomConfig!, points }
        });
    };

    return (
        <div className={`flex-1 relative overflow-hidden bg-[#050505] ${isSpacePressed ? 'cursor-grab' : ''}`}>
            {/* Grid Background */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}
            />

            {/* Pan Mode Indicator */}
            {isSpacePressed && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-premium-accent/90 text-premium-dark px-4 py-2 rounded-full text-xs font-bold">
                    Pan Mode (Release Space to exit)
                </div>
            )}

            <TransformWrapper
                ref={transformRef}
                initialScale={1}
                minScale={0.1}
                maxScale={5}
                centerOnInit
                onTransformed={(ref) => setCanvasTransform({
                    x: ref.state.positionX,
                    y: ref.state.positionY,
                    zoom: ref.state.scale
                })}
                wheel={{ disabled: true }}
                doubleClick={{ disabled: true }}
                pinch={{ disabled: true }}
                panning={{
                    disabled: !isSpacePressed,
                    velocityDisabled: true
                }}
            >
                <TransformComponent
                    wrapperClass="!w-full !h-full"
                    contentClass="!flex !items-center !justify-center"
                >
                    <div
                        ref={wrapperRef}
                        className="p-[200px] relative"
                        onClick={handleCanvasClick}
                    > {/* Large padding for handles at edges */}
                        {/* Zoom Engine Wrapper */}
                        <motion.div
                            animate={selectedZoomPoint ? {
                                scale: CANVAS_WIDTH / selectedZoomPoint.targetRegion.width,
                                x: -((selectedZoomPoint.targetRegion.x + selectedZoomPoint.targetRegion.width / 2) - CANVAS_WIDTH / 2) * (CANVAS_WIDTH / selectedZoomPoint.targetRegion.width),
                                y: -((selectedZoomPoint.targetRegion.y + selectedZoomPoint.targetRegion.height / 2) - CANVAS_HEIGHT / 2) * (CANVAS_WIDTH / selectedZoomPoint.targetRegion.width),
                            } : {
                                scale: 1,
                                x: 0,
                                y: 0
                            }}
                            transition={{ duration: section?.zoomConfig?.transitionDuration ? section.zoomConfig.transitionDuration / 1000 : 0.8, ease: "easeInOut" }}
                            style={{ transformOrigin: 'center center' }}
                        >
                            {/* Canvas Frame */}
                            <div
                                ref={canvasRef}
                                className="relative shadow-2xl rounded-2xl overflow-visible canvas-frame"
                                style={{
                                    width: CANVAS_WIDTH,
                                    height: CANVAS_HEIGHT,
                                    backgroundColor: backgroundColor || '#0a0a0a'
                                }}
                            >
                                {/* Elements */}
                                <AnimatePresence>
                                    {sortedLayers.filter(l => l.isVisible).map((layer) => (
                                        <CanvasElement
                                            key={layer.id}
                                            layer={layer}
                                            isSelected={selectedLayerId === layer.id}
                                            onSelect={() => selectLayer(layer.id)}
                                            onDrag={(pos: { x: number; y: number }) => handleElementDrag(layer.id, pos)}
                                            onResize={(size: any) => handleElementResize(layer.id, size)}
                                            isPanMode={isSpacePressed}
                                        />
                                    ))}
                                </AnimatePresence>

                                {/* Motion Path Visualization (Editing Mode) */}
                                {editingLayer && editingLayer.motionPathConfig && (
                                    <svg className="absolute inset-0 pointer-events-none z-40 overflow-visible">
                                        <path
                                            d={editingLayer.motionPathConfig.points.length > 0
                                                ? `M ${editingLayer.motionPathConfig.points[0].x} ${editingLayer.motionPathConfig.points[0].y} ` +
                                                editingLayer.motionPathConfig.points.slice(1).map((p: any) => `L ${p.x} ${p.y}`).join(' ')
                                                : ''
                                            }
                                            fill="none"
                                            stroke="var(--premium-accent)"
                                            strokeWidth="2"
                                            strokeDasharray="4 4"
                                            opacity="0.5"
                                        />
                                    </svg>
                                )}
                            </div>
                        </motion.div>

                        {/* Path Handles (Rendered outside overflow:hidden frame) */}
                        {editingLayer && editingLayer.motionPathConfig?.points.map((p: any, i: number) => (
                            <motion.div
                                key={`${editingLayer.id}-point-${i}`}
                                drag
                                dragMomentum={false}
                                onDrag={(e, info) => {
                                    const x = p.x + info.delta.x / zoom;
                                    const y = p.y + info.delta.y / zoom;
                                    handleUpdatePathPoint(i, x, y);
                                }}
                                className="absolute w-4 h-4 bg-premium-accent border-2 border-white rounded-full cursor-move z-50 shadow-lg flex items-center justify-center group/p path-handle"
                                style={{
                                    left: p.x + 200, // Account for padding
                                    top: p.y + 200,
                                    marginLeft: -8,
                                    marginTop: -8
                                }}
                            >
                                <span className="text-[8px] font-bold text-premium-dark pointer-events-none">
                                    {i + 1}
                                </span>
                                <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const points = editingLayer.motionPathConfig!.points.filter((_: any, idx: number) => idx !== i);
                                        updateLayer(editingLayer.id, {
                                            motionPathConfig: { ...editingLayer.motionPathConfig!, points }
                                        });
                                    }}
                                    className="absolute -top-4 -right-4 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center opacity-0 group-hover/p:opacity-100"
                                >
                                    ×
                                </button>
                            </motion.div>
                        ))}

                        {/* Zoom Region Editor */}
                        {selectedZoomPoint && (
                            <motion.div
                                className="absolute border-2 border-premium-accent bg-premium-accent/5 z-50 pointer-events-auto"
                                style={{
                                    left: selectedZoomPoint.targetRegion.x + 200,
                                    top: selectedZoomPoint.targetRegion.y + 200,
                                    width: selectedZoomPoint.targetRegion.width,
                                    height: selectedZoomPoint.targetRegion.height
                                }}
                                drag
                                dragMomentum={false}
                                onDrag={(e, info) => {
                                    handleUpdateZoomRegion({
                                        x: selectedZoomPoint.targetRegion.x + info.delta.x / zoom,
                                        y: selectedZoomPoint.targetRegion.y + info.delta.y / zoom
                                    });
                                }}
                            >
                                <div className="absolute -top-6 left-0 bg-premium-accent text-premium-dark px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap">
                                    ZOOM TARGET: {selectedZoomPoint.label}
                                </div>
                                {/* Resize Handle (Bottom Right) */}
                                <motion.div
                                    drag
                                    dragMomentum={false}
                                    onDrag={(e, info) => {
                                        e.stopPropagation();
                                        handleUpdateZoomRegion({
                                            width: Math.max(50, selectedZoomPoint.targetRegion.width + info.delta.x / zoom),
                                            height: Math.max(50, selectedZoomPoint.targetRegion.height + info.delta.y / zoom)
                                        });
                                    }}
                                    className="absolute bottom-0 right-0 w-4 h-4 bg-premium-accent cursor-nwse-resize"
                                />
                            </motion.div>
                        )}
                    </div>
                </TransformComponent>
            </TransformWrapper>

            {/* Zoom Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3">
                <span className="text-xs font-mono text-white/60">{Math.round(zoom * 100)}%</span>
                <span className="text-[10px] text-white/30">Hold Space to pan</span>
            </div>
        </div>
    );
};
