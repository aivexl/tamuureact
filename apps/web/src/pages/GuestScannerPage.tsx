import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
    Camera,
    XCircle,
    ArrowLeft,
    QrCode,
    RefreshCw,
    Printer,
    Bluetooth,
    BluetoothOff,
    Download,
    ShieldCheck,
    ChevronRight,
    Smartphone,
    Check
} from 'lucide-react';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { guests as guestsApi, admin as adminApi } from '../lib/api';
import { printer } from '../lib/printer';

/**
 * GuestScannerPage - Enterprise-Grade Event Access Control
 * Standard: Clean Light Enterprise (Apple Visual Language)
 * FAANG Standard: High Performance, Thermal-Optimized Snapshot (57mm x 30mm)
 */
export const GuestScannerPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();

    // UI State
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [downloadState, setDownloadState] = useState<'idle' | 'loading' | 'success'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [lastGuest, setLastGuest] = useState<any>(null);
    const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
    const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'duplicate' | 'error' | 'checkout'>('idle');
    const [isPrinterConnected, setIsPrinterConnected] = useState(false);
    
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const ticketRef = useRef<HTMLDivElement>(null);

    // Audio Feedback Engine
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

    useEffect(() => {
        const check = setInterval(() => {
            setIsPrinterConnected(printer.isConnected());
        }, 2000);
        return () => clearInterval(check);
    }, []);

    const handleConnectPrinter = async () => {
        setIsLoading(true);
        const success = await printer.connect();
        setIsPrinterConnected(success);
        setIsLoading(false);
    };

    useEffect(() => {
        // Auto-start scanner if permission is already granted or can be requested on mount
        const autoInitialize = async () => {
            try {
                if (navigator.permissions && navigator.permissions.query) {
                    const status = await navigator.permissions.query({ name: 'camera' as any });
                    if (status.state === 'granted') {
                        startScanner(true);
                    }
                    status.onchange = () => {
                        if (status.state === 'granted') startScanner(true);
                    };
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
        setScanResult(null);
        setLastGuest(null);
        setDownloadState('idle');

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
            setPermissionStatus('granted');
        } catch (err: any) {
            setIsScanning(false);
            if (!isAuto) {
                setPermissionStatus('denied');
                setError("Kamera tidak dapat diakses.");
            }
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        setIsScanning(false);
        setScanResult(decodedText);
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
            if (!target) throw new Error('Invalid Data');

            let response = await guestsApi.checkIn(target);

            if (response.code === 'ALREADY_CHECKED_IN') {
                response = await guestsApi.checkOut(target);
                if (response.success) {
                    setLastGuest(response.guest);
                    setCheckInStatus('checkout');
                    playSound('success');
                    if (isPrinterConnected) await printer.printReceipt(response.guest, 'check-out');
                    return;
                }
            }

            if (response.success) {
                setLastGuest(response.guest);
                setCheckInStatus('success');
                playSound('success');
                if (isPrinterConnected) await printer.printReceipt(response.guest, 'check-in');
                await triggerBlast(response.guest.name, response.guest.tier);
            } else {
                playSound('error');
                setCheckInStatus('error');
                setError(response.error || 'Identity not recognized');
            }
        } catch (err) {
            playSound('error');
            setCheckInStatus('error');
            setError('Connection failed');
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

    const handleDownloadEPass = async () => {
        if (!ticketRef.current || !lastGuest) return;
        setDownloadState('loading');
        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 3,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                width: 384
            });
            
            const link = document.createElement('a');
            link.download = `Tamuu_Receipt_${lastGuest.name.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            setDownloadState('success');
            setTimeout(() => setDownloadState('idle'), 3000);
        } catch (e) {
            console.error('Snapshot failed', e);
            setDownloadState('idle');
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#1D1D1F] flex flex-col font-sans overflow-hidden">
            <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition-all active:scale-95">
                        <ArrowLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Registry System</h1>
                        <p className="text-sm font-black text-[#001F3F]">Scan Tamuu Undangan</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${isPrinterConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        <Printer className="w-3 h-3" />
                        {isPrinterConnected ? 'Aktif' : 'Mati'}
                    </div>
                    <button onClick={handleConnectPrinter} className="w-9 h-9 rounded-full bg-[#FFBF00] text-black flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                        {isPrinterConnected ? <Bluetooth className="w-4 h-4" /> : <BluetoothOff className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-start pt-12 p-6 relative overflow-y-auto">
                {!isScanning && !scanResult && (
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

                <div className={`w-full max-w-sm aspect-square relative z-10 ${isScanning ? 'block' : 'hidden'}`}>
                    <div id="reader" className="w-full h-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm" />
                    
                    {/* Corner Accents - Apple Style */}
                    <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-[#FFBF00] rounded-tl-lg pointer-events-none z-20" />
                    <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-[#FFBF00] rounded-tr-lg pointer-events-none z-20" />
                    <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-[#FFBF00] rounded-bl-lg pointer-events-none z-20" />
                    <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-[#FFBF00] rounded-br-lg pointer-events-none z-20" />
                    
                    {/* High-End Scanning Line */}
                    <motion.div 
                        initial={{ top: '15%' }}
                        animate={{ top: '85%' }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="absolute left-10 right-10 h-px bg-[#FFBF00] pointer-events-none z-20 opacity-50"
                    />
                </div>

                <AnimatePresence>
                    {scanResult && lastGuest && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm mt-4 z-10 mb-12">
                            <div className="bg-white border border-slate-100 rounded-2xl p-8 relative overflow-hidden shadow-sm">
                                {checkInStatus === 'success' && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                                )}
                                
                                <div className="flex flex-col items-center text-center gap-6">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${checkInStatus === 'checkout' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                        {checkInStatus === 'checkout' ? <Smartphone className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                                    </div>

                                    <div className="space-y-1">
                                        <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block ${lastGuest.tier === 'vip' || lastGuest.tier === 'vvip' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                                            Tamu {lastGuest.tier || 'REGULER'}
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight text-[#001F3F]">{lastGuest.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                            {checkInStatus === 'checkout' ? 'Berhasil Keluar' : 'Berhasil Masuk'}
                                        </p>
                                    </div>

                                    <div className="w-full flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleDownloadEPass} 
                                                disabled={downloadState === 'loading'}
                                                className="flex-1 h-14 bg-slate-50 border border-slate-100 text-[#001F3F] rounded-xl flex items-center justify-center transition-all active:scale-95"
                                            >
                                                {downloadState === 'loading' ? (
                                                    <PremiumLoader variant="inline" size="sm" color="#001F3F" />
                                                ) : downloadState === 'success' ? (
                                                    <Check className="w-5 h-5 text-emerald-500" />
                                                ) : (
                                                    <Download className="w-5 h-5" />
                                                )}
                                            </button>
                                            
                                            {isPrinterConnected && (
                                                <button 
                                                    onClick={() => printer.printReceipt(lastGuest, checkInStatus === 'checkout' ? 'check-out' : 'check-in')} 
                                                    className="w-14 h-14 bg-[#FFBF00] text-black rounded-xl flex items-center justify-center"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <button onClick={() => startScanner()} className="w-full h-14 bg-[#001F3F] text-white font-bold uppercase tracking-[0.1em] text-[11px] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                                            Tutup <ChevronRight className="w-4 h-4 opacity-50" />
                                        </button>

                                        <div className="mt-4 text-center opacity-30">
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#001F3F]">Paper Size: 57mm x 30mm</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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

            {/* HIDDEN THERMAL RECEIPT TEMPLATE (57mm x 30mm Optimized) */}
            <div className="fixed -left-[2000px] top-0 pointer-events-none">
                <div 
                    ref={ticketRef} 
                    className="w-[384px] bg-white text-black p-6 flex flex-col items-center gap-4" 
                    style={{ fontFamily: "'Inter', sans-serif", minHeight: '200px' }}
                >
                    <div className="w-full flex flex-col items-center border-b-2 border-black border-dashed pb-4 gap-1">
                        <img src="/assets/tamuu-logo-header.png" alt="Tamuu" className="h-6 w-auto object-contain mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Konfirmasi Akses</span>
                    </div>

                    <div className="w-full text-center space-y-1 py-2">
                        <div className="text-[14px] font-black uppercase leading-tight">{lastGuest?.name}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tamu {lastGuest?.tier || 'Reguler'}</div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 border-y border-black border-dashed py-3">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-black uppercase opacity-50">Meja</span>
                            <span className="text-[11px] font-bold">{lastGuest?.table_number || lastGuest?.tableNumber || '-'}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                            <span className="text-[8px] font-black uppercase opacity-50">Jumlah</span>
                            <span className="text-[11px] font-bold">{lastGuest?.guest_count || 1} Orang</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] font-black uppercase opacity-50">Status</span>
                            <span className="text-[10px] font-black">{checkInStatus === 'checkout' ? 'KELUAR' : 'MASUK'}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                            <span className="text-[8px] font-black uppercase opacity-50">Waktu</span>
                            <span className="text-[10px] font-bold">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>

                    <div className="w-full flex flex-col items-center pt-2 gap-1">
                        <div className="text-[10px] font-mono font-black tracking-[0.3em] text-black">
                            {lastGuest?.check_in_code || lastGuest?.checkInCode || 'ID-TAMU'}
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-[0.3em]">Terima Kasih</span>
                    </div>
                </div>
            </div>

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
