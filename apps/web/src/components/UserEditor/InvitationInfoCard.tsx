import React, { useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Upload, ExternalLink, Copy, Check, Share2, Settings, CreditCard } from 'lucide-react';
import { getPublicDomain } from '@/lib/utils';
import { useParams, useNavigate } from 'react-router-dom';
import { SubscriptionStatusWidget } from '../ui/SubscriptionStatusWidget';
import { useStore } from '@/store/useStore';

interface InvitationInfoCardProps {
    invitation: {
        id: string;
        title: string;
        slug: string;
        status: string;
        activeUntil: string;
        thumbnailUrl?: string;
    };
    onShare?: () => void;
    onSettings?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const InvitationInfoCard: React.FC<InvitationInfoCardProps> = ({ invitation, onShare, onSettings }) => {
    const navigate = useNavigate();
    const { user } = useStore();
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
            className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-5 sm:p-6 md:p-8 overflow-hidden relative group/card"
        >
            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-6 md:gap-8">
                {/* Thumbnail / Avatar */}
                <div className="relative group shrink-0">
                    <div className="w-28 h-28 md:w-32 md:h-32 bg-slate-50 rounded-[1.5rem] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                        {invitation.thumbnailUrl ? (
                            <img src={invitation.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                            <Calendar className="w-12 h-12 text-slate-300 group-hover:text-teal-500 transition-colors" />
                        )}

                        <div
                            onClick={handleUploadClick}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-500"
                        >
                            <m.div
                                initial={false}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg text-slate-900 mb-2"
                            >
                                <Upload className="w-5 h-5" />
                            </m.div>
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Edit</span>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />

                    {/* Verified/Check Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
                        <div className="bg-teal-500 w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                    </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0 w-full text-center lg:text-left space-y-5">
                    {/* Header: Title & Status */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-outfit tracking-tight leading-tight">
                            {invitation.title}
                        </h2>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border ${invitation.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            <span className={`relative flex h-2 w-2 ${invitation.status === 'Published' ? '' : 'hidden'}`}>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {invitation.status}
                        </span>
                    </div>

                    {/* Link Section (Input Style) */}
                    <div className="max-w-xl mx-auto lg:mx-0">
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                            <div className="flex-1 min-w-[200px] flex items-center gap-0 bg-slate-50 rounded-xl border border-slate-200 p-1.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-400 transition-all">
                                <div className="pl-3 pr-2 text-slate-400 hidden sm:block">
                                    <ExternalLink className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0 py-1 sm:py-1.5 px-2 sm:px-0">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Link Undangan</p>
                                    <p className="text-sm font-bold text-slate-800 truncate font-mono">
                                        tamuu.id/{invitation.slug}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className={`p-2.5 rounded-lg transition-all shrink-0 ${copied ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-500 hover:text-teal-600 border border-slate-200 hover:border-teal-200'}`}
                                    title="Salin Link"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {/* Share Button (Moved from Grid) */}
                                <m.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onShare}
                                    className="p-3.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100 hover:bg-teal-500 hover:text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all flex flex-col items-center justify-center gap-1 group/share"
                                    title="Bagikan Undangan"
                                >
                                    <Share2 className="w-5 h-5" />
                                </m.button>

                                {/* Settings Button (Moved from Grid) */}
                                <m.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onSettings}
                                    className="p-3.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 hover:bg-slate-900 hover:text-white hover:shadow-lg hover:shadow-slate-900/30 transition-all flex flex-col items-center justify-center gap-1 group/settings"
                                    title="Pengaturan Undangan"
                                >
                                    <Settings className="w-5 h-5" />
                                </m.button>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info: Active Date */}
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-500">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium">Masa aktif hingga <span className="text-slate-700 font-bold">{invitation.activeUntil || (user?.expiresAt ? new Date(user.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Lifetime Access')}</span></span>
                    </div>

                    {/* Subscription Widget (Inline) */}
                    <div className="max-w-md">
                        <SubscriptionStatusWidget
                            expiresAt={user?.expiresAt || null}
                            email={user?.email}
                            variant="editor"
                        />
                    </div>
                </div>

                {/* Vertical Divider (Desktop Only) */}
                <div className="hidden lg:block w-px h-24 bg-slate-100 mx-2" />

                {/* Call to Action */}
                <div className="flex flex-col justify-center gap-3 w-full lg:w-auto shrink-0">
                    <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/dashboard?tab=invoice')}
                        className="px-6 py-3.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all font-outfit text-xs uppercase tracking-widest flex items-center justify-center gap-2 group whitespace-nowrap"
                    >
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        <span>Invoice</span>
                    </m.button>
                    <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/billing')}
                        className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 hover:bg-slate-800 transition-all font-outfit text-xs uppercase tracking-widest flex items-center justify-center gap-2 group whitespace-nowrap"
                    >
                        <span>Perpanjang</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </m.button>
                </div>
            </div>
        </m.div>
    );
};
