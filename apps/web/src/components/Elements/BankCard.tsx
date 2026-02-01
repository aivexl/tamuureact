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
    const brandColor = customColor || bank?.brandColor || bankName ? '#005dab' : '#005dab'; // Default blue if unknown
    const textColor = '#ffffff';

    // 2. Resolve Logo Component
    const LogoComponent = BankLogos[safeBankId] as any;
    const shouldForceWhite = bank?.forceWhiteLogo;

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[16px] overflow-hidden shadow-2xl select-none antialiased transform-gpu ${className}`}
            style={{
                backgroundColor: brandColor,
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                imageRendering: 'high-quality'
            } as any}
            initial={!isPreview ? { opacity: 0, scale: 0.98 } : {}}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* CONTENT LAYER */}
            <div className="relative z-10 h-full w-full p-[8%] flex flex-col justify-between" style={{ color: textColor }}>

                {/* 1. TOP ROW: BANK LOGO (Left) */}
                <div className="w-full flex justify-start items-center h-[16%] min-h-[20px]">
                    {LogoComponent ? (
                        <div className="h-full">
                            <LogoComponent
                                className={`h-full w-auto object-contain object-left ${shouldForceWhite ? 'brightness-0 invert' : ''}`}
                            />
                        </div>
                    ) : (
                        <span className="text-[14px] sm:text-[18px] font-black uppercase tracking-widest opacity-90 leading-none shadow-sm">
                            {bank?.name || bankName || ''}
                        </span>
                    )}
                </div>

                {/* 2. MIDDLE BLOCK: CHIP -> BANK NAME (Stacked Vertically) */}
                <div className="flex flex-col items-start gap-[6%] mt-[4%] mb-auto">
                    {/* EMV CHIP */}
                    <div className="w-[13%] aspect-[1.2/1] flex-shrink-0 flex items-center justify-center">
                        <img
                            src="/images/card-chip.png?v=restored"
                            alt="EMV Chip"
                            className="w-full h-auto block select-none pointer-events-none drop-shadow-md"
                        />
                    </div>

                    {/* BANK NAME (Below Chip, Bold, Single Line) */}
                    <div className="w-full mt-[3%]">
                        <span className="text-[11px] sm:text-[15px] font-black uppercase tracking-widest leading-none drop-shadow-md opacity-95 block truncate">
                            {bank?.name || bankName || 'BANK NAME'}
                        </span>
                    </div>
                </div>

                {/* 3. BOTTOM BLOCK: NAME -> ACCOUNT NUMBER (Proportional) */}
                <div className="w-full flex flex-col items-start gap-[2%] mt-auto">
                    {/* NAME (Large & Bold) */}
                    <div className="w-full mb-[2%]">
                        <span className="text-[12px] sm:text-[16px] font-bold uppercase tracking-widest leading-none text-shadow-md block truncate opacity-90">
                            {accountHolder || 'NAMA LENGKAP'}
                        </span>
                    </div>

                    {/* ACCOUNT NUMBER (Monospaced, Clean) */}
                    <div className="w-full">
                        <span className="text-[14px] sm:text-[20px] font-semibold leading-none whitespace-nowrap tracking-[0.15em] block overflow-hidden text-ellipsis drop-shadow-lg"
                            style={{ fontFamily: 'monospace' }}>
                            {accountNumber || '0000000000000000'}
                        </span>
                    </div>
                </div>
            </div>
        </m.div>
    );
};
