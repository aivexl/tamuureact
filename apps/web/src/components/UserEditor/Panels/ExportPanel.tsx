import React, { useState } from 'react';
import { m } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Monitor, Printer, FileImage, FileText, Loader2, CheckCircle2, Video, Square, Clock, Lock, Crown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useExportPDF, ExportFormat } from '@/hooks/useExportPDF';
import { useExportVideo, VideoFormat } from '@/hooks/useExportVideo';

interface ExportPanelProps {
    previewRef: React.RefObject<HTMLElement>;
}

const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'mobile', label: 'Mobile', icon: <Smartphone className="w-5 h-5" />, desc: 'Untuk WhatsApp, Instagram Story' },
    { id: 'desktop', label: 'Desktop', icon: <Monitor className="w-5 h-5" />, desc: 'Untuk email, presentasi' },
    { id: 'print', label: 'Cetak', icon: <Printer className="w-5 h-5" />, desc: 'Format A4 untuk cetak fisik' },
];

const DURATION_OPTIONS = [
    { value: 15000, label: '15 detik' },
    { value: 30000, label: '30 detik' },
    { value: 60000, label: '60 detik' },
];

export const ExportPanel: React.FC<ExportPanelProps> = ({ previewRef }) => {
    const navigate = useNavigate();
    const { user } = useStore();
    const { exportToPDF, exportToImage, isExporting: isPDFExporting, progress: pdfProgress, error: pdfError } = useExportPDF();
    const { startRecording, stopRecording, isRecording, progress: videoProgress, error: videoError } = useExportVideo();

    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('mobile');
    const [selectedDuration, setSelectedDuration] = useState(30000);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

    const isExporting = isPDFExporting || isRecording;
    const progress = isPDFExporting ? pdfProgress : videoProgress;
    const error = pdfError || videoError;

    const handleExport = async (type: 'pdf' | 'image') => {
        if (!previewRef.current) return;
        setExportSuccess(false);
        if (type === 'pdf') {
            await exportToPDF(selectedFormat, previewRef.current);
        } else {
            await exportToImage(selectedFormat, previewRef.current);
        }
        if (!error) {
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        }
    };

    const handleVideoRecord = async () => {
        if (!previewRef.current) return;
        setExportSuccess(false);
        const videoFormat: VideoFormat = selectedFormat === 'print' ? 'mobile' : selectedFormat as VideoFormat;
        await startRecording(videoFormat, previewRef.current, selectedDuration);
        if (!error) {
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                    onClick={() => setActiveTab('image')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'image' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                >
                    <FileImage className="w-4 h-4 inline mr-2" />
                    Gambar / PDF
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'video' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                >
                    <Video className="w-4 h-4 inline mr-2" />
                    Video
                    <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase rounded">New</span>
                </button>
            </div>

            {/* Format Selection */}
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                    Pilih Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {FORMAT_OPTIONS.filter(opt => activeTab === 'image' || opt.id !== 'print').map((opt) => (
                        <m.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedFormat(opt.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedFormat === opt.id ? 'border-teal-500 bg-teal-500/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                            <div className={`mb-2 ${selectedFormat === opt.id ? 'text-teal-600' : 'text-slate-400'}`}>
                                {opt.icon}
                            </div>
                            <p className={`text-sm font-bold ${selectedFormat === opt.id ? 'text-teal-700' : 'text-slate-700'}`}>
                                {opt.label}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-tight">{opt.desc}</p>
                        </m.button>
                    ))}
                </div>
            </div>

            {/* Duration Selector (Video Only) */}
            {activeTab === 'video' && (
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                        <Clock className="w-3 h-3 inline mr-1" /> Durasi Rekaman
                    </label>
                    <div className="flex gap-2">
                        {DURATION_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setSelectedDuration(opt.value)}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${selectedDuration === opt.value ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Export Actions */}
            <div className="space-y-3 relative">
                {activeTab === 'image' ? (
                    <>
                        <m.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => handleExport('image')} disabled={isExporting}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all disabled:opacity-50">
                            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileImage className="w-5 h-5" />}
                            Download Gambar (PNG)
                        </m.button>
                        <m.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => handleExport('pdf')} disabled={isExporting}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20">
                            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                            Download PDF (HD)
                        </m.button>
                    </>
                ) : (
                    <div className="relative group">
                        <m.button
                            whileHover={user?.tier === 'vvip' ? { scale: 1.01 } : {}}
                            whileTap={user?.tier === 'vvip' ? { scale: 0.99 } : {}}
                            onClick={user?.tier === 'vvip' ? (isRecording ? stopRecording : handleVideoRecord) : () => navigate('/upgrade')}
                            className={`w-full flex items-center justify-center gap-3 px-6 py-4 font-bold rounded-2xl transition-all shadow-lg ${user?.tier !== 'vvip'
                                    ? 'bg-slate-800 text-white opacity-90'
                                    : isRecording ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/20'
                                }`}
                        >
                            {user?.tier !== 'vvip' ? (
                                <>
                                    <Lock className="w-4 h-4 mr-1 text-[#FFBF00]" />
                                    Unlock Video Export (VVIP)
                                </>
                            ) : isRecording ? (
                                <>
                                    <Square className="w-5 h-5" />
                                    Hentikan Rekaman
                                </>
                            ) : (
                                <>
                                    <Video className="w-5 h-5" />
                                    Mulai Rekam Video
                                </>
                            )}
                        </m.button>

                        {user?.tier !== 'vvip' && (
                            <div className="absolute inset-x-0 -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-[#0A1128] text-[#FFBF00] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl border border-white/10 flex items-center gap-2 w-max mx-auto">
                                    <Crown className="w-3 h-3" />
                                    Available for VVIP Tier only
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {isExporting && (
                <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <m.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                            className={`h-full ${isRecording ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'}`} />
                    </div>
                    <p className="text-xs text-slate-400 text-center">
                        {isRecording ? 'Merekam...' : 'Mengekspor...'} {Math.round(progress)}%
                    </p>
                </div>
            )}

            {/* Success / Error */}
            {exportSuccess && (
                <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700">Berhasil! File sedang diunduh.</p>
                </m.div>
            )}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                    <p className="text-sm font-medium text-rose-700">{error}</p>
                </div>
            )}
        </div>
    );
};
