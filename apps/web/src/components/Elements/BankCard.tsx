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
    const brandColor = customColor || bank?.brandColor || '#0B132B';
    const textColor = bank?.textColor || '#ffffff';

    // 2. Resolve Logo Component
    const LogoComponent = BankLogos[safeBankId] || BankLogos.unknown;

    // 3. Format account number: Group by 4
    const formattedNumber = (accountNumber || '').replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[18px] overflow-hidden shadow-2xl select-none group ${className}`}
            style={{ backgroundColor: brandColor }}
            initial={!isPreview ? { opacity: 0, scale: 0.98 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* A. DECORATIVE LAYER: Subtle Diagonal Pattern (Inspired by Reference) */}
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="diagonalLines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="20" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#diagonalLines)" />
                </svg>
            </div>

            {/* B. CONTENT LAYER: ASYMMETRIC PROFESSIONAL LAYOUT */}
            <div className="relative z-10 h-full w-full p-[8%] flex flex-col justify-between" style={{ color: textColor }}>

                {/* 1. TOP-LEFT: BRANDING */}
                <div className="flex flex-col gap-[10%]">
                    {/* BANK LOGO (Top-most, small and elegant) */}
                    <div className="h-[10%] sm:h-[12%] w-fit flex items-center justify-start min-h-[16px]">
                        <LogoComponent className="h-full w-auto opacity-100" />
                        {!bank && (
                            <span className="ml-2 text-[10px] sm:text-[12px] font-bold tracking-widest uppercase opacity-80">
                                {bankName || 'Premium Bank'}
                            </span>
                        )}
                    </div>

                    {/* EMV CHIP (Directly below logo, realistic size) */}
                    <div className="w-[15%] aspect-[1.2/1] drop-shadow-md brightness-110">
                        <img
                            src="/images/card-chip.png"
                            alt="EMV"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* 2. BOTTOM SECTION: IDENTITY & NUMBER */}
                <div className="space-y-[6%] mb-1">
                    {/* Account Number (Spacious, mono) */}
                    <div className="flex flex-col">
                        <span className="text-sm sm:text-2xl font-mono tracking-[0.15em] font-medium drop-shadow-md text-white/95">
                            {formattedNumber || '0000 0000 0000 0000'}
                        </span>
                    </div>

                    {/* Bottom Row: Holder & Network Watermark */}
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[6px] sm:text-[8px] uppercase tracking-[0.4em] font-black opacity-30 mb-0.5">
                                Card Holder
                            </span>
                            <span className="text-[10px] sm:text-[14px] font-semibold uppercase tracking-widest truncate leading-tight">
                                {accountHolder || 'ALEXANDER PIERCE'}
                            </span>
                        </div>

                        {/* Subtle Network Placeholder (Right Bottom) */}
                        <div className="flex -space-x-2 opacity-20">
                            <div className="w-6 h-6 rounded-full bg-white/40" />
                            <div className="w-6 h-6 rounded-full bg-white/20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* C. DEPTH DETAILS */}
            <div className="absolute inset-0 z-0 ring-1 ring-white/5 pointer-events-none rounded-[18px]" />
            <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
        </m.div>
    );
};
