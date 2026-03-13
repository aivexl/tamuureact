import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Facebook, Instagram, MessageCircle, Share2, Globe, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
    text?: string;
    type?: 'product' | 'store';
}

// Custom X (Twitter) Icon since Lucide might still have the bird
const XIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
    </svg>
);

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    title,
    url,
    type = 'product'
}) => {
    const [copied, setCopied] = useState(false);
    
    // Construct rich share text based on type: Title + CTA + URL
    const fullShareText = `${title}\n\nCek selengkapnya di Tamuu.id\n${url}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(fullShareText);
            setCopied(true);
            toast.success('Berhasil disalin!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Gagal menyalin');
        }
    };

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="w-6 h-6" />,
            color: 'bg-[#25D366]',
            textColor: 'text-white',
            onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(fullShareText)}`, '_blank')
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-6 h-6" />,
            color: 'bg-[#1877F2]',
            textColor: 'text-white',
            onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: 'X',
            icon: <XIcon size={22} />,
            color: 'bg-black',
            textColor: 'text-white',
            onClick: () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(fullShareText)}`, '_blank')
        },
        {
            name: 'Instagram',
            icon: <Instagram className="w-6 h-6" />,
            color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
            textColor: 'text-white',
            onClick: () => {
                handleCopyLink();
                toast('Buka Instagram untuk membagikan teks yang sudah disalin', { icon: '📸' });
            }
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop: Ultra-premium blur as seen in iOS/macOS */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#0A1128]/40 backdrop-blur-xl transition-all duration-500"
                    />

                    {/* Modal Content: Apple Minimalist Design */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        className="relative w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.2)] overflow-hidden border border-white/20"
                    >
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-[#0A1128] tracking-tight uppercase italic">Bagikan</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{type === 'product' ? 'Produk Pilihan' : 'Mitra Terverifikasi'}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#0A1128] hover:text-white transition-all duration-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Info Card */}
                            <div className="p-4 bg-slate-50/80 rounded-3xl border border-slate-100 mb-8 flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#FFBF00] border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                                    <Share2 className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-[#0A1128] truncate uppercase tracking-tight">{title}</p>
                                    <p className="text-[9px] font-bold text-slate-400 truncate tracking-tight lowercase">{url}</p>
                                </div>
                            </div>

                            {/* Social Grid */}
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                {shareOptions.map((opt) => (
                                    <button
                                        key={opt.name}
                                        onClick={opt.onClick}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl ${opt.color} ${opt.textColor} flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all duration-300 group-hover:shadow-current/30`}>
                                            {opt.icon}
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#0A1128] transition-colors">{opt.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Action: Copy Link */}
                            <button
                                onClick={handleCopyLink}
                                className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 font-black uppercase tracking-widest text-[10px] ${
                                    copied 
                                    ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-xl' 
                                    : 'bg-[#0A1128] text-white hover:bg-black shadow-xl shadow-indigo-100'
                                }`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-[#FFBF00]" />}
                                {copied ? 'Berhasil Disalin' : 'Salin'}
                            </button>
                        </div>
                        
                        {/* Footer Branding */}
                        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 text-center">
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Powered by Tamuu.id</p>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
};
