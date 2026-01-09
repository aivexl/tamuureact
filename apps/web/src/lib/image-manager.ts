/**
 * 🦄 Enterprise Image Manager (Unicorn Standard)
 * 
 * Core engine for client-side image optimization.
 * Features:
 * 1. Smart Compression (WebP/JPEG)
 * 2. BlurHash Generation ("Ghost Loading")
 * 3. Context-Aware Optimization (Hero vs Thumb)
 * 4. Strict Type Safety
 */

import { encode } from 'blurhash';

export interface ImageOptimizationResult {
    file: File;
    blurHash: string;
    width: number;
    height: number;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
}

export type ImageContext = 'hero' | 'gallery' | 'avatar' | 'thumbnail';

interface OptimizationConfig {
    maxWidth: number;
    maxHeight: number;
    quality: number;
    format: 'webp' | 'jpeg';
}

// Enterprise Standards for different contexts
const CONTEXT_CONFIGS: Record<ImageContext, OptimizationConfig> = {
    hero: { maxWidth: 1920, maxHeight: 1920, quality: 0.85, format: 'webp' },
    gallery: { maxWidth: 1600, maxHeight: 1600, quality: 0.80, format: 'webp' },
    avatar: { maxWidth: 400, maxHeight: 400, quality: 0.85, format: 'webp' },
    thumbnail: { maxWidth: 800, maxHeight: 800, quality: 0.75, format: 'webp' },
};

/**
 * Main Entry Point: Optimize an image for a specific context
 */
export async function processImage(
    file: File,
    context: ImageContext = 'gallery'
): Promise<ImageOptimizationResult> {

    // 1. Get Config
    const config = CONTEXT_CONFIGS[context];

    // 2. Load Image to Canvas
    const { canvas, width, height, ctx } = await loadImageToCanvas(file, config);

    // 3. Generate BlurHash (Small 32x32 canvas for speed)
    const blurHash = encodeBlurHash(canvas, ctx);

    // 4. Compress to File
    const compressedFile = await canvasToFile(canvas, config, file.name);

    return {
        file: compressedFile,
        blurHash,
        width,
        height,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio: Math.round((1 - compressedFile.size / file.size) * 100)
    };
}

// Internal Helpers

function loadImageToCanvas(file: File, config: OptimizationConfig): Promise<{ canvas: HTMLCanvasElement, width: number, height: number, ctx: CanvasRenderingContext2D }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // Calculate Aspect Ratio
            let { width, height } = img;
            if (width > config.maxWidth || height > config.maxHeight) {
                const ratio = Math.min(config.maxWidth / width, config.maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            // High Quality Scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            resolve({ canvas, width, height, ctx });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

function encodeBlurHash(sourceCanvas: HTMLCanvasElement, sourceCtx: CanvasRenderingContext2D): string {
    // Resize to tiny canvas for BlurHash calculation (speed optimization)
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = 32;
    smallCanvas.height = 32;
    const smallCtx = smallCanvas.getContext('2d');

    if (!smallCtx) return '';

    // Draw resized image
    smallCtx.drawImage(sourceCanvas, 0, 0, 32, 32);

    // Get pixel data
    const imageData = smallCtx.getImageData(0, 0, 32, 32);

    // Encode (Component X: 4, Y: 3 is standard sweet spot)
    try {
        return encode(imageData.data, 32, 32, 4, 3);
    } catch (e) {
        console.error('BlurHash generation failed', e);
        return '';
    }
}

function canvasToFile(canvas: HTMLCanvasElement, config: OptimizationConfig, originalName: string): Promise<File> {
    return new Promise((resolve, reject) => {
        const mime = config.format === 'webp' ? 'image/webp' : 'image/jpeg';

        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Compression failed'));
                return;
            }

            // Construct new filename
            const extension = config.format;
            const name = originalName.replace(/\.[^/.]+$/, "") + "." + extension;

            const file = new File([blob], name, {
                type: mime,
                lastModified: Date.now()
            });

            resolve(file);

        }, mime, config.quality);
    });
}
