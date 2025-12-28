import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Moveable, { OnDrag, OnDragEnd, OnScale, OnScaleEnd, OnRotate, OnRotateEnd } from 'react-moveable';
import { Layer } from '@/store/layersSlice';
import { ElementRenderer } from './ElementRenderer';
import { AnimatedLayer } from '../Preview/AnimatedLayer';
import { Lock } from 'lucide-react';

// ============================================
// CANVAS ELEMENT COMPONENT
// Enterprise-grade implementation with proper
// separation of concerns between Moveable and React state
// ============================================
interface CanvasElementProps {
    layer: Layer;
    isSelected: boolean;
    onSelect: (toggle?: boolean) => void;
    onDrag: (position: { x: number; y: number }) => void;
    onResize: (updates: { scale?: number; width?: number; height?: number; x?: number; y?: number; rotation?: number }) => void;
    isPanMode?: boolean;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({
    layer,
    isSelected,
    onSelect,
    onDrag,
    onResize,
    isPanMode = false
}) => {
    const targetRef = useRef<HTMLDivElement>(null);
    const [isTransforming, setIsTransforming] = useState(false);

    // Track if selection happened via mousedown to prevent onClick from immediately deselecting
    const justSelectedViaMouseDown = useRef(false);

    // ============================================
    // TRANSFORM STATE MANAGEMENT
    // Using local state as source of truth during transforms
    // to prevent race conditions between Moveable and React
    // ============================================
    const [localTransform, setLocalTransform] = useState({
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
        scale: layer.scale || 1,
        rotation: layer.rotation || 0
    });

    // Sync local state with props when NOT transforming
    useEffect(() => {
        if (!isTransforming) {
            setLocalTransform({
                x: layer.x,
                y: layer.y,
                width: layer.width,
                height: layer.height,
                scale: layer.scale || 1,
                rotation: layer.rotation || 0
            });
        }
    }, [layer.x, layer.y, layer.width, layer.height, layer.scale, layer.rotation, isTransforming]);

    // ============================================
    // MOVEABLE HANDLERS
    // ============================================

    const handleDragStart = useCallback(() => {
        setIsTransforming(true);
    }, []);

    const handleDrag = useCallback(({ left, top }: OnDrag) => {
        setLocalTransform(prev => ({ ...prev, x: left, y: top }));
    }, []);

    const handleDragEnd = useCallback(({ lastEvent }: OnDragEnd) => {
        if (!lastEvent) {
            setIsTransforming(false);
            return;
        }
        onDrag({ x: localTransform.x, y: localTransform.y });
        setIsTransforming(false);
    }, [onDrag, localTransform.x, localTransform.y]);

    const handleScaleStart = useCallback(() => {
        setIsTransforming(true);
    }, []);

    const handleScale = useCallback(({ target, transform }: OnScale) => {
        // During scaling, let Moveable control the DOM directly for performance
        target.style.transform = transform;
    }, []);

    const handleScaleEnd = useCallback(({ target, lastEvent }: OnScaleEnd) => {
        if (!lastEvent) {
            setIsTransforming(false);
            return;
        }

        // Extract scale from Moveable's transform string
        const scaleMatch = target.style.transform.match(/scale\(([^)]+)\)/);
        if (scaleMatch) {
            const scales = scaleMatch[1].split(',').map((s: string) => parseFloat(s.trim()));
            const newScale = Math.abs(scales[0]);

            // Update local state immediately for visual consistency
            setLocalTransform(prev => ({ ...prev, scale: newScale }));

            // Persist to store
            onResize({ scale: newScale });

            // Reset the DOM element's style to use React-controlled values
            // This is critical to prevent Moveable's residual transform from persisting
            const flipX = layer.flipHorizontal ? -1 : 1;
            const flipY = layer.flipVertical ? -1 : 1;
            target.style.transform = `rotate(${localTransform.rotation}deg) scale(${flipX * newScale}, ${flipY * newScale})`;
        }

        setIsTransforming(false);
    }, [onResize, layer.flipHorizontal, layer.flipVertical, localTransform.rotation]);

    const handleRotateStart = useCallback(() => {
        setIsTransforming(true);
    }, []);

    const handleRotate = useCallback(({ target, transform }: OnRotate) => {
        target.style.transform = transform;
    }, []);

    const handleRotateEnd = useCallback(({ target, lastEvent }: OnRotateEnd) => {
        if (!lastEvent) {
            setIsTransforming(false);
            return;
        }

        const match = target.style.transform.match(/rotate\(([^)]+)deg\)/);
        if (match) {
            const newRotation = parseFloat(match[1]);
            setLocalTransform(prev => ({ ...prev, rotation: newRotation }));
            onResize({ rotation: newRotation });

            // Reset DOM transform
            const flipX = layer.flipHorizontal ? -1 : 1;
            const flipY = layer.flipVertical ? -1 : 1;
            target.style.transform = `rotate(${newRotation}deg) scale(${flipX * localTransform.scale}, ${flipY * localTransform.scale})`;
        }

        setIsTransforming(false);
    }, [onResize, layer.flipHorizontal, layer.flipVertical, localTransform.scale]);

    const canTransform = !layer.isLocked && !isPanMode;

    // ============================================
    // COMPUTED STYLES
    // ============================================
    const flipX = layer.flipHorizontal ? -1 : 1;
    const flipY = layer.flipVertical ? -1 : 1;
    const transformValue = `rotate(${localTransform.rotation}deg) scale(${flipX * localTransform.scale}, ${flipY * localTransform.scale})`;

    // ============================================
    // RENDER
    // Using regular div instead of motion.div to prevent
    // Framer Motion from interfering with Moveable's transform manipulation
    // ============================================

    return (
        <>
            <div
                ref={targetRef}
                className={`canvas-element group outline-none ${isSelected ? 'ring-1 ring-blue-500/50' : ''}`}
                style={{
                    position: 'absolute',
                    left: localTransform.x,
                    top: localTransform.y,
                    width: localTransform.width,
                    height: localTransform.height,
                    transform: transformValue,
                    transformOrigin: 'center center',
                    opacity: layer.opacity ?? 1,
                    zIndex: isTransforming ? 1000 : layer.zIndex,
                    cursor: isPanMode ? 'grab' : (layer.isLocked ? 'not-allowed' : 'grab'),
                    touchAction: 'none',
                    userSelect: 'none',
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isPanMode && !isTransforming) {
                        // If we just selected via mousedown, don't toggle (would immediately deselect)
                        if (justSelectedViaMouseDown.current) {
                            justSelectedViaMouseDown.current = false;
                            return;
                        }
                        // Toggle: if selected, deselect; if not selected, select
                        onSelect(isSelected);
                    }
                }}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    // Only select on mousedown if NOT already selected
                    if (!isSelected && canTransform) {
                        justSelectedViaMouseDown.current = true;
                        onSelect(false);
                    } else {
                        justSelectedViaMouseDown.current = false;
                    }
                }}
            >
                {/* CONTENT - fills container */}
                <div className={`w-full h-full ${layer.motionPathConfig?.enabled ? 'overflow-visible' : 'overflow-hidden'}`}>
                    <AnimatedLayer
                        layer={layer}
                        adjustedY={layer.y}
                        isOpened={false}
                        isEditor={true}
                        canvasHeight={896}
                    />
                </div>

                {/* Lock indicator - uses AnimatePresence for animation */}
                <AnimatePresence>
                    {isSelected && layer.isLocked && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500/80 px-2 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-1 pointer-events-none shadow-premium-gold z-50"
                        >
                            <Lock className="w-3 h-3" />
                            Locked
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hover Overlay */}
                {!isSelected && !isPanMode && (
                    <div className="absolute inset-0 bg-premium-accent/0 group-hover:bg-premium-accent/5 transition-colors pointer-events-none rounded" />
                )}
            </div>

            {isSelected && canTransform && (
                <Moveable
                    key={`moveable-${layer.id}`}
                    target={targetRef}
                    draggable={true}
                    scalable={true}
                    rotatable={true}
                    snappable={true}
                    keepRatio={true}
                    renderDirections={["nw", "ne", "sw", "se"]}
                    edge={false}
                    zoom={1}
                    origin={false}
                    padding={{ left: 0, top: 0, right: 0, bottom: 0 }}

                    /* Events */
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}

                    onScaleStart={handleScaleStart}
                    onScale={handleScale}
                    onScaleEnd={handleScaleEnd}

                    onRotateStart={handleRotateStart}
                    onRotate={handleRotate}
                    onRotateEnd={handleRotateEnd}

                    /* Styling */
                    className="custom-moveable"
                />
            )}

            <style>{`
                .custom-moveable .moveable-line {
                    background: #3b82f6 !important;
                    width: 1px !important;
                }
                .custom-moveable .moveable-control {
                    width: 10px !important;
                    height: 10px !important;
                    background: white !important;
                    border: 2px solid #3b82f6 !important;
                    border-radius: 2px !important;
                    margin-top: -5px !important;
                    margin-left: -5px !important;
                }
                .custom-moveable .moveable-rotation {
                    background: #3b82f6 !important;
                    width: 1px !important;
                }
                .custom-moveable .moveable-rotation .moveable-control {
                    border-radius: 50% !important;
                }
            `}</style>
        </>
    );
};
