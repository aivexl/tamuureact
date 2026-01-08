import { useState, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';

export type VideoFormat = 'mobile' | 'desktop';

interface VideoConfig {
    width: number;
    height: number;
    label: string;
}

const VIDEO_CONFIG: Record<VideoFormat, VideoConfig> = {
    mobile: { width: 1080, height: 1920, label: 'Mobile (9:16)' },
    desktop: { width: 1920, height: 1080, label: 'Desktop (16:9)' }
};

interface UseExportVideoResult {
    startRecording: (format: VideoFormat, targetElement: HTMLElement, durationMs?: number) => Promise<void>;
    stopRecording: () => void;
    isRecording: boolean;
    progress: number;
    error: string | null;
}

export const useExportVideo = (): UseExportVideoResult => {
    const [isRecording, setIsRecording] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { slug } = useStore();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
        }
        setIsRecording(false);
    }, []);

    const startRecording = useCallback(async (
        format: VideoFormat,
        targetElement: HTMLElement,
        durationMs: number = 30000 // Default 30 seconds
    ) => {
        setIsRecording(true);
        setProgress(0);
        setError(null);
        chunksRef.current = [];

        try {
            const config = VIDEO_CONFIG[format];

            // Create a canvas to capture the element
            const canvas = document.createElement('canvas');
            canvas.width = config.width;
            canvas.height = config.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            // Get the stream from canvas
            const stream = canvas.captureStream(30); // 30 FPS

            // Setup MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000 // 5 Mbps for quality
            });

            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);

                // Trigger download
                const a = document.createElement('a');
                a.href = url;
                a.download = `${slug || 'invitation'}-${format}.webm`;
                a.click();

                URL.revokeObjectURL(url);
                setProgress(100);
                setIsRecording(false);
            };

            mediaRecorder.onerror = (event) => {
                console.error('[VideoExport] Recording error:', event);
                setError('Gagal merekam video. Silakan coba lagi.');
                setIsRecording(false);
            };

            // Start recording
            mediaRecorder.start(100); // Collect data every 100ms

            // Animation loop to capture frames
            let startTime = Date.now();
            const captureFrame = async () => {
                if (!isRecording) return;

                const elapsed = Date.now() - startTime;
                const progressPercent = Math.min((elapsed / durationMs) * 100, 99);
                setProgress(progressPercent);

                // Use html2canvas-like capture
                try {
                    const { default: html2canvas } = await import('html2canvas');
                    const capturedCanvas = await html2canvas(targetElement, {
                        scale: 1,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#0a0a0a',
                        width: config.width,
                        height: config.height,
                        windowWidth: config.width,
                        windowHeight: config.height,
                    });

                    ctx.drawImage(capturedCanvas, 0, 0, config.width, config.height);
                } catch (err) {
                    console.warn('[VideoExport] Frame capture failed:', err);
                }

                if (elapsed < durationMs && mediaRecorderRef.current?.state === 'recording') {
                    requestAnimationFrame(captureFrame);
                } else {
                    stopRecording();
                }
            };

            // Start capturing
            requestAnimationFrame(captureFrame);

            // Safety timeout
            recordingTimeoutRef.current = setTimeout(() => {
                stopRecording();
            }, durationMs + 1000);

        } catch (err) {
            console.error('[VideoExport] Failed to start recording:', err);
            setError('Gagal memulai rekaman. Pastikan browser mendukung fitur ini.');
            setIsRecording(false);
        }
    }, [slug, isRecording, stopRecording]);

    return {
        startRecording,
        stopRecording,
        isRecording,
        progress,
        error
    };
};
