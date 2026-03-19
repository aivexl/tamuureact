import React, { useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Clock, Download, X, ScanLine, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { PremiumLoader } from '../ui/PremiumLoader';

interface ThermalReceiptProps {
    guest: {
        id: string;
        check_in_code?: string;
        name: string;
        tier?: string;
        table_number?: string;
        checked_in_at?: string;
        checked_out_at?: string;
    };
    status: 'CHECK_IN_SUCCESS' | 'CHECK_OUT_SUCCESS' | 'ALREADY_CHECKED_OUT';
    isVisible: boolean;
    onClose?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ guest, status, isVisible, onClose }) => {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Safety check: Don't render if guest is missing
    if (!guest) return null;

    const isCheckOut = status === 'CHECK_OUT_SUCCESS' || status === 'ALREADY_CHECKED_OUT';
    
    // Formatting times
    const formatTime = (isoString?: string) => {
        if (!isoString) return '-';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        } catch (e) {
            return '-';
        }
    };

    const checkInTime = formatTime(guest.checked_in_at);
    const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const handleDownload = async () => {
        if (!receiptRef.current || isDownloading || isSuccess) return;
        
        setIsDownloading(true);
        
        try {
            // Processing delay for UX
            await new Promise(resolve => setTimeout(resolve, 800));

            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: '#ffffff',
                scale: 3,
                logging: false,
                useCORS: true,
                allowTaint: true
            });
            
            const link = document.createElement('a');
            link.download = `tamuu-receipt-${guest.name.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();

            setIsDownloading(false);
            setIsSuccess(true);
            
            // Reset state back to "SIMPAN BUKTI" after 2 seconds
            setTimeout(() => {
                setIsSuccess(false);
            }, 2000);
        } catch (error) {
            console.error('Download failed:', error);
            setIsDownloading(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md overflow-y-auto">
                    {/* SCROLLABLE CONTENT WRAPPER */}
                    <div className="min-h-full w-full flex flex-col items-center justify-start p-4 py-16 md:justify-center">
                        
                        {/* Manual Close Button (Fixed Top Right) */}
                        <button 
                            onClick={onClose}
                            className="fixed top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white backdrop-blur-xl z-[120] transition-all active:scale-90"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <m.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="relative w-full flex flex-col items-center"
                        >
                            {/* THE RECEIPT CONTAINER - Monochrome & Text Only Style */}
                            <div ref={receiptRef} className="bg-white shadow-2xl overflow-hidden rounded-sm w-full max-w-[300px] border border-slate-100">
                                {/* Zigzag Top Edge */}
                                <div className="h-2 w-full bg-white" style={{
                                    clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
                                }} />

                                <div className="px-8 py-10 flex flex-col items-center text-black">
                                    {/* Tamuu Logo */}
                                    <img 
                                        src="/images/logo-tamuu-vfinal-v1.webp" 
                                        alt="Tamuu" 
                                        className="h-8 w-auto mb-6 brightness-0" 
                                    />

                                    <h2 className="text-lg font-black uppercase tracking-widest mb-8 text-center border-b border-black pb-2 w-full">
                                        {isCheckOut ? 'BERHASIL KELUAR' : 'BERHASIL MASUK'}
                                    </h2>

                                    {/* Details - Plain Text Style */}
                                    <div className="w-full space-y-5 font-mono text-[12px] leading-tight">
                                        <div className="flex flex-col">
                                            <span className="uppercase text-[10px] font-bold">Nama Tamu</span>
                                            <span className="font-black text-sm uppercase">{guest.name}</span>
                                            <span className="uppercase text-[10px] font-black mt-0.5">ID: {guest.check_in_code || guest.id.substring(0, 8)}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col">
                                                <span className="uppercase text-[10px] font-bold">Tier</span>
                                                <span className="font-black uppercase">{guest.tier || 'REGULER'}</span>
                                            </div>
                                            <div className="flex flex-col items-end text-right">
                                                <span className="uppercase text-[10px] font-bold">Meja</span>
                                                <span className="font-black">{guest.table_number || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="w-full border-t border-dashed border-black pt-4" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col">
                                                <span className="uppercase text-[10px] font-bold">Jam Masuk</span>
                                                <span className="font-black">{isCheckOut ? checkInTime : currentTime}</span>
                                            </div>
                                            <div className="flex flex-col items-end text-right">
                                                <span className="uppercase text-[10px] font-bold">Jam Keluar</span>
                                                <span className="font-black">{isCheckOut ? currentTime : '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Minimalist Separator */}
                                    <div className="w-full border-t border-black my-8" />

                                    {/* Footer */}
                                    <p className="text-center text-[10px] font-bold uppercase tracking-tight">
                                        TERIMA KASIH ATAS <br/> KEHADIRAN ANDA
                                    </p>
                                </div>

                                {/* Zigzag Bottom Edge */}
                                <div className="h-4 w-full bg-white" style={{
                                    clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)'
                                }} />
                            </div>

                            {/* Format Hint */}
                            <p className="mt-8 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                Ukuran Standar Kertas Thermal 57mm
                            </p>

                            {/* ACTION BUTTONS */}
                            <div className="mt-4 w-full max-w-[300px] flex flex-col gap-3">
                                <button 
                                    onClick={handleDownload}
                                    disabled={isDownloading || isSuccess}
                                    className={`w-full h-14 font-black uppercase tracking-[0.2em] text-[11px] rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${
                                        isSuccess ? 'bg-green-500 text-white' : 'bg-white text-black'
                                    }`}
                                >
                                    {isDownloading ? (
                                        <PremiumLoader variant="inline" size="sm" color="black" />
                                    ) : isSuccess ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            BERHASIL
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            SIMPAN BUKTI
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    onClick={onClose}
                                    className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] border border-white/10 backdrop-blur-xl"
                                >
                                    <ScanLine className="w-4 h-4" />
                                    KEMBALI KE SCANNER
                                </button>
                            </div>
                        </m.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};
