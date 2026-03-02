import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { getBankByName } from '@/lib/banks';
import { BankLogos } from './BankLogos';
import { AnimatedCopyIcon } from '../ui/AnimatedCopyIcon';

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
    const brandColor = customColor || bank?.brandColor || (bankName ? '#005dab' : '#005dab'); // Default blue if unknown
    const textColor = '#ffffff';

    // 2. Resolve Logo Component
    const LogoComponent = BankLogos[safeBankId] as any;
    const shouldForceWhite = bank?.forceWhiteLogo;

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-2xl select-none antialiased transform-gpu ${className}`}
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
            <div className="relative z-10 h-full w-full p-[6%] flex flex-col justify-between" style={{ color: textColor }}>

                {/* 1. TOP ROW: BANK LOGO (Left) - REFINED SIZE */}
                <div className="w-full flex justify-start items-center h-[18%] min-h-[24px]">
                    {LogoComponent ? (
                        <div className="h-full">
                            <LogoComponent
                                className={`h-full w-auto object-contain object-left ${shouldForceWhite ? 'brightness-0 invert' : ''}`}
                            />
                        </div>
                    ) : (
                        <span className="text-[14px] sm:text-[18px] font-black uppercase tracking-widest opacity-90 translation-none drop-shadow-sm">
                            {bank?.name || bankName || ''}
                        </span>
                    )}
                </div>

                {/* 2. BOTTOM STACK: CHIP -> BANK NAME -> HOLDER -> NUMBER (Perfectly Proportional) */}
                <div className="w-full flex flex-col items-start gap-[1%] mt-auto">
                    {/* EMV CHIP -> ELEVATED */}
                    <div className="w-[14%] aspect-[1.3/1] mb-[8%]">
                        <img
                            src="/images/card-chip.png?v=restored"
                            alt="EMV Chip"
                            className="w-full h-auto block select-none pointer-events-none drop-shadow-md"
                        />
                    </div>

                    {/* BANK NAME -> Uniform Gap below */}
                    <div className="w-full mb-[2.5%] text-left group flex items-center outline-none">
                        <span className="text-[10px] sm:text-[13px] font-black uppercase tracking-widest leading-none drop-shadow-sm opacity-90 block truncate flex-1">
                            {bank?.name || bankName || 'BANK NAME'}
                        </span>
                        {(bank?.name || bankName) && (
                            <AnimatedCopyIcon 
                                text={bank?.name || bankName || ''} 
                                size={14} 
                                className="ml-2 opacity-40 group-hover:opacity-100 transition-all" 
                                successMessage="Nama Bank disalin!" 
                            />
                        )}
                    </div>

                    {/* ACCOUNT HOLDER -> Uniform Gap below */}
                    <div className="w-full mb-[2.5%] text-left group flex items-center outline-none">
                        <span className="text-[12px] sm:text-[16px] font-bold uppercase tracking-widest leading-none text-shadow-md block truncate flex-1">
                            {accountHolder || 'NAMA LENGKAP'}
                        </span>
                        {accountHolder && (
                            <AnimatedCopyIcon 
                                text={accountHolder} 
                                size={14} 
                                className="ml-2 opacity-40 group-hover:opacity-100 transition-all" 
                                successMessage="Pemilik disalin!" 
                            />
                        )}
                    </div>

                    {/* ACCOUNT NUMBER */}
                    <div className="w-full text-left group flex items-center outline-none">
                        <span className="text-[15px] sm:text-[22px] font-semibold leading-none whitespace-nowrap tracking-widest block overflow-hidden text-ellipsis drop-shadow-lg flex-1"
                            style={{ fontFamily: 'monospace' }}>
                            {accountNumber || '0000000000000000'}
                        </span>
                        {accountNumber && (
                            <AnimatedCopyIcon 
                                text={accountNumber} 
                                size={18} 
                                className="ml-2 opacity-40 group-hover:opacity-100 transition-all" 
                                successMessage="Nomor Rekening disalin!" 
                            />
                        )}
                    </div>
                </div>
            </div>
        </m.div>
    );
};
