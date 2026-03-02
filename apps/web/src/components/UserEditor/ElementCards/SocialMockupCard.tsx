import React from 'react';
import { Share2, Type, Link as LinkIcon, Lock } from 'lucide-react';
import { ElementCardProps } from './Registry';

export const SocialMockupCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const config = element.socialMockupConfig || ({
        title: 'Undangan Pernikahan',
        description: 'Kami mengundang Anda...',
        imageUrl: '',
        theme: 'standard'
    } as any);

    const canEdit = permissions.canEditText || permissions.canEditContent;

    return (
        <div className="space-y-5">
            {canEdit ? (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Judul Share (WhatsApp/Social)
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                <Type className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={config.title || ''}
                                onChange={(e) => handleUpdate({
                                    socialMockupConfig: { ...config, title: e.target.value }
                                })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                placeholder="Nama Pasangan & Tgl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Deskripsi Singkat
                        </label>
                        <textarea
                            value={config.description || ''}
                            onChange={(e) => handleUpdate({
                                socialMockupConfig: { ...config, description: e.target.value }
                            })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all min-h-[60px] resize-none"
                            placeholder="Kalimat singkat untuk pratinjau link..."
                        />
                    </div>
                </>
            ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Preview Sosmed Dikunci</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">{config.title || 'Belum diatur'}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{config.description || 'Belum ada deskripsi'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
