import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { m } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSEO } from '../hooks/useSEO';

import { CheckCircle2 } from 'lucide-react';
import { guests as guestsApi } from '../lib/api';

export const GuestWelcomePage: React.FC = () => {
    const { invitationId, guestId } = useParams<{ invitationId: string; guestId: string }>();
    const [guest, setGuest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useSEO({
        title: 'Selamat Datang! - Tamuu',
        description: 'Selamat datang di acara kami.',
    });

    useEffect(() => {
        const loadGuest = async () => {
            if (!guestId) return;
            try {
                const data = await guestsApi.get(guestId);
                const mappedGuest = {
                    ...data,
                    guestCount: data.guest_count || 1,
                    tableNumber: data.table_number || '-',
                };
                setGuest(mappedGuest);

                if (!data.checked_in_at) {
                    await guestsApi.update(guestId, { checked_in_at: new Date().toISOString() });
                }
            } catch (error) {
                console.error('Failed to load guest:', error);
                setGuest({
                    name: 'Tamu Undangan',
                    tableNumber: '-',
                    tier: 'reguler',
                    guestCount: 1
                });
            }
            setIsLoading(false);

            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
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
            <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                    <p className="text-white/50 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">Authenticating Identity...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-inter">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <m.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className="relative z-10 w-full max-w-[420px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 text-center shadow-2xl"
            >
                <m.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-teal-500/20 mb-6 ring-1 ring-white/20">
                        <CheckCircle2 className="w-8 h-8 text-teal-400" />
                    </div>
                    <h2 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Entrance Granted</h2>
                    <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.1] tracking-tighter">Welcome<br />Aboard!</h1>
                </m.div>

                <div className="space-y-6">
                    <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Honored Guest</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-[#0A1128] break-words leading-tight">{guest?.name}</h3>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8">
                            <div className={`p-4 rounded-2xl border ${guest?.tier ? tierColor[guest.tier as keyof typeof tierColor] : tierColor.reguler}`}>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Tier</p>
                                <p className="text-base sm:text-lg font-black uppercase tracking-tighter">{guest?.tier || 'Reguler'}</p>
                            </div>
                            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-700">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Table</p>
                                <p className="text-base sm:text-lg font-black tracking-tighter">{guest?.tableNumber || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Party Size</span>
                            <span className="text-xs font-black text-[#0A1128] bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-tighter">{guest?.guestCount || 1} Person</span>
                        </div>
                    </m.div>

                    <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-white/20 text-[9px] font-bold uppercase tracking-widest leading-loose">
                        Please proceed to the concierge if you require assistance with your seating arrangements.
                    </m.p>
                </div>
            </m.div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-white" />
                <span className="text-white font-black tracking-[0.4em] uppercase text-[9px]">Tamuu Elite Event Engine</span>
                <div className="w-1 h-1 rounded-full bg-white" />
            </div>
        </div>
    );
};

export default GuestWelcomePage;