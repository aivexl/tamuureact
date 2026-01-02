/**
 * useBackgroundRemoval Hook - Server-Side Edition
 * 
 * Uses Cloudflare Worker + HuggingFace API for high-quality background removal
 * 
 * Features:
 * - Server-side processing (fast, < 15 seconds)
 * - RMBG-1.4 model (high quality)
 * - 100% Free (HuggingFace free tier: 300 req/hour)
 */

import { useState, useCallback, useRef } from 'react';

// Worker URL - using workers.dev domain while tamuu.id DNS propagates
const WORKER_URL = import.meta.env.VITE_BG_REMOVER_URL || 'https://bg-remover.shafania57.workers.dev';

interface UseBackgroundRemovalReturn {
    processImage: (file: File) => Promise<void>;
    applyBackground: (type: 'transparent' | 'color' | 'gradient', value?: string) => Promise<Blob | null>;
    isLoading: boolean;
    isModelLoading: boolean;
    progress: number;
    downloadSpeed: string;
    originalImage: string | null;
    resultImage: string | null;
    maskData: ImageData | null;
    error: string | null;
    reset: () => void;
}

export const useBackgroundRemoval = (): UseBackgroundRemovalReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadSpeed, setDownloadSpeed] = useState('');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [maskData, setMaskData] = useState<ImageData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const reset = useCallback(() => {
        setIsLoading(false);
        setIsModelLoading(false);
        setOriginalImage(null);
        setResultImage(null);
        setMaskData(null);
        setError(null);
        setProgress(0);
        setDownloadSpeed('');
    }, []);

    const processImage = useCallback(async (file: File, retryCount = 0) => {
        setIsLoading(true);
        setError(null);
        setProgress(0);
        setResultImage(null);
        setMaskData(null);

        try {
            // Show original image
            const originalUrl = URL.createObjectURL(file);
            setOriginalImage(originalUrl);
            setProgress(10);

            // Store original for later use
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = reject;
                img.src = originalUrl;
            });

            const originalCanvas = document.createElement('canvas');
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            const origCtx = originalCanvas.getContext('2d', { willReadFrequently: true })!;
            origCtx.drawImage(img, 0, 0);
            originalCanvasRef.current = originalCanvas;

            setProgress(20);
            setDownloadSpeed('Mengirim ke server...');

            // Send to Worker API
            const formData = new FormData();
            formData.append('image', file);

            setProgress(30);
            setDownloadSpeed('Memproses di server...');
            setIsModelLoading(true);

            const response = await fetch(WORKER_URL, {
                method: 'POST',
                body: formData,
            });

            setIsModelLoading(false);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Handle model loading (503)
                if (response.status === 503 && retryCount < 3) {
                    setDownloadSpeed('Model sedang dimuat, menunggu...');
                    await new Promise(r => setTimeout(r, 20000));
                    return processImage(file, retryCount + 1);
                }

                throw new Error(errorData.error || 'Server processing failed');
            }

            setProgress(80);
            setDownloadSpeed('Menerima hasil...');

            // Get result blob
            const resultBlob = await response.blob();
            const resultUrl = URL.createObjectURL(resultBlob);
            setResultImage(resultUrl);

            setProgress(90);
            setDownloadSpeed('Memproses hasil...');

            // Extract mask for background changes
            const resultImg = new Image();
            await new Promise<void>((resolve, reject) => {
                resultImg.onload = () => resolve();
                resultImg.onerror = reject;
                resultImg.src = resultUrl;
            });

            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = img.width;
            maskCanvas.height = img.height;
            const maskCtx = maskCanvas.getContext('2d')!;
            maskCtx.drawImage(resultImg, 0, 0, img.width, img.height);
            const maskImageData = maskCtx.getImageData(0, 0, img.width, img.height);

            const alphaMask = new ImageData(img.width, img.height);
            for (let i = 0; i < img.width * img.height; i++) {
                const alpha = maskImageData.data[i * 4 + 3];
                alphaMask.data[i * 4] = alpha;
                alphaMask.data[i * 4 + 1] = alpha;
                alphaMask.data[i * 4 + 2] = alpha;
                alphaMask.data[i * 4 + 3] = 255;
            }
            setMaskData(alphaMask);

            setProgress(100);
            setDownloadSpeed('Selesai!');

            setTimeout(() => {
                setDownloadSpeed('');
                setIsLoading(false);
            }, 500);

        } catch (err) {
            console.error('Processing error:', err);
            setError(err instanceof Error ? err.message : String(err));
            setDownloadSpeed('');
            setIsLoading(false);
        }
    }, []);

    const applyBackground = useCallback(async (
        type: 'transparent' | 'color' | 'gradient',
        value?: string
    ): Promise<Blob | null> => {
        if (!originalCanvasRef.current || !maskData) return null;

        const original = originalCanvasRef.current;
        const width = original.width;
        const height = original.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        if (type === 'color' && value) {
            ctx.fillStyle = value;
            ctx.fillRect(0, 0, width, height);
        } else if (type === 'gradient' && value) {
            ctx.fillStyle = value;
            ctx.fillRect(0, 0, width, height);
        }

        const originalData = original.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, width, height);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d')!;

        for (let i = 0; i < width * height; i++) {
            originalData.data[i * 4 + 3] = maskData.data[i * 4];
        }
        tempCtx.putImageData(originalData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    setResultImage(URL.createObjectURL(blob));
                }
                resolve(blob);
            }, 'image/png');
        });
    }, [maskData]);

    return {
        processImage,
        applyBackground,
        isLoading,
        isModelLoading,
        progress,
        downloadSpeed,
        originalImage,
        resultImage,
        maskData,
        error,
        reset,
    };
};

export default useBackgroundRemoval;
