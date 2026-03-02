import React from 'react';
import { m } from 'framer-motion';
import { Home, MapPin, Phone, User } from 'lucide-react';
import { AnimatedCopyIcon } from '../ui/AnimatedCopyIcon';

interface GiftAddressCardProps {
    recipientName: string;
    phoneNumber: string;
    address: string;
    customColor?: string;
    className?: string;
    isPreview?: boolean;
}

export const GiftAddressCard: React.FC<GiftAddressCardProps> = ({
    recipientName,
    phoneNumber,
    address,
    customColor = '#f8fafc',
    className = '',
    isPreview = false
}) => {
    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-2xl select-none antialiased border border-slate-100 transform-gpu bg-white ${className}`}
            style={{
                backgroundColor: customColor,
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
            } as any}
            initial={!isPreview ? { opacity: 0, scale: 0.98 } : {}}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* HOUSE ICON WATERMARK - CTO Subtle Branding */}
            <div className="absolute -right-12 -bottom-12 opacity-[0.02] pointer-events-none rotate-12">
                <Home size={320} />
            </div>

            <div className="relative z-10 h-full w-full p-[5%] flex flex-col gap-3 sm:gap-4">
                {/* HEADER SECTION */}
                <div className="flex items-center gap-3 border-b border-slate-200/50 pb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                        <Home size={18} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 leading-none mb-0.5">Shipping Details</span>
                        <span className="text-[14px] sm:text-[16px] font-black uppercase tracking-widest text-slate-900">Alamat Kirim Kado</span>
                    </div>
                </div>

                {/* INFORMATION STACK - Vertical Sections */}
                <div className="flex-1 flex flex-col justify-between py-1">
                    
                    {/* SECTION 1: RECIPIENT */}
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-teal-600 transition-colors">
                                <User size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Nama Penerima</span>
                                <span className="text-[13px] sm:text-[15px] font-bold text-slate-900 uppercase tracking-wide truncate max-w-[180px]">
                                    {recipientName || 'NAMA PENERIMA'}
                                </span>
                            </div>
                        </div>
                        <AnimatedCopyIcon 
                            text={recipientName || 'NAMA PENERIMA'} 
                            size={16} 
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-teal-600 transition-all"
                            successMessage="Nama disalin!"
                        />
                    </div>

                    {/* SECTION 2: PHONE */}
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-teal-600 transition-colors">
                                <Phone size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Nomor Telepon</span>
                                <span className="text-[14px] sm:text-[16px] font-black text-teal-600 tracking-[0.1em] font-mono">
                                    {phoneNumber || '08XXXXXXXXXX'}
                                </span>
                            </div>
                        </div>
                        <AnimatedCopyIcon 
                            text={phoneNumber || '08XXXXXXXXXX'} 
                            size={16} 
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-teal-600 transition-all"
                            successMessage="Nomor disalin!"
                        />
                    </div>

                    {/* SECTION 3: ADDRESS */}
                    <div className="flex items-start justify-between group pt-3 border-t border-slate-100/80">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shrink-0">
                                <MapPin size={16} />
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Detail Alamat Lengkap</span>
                                <p className="text-[10px] sm:text-[12px] font-bold text-slate-600 leading-tight text-left line-clamp-2 pr-2">
                                    {address || 'Masukkan detail alamat lengkap pengiriman kado di sini...'}
                                </p>
                            </div>
                        </div>
                        <div className="pt-0.5">
                            <AnimatedCopyIcon 
                                text={address || 'Alamat lengkap pengiriman kado di sini...'} 
                                size={16} 
                                className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-teal-600 transition-all"
                                successMessage="Alamat disalin!"
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* PREMIUM ACCENT LINE */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-200 via-teal-100 to-slate-200" />
        </m.div>
    );
};
