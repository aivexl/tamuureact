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
    const brandColor = customColor || bank?.brandColor || '#0066AE';
    const textColor = bank?.textColor || '#ffffff';

    // 2. Resolve Logo Component
    const LogoComponent = BankLogos[safeBankId] || BankLogos.unknown;

    // 3. Format account number: Split into two rows of 8 digits each
    const cleanNumber = (accountNumber || '0000000000000000').replace(/\s/g, '');
    const row1 = cleanNumber.slice(0, 8).replace(/(.{4})/g, '$1 ').trim();
    const row2 = cleanNumber.slice(8, 16).replace(/(.{4})/g, '$1 ').trim();

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl select-none ${className}`}
            style={{ backgroundColor: brandColor }}
            initial={!isPreview ? { opacity: 0, scale: 0.98 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* CONTENT LAYER */}
            <div className="relative z-10 h-full w-full p-6 flex flex-col justify-between" style={{ color: textColor }}>

                {/* TOP SECTION */}
                <div className="flex flex-col gap-4">
                    {/* BANK LOGO - Fixed height container */}
                    <div className="h-6 sm:h-8 flex items-center">
                        <LogoComponent className="h-full w-auto max-w-[120px]" />
                        {!bank && bankName && (
                            <span className="text-sm sm:text-base font-bold tracking-wide uppercase">
                                {bankName}
                            </span>
                        )}
                    </div>

                    {/* EMV CHIP - Original quality, no filters */}
                    <div className="w-12 sm:w-14">
                        <img
                            src="/images/card-chip.png"
                            alt="EMV Chip"
                            className="w-full h-auto"
                        />
                    </div>
                </div>

                {/* BOTTOM SECTION */}
                <div className="flex flex-col gap-3">
                    {/* ACCOUNT NUMBER - Two rows */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-lg sm:text-xl font-mono tracking-[0.2em] font-medium">
                            {row1 || '0000 0000'}
                        </span>
                        <span className="text-lg sm:text-xl font-mono tracking-[0.2em] font-medium">
                            {row2 || '0000 0000'}
                        </span>
                    </div>

                    {/* CARD HOLDER */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] opacity-50">
                            Card Holder
                        </span>
                        <span className="text-sm sm:text-base font-semibold uppercase tracking-wider">
                            {accountHolder || 'NAMA LENGKAP'}
                        </span>
                    </div>
                </div>
            </div>
        </m.div>
    );
};
