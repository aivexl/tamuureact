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

    // 2. Resolve Logo Component (Cast to any for build support)
    const LogoComponent = BankLogos[safeBankId] as any;

    // 3. Format account number: Split into two rows of 8 digits each
    const cleanNumber = (accountNumber || '0000000000000000').replace(/\s/g, '').padEnd(16, '0');
    const row1 = cleanNumber.slice(0, 8).replace(/(.{4})/g, '$1 ').trim();
    const row2 = cleanNumber.slice(8, 16).replace(/(.{4})/g, '$1 ').trim();

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[12px] overflow-hidden shadow-2xl select-none ${className}`}
            style={{ backgroundColor: brandColor }}
            initial={!isPreview ? { opacity: 0, scale: 0.98 } : {}}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* CONTENT LAYER - NO OVERLAYS, NO TEXTURES, NO CIRCLES */}
            <div className="relative z-10 h-full w-full p-[8%] flex flex-col items-start" style={{ color: textColor }}>

                {/* 1. TOP: BANK LOGO (MICRO) */}
                <div className="h-[8%] mb-[4%] flex items-center min-h-[14px]">
                    {LogoComponent ? (
                        <div className="h-full w-auto">
                            <LogoComponent className="h-full w-auto block" />
                        </div>
                    ) : (
                        <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest opacity-90">
                            {bank?.name || bankName || ''}
                        </span>
                    )}
                </div>

                {/* 2. EMV CHIP (BELOW LOGO) - ORIGINAL QUALITY */}
                <div className="w-[12%] aspect-[1.2/1] mb-[6%] flex items-center justify-center">
                    <img
                        src="/images/card-chip.png"
                        alt="EMV Chip"
                        className="w-full h-auto block select-none pointer-events-none filter-none"
                        style={{ imageRendering: 'auto' }}
                    />
                </div>

                {/* 3. INFO BLOCK: BANK NAME -> HOLDER -> ACCOUNT NUMBER */}
                <div className="w-full flex flex-col gap-[3%]">
                    {/* BANK NAME (MICRO) */}
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] opacity-60 leading-none">
                        {bank?.name || bankName || 'Bank Name'}
                    </span>

                    {/* HOLDER NAME (SMALL) */}
                    <div className="flex flex-col mt-[4%]">
                        <span className="text-[5px] sm:text-[6px] uppercase tracking-[0.2em] opacity-40 mb-0.5 font-bold">
                            Card Holder
                        </span>
                        <span className="text-[9px] sm:text-[12px] font-bold uppercase tracking-widest leading-none">
                            {accountHolder || 'NAMA LENGKAP'}
                        </span>
                    </div>

                    {/* ACCOUNT NUMBER (TWO ROWS, MONO) */}
                    <div className="flex flex-col gap-[3px] mt-[6%]">
                        <span className="text-[11px] sm:text-[16px] font-mono tracking-[0.2em] font-medium leading-none whitespace-nowrap">
                            {row1}
                        </span>
                        <span className="text-[11px] sm:text-[16px] font-mono tracking-[0.2em] font-medium leading-none whitespace-nowrap">
                            {row2}
                        </span>
                    </div>
                </div>
            </div>
        </m.div>
    );
};
