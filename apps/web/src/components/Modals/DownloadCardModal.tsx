import React, { useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { m, AnimatePresence } from 'framer-motion';
import { X, Download, Check, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { PremiumLoader } from '../ui/PremiumLoader';

interface DownloadCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    guest: any;
    invitation: any;
    publicDomain: string;
}

export const DownloadCardModal: React.FC<DownloadCardModalProps> = ({
    isOpen,
    onClose,
    guest,
    invitation,
    publicDomain
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<'idle' | 'downloading' | 'success'>('idle');

    const handleDownload = async () => {
        if (!cardRef.current || status !== 'idle') return;

        setStatus('downloading');
        
        try {
            // small delay to ensure rendering
            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                allowTaint: true,
                scale: 3, // Ultra high definition for enterprise standard
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 0,
                removeContainer: true
            });

            const link = document.createElement('a');
            link.download = `Undangan-${guest?.name?.replace(/\s+/g, '-') || 'Tamu'}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();

            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
            }, 3000);
        } catch (error) {
            console.error('[Download] Failed:', error);
            setStatus('idle');
        }
    };

    if (!guest || !invitation) return null;

    // Data parsing for card
    const og = invitation.og_settings ? (typeof invitation.og_settings === 'string' ? JSON.parse(invitation.og_settings) : invitation.og_settings) : {};
    const names = invitation.name?.split('&').map((n: string) => n.trim()) || [];
    const dt = og.time || invitation.event_date || '';
    const loc = og.loc || invitation.venue_name || 'LOCATION';
    
    // CEO DESIGN STANDARD: The QR code points to the /welcome route
    // which is intercepted by Cloudflare Pages Functions to inject OG meta tags.
    // This ensures that sharing the link result from the QR still generates a card.
    const personalLink = `${window.location.origin}/welcome/${invitation.id}/${guest.id}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#0A1128]/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 flex justify-between items-center border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                                    <ImageIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Kartu Undangan Digital</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preview & Download</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Preview Area */}
                        <div className="p-6 sm:p-10 flex flex-col items-center bg-slate-50/50">
                            {/* The Card Template (1:1 Aspect Ratio) */}
                            <div className="w-full max-w-[320px] aspect-square shadow-2xl rounded-2xl overflow-hidden relative group">
                                <div 
                                    ref={cardRef}
                                    className="w-full h-full bg-white flex flex-col p-[10%] relative leading-none select-none" 
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    {/* Top Section */}
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex flex-col items-start w-[65%]">
                                            <img src="/assets/tamuu-logo-header.png" alt="Tamuu" className="w-[25%] opacity-40 grayscale mb-[12%]" />
                                            <div className="text-[7px] text-slate-400 uppercase tracking-[6px] font-bold mb-[6%] opacity-70 leading-none">
                                                {(og.event || 'THE WEDDING OF').toUpperCase()}
                                            </div>
                                            
                                            <div className="flex flex-col items-start w-full">
                                                <div className="text-[22px] font-black text-slate-900 leading-[1] tracking-tighter uppercase mb-1">
                                                    {og.n1 || names[0] || 'MEMPELAI 1'}
                                                </div>
                                                <div className="text-[14px] text-slate-300 font-light italic mb-1">&</div>
                                                <div className="text-[22px] font-black text-slate-900 leading-[1] tracking-tighter uppercase">
                                                    {og.n2 || names[1] || 'MEMPELAI 2'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* QR CONTAINER: MUST BE PURE WHITE FOR SCANNER DISCOVERY */}
                                        <div className="w-[30%] aspect-square flex items-center justify-center bg-white rounded-xl p-2">
                                            <QRCode 
                                                value={personalLink} 
                                                size={512} 
                                                style={{ height: "auto", maxWidth: "100%", width: "100%" }} 
                                                viewBox={`0 0 256 256`} 
                                                level="H" 
                                            />
                                        </div>
                                    </div>

                                    {/* Middle Section */}
                                    <div className="flex flex-col items-start mt-[12%]">
                                        <div className="flex flex-col gap-1.5">
                                            {dt.includes(',') ? dt.split(',').map((part: string, i: number) => (
                                                <div key={i} className={`uppercase tracking-[2px] ${i === 0 ? 'text-[9px] text-slate-700 font-black' : 'text-[8px] text-slate-400 font-bold opacity-80'}`}>
                                                    {part.trim()}
                                                </div>
                                            )) : (
                                                <div className="text-[9px] text-slate-700 font-black uppercase tracking-[2px]">
                                                    {dt || 'EVENT DATE'}
                                                </div>
                                            )}
                                            <div className="text-[8px] text-slate-400 font-medium mt-1 opacity-80 uppercase tracking-[1px] leading-snug max-w-[80%]">
                                                {loc}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section */}
                                    <div className="mt-auto flex flex-col items-start w-full pt-4 border-t border-slate-50">
                                        <div className="text-[7px] text-slate-400 font-bold uppercase tracking-[3px] mb-2 opacity-50">Kepada Yth:</div>
                                        <div className="text-[16px] font-black text-slate-900 truncate w-full pr-4 uppercase tracking-tighter">
                                            {guest.name || 'TAMU UNDANGAN'}
                                        </div>
                                    </div>
                                </div>

                                {/* Success Overlay */}
                                <AnimatePresence>
                                    {status === 'success' && (
                                        <m.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center text-white p-6 text-center"
                                        >
                                            <m.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", damping: 12 }}
                                                className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-xl"
                                            >
                                                <Check size={40} strokeWidth={4} />
                                            </m.div>
                                            <h4 className="text-xl font-black uppercase tracking-tight">Berhasil!</h4>
                                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1">Kartu telah disimpan</p>
                                        </m.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <p className="mt-8 text-[10px] text-slate-400 text-center max-w-[280px] font-medium leading-relaxed uppercase tracking-widest">
                                Gunakan kartu ini untuk dikirimkan melalui WhatsApp agar tampilan lebih eksklusif.
                            </p>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 pt-0">
                            <button
                                onClick={handleDownload}
                                disabled={status !== 'idle'}
                                className={`
                                    w-full h-16 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 relative overflow-hidden
                                    ${status === 'downloading' ? 'bg-slate-900 cursor-wait' : ''}
                                    ${status === 'success' ? 'bg-emerald-500 shadow-xl shadow-emerald-200' : 'bg-slate-900 hover:bg-black text-white shadow-2xl shadow-indigo-100'}
                                    disabled:opacity-100
                                `}
                            >
                                {status === 'idle' && (
                                    <>
                                        <Download size={20} className="text-teal-400" />
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">Unduh Kartu Gambar</span>
                                    </>
                                )}

                                {status === 'downloading' && (
                                    <PremiumLoader variant="inline" size="sm" showLabel label="Generating..." color="white" />
                                )}

                                {status === 'success' && (
                                    <>
                                        <Check size={20} />
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">Tersimpan</span>
                                    </>
                                )}
                            </button>
                            
                            <button 
                                onClick={onClose}
                                className="w-full mt-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-600 transition-colors"
                            >
                                Tutup Panel
                            </button>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};
