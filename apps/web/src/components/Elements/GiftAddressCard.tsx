import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Home, Copy, Check, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GiftAddressCardProps {
    recipientName: string;
    address: string;
    customColor?: string;
    className?: string;
    isPreview?: boolean;
}

export const GiftAddressCard: React.FC<GiftAddressCardProps> = ({
    recipientName,
    address,
    customColor = '#f8fafc', // Default slate-50
    className = '',
    isPreview = false
}) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, fieldName: string) => {
        if (!text || isPreview) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        toast.success(`${fieldName} copied!`, {
            id: `copy-address-${fieldName}`,
        });
        setTimeout(() => setCopiedField(null), 2000);
    };

    const CopyIcon = ({ fieldName, size = 12 }: { fieldName: string, size?: number }) => (
        <div className="ml-2 transition-opacity duration-200 flex-shrink-0 flex items-center justify-center">
            {copiedField === fieldName ? (
                <Check size={size} className="text-emerald-500" />
            ) : (
                <Copy size={size} className="opacity-20 group-hover:opacity-100 transition-opacity text-slate-400" />
            )}
        </div>
    );

    return (
        <m.div
            className={`relative w-full aspect-[1.586/1] rounded-[16px] overflow-hidden shadow-2xl select-none antialiased border border-slate-100 transform-gpu ${className}`}
            style={{
                backgroundColor: customColor,
            }}
            initial={!isPreview ? { opacity: 0, scale: 0.98 } : {}}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* HOUSE ICON WATERMARK */}
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] pointer-events-none">
                <Home size={240} />
            </div>

            <div className="relative z-10 h-full w-full p-[8%] flex flex-col justify-between">
                {/* HEADER */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
                        <Home size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Gift Address</span>
                        <span className="text-[14px] font-black uppercase tracking-widest text-slate-900 mt-1">Alamat Gift/Kado</span>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col gap-4 mt-auto">
                    {/* RECIPIENT */}
                    <button
                        onClick={() => handleCopy(recipientName, 'Recipient Name')}
                        className={`w-full group flex flex-col items-start outline-none transition-transform active:scale-[0.98] ${isPreview ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                        <div className="flex items-center w-full">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">Penerima</span>
                            {!isPreview && <CopyIcon fieldName="Recipient Name" size={10} />}
                        </div>
                        <span className="text-[14px] sm:text-[18px] font-bold text-slate-800 uppercase tracking-wide truncate w-full text-left">
                            {recipientName || 'NAMA PENERIMA'}
                        </span>
                    </button>

                    {/* ADDRESS */}
                    <button
                        onClick={() => handleCopy(address, 'Address')}
                        className={`w-full group flex flex-col items-start outline-none transition-transform active:scale-[0.98] ${isPreview ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                        <div className="flex items-center w-full">
                            <MapPin size={10} className="text-rose-500 mr-1.5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Alamat Lengkap</span>
                            {!isPreview && <CopyIcon fieldName="Address" size={10} />}
                        </div>
                        <span className="text-[10px] sm:text-[12px] font-medium text-slate-500 mt-1 leading-relaxed text-left line-clamp-2 w-full">
                            {address || 'Masukkan alamat lengkap di sini...'}
                        </span>
                    </button>
                </div>
            </div>

            {/* DECORATIVE LINE */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-emerald-400 to-slate-200 opacity-30" />
        </m.div>
    );
};
