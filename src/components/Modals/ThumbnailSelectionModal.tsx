import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crop, Upload, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ThumbnailSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (blob: Blob) => Promise<void>;
    initialImageSrc?: string | null;
}

export const ThumbnailSelectionModal: React.FC<ThumbnailSelectionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialImageSrc
}) => {
    const [step, setStep] = useState<'capture' | 'crop'>('capture');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    // Crop state: x, y, width, height (percentages)
    // Default to a vertical aspect ratio compatible area
    const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });
    const [isSaving, setIsSaving] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });

    const cropRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const timeoutRef = useRef<NodeJS.Timeout>();

    // Capture Canvas
    const captureCanvas = useCallback(async () => {
        if (!isOpen) return; // Prevent capture if closed
        setIsCapturing(true);
        try {
            // Priority 1: Active section
            let element = document.querySelector('.captured-canvas-target') as HTMLElement;

            // Priority 2: Any visible section (fallback)
            if (!element) {
                element = document.querySelector('[data-capture-target="true"]') as HTMLElement;
            }

            if (!element) {
                console.warn('Canvas element not found. Ensure a section is active.');
                // Show manual upload option in UI instead of alerting
                return;
            }

            const canvas = await html2canvas(element, {
                useCORS: true,
                scale: 1, // Full quality for crop source
                backgroundColor: null, // Transparent if needed
                logging: false
            });

            if (!isOpen) return; // Double check

            setCapturedImage(canvas.toDataURL('image/png'));
            setStep('crop');
        } catch (error) {
            console.error('Capture failed:', error);
        } finally {
            if (isOpen) setIsCapturing(false);
        }
    }, [isOpen]); // Removed onClose dep to avoid stale closures

    // Initial trigger
    useEffect(() => {
        if (isOpen) {
            if (initialImageSrc) {
                setCapturedImage(initialImageSrc);
                setStep('crop');
                setViewTransform({ x: 0, y: 0, scale: 1 });
            } else if (step === 'capture') {
                timeoutRef.current = setTimeout(captureCanvas, 500);
            }
        } else {
            setStep('capture');
            setCapturedImage(null);
            setIsSaving(false);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isOpen, initialImageSrc, captureCanvas, step]);

    // ============================================
    // FLUID DRAG LOGIC (Window-based)
    // ============================================

    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const viewTransformStartRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleWindowMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaX = e.clientX - dragStartRef.current.x;
            const deltaY = e.clientY - dragStartRef.current.y;

            setViewTransform({
                ...viewTransform,
                x: viewTransformStartRef.current.x + deltaX,
                y: viewTransformStartRef.current.y + deltaY
            });
        };

        const handleWindowMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleWindowMouseMove);
            window.addEventListener('mouseup', handleWindowMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [isDragging, viewTransform.scale]); // Re-bind if dragging state changes

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent text selection
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        viewTransformStartRef.current = { x: viewTransform.x, y: viewTransform.y };
    };

    const handleWheel = (e: React.WheelEvent) => {
        const newScale = Math.max(0.1, Math.min(5, viewTransform.scale - e.deltaY * 0.001));
        setViewTransform(prev => ({ ...prev, scale: newScale }));
    };

    // New Save Logic for Viewport Crop
    const handleViewportSave = async () => {
        if (!capturedImage) return;
        setIsSaving(true);

        try {
            const canvas = document.createElement('canvas');
            // Target thumbnail size matches visual viewport aspect ratio
            const TARGET_W = 360; // Slightly higher res for premium quality
            const TARGET_H = 600;

            canvas.width = TARGET_W;
            canvas.height = TARGET_H;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Premium background fill
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, TARGET_W, TARGET_H);

            const img = new Image();
            img.src = capturedImage;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            // CTO ENTERPRISE CALCULATION: Pixel Perfect Mapping
            // 1. Calculate how much we need to scale the UI coordinates (300px width) 
            //    to map to our high-res Canvas (360px width).
            const renderScaleUItoCanvas = TARGET_W / 300;

            ctx.save();

            // Apply the UI-captured transforms scaled up to the production canvas resolution
            ctx.translate(viewTransform.x * renderScaleUItoCanvas, viewTransform.y * renderScaleUItoCanvas);
            ctx.scale(viewTransform.scale * renderScaleUItoCanvas, viewTransform.scale * renderScaleUItoCanvas);

            // Draw the full image source
            ctx.drawImage(img, 0, 0);

            ctx.restore();

            canvas.toBlob(async (blob) => {
                if (blob) {
                    await onSave(blob);
                    onClose();
                }
            }, 'image/jpeg', 0.92); // High quality JPEG

        } catch (error) {
            console.error('[Enterprise Cropper] Save Failed:', error);
            setIsSaving(false);
        }
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-lg overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
                            <div className="flex items-center gap-2 text-white">
                                <Crop className="w-5 h-5 text-premium-accent" />
                                <span className="font-bold text-sm">Set Thumbnail</span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col items-center gap-4">
                            {step === 'capture' ? (
                                <div className="h-64 w-full flex flex-col items-center justify-center gap-3 text-white/40">
                                    <Loader2 className="w-8 h-8 animate-spin text-premium-accent" />
                                    <span className="text-sm font-medium">Capturing Canvas...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <p className="text-xs text-white/40 text-center">
                                        Drag to position. Scroll to zoom.
                                    </p>

                                    {/* Viewport Frame */}
                                    <div
                                        className={`relative w-[300px] h-[500px] bg-black overflow-hidden rounded-lg border-2 border-premium-accent shadow-2xl touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                                        onMouseDown={handleMouseDown}
                                        onWheel={handleWheel}
                                    >
                                        {capturedImage && (
                                            <img
                                                src={capturedImage}
                                                alt="Preview"
                                                role="presentation"
                                                draggable={false}
                                                onLoad={(e) => {
                                                    const img = e.currentTarget;
                                                    const naturalW = img.naturalWidth;
                                                    const naturalH = img.naturalHeight;

                                                    if (naturalW > 0 && naturalH > 0) {
                                                        // 1. Calculate scale to fit width
                                                        const fitScale = 300 / naturalW;

                                                        // 2. Calculate centering offsets
                                                        // We want (naturalW * fitScale) to be 300
                                                        // We want (naturalH * fitScale) height. 
                                                        // If it's taller than 500, we center it vertically.
                                                        const renderedH = naturalH * fitScale;
                                                        const offsetY = (500 - renderedH) / 2;

                                                        setViewTransform({
                                                            x: 0,
                                                            y: offsetY,
                                                            scale: fitScale
                                                        });
                                                    }
                                                }}
                                                className="absolute touch-none select-none pointer-events-none"
                                                style={{
                                                    maxWidth: 'none',
                                                    maxHeight: 'none',
                                                    transformOrigin: '0 0',
                                                    transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`
                                                }}
                                            />
                                        )}

                                        {/* Overlay Grid */}
                                        <div className="absolute inset-0 pointer-events-none opacity-20">
                                            <div className="w-full h-full border border-white/50" />
                                            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                                            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                                            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                                            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex gap-4 items-center w-full justify-center">
                                        <button
                                            onClick={() => setViewTransform(p => ({ ...p, scale: Math.max(0.1, p.scale - 0.1) }))}
                                            className="p-2 bg-white/5 rounded hover:bg-white/10 text-white/60"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="3"
                                            step="0.01"
                                            value={viewTransform.scale}
                                            onChange={(e) => setViewTransform(p => ({ ...p, scale: parseFloat(e.target.value) }))}
                                            className="w-32 accent-premium-accent"
                                        />
                                        <button
                                            onClick={() => setViewTransform(p => ({ ...p, scale: Math.min(5, p.scale + 0.1) }))}
                                            className="p-2 bg-white/5 rounded hover:bg-white/10 text-white/60"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="h-16 border-t border-white/10 flex items-center justify-end px-6 bg-white/5 gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleViewportSave}
                                disabled={isSaving || step !== 'crop'}
                                className="px-6 py-2 bg-premium-accent hover:bg-premium-accent/90 text-premium-dark rounded-lg text-xs font-bold transition-all shadow-lg shadow-premium-accent/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Save Thumbnail
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
