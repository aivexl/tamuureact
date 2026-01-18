import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useStore } from '@/store/useStore';

export type ExportFormat = 'mobile' | 'desktop' | 'print';

interface ExportConfig {
    width: number;
    height: number;
    orientation: 'portrait' | 'landscape';
    label: string;
}

const FORMAT_CONFIG: Record<ExportFormat, ExportConfig> = {
    mobile: {
        width: 1080,
        height: 2500, // Optimized ratio (approx 9:21) matching 960 design units for better spacing
        orientation: 'portrait',
        label: 'Mobile (High-Fidelity)'
    },
    desktop: {
        width: 1280, // Slightly wider for Orbit visibility but still readable
        height: 720,
        orientation: 'landscape',
        label: 'Desktop (16:9)'
    },
    print: {
        width: 794, // A4 at 96 DPI
        height: 1123,
        orientation: 'portrait',
        label: 'Cetak (A4)'
    }
};

interface UseExportPDFResult {
    exportToPDF: (format: ExportFormat, targetElement: HTMLElement) => Promise<void>;
    exportToImage: (format: ExportFormat, targetElement: HTMLElement) => Promise<void>;
    isExporting: boolean;
    progress: number;
    error: string | null;
}

export const useExportPDF = (): UseExportPDFResult => {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { sections, slug } = useStore();

    const captureElement = useCallback(async (
        element: HTMLElement,
        config: ExportConfig,
        format: ExportFormat
    ): Promise<HTMLCanvasElement> => {
        // DESIGN PARITY: Orbit is 1080px wide. Core is 414px wide.
        const exportDesignWidth = format === 'desktop' ? 1080 : 414;
        const targetScale = config.width / exportDesignWidth;

        return html2canvas(element, {
            scale: targetScale * 2, // 2x for HD quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a0a0a',
            width: exportDesignWidth,
            height: element.scrollHeight,
            windowWidth: exportDesignWidth,
            windowHeight: element.scrollHeight,
            logging: false,
        });
    }, []);

    const exportToImage = useCallback(async (
        format: ExportFormat,
        targetElement: HTMLElement
    ) => {
        setIsExporting(true);
        setProgress(0);
        setError(null);

        try {
            const config = FORMAT_CONFIG[format];
            setProgress(30);

            // Ensure element layout is ready and clean
            const exportDesignWidth = format === 'desktop' ? 1080 : 414;
            const originalStyle = targetElement.style.cssText;
            targetElement.style.display = 'block';
            targetElement.style.height = 'auto'; // Let it grow
            targetElement.style.width = `${exportDesignWidth}px`;

            const canvas = await captureElement(targetElement, config, format);
            targetElement.style.cssText = originalStyle;

            setProgress(80);

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${slug || 'invitation'}-${format}.png`;
                    link.click();
                    URL.revokeObjectURL(url);
                }
            }, 'image/png', 1.0);

            setProgress(100);
        } catch (err) {
            console.error('[Export] Failed to export image:', err);
            setError('Gagal mengekspor gambar. Silakan coba lagi.');
        } finally {
            setIsExporting(false);
        }
    }, [captureElement, slug]);

    const exportToPDF = useCallback(async (
        format: ExportFormat,
        targetElement: HTMLElement
    ) => {
        setIsExporting(true);
        setProgress(0);
        setError(null);

        try {
            const config = FORMAT_CONFIG[format];
            setProgress(20);

            const exportDesignWidth = format === 'desktop' ? 1080 : 414;
            const originalStyle = targetElement.style.cssText;
            targetElement.style.display = 'block';
            targetElement.style.height = 'auto';
            targetElement.style.width = `${exportDesignWidth}px`;

            const canvas = await captureElement(targetElement, config, format);
            targetElement.style.cssText = originalStyle;

            setProgress(60);

            // Create PDF based on standard design width
            let outputWidth = config.width;

            // For invitations (portrait), if Desktop (1920) is too wide, we might hit 14400 faster.
            // But we'll follow the user's wish: "tidak harus real seukuran dekstp"
            if (format === 'desktop' && canvas.height > canvas.width) {
                outputWidth = 1080; // Cap at 1080 for long invitations to avoid excessive scaling
            }

            let outputHeight = (canvas.height / canvas.width) * outputWidth;

            // CRITICAL: jsPDF 14400 Limit Safeguard
            const MAX_DIM = 14400;
            if (outputHeight > MAX_DIM) {
                const ratio = MAX_DIM / outputHeight;
                outputHeight = MAX_DIM;
                outputWidth = outputWidth * ratio;
                console.warn(`[Export] Output height exceeds 14400 threshold. Scaling down to [${Math.round(outputWidth)} x ${MAX_DIM}]`);
            }

            const pdf = new jsPDF({
                orientation: config.orientation,
                unit: 'px',
                format: [outputWidth, outputHeight]
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            pdf.addImage(imgData, 'PNG', 0, 0, outputWidth, outputHeight);
            setProgress(90);

            // Download
            pdf.save(`${slug || 'invitation'}-${format}.pdf`);
            setProgress(100);

        } catch (err) {
            console.error('[Export] Failed to export PDF:', err);
            setError('Gagal mengekspor PDF. Proyek mungkin terlalu besar atau terjadi kesalahan.');
        } finally {
            setIsExporting(false);
        }
    }, [captureElement, slug]);

    return {
        exportToPDF,
        exportToImage,
        isExporting,
        progress,
        error
    };
};
