import React, { useMemo, useState } from 'react';
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
    const [logoError, setLogoError] = useState(false);

    // 1. Resolve Bank Data safely
    const bank = useMemo(() => getBankByName(bankName || ''), [bankName]);
    const safeBankId = bank?.id || 'unknown';
    const brandColor = customColor || bank?.brandColor || '#005dab';
    const textColor = bank?.textColor || '#ffffff';

    // 2. Resolve Logo Component
    const LogoComponent = BankLogos[safeBankId] || BankLogos.unknown;

    // 3. Format account number: Split into two rows of 8 digits each
    const cleanNumber = (accountNumber || '0000000000000000').replace(/\s/g, '').padEnd(16, '0');
    const row1 = cleanNumber.slice(0, 8).replace(/(.{4})/g, '$1 ').trim();
    const row2 = cleanNumber.slice(8, 16).replace(/(.{4})/g, '$1 ').trim();

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[16px] overflow-hidden shadow-2xl select-none ${className}`}
            style={{ backgroundColor: brandColor }}
            initial={!isPreview ? { opacity: 0, scale: 0.98 } : {}}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* PURE SOLID COLOR - NO TEXTURES */}

            {/* CONTENT LAYER: PIXEL-PERFECT PROPORTIONS */}
            <div className="relative z-10 h-full w-full p-[8%] flex flex-col justify-between" style={{ color: textColor }}>

                {/* 1. TOP SECTION: LOGO & CHIP */}
                <div className="flex flex-col gap-[6%]">
                    {/* BANK BRANDING (Top Left) */}
                    <div className="h-[12%] sm:h-[15%] flex items-center gap-[4%] min-h-[20px]">
                        {/* Logo with Error Handling */}
                        {!logoError ? (
                            <div className="h-full w-auto">
                                <LogoComponent className="h-full w-auto block" />
                                {/* Hidden img to detect load errors if LogoComponent uses img */}
                                <img
                                    src={`/images/logos/banks/${safeBankId}.png`}
                                    className="hidden"
                                    onError={() => setLogoError(true)}
                                    alt=""
                                />
                            </div>
                        ) : (
                            <span className="text-[12px] sm:text-[18px] font-black uppercase tracking-widest whitespace-nowrap">
                                {bankName || 'TAMUU BANK'}
                            </span>
                        )}

                        {/* Secondary Name (Optional - Only if logo exists but we want text too) */}
                        {!logoError && bank && (
                            <span className="text-[8px] sm:text-[12px] font-bold uppercase tracking-wider opacity-60">
                                {bank.name}
                            </span>
                        )}
                    </div>

                    {/* EMV CHIP (Middle Left) - Precise 13.4% Width */}
                    <div className="w-[14%] aspect-[1.3/1] bg-[#C1A25C] rounded-[4px] relative overflow-hidden">
                        <img
                            src="/images/card-chip.png"
                            alt="EMV Chip"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* 2. BOTTOM SECTION: IDENTITY & NUMBER */}
                <div className="space-y-[6%]">
                    {/* ACCOUNT NUMBER (Two rows as requested) */}
                    <div className="flex flex-col gap-[2%]">
                        <span className="text-[14px] sm:text-[24px] font-mono tracking-[0.2em] font-medium leading-none drop-shadow-md">
                            {row1}
                        </span>
                        <span className="text-[14px] sm:text-[24px] font-mono tracking-[0.2em] font-medium leading-none drop-shadow-md">
                            {row2}
                        </span>
                    </div>

                    {/* CARD HOLDER */}
                    <div className="flex flex-col">
                        <span className="text-[6px] sm:text-[8px] uppercase tracking-[0.4em] font-black opacity-40 mb-1">
                            Card Holder
                        </span>
                        <span className="text-[10px] sm:text-[16px] font-bold uppercase tracking-widest truncate leading-none">
                            {accountHolder || 'ALEXANDER PIERCE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* NETWORK WATERMARK (Subtle) */}
            <div className="absolute bottom-[8%] right-[8%] opacity-20 flex -space-x-[15%]">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white" />
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/60" />
            </div>
        </m.div>
    );
};
