import React, { useRef } from 'react';
import { m } from 'framer-motion';
import { Calendar, Clock, Upload, ExternalLink, Check, Share2, Settings, CreditCard, FileText, Send } from 'lucide-react';
import { getPublicDomain } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { SubscriptionStatusWidget } from '../ui/SubscriptionStatusWidget';
import { useStore } from '@/store/useStore';
import { AnimatedCopyIcon } from '../ui/AnimatedCopyIcon';

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

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const publicDomain = getPublicDomain();

    return (
        <m.div
            id="tutorial-info-card"
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
                    {/* Header: Title */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-outfit tracking-tight leading-tight">
                            {invitation.title}
                        </h2>
                    </div>

                    {/* Link Section (Input Style) */}
                    <div className="max-w-xl mx-auto lg:mx-0">
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                            <div className="flex-1 min-w-[200px] flex items-center gap-0 bg-slate-50 rounded-xl border border-slate-200 p-1.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-400 transition-all">
                                <a 
                                    href={`https://${publicDomain}/${invitation.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center flex-1 min-w-0 hover:bg-slate-100/50 rounded-lg transition-all group/link"
                                >
                                    <div className="pl-3 pr-2 text-slate-400 hidden sm:block group-hover/link:text-teal-500 transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1 sm:py-1.5 px-2 sm:px-0">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Link Undangan</p>
                                        <p className="text-sm font-bold text-slate-800 truncate font-mono group-hover/link:text-teal-600 transition-colors">
                                            {publicDomain}/{invitation.slug}
                                        </p>
                                    </div>
                                </a>
                                <div className="p-1">
                                    <AnimatedCopyIcon 
                                        text={`https://${publicDomain}/${invitation.slug}`} 
                                        size={18} 
                                        className="p-2.5 rounded-lg bg-white text-slate-500 hover:text-teal-600 border border-slate-200 hover:border-teal-200 transition-all"
                                        successMessage="Link disalin!"
                                    />
                                </div>
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

                {/* Call to Action - Vertical Stack */}
                <div className="flex flex-col justify-center gap-3 w-full lg:w-48 shrink-0">
                    
                    {/* 1. PUBLISH BUTTON (Top) */}
                    <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            import('@/lib/api').then(({ invitations }) => {
                                invitations.update(invitation.id, { is_published: true });
                            });
                            useStore.getState().setIsPublished(true);
                        }}
                        className={`w-full px-6 py-3.5 rounded-xl font-bold border shadow-sm transition-all font-outfit text-xs uppercase tracking-widest flex items-center justify-center gap-2 group whitespace-nowrap ${
                            invitation.status === 'Published'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-2 ring-emerald-500/20'
                                : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                        }`}
                    >
                        {invitation.status === 'Published' ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Publish</span>
                    </m.button>

                    {/* 2. DRAFT BUTTON (Second) */}
                    <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            import('@/lib/api').then(({ invitations }) => {
                                invitations.update(invitation.id, { is_published: false });
                            });
                            useStore.getState().setIsPublished(false);
                        }}
                        className={`w-full px-6 py-3.5 rounded-xl font-bold border shadow-sm transition-all font-outfit text-xs uppercase tracking-widest flex items-center justify-center gap-2 group whitespace-nowrap ${
                            invitation.status === 'Draft'
                                ? 'bg-amber-50 text-amber-600 border-amber-200 ring-2 ring-amber-500/20'
                                : 'bg-white text-slate-400 border-slate-200 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Draft</span>
                    </m.button>

                    {/* 3. INVOICE BUTTON (Third) */}
                    <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/dashboard?tab=invoice')}
                        className="w-full px-6 py-3.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all font-outfit text-xs uppercase tracking-widest flex items-center justify-center gap-2 group whitespace-nowrap"
                    >
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        <span>Invoice</span>
                    </m.button>

                    {/* 4. PERPANJANG BUTTON (Fourth) */}
                    <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/billing')}
                        className="w-full px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 hover:bg-slate-800 transition-all font-outfit text-xs uppercase tracking-widest flex items-center justify-center gap-2 group whitespace-nowrap"
                    >
                        <span>Perpanjang</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </m.button>
                </div>
            </div>
        </m.div>
    );
};
