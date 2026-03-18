import React, { useRef, useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, User, Ticket, Star, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { PremiumLoader } from '../ui/PremiumLoader';

interface GuestQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    guestName: string;
    checkInCode: string;
    tier?: string;
}

export const GuestQRModal: React.FC<GuestQRModalProps> = ({ 
    isOpen, 
    onClose, 
    guestName, 
    checkInCode,
    tier = 'reguler'
}) => {
    const [downloadState, setDownloadState] = useState<'idle' | 'loading' | 'success'>('idle');
    const passRef = useRef<HTMLDivElement>(null);
    const isVIP = tier === 'vip' || tier === 'vvip';

    // RESET STATE ON CLOSE
    useEffect(() => {
        if (!isOpen) {
            setDownloadState('idle');
        }
    }, [isOpen]);

    const handleDownload = async () => {
        if (!passRef.current) return;
        setDownloadState('loading');
        try {
            // High-fidelity capture for enterprise standard
            const canvas = await html2canvas(passRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false
            });
            const link = document.createElement('a');
            link.download = `Tamuu_Pass_${guestName.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            setDownloadState('success');
            setTimeout(() => setDownloadState('idle'), 3000);
        } catch (e) {
            console.error('[GuestQRModal] Export failed:', e);
            setDownloadState('idle');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100001] flex items-center justify-center p-6">
                    {/* Backdrop with extreme blur */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                    />

                    {/* Modal Content */}
                    <m.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="relative w-full max-w-sm flex flex-col items-center gap-8"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-14 right-0 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white/50 transition-all active:scale-90"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Apple Wallet Style Pass */}
                        <div 
                            ref={passRef}
                            className="relative w-full aspect-[3/4.3] flex flex-col overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
                            style={{ 
                                borderRadius: 32,
                                background: isVIP 
                                    ? 'linear-gradient(135deg, #0A1128 0%, #1C2541 100%)' 
                                    : '#FFFFFF',
                                border: isVIP ? '1px solid rgba(255,191,0,0.4)' : '1px solid rgba(0,0,0,0.08)'
                            }}
                        >
                            {/* VIP Shimmer */}
                            {isVIP && (
                                <m.div 
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
                                />
                            )}

                            {/* Pass Header */}
                            <div className={`p-8 flex justify-between items-start border-b border-dashed ${isVIP ? 'border-white/10' : 'border-black/10'}`}>
                                <div className="space-y-2">
                                    <img 
                                        src="/assets/tamuu-logo-header.png" 
                                        className="h-5 w-auto object-contain block" 
                                        alt="Tamuu" 
                                    />
                                    <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isVIP ? 'text-[#FFBF00]' : 'text-slate-400'}`}>
                                        Kartu Akses Tamu
                                    </p>
                                </div>
                                {isVIP && <Star className="w-5 h-5 text-[#FFBF00] fill-[#FFBF00] animate-pulse" />}
                            </div>

                            {/* Pass Main Body */}
                            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
                                <div className="p-5 rounded-[2.8rem] bg-white shadow-2xl border border-black/5">
                                    <QRCode
                                        value={checkInCode}
                                        size={180}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                        level="H"
                                    />
                                </div>

                                <div className="text-center space-y-3">
                                    <div className={`flex items-center justify-center gap-2 text-[10px] tracking-[0.25em] uppercase font-black ${isVIP ? 'text-white/40' : 'text-slate-400'}`}>
                                        <User className="w-3 h-3" /> Nama Tamu
                                    </div>
                                    <h3 className={`text-3xl font-black tracking-tighter leading-none ${isVIP ? 'text-white' : 'text-slate-900'}`}>
                                        {guestName}
                                    </h3>
                                    <div className="flex flex-col items-center mt-6">
                                        <div className={`text-[8px] font-black uppercase tracking-[0.4em] mb-2 ${isVIP ? 'text-white/20' : 'text-slate-300'}`}>ID Tamu</div>
                                        <p className={`font-mono text-xs font-black tracking-[0.5em] px-5 py-1.5 rounded-full ${isVIP ? 'bg-white/5 text-[#FFBF00]' : 'bg-slate-100 text-slate-600'}`}>
                                            {checkInCode}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pass Bottom Section */}
                            <div className={`p-8 mt-auto grid grid-cols-2 gap-4 border-t border-dashed ${isVIP ? 'border-white/10' : 'border-black/10'} bg-black/5`}>
                                <div className="space-y-1.5">
                                    <span className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] block">Status</span>
                                    <span className={`text-[11px] font-bold uppercase flex items-center gap-1.5 ${isVIP ? 'text-[#FFBF00]' : 'text-slate-600'}`}>
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Akses Valid
                                    </span>
                                </div>
                                <div className="space-y-1.5 text-right">
                                    <span className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] block">Verifikasi</span>
                                    <span className="text-[11px] font-bold text-emerald-500 uppercase flex items-center justify-end gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi
                                    </span>
                                </div>
                            </div>

                            {/* Visual Punch Holes */}
                            <div className={`absolute left-0 top-[23%] -translate-x-1/2 w-8 h-8 rounded-full ${isVIP ? 'bg-black' : 'bg-black/95'}`} />
                            <div className={`absolute right-0 top-[23%] translate-x-1/2 w-8 h-8 rounded-full ${isVIP ? 'bg-black' : 'bg-black/95'}`} />
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col gap-4">
                            <m.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDownload}
                                disabled={downloadState === 'loading'}
                                className="w-full h-16 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                            >
                                {downloadState === 'loading' ? (
                                    <PremiumLoader variant="inline" size="sm" color="#000000" />
                                ) : downloadState === 'success' ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in duration-300" />
                                ) : (
                                    <Download className="w-6 h-6" />
                                )}
                            </m.button>
                            
                            <p className="text-[10px] text-white/40 text-center font-bold uppercase tracking-[0.3em] leading-relaxed">
                                Present this pass at the security <br/> checkpoint for verification
                            </p>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};
