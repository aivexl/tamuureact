import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
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
    BluetoothOff
} from 'lucide-react';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { guests as guestsApi, admin as adminApi } from '../lib/api';
import { printer } from '../lib/printer';

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
    const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'duplicate' | 'error' | 'checkout'>('idle');
    const [isPrinterConnected, setIsPrinterConnected] = useState(false);

    const scannerRef = useRef<Html5Qrcode | null>(null);

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
        if (success) {
            // Optional: Print a test or connection success message
        }
    };

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

        // Parse QR Data: Can be guest ID, check_in_code, or URL with "to" param
        let guestId: string | null = null;
        let guestCode: string | null = null;

        try {
            // Case 1: URL format (standard or legacy)
            if (decodedText.startsWith('http')) {
                const url = new URL(decodedText);
                
                // Subcase A: Standardized query param (e.g. ?to=UUID)
                const toParam = url.searchParams.get('to');
                if (toParam) {
                    if (toParam.length > 20) guestId = toParam;
                    else guestCode = toParam;
                } 
                // Subcase B: Legacy path-based (e.g. /welcome/INV_ID/GUEST_ID)
                else {
                    const pathParts = url.pathname.split('/').filter(Boolean);
                    // Usually the last part is the guest ID/Code
                    const lastPart = pathParts[pathParts.length - 1];
                    if (lastPart) {
                        if (lastPart.length > 20) guestId = lastPart;
                        else guestCode = lastPart;
                    }
                }
            } 
            // Case 2: JSON format
            else if (decodedText.startsWith('{')) {
                const data = JSON.parse(decodedText);
                if (data.id) guestId = data.id;
                else if (data.code || data.checkInCode) guestCode = data.code || data.checkInCode;
            }
            // Case 3: Raw text
            else {
                if (decodedText.length > 20) guestId = decodedText;
                else guestCode = decodedText;
            }
        } catch (e) {
            // Fallback to raw text if parsing fails
            guestCode = decodedText;
        }

        await performCheckIn(guestId, guestCode);
    };

    const performCheckIn = async (guestId: string | null, guestCode: string | null) => {
        setIsLoading(true);
        setError(null);

        try {
            const finalIdOrCode = guestId || guestCode;
            if (!finalIdOrCode) throw new Error('Invalid QR Data');

            // SMART LOGIC: Always try check-in first
            let response = await guestsApi.checkIn(finalIdOrCode);

            // If already checked in, trigger check-out automatically
            if (response.code === 'ALREADY_CHECKED_IN') {
                console.log('[Scanner] Smart Redirect: Guest already in, performing Check-Out');
                response = await guestsApi.checkOut(finalIdOrCode);
                
                if (response.success) {
                    setGuestName(response.guest.name);
                    setCheckInStatus('checkout');
                    
                    // Print Receipt for Check-Out
                    if (printer.isConnected()) {
                        await printer.printReceipt(response.guest, 'check-out');
                    }
                    return; // Early exit for checkout success
                }
            }

            if (response.success) {
                // SUCCESS: Guest checked in
                setGuestName(response.guest.name);
                setCheckInStatus('success');

                // Print Receipt for Check-In
                if (printer.isConnected()) {
                    await printer.printReceipt(response.guest, 'check-in');
                }

                // Trigger display blast for visual effect with tier info
                await triggerBlast(response.guest.name, response.guest.tier);
            } else if (response.code === 'NOT_FOUND') {
                setCheckInStatus('error');
                setError('QR Code tidak dikenali. Pastikan tamu terdaftar.');
            } else if (response.code === 'ALREADY_CHECKED_OUT') {
                setCheckInStatus('error');
                setError(`${response.guest.name} sudah check-out sebelumnya.`);
            } else {
                setCheckInStatus('error');
                setError(response.error || 'Gagal memproses data.');
            }
        } catch (err: any) {
            console.error(err);
            setCheckInStatus('error');
            setError('Gagal terhubung ke server. Coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const triggerBlast = async (name: string, tier?: string) => {
        try {
            // CTO: Use the standardized Command Bus API for display sync
            // Including TIER for "Tamuu VIP" label on screen
            await adminApi.triggerDisplay(id!, {
                name: name,
                tier: tier,
                effect: 'confetti',
                style: 'cinematic',
                timestamp: Date.now()
            });
            console.log(`[Scanner] Blast triggered for ${name} (${tier})`);
        } catch (err: any) {
            console.warn('Display sync failed, but check-in was successful');
        }
    };

    return (
        <div className="min-h-screen bg-[#0A1128] text-white flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="p-4 sm:p-6 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-base sm:text-lg font-bold tracking-tight">Scanner Mode</h1>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Live Sync Active</span>
                    </div>
                </div>
                <button
                    onClick={handleConnectPrinter}
                    className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isPrinterConnected ? 'bg-teal-500/20 text-teal-400' : 'bg-white/10 text-white/40'}`}
                    title={isPrinterConnected ? 'Printer Connected' : 'Connect Bluetooth Printer'}
                >
                    {isPrinterConnected ? <Bluetooth className="w-5 h-5" /> : <BluetoothOff className="w-5 h-5" />}
                </button>
            </header>

            {/* Main Surface */}
            <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-4 pb-12 overflow-y-auto">

                {/* Visual Context */}
                {!isScanning && !scanResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col items-center text-center gap-6"
                    >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFBF00]/20 flex items-center justify-center">
                            <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFBF00]" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-lg sm:text-xl font-bold">Ready to Scan?</h2>
                            <p className="text-xs sm:text-sm text-white/50 leading-relaxed px-2 sm:px-4">
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
                            className="w-full max-w-sm mt-8 bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-2xl relative overflow-hidden"
                        >
                            {/* Success Progress Bar */}
                            {isLoading && (
                                <div className="absolute top-0 left-0 h-1 bg-[#FFBF00] animate-progress-fast shadow-[0_0_10px_rgba(255,191,0,0.8)]" style={{ width: '100%' }} />
                            )}

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${checkInStatus === 'checkout' ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
                                    {checkInStatus === 'checkout' ? (
                                        <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
                                    ) : (
                                        <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-0.5">
                                        {checkInStatus === 'checkout' ? 'Guest Checked Out' : 'Guest Checked In'}
                                    </p>
                                    <h3 className={`text-lg sm:text-xl font-bold truncate ${checkInStatus === 'checkout' ? 'text-amber-400' : 'text-[#FFBF00]'}`}>{guestName}</h3>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                {isPrinterConnected && (
                                    <div className="absolute top-4 right-4 animate-pulse">
                                        <Printer className="w-4 h-4 text-teal-400" />
                                    </div>
                                )}
                                <button
                                    onClick={() => triggerBlast(guestName || '')}
                                    disabled={isLoading || checkInStatus === 'checkout'}
                                    className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-30 text-xs"
                                >
                                    {isLoading ? <PremiumLoader variant="inline" size="sm" color="#FFBF00" /> : <RefreshCw className="w-4 h-4" />}
                                    Resend Blast
                                </button>
                                <button
                                    onClick={startScanner}
                                    className="flex-1 py-3.5 bg-[#FFBF00] text-[#0A1128] rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-xs"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Next Guest
                                </button>
                            </div>

                            {error && (
                                <p className="mt-4 text-[10px] sm:text-xs text-red-500 flex items-center gap-1.5 font-medium">
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