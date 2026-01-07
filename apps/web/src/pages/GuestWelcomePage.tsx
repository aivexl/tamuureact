import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { m } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSEO } from '../hooks/useSEO';

// Dummy data fallback (in real app, use API)
const DUMMY_GUESTS_DATA: Record<string, any> = {
    '1': { name: 'Budi Santoso', tableNumber: 'A1', tier: 'vip', paxi: 2 },
    '2': { name: 'Siti Rahma', tableNumber: 'A2', tier: 'vvip', paxi: 3 },
    '3': { name: 'Ahmad Hidayat', tableNumber: 'B1', tier: 'reguler', paxi: 1 },
    '4': { name: 'Dewi Lestari', tableNumber: 'B2', tier: 'reguler', paxi: 2 },
    '5': { name: 'Rizki Pratama', tableNumber: 'C1', tier: 'vip', paxi: 4 },
};

export const GuestWelcomePage: React.FC = () => {
    const { invitationId, guestId } = useParams<{ invitationId: string; guestId: string }>();
    const [guest, setGuest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useSEO({
        title: 'Selamat Datang! - Tamuu',
        description: 'Selamat datang di acara kami.',
    });

    useEffect(() => {
        // Simulate API fetch
        const loadGuest = async () => {
            // In a real scenario, fetch from: /api/invitations/:invitationId/guests/:guestId
            // For now, use the dummy data or query params if provided
            await new Promise(r => setTimeout(r, 1000));

            // Check if guestId exists in dummy data (string comparison)
            if (guestId && DUMMY_GUESTS_DATA[guestId]) {
                setGuest(DUMMY_GUESTS_DATA[guestId]);
            } else {
                // Fallback for demo if id not found (just show param)
                setGuest({
                    name: 'Tamu Undangan',
                    tableNumber: '-',
                    tier: 'reguler',
                    paxi: 1
                });
            }
            setIsLoading(false);

            // Trigger confetti on load
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);
        };

        loadGuest();
    }, [guestId]);

    const tierColor = {
        reguler: 'bg-slate-100 text-slate-600 border-slate-200',
        vip: 'bg-amber-50 text-amber-700 border-amber-200',
        vvip: 'bg-purple-50 text-purple-700 border-purple-200',
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                    <p className="text-white/50 text-sm font-medium tracking-widest uppercase animate-pulse">Memeriksa Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-teal-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            <m.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 text-center shadow-2xl"
            >
                {/* Header */}
                <m.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 mb-4 ring-1 ring-white/20">
                        <svg className="w-8 h-8 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h2 className="text-white/60 text-sm font-bold uppercase tracking-[0.2em] mb-2">Check-In Berhasil</h2>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">Selamat<br />Datang!</h1>
                </m.div>

                {/* Guest Info */}
                <div className="space-y-6">
                    <m.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-3xl p-6 shadow-xl"
                    >
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Nama Tamu</p>
                        <h3 className="text-2xl font-black text-slate-800 break-words">{guest?.name}</h3>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className={`p-4 rounded-2xl border ${guest?.tier ? tierColor[guest.tier as keyof typeof tierColor] : tierColor.reguler}`}>
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Tier</p>
                                <p className="text-lg font-black uppercase">{guest?.tier || 'Reguler'}</p>
                            </div>
                            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Meja</p>
                                <p className="text-lg font-black">{guest?.tableNumber || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Jumlah Tamu</span>
                            <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{guest?.guestCount || 1} Orang</span>
                        </div>
                    </m.div>

                    <m.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-white/40 text-xs font-medium"
                    >
                        Silakan hubungi penerima tamu jika ada kesalahan data.
                    </m.p>
                </div>
            </m.div>

            {/* Footer Logo */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-30">
                <span className="text-white font-bold tracking-widest uppercase text-xs">Powered by Tamuu</span>
            </div>
        </div>
    );
};
