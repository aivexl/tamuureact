import React from 'react';
import { m } from 'framer-motion';
import { QrCode } from 'lucide-react';

interface GuestQRTriggerProps {
    onClick: () => void;
    isVisible: boolean;
}

export const GuestQRTrigger: React.FC<GuestQRTriggerProps> = ({ onClick, isVisible }) => {
    return (
        <m.button
            initial={{ x: -100, opacity: 0 }}
            animate={isVisible ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            onClick={onClick}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-[90000] group"
        >
            <div className="relative flex items-center">
                {/* Main Tab */}
                <div className="bg-white/10 backdrop-blur-xl border-y border-r border-white/20 px-4 py-6 rounded-r-2xl shadow-2xl transition-all duration-300 group-hover:bg-white/20 group-hover:px-6">
                    <div className="flex flex-col items-center gap-2">
                        <QrCode className="w-6 h-6 text-white" />
                        <span className="[writing-mode:vertical-lr] text-[10px] tracking-[0.3em] uppercase text-white/70 font-medium">
                            E-Ticket
                        </span>
                    </div>
                </div>

                {/* Pulse Effect */}
                <div className="absolute inset-0 bg-white/20 rounded-r-2xl animate-pulse -z-10 group-hover:scale-110" />
            </div>
        </m.button>
    );
};
