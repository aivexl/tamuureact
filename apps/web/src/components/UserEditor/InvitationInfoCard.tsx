import React, { useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Upload, ExternalLink, Copy, Check } from 'lucide-react';
import { getPublicDomain } from '@/lib/utils';
import { useParams } from 'react-router-dom';

interface InvitationInfoCardProps {
    invitation: {
        id: string;
        title: string;
        slug: string;
        status: string;
        activeUntil: string;
        thumbnailUrl?: string;
    };
}

export const InvitationInfoCard: React.FC<InvitationInfoCardProps> = ({ invitation }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCopyLink = () => {
        const publicDomain = getPublicDomain();
        const url = `${publicDomain}/${invitation.slug}`;
        navigator.clipboard.writeText(`https://${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg p-8 overflow-hidden relative group/card"
        >
            {/* Subtle background decoration */}
            {/* Subtle background decoration removed */}

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Thumbnail / Avatar */}
                <div className="relative group">
                    <div className="w-28 h-28 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-slate-400 group-hover:shadow-lg ring-4 ring-white shadow-inner">
                        {invitation.thumbnailUrl ? (
                            <img src={invitation.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <Calendar className="w-10 h-10 text-slate-300 group-hover:text-teal-500 transition-colors" />
                        )}

                        <div
                            onClick={handleUploadClick}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-500"
                        >
                            <m.div
                                initial={false}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg text-slate-900 mb-2"
                            >
                                <Upload className="w-5 h-5" />
                            </m.div>
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Ganti Foto</span>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />

                    {/* Floating Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-lg border border-slate-50">
                        <div className="bg-teal-500 w-6 h-6 rounded-lg flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                        <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tighter">{invitation.title}</h2>
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100 flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            {invitation.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Public Link Section */}
                        <div className="group/link flex items-center justify-center md:justify-start gap-4 bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 flex-1">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover/link:shadow-md transition-all">
                                <ExternalLink className="w-5 h-5 text-slate-400 group-hover/link:text-teal-500 transition-colors" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Link Publik</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-slate-900 truncate text-sm">tamuu.id/{invitation.slug}</p>
                                    <button
                                        onClick={handleCopyLink}
                                        className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'}`}
                                    >
                                        <AnimatePresence mode="wait">
                                            {copied ? (
                                                <m.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                    <Check className="w-3.5 h-3.5" />
                                                </m.div>
                                            ) : (
                                                <m.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                    <Copy className="w-3.5 h-3.5" />
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Active Period Section */}
                        <div className="group/time flex items-center justify-center md:justify-start gap-4 bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 flex-1">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover/time:shadow-md transition-all">
                                <Clock className="w-5 h-5 text-slate-400 group-hover/time:text-teal-500 transition-colors" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Aktif Sampai</p>
                                <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{invitation.activeUntil}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="flex flex-col gap-3">
                    <m.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all font-outfit text-xs uppercase tracking-[0.2em] whitespace-nowrap"
                    >
                        Perpanjang Masa Aktif
                    </m.button>
                </div>
            </div>
        </m.div>
    );
};
