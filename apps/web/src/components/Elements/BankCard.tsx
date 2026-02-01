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

    // 2. Resolve Logo Component
    const LogoComponent = BankLogos[safeBankId] as any;
    const shouldForceWhite = bank?.forceWhiteLogo;

    // 3. Raw Account Number
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

                {/* 1. TOP ROW: BANK LOGO (Slightly larger as requested) */}
                <div className="w-full flex justify-start items-center h-[14%] min-h-[16px] mb-[2%]">
                    {LogoComponent ? (
                        <div className="h-full">
                            <LogoComponent
                                className={`h-full w-auto object-contain object-left ${shouldForceWhite ? 'brightness-0 invert' : ''}`}
                            />
                        </div>
                    ) : (
                        <span className="text-[12px] sm:text-[14px] font-black uppercase tracking-widest opacity-90 leading-none">
                            {bank?.name || bankName || ''}
                        </span>
                    )}
                </div>

                {/* 2. MIDDLE ROW: CHIP & BANK NAME (Aligned) */}
                <div className="flex items-center gap-[4%] mb-auto mt-[2%] max-w-full overflow-hidden">
                    {/* EMV CHIP */}
                    <div className="w-[12%] aspect-[1.2/1] flex-shrink-0 flex items-center justify-center">
                        <img
                            src="/images/card-chip.png?v=restored"
                            alt="EMV Chip"
                            className="w-full h-auto block select-none pointer-events-none"
                        />
                    </div>

                    {/* BANK NAME (Proportional, Bold, Single Row Only) */}
                    <span className="text-[10px] sm:text-[12px] font-bold uppercase tracking-widest leading-none drop-shadow-sm opacity-90 whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                        {bank?.name || bankName || 'Bank Name'}
                    </span>
                </div>

                {/* 3. BOTTOM BLOCK: HOLDER (REMOVED) -> ACCOUNT NUMBER */}
                <div className="w-full flex flex-col items-start gap-[1%] mt-auto">
                    {/* NAME (Formerly Holder Name position, now just Name but bigger) */}
                    <div className="w-full mb-[2%]">
                        <span className="text-[10px] sm:text-[14px] font-bold uppercase tracking-widest leading-none text-shadow-sm block truncate">
                            {accountHolder || 'NAMA LENGKAP'}
                        </span>
                    </div>

                    {/* ACCOUNT NUMBER (Proportional Font) */}
                    <div className="w-full">
                        <span className="text-[13px] sm:text-[18px] font-medium leading-none whitespace-nowrap tracking-[0.14em] block overflow-hidden text-ellipsis drop-shadow-md"
                            style={{ fontFamily: 'monospace' }}>
                            {displayAccountNumber}
                        </span>
                    </div>
                </div>
            </div>
        </m.div>
    );
};
