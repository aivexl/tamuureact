/**
 * Client-Side Image Compression
 * Compress images before upload to save bandwidth and storage
 * 
 * Benefits:
 * - Reduces upload size by 60-80%
 * - Faster uploads
 * - Less R2 storage used
 * - 100% FREE (uses browser Canvas API)
 */

export interface CompressionOptions {
    maxWidth?: number;      // Max width in pixels (default: 1920)
    maxHeight?: number;     // Max height in pixels (default: 1920)
    quality?: number;       // JPEG quality 0-1 (default: 0.85)
    outputType?: 'jpeg' | 'webp' | 'png';  // Output format
}

const DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    outputType: 'webp', // WebP supports transparency and has good compression
};

/**
 * Check if file type supports transparency (PNG, WebP)
 */
export function hasTransparencySupport(file: File): boolean {
    return file.type === 'image/png' || file.type === 'image/webp';
}

/**
 * Get the best output format for a file
 * - For transparent images: use 'webp' or 'png'
 * - For opaque images: use 'jpeg' for best compression
 */
export function getBestOutputType(file: File): 'jpeg' | 'webp' | 'png' {
    if (hasTransparencySupport(file)) {
        return 'webp'; // WebP supports transparency with good compression
    }
    return 'jpeg'; // JPEG for photos/opaque images
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Compress an image file
 * @param file - Original image file
 * @param options - Compression options
 * @returns Compressed image as Blob
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<Blob> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            try {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;

                // Scale down if larger than max dimensions
                if (width > opts.maxWidth! || height > opts.maxHeight!) {
                    const ratio = Math.min(
                        opts.maxWidth! / width,
                        opts.maxHeight! / height
                    );
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Set canvas size to new dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw image with high-quality settings
                if (ctx) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                }

                // Convert to blob with specified quality
                const mimeType = `image/${opts.outputType}`;
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const savings = Math.round((1 - blob.size / file.size) * 100);
                            console.log(
                                `📸 Compressed: ${formatBytes(file.size)} → ${formatBytes(blob.size)} ` +
                                `(${savings}% smaller, ${width}x${height}px)`
                            );
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    mimeType,
                    opts.quality
                );

                // Cleanup
                URL.revokeObjectURL(img.src);
            } catch (err) {
                URL.revokeObjectURL(img.src);
                reject(err);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load image for compression'));
        };

        img.src = URL.createObjectURL(file);
    });
}

/**
 * Compress image and return as File object
 */
export async function compressImageToFile(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const blob = await compressImage(file, options);

    // Generate new filename with correct extension
    const extension = opts.outputType === 'webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const newName = `${baseName}.${extension}`;

    return new File([blob], newName, {
        type: `image/${opts.outputType}`,
        lastModified: Date.now(),
    });
}

/**
 * Check if file should be compressed
 * Only compress images larger than 500KB (excluding GIFs)
 */
export function shouldCompress(file: File): boolean {
    const isImage = file.type.startsWith('image/');
    const isLarge = file.size > 500 * 1024; // 500KB threshold
    const isNotGif = file.type !== 'image/gif'; // Don't compress GIFs (animation)

    return isImage && isLarge && isNotGif;
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to get image dimensions'));
        };
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Estimate compressed size without actually compressing
 * Useful for showing progress to user
 */
export function estimateCompressedSize(file: File): number {
    // JPEG compression typical ratio
    const compressionRatio = 0.3; // ~70% reduction on average
    return Math.round(file.size * compressionRatio);
}
