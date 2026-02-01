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
            {/* A. CONTENT LAYER: ULTRA-PRECISION HIERARCHY */}
            <div className="relative z-10 h-full w-full p-[8%] flex flex-col" style={{ color: textColor }}>

                {/* 1. TOP SECTION: LOGO & CHIP */}
                <div className="flex flex-col gap-[8%] mb-auto">
                    {/* A. BANK LOGO (TOP) */}
                    <div className="h-[12%] sm:h-[15%] w-fit flex items-center justify-start">
                        <LogoComponent className="h-full w-auto opacity-90" />
                    </div>

                    {/* B. EMV CHIP (BELOW LOGO) - Realistic scaled size (12-14% width) */}
                    <div className="w-[14%] aspect-square drop-shadow-md">
                        <img
                            src="/images/card-chip.png"
                            alt="EMV"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* 2. BOTTOM SECTION: IDENTITY & NUMBER (BELOW CHIP) */}
                <div className="space-y-[4%] sm:space-y-[6%]">
                    {/* Account Holder */}
                    <div className="flex flex-col">
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.3em] font-black opacity-30 mb-0.5">
                            Card Holder
                        </span>
                        <span className="text-sm sm:text-xl font-bold uppercase tracking-widest truncate leading-none">
                            {accountHolder || 'ALEXANDER PIERCE'}
                        </span>
                    </div>

                    {/* Account Number */}
                    <div className="flex flex-col">
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.3em] font-black opacity-30 mb-0.5">
                            {bankName || 'Premium Bank'}
                        </span>
                        <span className="text-lg sm:text-3xl font-mono tracking-[0.12em] font-black drop-shadow-sm leading-none">
                            {formattedNumber || '0000 0000 0000 0000'}
                        </span>
                    </div>
                </div>
            </div>

            {/* B. SUBTLE DEPTH (Professional Detail) */}
            <div className="absolute inset-0 z-0 ring-1 ring-white/10 pointer-events-none rounded-[22px]" />
            <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]" />
        </m.div>
    );
};
