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
        height: 1920,
        orientation: 'portrait',
        label: 'Mobile (9:16)'
    },
    desktop: {
        width: 1920,
        height: 1080,
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
        config: ExportConfig
    ): Promise<HTMLCanvasElement> => {
        return html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a0a0a',
            width: config.width,
            height: config.height,
            windowWidth: config.width,
            windowHeight: config.height,
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

            const canvas = await captureElement(targetElement, config);
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

            // Capture the element
            const canvas = await captureElement(targetElement, config);
            setProgress(60);

            // Create PDF
            const pdf = new jsPDF({
                orientation: config.orientation,
                unit: 'px',
                format: [config.width, config.height]
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            pdf.addImage(imgData, 'PNG', 0, 0, config.width, config.height);
            setProgress(90);

            // Download
            pdf.save(`${slug || 'invitation'}-${format}.pdf`);
            setProgress(100);

        } catch (err) {
            console.error('[Export] Failed to export PDF:', err);
            setError('Gagal mengekspor PDF. Silakan coba lagi.');
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
