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
            className={`relative w-full aspect-[1.586/1] rounded-[22px] overflow-hidden shadow-2xl select-none ${className}`}
            style={{ backgroundColor: brandColor }}
            initial={!isPreview ? { opacity: 0, scale: 0.98 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* A. CONTENT LAYER: STRICT VERTICAL HIERARCHY */}
            <div className="relative z-10 h-full w-full p-6 sm:p-8 flex flex-col" style={{ color: textColor }}>

                {/* 1. TOP-LEFT: LOGO & CHIP ALIGNMENT */}
                <div className="flex flex-col gap-4 mb-auto">
                    {/* A. BANK LOGO (TOPMOST) */}
                    <div className="h-4 sm:h-6 w-fit flex items-center justify-start opacity-90">
                        <LogoComponent className="h-full w-auto" />
                    </div>

                    {/* B. EMV CHIP (BELOW LOGO) - Realistic proportioned size */}
                    <div className="w-10 sm:w-14 h-auto drop-shadow-md">
                        <img
                            src="/images/card-chip.png"
                            alt="EMV Chip"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* 2. BOTTOM SECTION: ACCOUNT INFORMATION (BELOW CHIP) */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Account Holder */}
                    <div className="flex flex-col">
                        <span className="text-[6px] sm:text-[8px] uppercase tracking-[0.3em] font-black opacity-30 mb-0.5">
                            Card Holder
                        </span>
                        <span className="text-sm sm:text-lg font-bold uppercase tracking-widest truncate">
                            {accountHolder || 'ALEXANDER PIERCE'}
                        </span>
                    </div>

                    {/* Footer Row: Account Number & Bank Name */}
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                            <span className="text-[6px] sm:text-[8px] uppercase tracking-[0.3em] font-black opacity-30">
                                {bankName || 'Premium Bank'}
                            </span>
                            <span className="text-base sm:text-2xl font-mono tracking-[0.1em] font-black drop-shadow-sm">
                                {formattedNumber || '0000 0000 0000 0000'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* B. LIGHTING & DEPTH (Ultra-Realistic Subtle Shadow/Highlight) */}
            <div className="absolute inset-0 z-0 ring-1 ring-white/5 pointer-events-none rounded-[22px]" />
            <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" />
        </m.div>
    );
};
