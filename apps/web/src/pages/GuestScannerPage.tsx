import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    XCircle,
    ArrowLeft,
    QrCode,
    RefreshCw,
    ShieldCheck
} from 'lucide-react';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { ThermalReceipt } from '../components/Shared/ThermalReceipt';
import { guests as guestsApi, admin as adminApi } from '../lib/api';

/**
 * GuestScannerPage - Sistem Kontrol Akses Undangan Otomatis (Smart Toggle)
 */
export const GuestScannerPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();

    // UI State
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastGuest, setLastGuest] = useState<any>(null);
    const [checkInStatus, setCheckInStatus] = useState<'CHECK_IN_SUCCESS' | 'CHECK_OUT_SUCCESS' | 'ALREADY_CHECKED_OUT' | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Suara Notifikasi
    const playSound = (type: 'success' | 'error') => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = type === 'success' ? 'sine' : 'square';
            oscillator.frequency.setValueAtTime(type === 'success' ? 880 : 220, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(type === 'success' ? 440 : 110, context.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.1);
        } catch (e) {}
    };

    // Auto-reset timer for receipt
    useEffect(() => {
        if (showReceipt) {
            const timer = setTimeout(() => {
                setShowReceipt(false);
                setLastGuest(null);
                setCheckInStatus(null);
                startScanner(true);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showReceipt]);

    useEffect(() => {
        const autoInitialize = async () => {
            try {
                if (navigator.permissions && navigator.permissions.query) {
                    const status = await navigator.permissions.query({ name: 'camera' as any });
                    if (status.state === 'granted') {
                        startScanner(true);
                    }
                } else {
                    startScanner(true);
                }
            } catch (e) {}
        };

        autoInitialize();

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {});
            }
        };
    }, []);

    const startScanner = async (isAuto = false) => {
        setError(null);
        setIsScanning(true);
        setLastGuest(null);
        setCheckInStatus(null);
        setShowReceipt(false);

        const config = {
            fps: 20,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        };

        try {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (text) => handleScanSuccess(text),
                (msg) => { if (!msg.includes("NotFoundException")) return; }
            );
        } catch (err: any) {
            setIsScanning(false);
            if (!isAuto) {
                setError("Kamera tidak dapat diakses.");
            }
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        setIsScanning(false);
        if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop().catch(() => {});
        }

        let guestId: string | null = null;
        let guestCode: string | null = null;

        try {
            if (decodedText.startsWith('http')) {
                const url = new URL(decodedText);
                const toParam = url.searchParams.get('to');
                if (toParam) {
                    if (toParam.length > 20) guestId = toParam;
                    else guestCode = toParam;
                } else {
                    const parts = url.pathname.split('/').filter(Boolean);
                    const last = parts[parts.length - 1];
                    if (last.length > 20) guestId = last;
                    else guestCode = last;
                }
            } else if (decodedText.startsWith('{')) {
                const data = JSON.parse(decodedText);
                guestId = data.id || null;
                guestCode = data.check_in_code || data.code || null;
            } else {
                if (decodedText.length > 20) guestId = decodedText;
                else guestCode = decodedText;
            }
        } catch (e) {
            guestCode = decodedText;
        }

        await performAction(guestId, guestCode);
    };

    const performAction = async (guestId: string | null, guestCode: string | null) => {
        setIsLoading(true);
        setError(null);

        try {
            const target = guestId || guestCode;
            if (!target) throw new Error('Data tidak valid');

            // CTO UNIFIED CALL: Check-in API now handles toggle (In -> Out)
            const response = await guestsApi.checkIn(target);

            if (response.status) {
                setLastGuest(response.data);
                setCheckInStatus(response.status);
                setShowReceipt(true);
                playSound('success');

                // Trigger display confetti only on first check-in
                if (response.status === 'CHECK_IN_SUCCESS') {
                    await triggerBlast(response.data.name, response.data.tier);
                }
            } else {
                playSound('error');
                setError(response.error || 'Identitas tidak dikenali');
                setTimeout(() => startScanner(true), 3000);
            }
        } catch (err) {
            playSound('error');
            setError('Koneksi gagal');
            setTimeout(() => startScanner(true), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const triggerBlast = async (name: string, tier?: string) => {
        try {
            await adminApi.triggerDisplay(id!, {
                name,
                tier,
                effect: 'confetti',
                style: 'cinematic',
                timestamp: Date.now()
            });
        } catch (e) {}
    };

    return (
        <div className="min-h-screen bg-white text-[#1D1D1F] flex flex-col font-sans overflow-hidden">
            <header className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <button onClick={() => navigate(-1)} className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition-all active:scale-95">
                        <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-600" />
                    </button>
                    <div className="truncate">
                        <p className="text-xs md:text-sm font-black text-[#001F3F] truncate uppercase tracking-wider">Scan Undangan</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-[#FFBF00]/10 border border-[#FFBF00]/20 rounded-full">
                    <span className="text-[10px] font-black text-[#001F3F] uppercase tracking-widest">Auto-Toggle</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-start pt-12 p-6 relative overflow-y-auto">
                {!isScanning && !showReceipt && !isLoading && !error && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm flex flex-col items-center gap-10 z-10 pt-8">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <QrCode className="w-8 h-8 text-[#FFBF00]" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#001F3F] flex items-center justify-center shadow-sm border-2 border-white">
                                <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                        
                        <div className="text-center space-y-1.5">
                            <h2 className="text-2xl font-black tracking-tight text-[#001F3F]">Pindai QR</h2>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Arahkan kamera ke QR tamu</p>
                        </div>

                        <button onClick={() => startScanner()} className="w-full h-14 bg-[#001F3F] text-white font-bold uppercase tracking-[0.15em] text-[11px] rounded-xl flex items-center justify-center gap-3 shadow-sm hover:bg-[#002F5F] active:scale-[0.98] transition-all">
                            Buka Kamera
                        </button>
                    </motion.div>
                )}

                <div id="reader" className={`w-full max-w-sm aspect-square relative z-10 ${isScanning ? 'block' : 'hidden'}`}>
                    <div className="w-full h-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm" />
                    
                    {/* Corner Accents */}
                    <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-[#FFBF00] rounded-tl-lg pointer-events-none z-20" />
                    <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-[#FFBF00] rounded-tr-lg pointer-events-none z-20" />
                    <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-[#FFBF00] rounded-bl-lg pointer-events-none z-20" />
                    <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-[#FFBF00] rounded-br-lg pointer-events-none z-20" />
                    
                    <motion.div 
                        initial={{ top: '15%' }}
                        animate={{ top: '85%' }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="absolute left-10 right-10 h-px bg-[#FFBF00] pointer-events-none z-20 opacity-50"
                    />
                </div>

                <ThermalReceipt 
                    isVisible={showReceipt} 
                    guest={lastGuest} 
                    status={checkInStatus as any} 
                />

                {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-red-50 border border-red-100 px-4 py-3 rounded-xl flex items-center gap-3 text-red-600 z-10">
                        <XCircle className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{error}</span>
                        <button onClick={() => startScanner()} className="ml-4 p-1.5 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </main>

            {/* Global Sync Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-6">
                        <PremiumLoader color="#001F3F" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#001F3F] animate-pulse">Sinkronisasi Data</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GuestScannerPage;
