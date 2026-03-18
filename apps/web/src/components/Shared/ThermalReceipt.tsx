import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Ticket, User, Star, Clock } from 'lucide-react';

interface ThermalReceiptProps {
    guest: {
        name: string;
        tier?: string;
        table_number?: string;
    };
    status: 'CHECK_IN_SUCCESS' | 'CHECK_OUT_SUCCESS' | 'ALREADY_CHECKED_OUT';
    isVisible: boolean;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ guest, status, isVisible }) => {
    const isCheckOut = status === 'CHECK_OUT_SUCCESS' || status === 'ALREADY_CHECKED_OUT';
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <m.div
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -20, opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-sm bg-white shadow-2xl overflow-hidden"
                        style={{
                            filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.2))',
                        }}
                    >
                        {/* Zigzag Top Edge */}
                        <div className="h-2 w-full bg-white" style={{
                            clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
                        }} />

                        <div className="px-8 py-10 flex flex-col items-center text-[#001F3F]">
                            {/* Logo / Header */}
                            <div className="flex items-center gap-2 mb-6 opacity-60">
                                <Ticket className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tamuu Elite</span>
                            </div>

                            {/* Status Icon */}
                            <m.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="mb-6"
                            >
                                <div className="p-4 bg-green-50 rounded-full border-2 border-green-500/20">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                            </m.div>

                            {/* Status Title */}
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-center">
                                {isCheckOut ? 'BERHASIL KELUAR' : 'BERHASIL MASUK'}
                            </h2>

                            {/* Divider Dot Line */}
                            <div className="w-full border-b border-dashed border-[#001F3F]/20 mb-8" />

                            {/* Details Table-like Layout */}
                            <div className="w-full space-y-4 font-mono text-sm mb-8">
                                <div className="flex justify-between items-start gap-4">
                                    <span className="opacity-50 uppercase text-[10px]">Tamu</span>
                                    <span className="font-bold text-right">{guest.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="opacity-50 uppercase text-[10px]">Tier</span>
                                    <span className="font-bold uppercase tracking-wider">{guest.tier || 'REGULER'}</span>
                                </div>
                                {guest.table_number && (
                                    <div className="flex justify-between items-center">
                                        <span className="opacity-50 uppercase text-[10px]">Meja</span>
                                        <span className="font-bold">TABLE {guest.table_number}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="opacity-50 uppercase text-[10px]">Waktu</span>
                                    <span className="font-bold">{timeString}</span>
                                </div>
                            </div>

                            {/* Divider Dot Line */}
                            <div className="w-full border-b border-dashed border-[#001F3F]/20 mb-8" />

                            {/* Footer Message */}
                            <p className="text-center text-[11px] leading-relaxed opacity-60 font-medium px-4">
                                Terima kasih sudah bertamuu <br/> di acara kami.
                            </p>
                        </div>

                        {/* Zigzag Bottom Edge */}
                        <div className="h-4 w-full bg-white" style={{
                            clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)'
                        }} />
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};
