import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
    Camera,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    User,
    QrCode,
    RefreshCw,
    Printer,
    Bluetooth,
    BluetoothOff,
    Download,
    Share2,
    ShieldCheck,
    MapPin,
    Calendar,
    ChevronRight,
    Smartphone
} from 'lucide-react';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { guests as guestsApi, admin as adminApi } from '../lib/api';
import { printer } from '../lib/printer';

/**
 * GuestScannerPage - Enterprise-Grade Event Access Control
 * FAANG Standard: High Performance, Multimodal Feedback, Hybrid Printing
 */
export const GuestScannerPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();

    // UI State
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
        } catch (e) {
            console.warn('Audio feedback failed');
        }
    };

    // Sync printer status
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
        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {});
            }
        };
    }, []);

    const startScanner = async () => {
        setError(null);
        setIsScanning(true);
        setScanResult(null);
        setLastGuest(null);

        const config = {
            fps: 20, // FAANG Standard: High precision frame rate
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
            setPermissionStatus('denied');
            setError("Kamera tidak dapat diakses. Mohon cek izin browser.");
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]); // Dual-pulse haptic
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

            // SMART HUB: Process Check-In / Check-Out
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
        setIsLoading(true);
        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                logging: false
            });
            
            const link = document.createElement('a');
            link.download = `TamuuPass_${lastGuest.name.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            if (navigator.share) {
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const file = new File([blob], `Pass_${lastGuest.name}.png`, { type: 'image/png' });
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'Entrance Pass',
                                text: `Pass untuk ${lastGuest.name}`
                            });
                        } catch (e) {}
                    }
                });
            }
        } catch (e) {
            console.error('Snapshot failed', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050811] text-white flex flex-col font-sans overflow-hidden">
            {/* Enterprise Header */}
            <header className="p-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-2xl z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">Event Registry</h1>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-emerald-500/80 uppercase">Node Secure</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-full border ${isPrinterConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30'} flex items-center gap-2 transition-all`}>
                        <Printer className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{isPrinterConnected ? 'Online' : 'Offline'}</span>
                    </div>
                    <button onClick={handleConnectPrinter} className="w-10 h-10 rounded-full bg-[#FFBF00] text-black flex items-center justify-center shadow-lg shadow-[#FFBF00]/20 active:scale-90 transition-transform">
                        {isPrinterConnected ? <Bluetooth className="w-5 h-5" /> : <BluetoothOff className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                {/* Background Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FFBF00]/5 rounded-full blur-[120px] pointer-events-none" />

                {!isScanning && !scanResult && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm flex flex-col items-center gap-8 z-10">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-3xl">
                                <QrCode className="w-10 h-10 text-[#FFBF00]" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-[#050811]">
                                <Camera className="w-4 h-4 text-black" />
                            </div>
                        </div>
                        
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black tracking-tight">Security Checkpoint</h2>
                            <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Point device at guest e-ticket</p>
                        </div>

                        <button onClick={startScanner} className="w-full h-16 bg-[#FFBF00] text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-[#FFBF00]/20 active:scale-95 transition-all">
                            Initialize Camera
                        </button>
                    </motion.div>
                )}

                <div id="reader" className={`w-full max-w-sm aspect-square overflow-hidden rounded-[3rem] border-4 border-white/10 bg-black shadow-2xl z-10 ${isScanning ? 'block' : 'hidden'}`} />

                <AnimatePresence>
                    {scanResult && lastGuest && (
                        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm mt-8 z-10">
                            {/* Verification Card */}
                            <div className="bg-white/10 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 relative overflow-hidden shadow-2xl">
                                {checkInStatus === 'success' && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                                )}
                                
                                <div className="flex flex-col items-center text-center gap-6">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${checkInStatus === 'checkout' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        {checkInStatus === 'checkout' ? <Smartphone className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
                                    </div>

                                    <div className="space-y-1">
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] inline-block ${lastGuest.tier === 'vip' || lastGuest.tier === 'vvip' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60'}`}>
                                            {lastGuest.tier || 'REGULER'} Guest
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tighter text-white">{lastGuest.name}</h3>
                                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                                            {checkInStatus === 'checkout' ? 'Departure Confirmed' : 'Access Granted'}
                                        </p>
                                    </div>

                                    <div className="w-full grid grid-cols-2 gap-3 py-6 border-y border-white/5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Table Unit</span>
                                            <span className="text-sm font-bold text-[#FFBF00]">{lastGuest.table_number || lastGuest.tableNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Party Size</span>
                                            <span className="text-sm font-bold text-white">{lastGuest.guest_count || 1} PAX</span>
                                        </div>
                                    </div>

                                    <div className="w-full flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <button onClick={handleDownloadEPass} className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 transition-all group">
                                                <Download className="w-4 h-4 text-[#FFBF00] group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">E-Pass</span>
                                            </button>
                                            <button onClick={() => isPrinterConnected ? printer.printReceipt(lastGuest, checkInStatus === 'checkout' ? 'check-out' : 'check-in') : handleDownloadEPass()} className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 transition-all group">
                                                <Printer className="w-4 h-4 text-[#FFBF00] group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{isPrinterConnected ? 'Print' : 'Share'}</span>
                                            </button>
                                        </div>
                                        <button onClick={startScanner} className="w-full h-16 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                                            Close & Next <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 z-10">
                        <XCircle className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
                        <button onClick={startScanner} className="ml-4 p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </main>

            {/* Hidden Ticket Template for Snapshot */}
            <div className="fixed -left-[1000px] top-0 pointer-events-none">
                <div ref={ticketRef} className="w-[400px] bg-[#0A1128] text-white p-10 flex flex-col gap-8 rounded-[3rem] border border-white/10 relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFBF00]/10 rounded-full blur-3xl -mr-20 -mt-20" />
                    
                    <div className="flex justify-between items-start">
                        <img src="/assets/tamuu-logo-header.png" alt="Tamuu" className="h-6 opacity-80" />
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFBF00]">Verified</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Identity Pass</div>
                        <div className="text-3xl font-black tracking-tighter uppercase">{lastGuest?.name}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-3xl border border-white/10">
                        <div className="space-y-1">
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Entry Status</span>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Granted</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Timestamp</span>
                            <span className="text-[10px] font-bold text-white uppercase">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Tier Class</span>
                            <span className="text-xs font-black text-[#FFBF00] uppercase tracking-widest">{lastGuest?.tier || 'Reguler'}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Unit Placement</span>
                            <span className="text-xs font-black text-white uppercase tracking-widest">{lastGuest?.table_number || lastGuest?.tableNumber || 'Auto'}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/10">
                        <div className="text-[9px] font-medium text-white/20 text-center uppercase tracking-[0.4em]">tamuu elite event protection</div>
                    </div>
                </div>
            </div>

            {/* Global Loader Layer */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6">
                        <PremiumLoader color="#FFBF00" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFBF00] animate-pulse">Syncing Cloud Identity</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GuestScannerPage;
