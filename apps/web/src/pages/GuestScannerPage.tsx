import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    CheckCircle2,
    XCircle,
    Loader2,
    Zap,
    ArrowLeft,
    User,
    QrCode,
    RefreshCw
} from 'lucide-react';

/**
 * GuestScannerPage - Professional QR Scanning Interface
 * CEO/CTO DESIGN STANDARD: Glassmorphic, Haptic, High-Performance
 */
export const GuestScannerPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Invitation/Display ID
    const navigate = useNavigate();

    // UI State
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guestName, setGuestName] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Initialization: Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    scannerRef.current.stop().then(() => {
                        scannerRef.current?.clear();
                    }).catch(console.error);
                } else {
                    scannerRef.current.clear();
                }
            }
        };
    }, []);

    const startScanner = async () => {
        setError(null);
        setIsScanning(true);
        setScanResult(null);
        setGuestName(null);

        // CONFIG: Optimized for fast discovery
        const config = {
            fps: 15, // Higher FPS for smoother elite experience
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        };

        try {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText: string) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage: string) => {
                    if (errorMessage.includes("NotFoundException")) return;
                    // Silent warning as frequent search misses are normal
                }
            );

            setPermissionStatus('granted');
        } catch (err: any) {
            console.error("Camera Start Error:", err);
            setIsScanning(false);
            setPermissionStatus('denied');
            if (err?.toString().includes("NotAllowedError")) {
                setError("Izin kamera ditolak. Silakan aktifkan di pengaturan browser.");
            } else {
                setError("Gagal mengakses kamera. Pastikan tidak sedang digunakan aplikasi lain.");
            }
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        // Haptic Feedback (Vibrate 100ms)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(100);
        }

        setIsScanning(false);
        setScanResult(decodedText);

        if (scannerRef.current && scannerRef.current.isScanning) {
            await scannerRef.current.stop().catch(console.error);
        }

        // AUTO-TRIGGER LOGIC
        // We assume the QR code contains the Guest ID/Name in some format
        // For now, let's treat the decodedText as the Guest Name for testing
        // or a JSON string if it's more complex.

        let identifiedName = decodedText;
        try {
            const data = JSON.parse(decodedText);
            identifiedName = data.name || data.guestName || decodedText;
        } catch (e) {
            // Not JSON, use raw text
        }

        setGuestName(identifiedName);
        triggerBlast(identifiedName);
    };

    const triggerBlast = async (name: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // CTO: Use the standardized Command Bus API
            const response = await fetch(`https://api.tamuu.id/api/trigger/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    effect: 'confetti', // Default interaction
                    style: 'cinematic',
                    timestamp: Date.now()
                })
            });

            if (!response.ok) throw new Error('API Sync Failed');

            // Success Visual Feedback
            console.log(`[Scanner] Blast triggered for ${name}`);
        } catch (err: any) {
            console.error(err);
            setError('Gagal sinkronisasi ke layar. Coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A1128] text-white flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="p-6 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-lg font-bold tracking-tight">Scanner Mode</h1>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Live Sync Active</span>
                    </div>
                </div>
                <div className="w-10" />
            </header>

            {/* Main Surface */}
            <main className="flex-1 flex flex-col items-center px-6 pt-4 pb-12 overflow-y-auto">

                {/* Visual Context */}
                {!isScanning && !scanResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center text-center gap-6"
                    >
                        <div className="w-20 h-20 rounded-full bg-[#FFBF00]/20 flex items-center justify-center">
                            <QrCode className="w-10 h-10 text-[#FFBF00]" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Ready to Scan?</h2>
                            <p className="text-sm text-white/50 leading-relaxed px-4">
                                Pastikan Welcome Display sudah terbuka di TV/Laptop. Scan QR tamu untuk memulai animasi.
                            </p>
                        </div>
                        <button
                            onClick={startScanner}
                            className="w-full py-4 bg-[#FFBF00] text-[#0A1128] font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                        >
                            <Camera className="w-5 h-5" />
                            Buka Kamera
                        </button>
                    </motion.div>
                )}

                {/* The Scanner Viewport */}
                <div
                    id="reader"
                    className={`w-full max-w-sm mx-auto overflow-hidden rounded-3xl border-2 border-white/20 bg-black/40 ${isScanning ? 'block' : 'hidden'}`}
                />

                {/* Scan Result Card */}
                <AnimatePresence>
                    {scanResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            className="w-full max-w-sm mt-8 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden"
                        >
                            {/* Success Progress Bar */}
                            {isLoading && (
                                <div className="absolute top-0 left-0 h-1 bg-[#FFBF00] animate-progress-fast shadow-[0_0_10px_rgba(255,191,0,0.8)]" style={{ width: '100%' }} />
                            )}

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-0.5">Guest Discovered</p>
                                    <h3 className="text-xl font-bold truncate text-[#FFBF00]">{guestName}</h3>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => triggerBlast(guestName || '')}
                                    disabled={isLoading}
                                    className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    Resend Blast
                                </button>
                                <button
                                    onClick={startScanner}
                                    className="flex-1 py-3.5 bg-[#FFBF00] text-[#0A1128] rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Next Guest
                                </button>
                            </div>

                            {error && (
                                <p className="mt-4 text-xs text-red-500 flex items-center gap-1.5 font-medium">
                                    <XCircle className="w-4 h-4" />
                                    {error}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Guide */}
                <div className="mt-auto pt-10 text-center">
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Tamuu Elite Event Control • Pro v1.0</p>
                </div>
            </main>

            {/* Global Smooth Transition Layer */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-none z-50 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-1 bg-[#FFBF00] h-screen fixed left-0"
                    />
                </div>
            )}
        </div>
    );
};

export default GuestScannerPage;
