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
    // Priority: Custom Color > Bank Brand Color > Default Dark
    const brandColor = customColor || bank?.brandColor || '#2d3436';
    const textColor = bank?.textColor || '#ffffff';

    // 2. Resolve Logo Component
    const LogoComponent = BankLogos[safeBankId] || BankLogos.unknown;

    // 3. Format account number: Group by 4
    const formattedNumber = (accountNumber || '').replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[18px] sm:rounded-[24px] overflow-hidden shadow-2xl ${className}`}
            style={{ backgroundColor: brandColor }}
            initial={!isPreview ? { opacity: 0, scale: 0.95 } : {}}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* A. Base Layer: Solid Brand Color (Applied via style above) */}

            {/* B. Overlay: Transparent Card Texture (Border, Shine, Detail) */}
            <img
                src="/images/bank-card-transparent.png"
                alt="Card Frame"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-20 mix-blend-overlay opacity-50"
            />
            {/* Additional crisp border for definition */}
            <div className="absolute inset-0 rounded-[18px] sm:rounded-[24px] border border-white/20 z-30 pointer-events-none" />

            {/* C. Content Layer: Strictly positioned elements */}
            <div className="relative z-40 h-full p-6 flex flex-col" style={{ color: textColor }}>

                {/* 1. Logo Position: Top Left (Above Chip) */}
                <div className="h-8 sm:h-12 w-32 flex items-center justify-start mb-4">
                    <LogoComponent className="h-full w-auto max-w-full drop-shadow-md" />
                </div>

                {/* 2. Chip Position: Below Logo */}
                <div className="w-10 h-7 sm:w-12 sm:h-9 rounded-md bg-gradient-to-br from-[#ffd700] via-[#f7d560] to-[#ffd700] shadow-sm border border-black/10 relative overflow-hidden flex items-center justify-center mb-6">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 opacity-30">
                        {[...Array(9)].map((_, i) => <div key={i} className="border border-black" />)}
                    </div>
                </div>

                {/* 3. Account Info: Below Chip */}
                <div className="mt-auto flex flex-col gap-1">
                    {/* Account Holder Name (Below Chip) */}
                    <div>
                        <span className="text-[8px] sm:text-[10px] uppercase tracking-widest opacity-80 block mb-0.5">
                            Account Holder
                        </span>
                        <span className="text-sm sm:text-lg font-bold uppercase tracking-wider truncate block max-w-full drop-shadow-sm">
                            {accountHolder || 'YOUR NAME'}
                        </span>
                    </div>

                    {/* Account Number (Below Name) */}
                    <div className="mt-2">
                        <span className="text-lg sm:text-2xl font-mono tracking-widest font-black drop-shadow-md block truncate">
                            {formattedNumber || '0000 0000'}
                        </span>
                    </div>
                </div>

                {/* Premium Brand Label (Bottom Right) */}
                <div className="absolute bottom-6 right-6 text-right opacity-80">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold block">
                        PREMIUM
                    </span>
                    <span className="text-[12px] font-black italic">
                        TAMUU
                    </span>
                </div>
            </div>

            {/* D. Shine Effect */}
            <m.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] z-50 pointer-events-none"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            />
        </m.div>
    );
};
