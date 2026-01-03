import React, { useRef } from 'react';
import { m } from 'framer-motion';
import { Calendar, Clock, Upload, ExternalLink } from 'lucide-react';

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

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] p-8"
        >
            <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Thumbnail / Avatar */}
                <div className="relative group">
                    <div className="w-24 h-24 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-2xl border-2 border-dashed border-teal-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-teal-400 group-hover:shadow-lg group-hover:shadow-teal-500/10">
                        {invitation.thumbnailUrl ? (
                            <img src={invitation.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                            <Calendar className="w-8 h-8 text-teal-600/50" />
                        )}

                        <div
                            onClick={handleUploadClick}
                            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                        >
                            <Upload className="w-5 h-5 text-white mb-1" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Ganti</span>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                        <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tight">{invitation.title}</h2>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            {invitation.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <ExternalLink className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link Publik</p>
                                <p className="font-bold text-teal-600 truncate text-sm">tamuu.id/{invitation.slug}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Clock className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aktif Sampai</p>
                                <p className="font-bold text-slate-700 text-sm">{invitation.activeUntil}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="flex flex-col gap-2">
                    <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all font-outfit text-sm whitespace-nowrap"
                    >
                        Perpanjang Durasi
                    </m.button>
                </div>
            </div>
        </m.div>
    );
};
