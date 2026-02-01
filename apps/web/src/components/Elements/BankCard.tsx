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
    const brandColor = customColor || bank?.brandColor || '#005dab';
    const textColor = '#ffffff';

    // 2. Resolve Logo Component (Direct lookup, no hidden detectors)
    const LogoComponent = BankLogos[safeBankId] as any;

    // 3. Raw Account Number (Single Horizontal Row)
    const displayAccountNumber = accountNumber || '0000000000000000';

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[16px] overflow-hidden shadow-2xl select-none antialiased ${className}`}
            style={{
                backgroundColor: brandColor,
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
            } as any}
            initial={!isPreview ? { opacity: 0, scale: 0.98 } : {}}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* CONTENT LAYER */}
            <div className="relative z-10 h-full w-full p-[8%] flex flex-col justify-between" style={{ color: textColor }}>

                {/* TOP ROW: CHIP (LEFT) & LOGO (RIGHT) */}
                <div className="flex justify-between items-start w-full">
                    {/* 1. EMV CHIP - ORIGINAL QUALITY */}
                    <div className="w-[14%] aspect-[1.2/1] flex items-center justify-center">
                        <img
                            src="/images/card-chip.png?v=restored"
                            alt="EMV Chip"
                            className="w-full h-auto block select-none pointer-events-none"
                        />
                    </div>

                    {/* 2. BANK LOGO (TOP RIGHT) - FIX: Absolute height, no hidden detector */}
                    <div className="h-6 sm:h-8 flex items-center">
                        {LogoComponent ? (
                            <LogoComponent className="h-full w-auto" />
                        ) : (
                            <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest opacity-90 leading-none text-right">
                                {bank?.name || bankName || ''}
                            </span>
                        )}
                    </div>
                </div>

                {/* BOTTOM BLOCK: BANK NAME -> HOLDER -> ACCOUNT NUMBER */}
                <div className="w-full flex flex-col items-start gap-[2%] mb-[2%]">
                    {/* BANK NAME (MICRO) */}
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] opacity-60 leading-none">
                        {bank?.name || bankName || 'Bank Name'}
                    </span>

                    {/* HOLDER NAME */}
                    <div className="flex flex-col mt-[4%]">
                        <span className="text-[5px] sm:text-[6px] uppercase tracking-[0.2em] opacity-40 mb-0.5 font-bold">
                            Card Holder
                        </span>
                        <span className="text-[9px] sm:text-[12px] font-bold uppercase tracking-widest leading-none">
                            {accountHolder || 'NAMA LENGKAP'}
                        </span>
                    </div>

                    {/* ACCOUNT NUMBER (SINGLE HORIZONTAL ROW) */}
                    <div className="mt-[6%] w-full">
                        <span className="text-[12px] sm:text-[18px] font-medium leading-none whitespace-nowrap tracking-[0.15em] block overflow-hidden text-ellipsis"
                            style={{ fontFamily: 'monospace' }}>
                            {displayAccountNumber}
                        </span>
                    </div>
                </div>
            </div>
        </m.div>
    );
};
