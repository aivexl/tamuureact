import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, User, Ticket } from 'lucide-react';
import QRCode from 'react-qr-code';

interface GuestQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    guestName: string;
    guestId: string;
}

export const GuestQRModal: React.FC<GuestQRModalProps> = ({ isOpen, onClose, guestName, guestId }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <m.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]"
                    >
                        {/* Top Accent */}
                        <div className="h-2 w-full bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200" />

                        <div className="p-8 pb-10">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-white/40 text-xs tracking-[0.2em] uppercase font-semibold mb-1">Guest Identification</h2>
                                    <p className="text-white text-lg font-medium">Digital Check-in</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Ticket Content */}
                            <div className="bg-zinc-800/50 border border-white/5 rounded-3xl p-6 mb-8 text-center">
                                {/* QR Container */}
                                <div className="bg-white p-6 rounded-2xl inline-block mb-6 shadow-inner">
                                    <QRCode
                                        value={guestId}
                                        size={200}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                </div>

                                {/* Guest Info */}
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 text-white/40 text-[10px] tracking-widest uppercase mb-1">
                                            <User className="w-3 h-3" />
                                            GUEST NAME
                                        </div>
                                        <h3 className="text-2xl font-serif text-white tracking-wide">
                                            {guestName}
                                        </h3>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 text-white/40 text-[10px] tracking-widest uppercase mb-1">
                                            <Ticket className="w-3 h-3" />
                                            UNIQUE ID
                                        </div>
                                        <p className="font-mono text-amber-200/80 text-sm tracking-widest">
                                            {guestId}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="text-center">
                                <p className="text-white/40 text-xs leading-relaxed">
                                    Tunjukkan QR Code ini kepada petugas <br />
                                    di pintu masuk untuk konfirmasi kehadiran.
                                </p>
                            </div>
                        </div>

                        {/* Subtle Footer */}
                        <div className="bg-zinc-950/50 py-4 text-center border-t border-white/5">
                            <span className="text-[9px] text-white/20 tracking-[0.4em] uppercase">
                                Powered by Tamuu Intelligence
                            </span>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};
