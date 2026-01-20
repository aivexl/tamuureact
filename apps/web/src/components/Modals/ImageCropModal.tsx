import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { X, Crop, Check, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { PremiumLoader } from '../ui/PremiumLoader';

// ============================================
// IMAGE CROP MODAL
// Enterprise-grade image cropping with react-easy-crop
// Fixed: Proper crop extraction, zoom out support
// ============================================

interface ImageCropModalProps {
    isOpen: boolean;
    imageSrc: string | null;
    aspectRatio?: number;
    onClose: () => void;
    onCropComplete: (croppedImageUrl: string) => void;
}

/**
 * Create an image element from URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.crossOrigin = 'anonymous';
        image.src = url;
    });
}

/**
 * Get radians from degree
 */
function getRadianAngle(degreeValue: number): number {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Calculate the size of the rotated image
 */
function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation);
    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

/**
 * FIXED: Proper crop function using two-canvas approach
 * This correctly extracts the cropped area preserving image quality
 */
async function getCroppedImage(
    imageSrc: string,
    pixelCrop: Area,
    rotation: number = 0
): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    // Calculate rotated image size
    const rotRad = getRadianAngle(rotation);
    const { width: rotatedWidth, height: rotatedHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // Create a canvas large enough to hold the rotated image
    const rotatedCanvas = document.createElement('canvas');
    const rotatedCtx = rotatedCanvas.getContext('2d');
    if (!rotatedCtx) {
        throw new Error('Could not get rotated canvas context');
    }

    rotatedCanvas.width = rotatedWidth;
    rotatedCanvas.height = rotatedHeight;

    // Draw the rotated image onto the canvas
    rotatedCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
    rotatedCtx.rotate(rotRad);
    rotatedCtx.translate(-image.width / 2, -image.height / 2);
    rotatedCtx.drawImage(image, 0, 0);

    // Now extract the cropped area from the rotated canvas
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped portion
    ctx.drawImage(
        rotatedCanvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // Return as PNG to preserve transparency
    return canvas.toDataURL('image/png');
}


export const ImageCropModal: React.FC<ImageCropModalProps> = ({
    isOpen,
    imageSrc,
    aspectRatio = 1,
    onClose,
    onCropComplete
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const onCropChange = useCallback((location: Point) => {
        setCrop(location);
    }, []);

    const onZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
    }, []);

    const onRotationChange = useCallback((newRotation: number) => {
        setRotation(newRotation);
    }, []);

    const onCropCompleteInternal = useCallback(
        (_croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setIsSaving(true);
        try {
            const croppedImage = await getCroppedImage(
                imageSrc,
                croppedAreaPixels,
                rotation
            );
            onCropComplete(croppedImage);
            onClose();
        } catch (error) {
            console.error('[ImageCropModal] Crop failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    // Reset state when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
            setCroppedAreaPixels(null);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && imageSrc && (
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
                                <span className="font-bold text-sm">Crop Image</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cropper Area */}
                        <div className="relative h-[400px] bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={aspectRatio}
                                minZoom={0.5}
                                maxZoom={4}
                                restrictPosition={false}
                                onCropChange={onCropChange}
                                onZoomChange={onZoomChange}
                                onRotationChange={onRotationChange}
                                onCropComplete={onCropCompleteInternal}
                                cropShape="rect"
                                showGrid={true}
                                objectFit="contain"
                                style={{
                                    containerStyle: {
                                        background: '#0a0a0a'
                                    },
                                    cropAreaStyle: {
                                        border: '2px solid #bfa181',
                                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
                                    }
                                }}
                            />
                        </div>


                        {/* Controls */}
                        <div className="p-4 border-t border-white/10 bg-[#111] space-y-4">
                            {/* Zoom Control - supports zoom out (0.5x - 4x) */}
                            <div className="flex items-center gap-3">
                                <ZoomOut className="w-4 h-4 text-white/40" />
                                <input
                                    type="range"
                                    min={0.5}
                                    max={4}
                                    step={0.01}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-premium-accent"
                                />
                                <ZoomIn className="w-4 h-4 text-white/40" />
                                <span className="text-xs text-white/40 w-12 text-right">{Math.round(zoom * 100)}%</span>
                            </div>

                            {/* Rotation Control */}
                            <div className="flex items-center gap-3">
                                <RotateCcw className="w-4 h-4 text-white/40" />
                                <input
                                    type="range"
                                    min={-180}
                                    max={180}
                                    step={1}
                                    value={rotation}
                                    onChange={(e) => setRotation(parseInt(e.target.value))}
                                    className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-premium-accent"
                                />
                                <span className="text-xs text-white/40 w-12 text-right">{rotation}°</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="h-16 border-t border-white/10 flex items-center justify-between px-6 bg-white/5">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !croppedAreaPixels}
                                    className="px-6 py-2 bg-premium-accent hover:bg-premium-accent/90 text-premium-dark rounded-lg text-xs font-bold transition-all shadow-lg shadow-premium-accent/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            <PremiumLoader variant="inline" color="#bfa181" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
