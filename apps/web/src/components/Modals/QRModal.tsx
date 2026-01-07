import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { m, AnimatePresence } from 'framer-motion';
import { X, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
    guestName: string;
    url: string;
    tier?: string;
}

export const QRModal: React.FC<QRModalProps> = ({
    isOpen,
    onClose,
    guestName,
    url,
    tier = 'reguler'
}) => {
    const qrRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (qrRef.current) {
            const canvas = await html2canvas(qrRef.current, { backgroundColor: '#ffffff', scale: 2 });
            const link = document.createElement('a');
            link.download = `QR-${guestName.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    const tierColor = {
        reguler: 'bg-slate-100 text-slate-600',
        vip: 'bg-amber-100 text-amber-700',
        vvip: 'bg-purple-100 text-purple-700',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 pb-0 flex justify-between items-start">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Kode Akses Tamu</h3>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col items-center">
                            {/* QR Card - Targeted for download */}
                            <div ref={qrRef} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col items-center w-full">
                                <div className="p-4 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.05)] mb-4">
                                    <QRCode value={url} size={200} viewBox={`0 0 256 256`} level="H" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 text-center leading-tight mb-2">{guestName}</h2>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tierColor[tier as keyof typeof tierColor] || tierColor.reguler}`}>
                                    {tier}
                                </span>
                                <p className="mt-4 text-[10px] text-slate-400 font-medium uppercase tracking-widest">Scan untuk Check-In</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 w-full mt-6">
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="text-xs uppercase tracking-wider">Simpan</span>
                                </button>
                                {/* Future: Share button */}
                            </div>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};
