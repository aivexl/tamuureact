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
            className={`relative w-full aspect-[1.15/1] rounded-[24px] overflow-hidden shadow-2xl select-none antialiased border border-slate-100 transform-gpu bg-white ${className}`}
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

            <div className="relative z-10 h-full w-full p-[7%] flex flex-col gap-6">
                {/* HEADER SECTION */}
                <div className="flex items-center gap-4 border-b border-slate-200/50 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/20">
                        <Home size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 leading-none mb-1">Shipping Details</span>
                        <span className="text-[16px] font-black uppercase tracking-widest text-slate-900">Alamat Kirim Kado</span>
                    </div>
                </div>

                {/* INFORMATION STACK - Vertical Sections */}
                <div className="flex-1 flex flex-col justify-between">
                    
                    {/* SECTION 1: RECIPIENT */}
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-teal-600 transition-colors">
                                <User size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Nama Penerima</span>
                                <span className="text-[15px] sm:text-[18px] font-bold text-slate-900 uppercase tracking-wide truncate max-w-[180px]">
                                    {recipientName || 'NAMA PENERIMA'}
                                </span>
                            </div>
                        </div>
                        <AnimatedCopyIcon 
                            text={recipientName || 'NAMA PENERIMA'} 
                            size={18} 
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-teal-600 transition-all"
                            successMessage="Nama disalin!"
                        />
                    </div>

                    {/* SECTION 2: PHONE */}
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-teal-600 transition-colors">
                                <Phone size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Nomor Telepon</span>
                                <span className="text-[16px] sm:text-[19px] font-black text-teal-600 tracking-[0.15em] font-mono">
                                    {phoneNumber || '08XXXXXXXXXX'}
                                </span>
                            </div>
                        </div>
                        <AnimatedCopyIcon 
                            text={phoneNumber || '08XXXXXXXXXX'} 
                            size={18} 
                            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-teal-600 transition-all"
                            successMessage="Nomor disalin!"
                        />
                    </div>

                    {/* SECTION 3: ADDRESS */}
                    <div className="flex items-start justify-between group pt-4 border-t border-slate-100/80">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shrink-0">
                                <MapPin size={18} />
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Detail Alamat Lengkap</span>
                                <p className="text-[11px] sm:text-[13px] font-bold text-slate-600 leading-[1.5] text-left line-clamp-4 pr-2">
                                    {address || 'Masukkan detail alamat lengkap pengiriman kado di sini...'}
                                </p>
                            </div>
                        </div>
                        <div className="pt-1">
                            <AnimatedCopyIcon 
                                text={address || 'Alamat lengkap pengiriman kado di sini...'} 
                                size={18} 
                                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-teal-600 transition-all"
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
