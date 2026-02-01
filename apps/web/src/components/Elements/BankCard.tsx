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
    const brandColor = customColor || bank?.brandColor || '#1a1a1a';
    const textColor = bank?.textColor || '#ffffff';

    // 2. Resolve Logo Component
    const LogoComponent = BankLogos[safeBankId] || BankLogos.unknown;

    // 3. Format account number: Group by 4
    const formattedNumber = (accountNumber || '').replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group select-none ${className}`}
            initial={!isPreview ? { opacity: 0, scale: 0.9 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* A. BASE GRADIENT & GLASS LAYER */}
            <div
                className="absolute inset-0 z-0 transition-colors duration-1000"
                style={{
                    background: `linear-gradient(135deg, ${brandColor} 0%, #000000 100%)`,
                }}
            />

            {/* B. DYNAMIC GLOW EFFECTS (Stitch-Inspired) */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[80px] z-10 pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-black/40 rounded-full blur-[60px] z-10 pointer-events-none" />

            {/* C. GLASS OVERLAY */}
            <div className="absolute inset-0 z-20 backdrop-blur-[2px] bg-white/[0.02] border border-white/10 rounded-[28px] pointer-events-none" />

            {/* D. NOISE TEXTURE (For that 'Deep Design' feel) */}
            <div className="absolute inset-0 z-30 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/asfalt-dark.png")` }} />

            {/* E. CONTENT LAYER */}
            <div className="relative z-40 h-full w-full p-8 flex flex-col justify-between" style={{ color: textColor }}>

                {/* 1. TOP SECTION: CHIP & LOGO */}
                <div className="flex justify-between items-start">
                    {/* PHYSICAL CHIP ASSET */}
                    <div className="w-12 sm:w-16 h-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105 duration-500">
                        <img
                            src="/images/card-chip.png"
                            alt="Card Chip"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* BANK LOGO */}
                    <div className="h-6 sm:h-9 w-fit flex items-center justify-end opacity-90 brightness-110">
                        <LogoComponent className="h-full w-auto drop-shadow-md" />
                    </div>
                </div>

                {/* 2. BOTTOM SECTION: IDENTITY & NUMBER */}
                <div className="space-y-6 sm:space-y-8 mb-2">
                    {/* Account Number */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.4em] font-black opacity-30">
                            Secure Account Number
                        </span>
                        <span className="text-xl sm:text-3xl font-mono tracking-[0.18em] font-black drop-shadow-2xl">
                            {formattedNumber || '0000 0000 0000 0000'}
                        </span>
                    </div>

                    {/* Account Holder */}
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.4em] font-black opacity-30 mb-1">
                                Account Holder
                            </span>
                            <span className="text-sm sm:text-xl font-bold uppercase tracking-widest truncate max-w-[200px] drop-shadow-lg">
                                {accountHolder || 'YOUR NAME'}
                            </span>
                        </div>

                        {/* SUBTLE BRAND MARK */}
                        <div className="opacity-20 flex flex-col items-end">
                            <span className="text-[6px] sm:text-[8px] font-black tracking-[0.5em] uppercase">Private</span>
                            <span className="text-[8px] sm:text-[10px] font-black italic tracking-tighter">Edition</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* F. PREMIUM REFLECTION & SHINE */}
            <m.div
                className="absolute inset-0 z-50 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent skew-x-[-20deg]"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            />
        </m.div>
    );
};
