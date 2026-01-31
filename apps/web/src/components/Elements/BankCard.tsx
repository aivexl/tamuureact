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
            className={`relative w-full aspect-[1.586/1] rounded-[18px] sm:rounded-[24px] overflow-hidden shadow-2xl bg-white border border-black/5 ${className}`}
            initial={!isPreview ? { opacity: 0, scale: 0.95 } : {}}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Card Base Image (The provided white card with chip) */}
            <img
                src="/images/bank-card-base.png"
                alt="Card Base"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            />

            {/* Shine Animation (Subtle for white cards) */}
            <m.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
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

            {/* Content Layer - Text should be dark for the white card */}
            <div className="relative h-full p-4 sm:p-6 flex flex-col justify-between text-black">
                {/* Header: Logo area */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        {bank?.logoType === 'text' ? (
                            <span className="text-lg sm:text-2xl font-black italic tracking-tighter uppercase leading-none" style={{ color: brandColor }}>
                                {bank.logoContent}
                            </span>
                        ) : (
                            <span className="text-sm sm:text-lg font-bold uppercase tracking-widest" style={{ color: brandColor }}>
                                {bankName || 'TAMUU'}
                            </span>
                        )}
                        <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.3em] mt-1 opacity-40 font-bold">
                            DIGITAL INVITATION
                        </span>
                    </div>

                    {/* Network Logo Emoji Placeholder */}
                    <div className="text-xl sm:text-2xl opacity-40 grayscale">
                        {bankName.toLowerCase().includes('dana') || bankName.toLowerCase().includes('ovo') || bankName.toLowerCase().includes('pay') ? '💳' : '🏦'}
                    </div>
                </div>

                {/* Body Area */}
                <div className="flex flex-col gap-2 sm:gap-4 mt-auto">
                    {/* Manual Chip Removed - Now using image chip */}

                    <div className="flex flex-col">
                        <m.span
                            key={accountNumber}
                            className="text-lg sm:text-2xl font-mono tracking-[0.15em] sm:tracking-[0.2em] font-black drop-shadow-sm truncate mb-2"
                        >
                            {formattedNumber || '0000 0000 0000 0000'}
                        </m.span>

                        <div className="flex justify-between items-end">
                            <div className="flex flex-col min-w-0">
                                <span className="text-[7px] sm:text-[9px] uppercase tracking-widest opacity-40 mb-0.5 font-bold">
                                    Account Holder
                                </span>
                                <span className="text-[11px] sm:text-[14px] font-black uppercase tracking-widest truncate max-w-[200px]">
                                    {accountHolder || 'ADD NAME HERE'}
                                </span>
                            </div>

                            <div className="flex flex-col items-end flex-shrink-0">
                                <span className="text-[10px] sm:text-[12px] font-black italic opacity-20">
                                    PREMIUM
                                </span>
                                <div className="text-[10px] sm:text-[12px] font-black tracking-widest opacity-40 scale-x-75 origin-right">
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
