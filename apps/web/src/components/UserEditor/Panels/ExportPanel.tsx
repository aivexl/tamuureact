import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Smartphone, FileImage, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useExportPDF } from '@/hooks/useExportPDF';

interface ExportPanelProps {
    previewRef: React.RefObject<HTMLElement>;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ previewRef }) => {
    const { exportToPDF, exportToImage, isExporting, progress, error } = useExportPDF();
    const [exportSuccess, setExportSuccess] = useState(false);

    const handleExport = async (type: 'pdf' | 'image') => {
        setExportSuccess(false);

        // Sync with store - system is optimized for 'mobile' format
        useStore.getState().setExportFormat('mobile');

        // Allow layout shifts and mounting for a moment
        await new Promise(r => setTimeout(r, 400));

        if (!previewRef.current) {
            console.error('[Export] Ref is still null after mounting attempt');
            useStore.getState().setExportFormat(null);
            return;
        }

        if (type === 'pdf') {
            await exportToPDF('mobile', previewRef.current);
        } else {
            await exportToImage('mobile', previewRef.current);
        }

        // Reset
        useStore.getState().setExportFormat(null);

        if (!error) {
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        }
    };

    return (
        <div className="space-y-8 py-4">
            {/* Header info */}
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-teal-600 flex-shrink-0">
                    <Smartphone className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter">Mobile Optimization</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Ekspor dioptimalkan untuk tampilan smartphone (WhatsApp & Instagram Story).</p>
                </div>
            </div>

            {/* Export Actions */}
            <div className="space-y-4">
                <m.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleExport('image')}
                    disabled={isExporting}
                    className="w-full h-20 flex items-center justify-between px-8 bg-white border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50/10 text-slate-700 font-bold rounded-[2rem] transition-all disabled:opacity-50 group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-teal-600 group-hover:bg-white transition-colors">
                            <FileImage className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Download Gambar</p>
                            <p className="text-[10px] text-slate-400 font-medium">Format PNG (High Quality)</p>
                        </div>
                    </div>
                    {isExporting && !exportSuccess ? <Loader2 className="w-5 h-5 animate-spin text-teal-600" /> : <div className="text-xs font-black text-slate-300 uppercase tracking-widest">PNG</div>}
                </m.button>

                <m.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="w-full h-20 flex items-center justify-between px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-[2rem] transition-all disabled:opacity-50 shadow-xl shadow-teal-500/20 group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black uppercase tracking-tight">Download PDF (HD)</p>
                            <p className="text-[10px] text-teal-100/70 font-medium">Format PDF Dokumen HD</p>
                        </div>
                    </div>
                    {isExporting && !exportSuccess ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <div className="text-xs font-black text-teal-400 uppercase tracking-widest">PDF</div>}
                </m.button>
            </div>

            {/* Progress Bar */}
            {isExporting && (
                <div className="space-y-2 px-2">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <m.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                        />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">
                        Sedang Mengekspor... {Math.round(progress)}%
                    </p>
                </div>
            )}

            {/* Success / Error Messages */}
            {exportSuccess && (
                <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-5 bg-emerald-50 border border-emerald-100 rounded-3xl">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-emerald-800 uppercase tracking-tight">Berhasil!</p>
                        <p className="text-[10px] text-emerald-600 font-medium">File undangan sedang diunduh secara otomatis.</p>
                    </div>
                </m.div>
            )}
            {error && (
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl">
                    <p className="text-xs font-black text-rose-800 uppercase tracking-tight mb-1">Gagal Ekspor</p>
                    <p className="text-[10px] text-rose-600 font-medium leading-relaxed">{error}</p>
                </div>
            )}
        </div>
    );
};
