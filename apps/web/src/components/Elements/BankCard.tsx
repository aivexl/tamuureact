import React from 'react';
import { m } from 'framer-motion';
import { getBankByName } from '@/lib/banks';

interface BankCardProps {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    className?: string;
    isPreview?: boolean;
}

export const BankCard: React.FC<BankCardProps> = ({
    bankName,
    accountNumber,
    accountHolder,
    className = '',
    isPreview = false
}) => {
    const bank = getBankByName(bankName);
    const brandColor = bank?.brandColor || '#1a1a1a';
    const textColor = bank?.textColor || '#ffffff';

    // Format account number: Group by 4
    const formattedNumber = accountNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[18px] sm:rounded-[24px] overflow-hidden shadow-2xl ${className}`}
            style={{
                backgroundColor: brandColor,
                color: textColor
            }}
            initial={!isPreview ? { opacity: 0, scale: 0.95 } : {}}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/20 pointer-events-none" />

            {/* Card Base Image (The chip and stylized layout) */}
            <img
                src="/images/bank-card-base.png"
                alt="Card Base"
                className="absolute inset-0 w-full h-full object-cover mix-blend-soft-light opacity-60 pointer-events-none select-none"
            />

            {/* Shine Animation */}
            <m.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                animate={{
                    x: ['-100%', '200%']
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                }}
            />

            {/* Content Layer */}
            <div className="relative h-full p-4 sm:p-6 flex flex-col justify-between">
                {/* Header: Logo above chip area (left side) */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        {bank?.logoType === 'text' ? (
                            <span className="text-lg sm:text-2xl font-black italic tracking-tighter uppercase leading-none drop-shadow-sm">
                                {bank.logoContent}
                            </span>
                        ) : (
                            <span className="text-sm sm:text-lg font-bold uppercase tracking-widest drop-shadow-sm">
                                {bankName || 'TAMUU'}
                            </span>
                        )}
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.3em] mt-1 opacity-70 font-bold">
                            DIGITAL INVITATION
                        </span>
                    </div>

                    {/* Network Logo Emoji Placeholder */}
                    <div className="text-xl sm:text-2xl opacity-60 filter grayscale brightness-200">
                        {bankName.toLowerCase().includes('dana') || bankName.toLowerCase().includes('ovo') || bankName.toLowerCase().includes('pay') ? '💳' : '🏦'}
                    </div>
                </div>

                {/* Body Area */}
                <div className="flex flex-col gap-2 sm:gap-4 mt-auto">
                    {/* Chip simulation (positioned relative to logo) */}
                    <div className="w-10 h-7 sm:w-12 sm:h-9 rounded-md bg-gradient-to-br from-[#ffd700] via-[#f7d560] to-[#ffd700] shadow-md border border-black/10 relative overflow-hidden flex items-center justify-center p-1">
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 opacity-20">
                            {[...Array(9)].map((_, i) => <div key={i} className="border border-black" />)}
                        </div>
                        <div className="absolute inset-x-1 h-px bg-black/10 top-1/2" />
                        <div className="absolute inset-y-1 w-px bg-black/10 left-1/2" />
                    </div>

                    <div className="flex flex-col">
                        <m.span
                            key={accountNumber}
                            className="text-lg sm:text-2xl font-mono tracking-[0.15em] sm:tracking-[0.2em] font-black drop-shadow-md truncate"
                        >
                            {formattedNumber || '0000 0000 0000 0000'}
                        </m.span>

                        <div className="flex justify-between items-end mt-1 sm:mt-2">
                            <div className="flex flex-col min-w-0">
                                <span className="text-[7px] sm:text-[9px] uppercase tracking-widest opacity-60 mb-0.5 font-bold">
                                    Account Holder
                                </span>
                                <span className="text-[11px] sm:text-[14px] font-black uppercase tracking-widest truncate max-w-[200px]">
                                    {accountHolder || 'ADD NAME HERE'}
                                </span>
                            </div>

                            <div className="flex flex-col items-end flex-shrink-0">
                                <span className="text-[10px] sm:text-[12px] font-black italic opacity-40">
                                    PREMIUM
                                </span>
                                <div className="text-[10px] sm:text-[12px] font-black tracking-widest opacity-80 scale-x-75 origin-right">
                                    TAMUU
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </m.div>
    );
};
