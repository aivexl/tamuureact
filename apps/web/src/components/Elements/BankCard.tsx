import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { getBankByName } from '@/lib/banks';
import { BankLogos } from './BankLogos';

interface BankCardProps {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    customColor?: string;
    className?: string;
    isPreview?: boolean;
}

export const BankCard: React.FC<BankCardProps> = ({
    bankName,
    accountNumber,
    accountHolder,
    customColor,
    className = '',
    isPreview = false
}) => {
    // 1. Resolve Bank Data safely
    const bank = useMemo(() => getBankByName(bankName || ''), [bankName]);
    const safeBankId = bank?.id || 'unknown';
    // Priority: Custom Color > Bank Brand Color > Default Elegant Dark
    const brandColor = customColor || bank?.brandColor || '#1a1a1a';
    const textColor = bank?.textColor || '#ffffff';

    // 2. Resolve Logo Component
    const LogoComponent = BankLogos[safeBankId] || BankLogos.unknown;

    // 3. Format account number: Group by 4
    const formattedNumber = (accountNumber || '').replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[24px] overflow-hidden shadow-2xl group ${className}`}
            initial={!isPreview ? { opacity: 0, y: 20 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
            {/* A. SMART FILL LAYER: Clipped to the inner design boundary */}
            <div
                className="absolute inset-[3px] rounded-[21px] transition-colors duration-700 ease-in-out z-0"
                style={{
                    backgroundColor: brandColor,
                    boxShadow: `inset 0 0 40px rgba(0,0,0,0.3)`
                }}
            />

            {/* B. TEXTURE & OVERLAY: Premium Glass & Metallic Detail */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                <img
                    src="/images/bank-card-transparent.png"
                    alt="Card Frame"
                    className="w-full h-full object-cover mix-blend-overlay opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            </div>

            {/* C. CONTENT LAYER: SMART POSITIONING */}
            <div className="relative z-30 h-full p-6 sm:p-8 flex flex-col justify-between" style={{ color: textColor }}>

                {/* 1. TOP SECTION: LOGO ABOVE CHIP */}
                <div className="flex flex-col gap-3">
                    {/* Brand Logo (Top Left) */}
                    <div className="h-6 sm:h-8 w-fit min-w-[60px] flex items-center justify-start">
                        <LogoComponent className="h-full w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all" />
                    </div>

                    {/* Chip Position: Directly below logo */}
                    <div className="w-10 h-7 sm:w-12 sm:h-9 bg-gradient-to-br from-[#f1c40f] via-[#f39c12] to-[#e67e22] rounded-md relative overflow-hidden flex items-center justify-center border border-black/20 shadow-[0_2px_10px_rgba(0,0,0,0.3)] z-20">
                        {/* Chip micro-lines */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1px] opacity-40">
                            {[...Array(9)].map((_, i) => <div key={i} className="border-[0.5px] border-black/50" />)}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                    </div>
                </div>

                {/* 2. BOTTOM SECTION: ACCOUNT INFO */}
                <div className="space-y-4">
                    {/* Identity: Below Chip */}
                    <div className="space-y-0.5">
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.3em] font-black opacity-60 block">
                            ACCOUNT HOLDER
                        </span>
                        <span className="text-sm sm:text-xl font-bold uppercase tracking-wider truncate block drop-shadow-md">
                            {accountHolder || 'YOUR NAME'}
                        </span>
                    </div>

                    {/* Number: Below Name */}
                    <div className="space-y-0.5">
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.3em] font-black opacity-60 block">
                            ACCOUNT NUMBER
                        </span>
                        <span className="text-lg sm:text-2xl font-mono tracking-[0.15em] font-black drop-shadow-lg truncate block">
                            {formattedNumber || '0000 0000 0000 0000'}
                        </span>
                    </div>
                </div>

                {/* 3. PREMIUM LABEL (Bottom Right) */}
                <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 text-right flex flex-col items-end opacity-40 group-hover:opacity-70 transition-opacity">
                    <span className="text-[8px] uppercase tracking-[0.4em] font-black">PREMIUM</span>
                    <span className="text-[10px] font-black italic tracking-tighter">TAMUU.ID</span>
                </div>
            </div>

            {/* D. PREMIUM SHINE & REFLECTION */}
            <div className="absolute inset-0 z-40 pointer-events-none">
                <m.div
                    className="absolute inset[-100%] bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-25deg]"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 5, ease: "linear" }}
                />
            </div>

            {/* Border glow */}
            <div className="absolute inset-0 rounded-[24px] border border-white/10 z-20 pointer-events-none" />
        </m.div>
    );
};
