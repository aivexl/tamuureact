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
                {/* Main Tab - Optimized for absolute clarity and "Zero-Blur" professional aesthetic */}
                <div className="bg-[#111111] border-y border-r border-white/10 px-4 py-6 rounded-r-2xl transition-all duration-300 group-hover:px-6 active:scale-95">
                    <div className="flex flex-col items-center gap-2">
                        <QrCode className="w-6 h-6 text-white" />
                        <span className="[writing-mode:vertical-lr] text-[10px] tracking-[0.3em] uppercase text-white font-black">
                            E-Ticket
                        </span>
                    </div>
                </div>
            </div>
        </m.button>
    );
};
