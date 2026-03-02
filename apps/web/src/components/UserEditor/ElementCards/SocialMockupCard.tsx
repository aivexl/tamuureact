import React, { useState } from 'react';
import { Share2, User, ChevronDown, Palette, Lock, Instagram, Twitter, ExternalLink } from 'lucide-react';
import { ElementCardProps } from './Registry';

export const SocialMockupCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);

    // CTO: Unified Social Mockup Config
    const config = element.socialMockupConfig || ({
        platform: 'instagram',
        username: '',
        variant: 'luxury',
        showIcon: true
    } as any);

    const canEdit = permissions.canEditText || permissions.canEditContent;

    return (
        <div className="space-y-5">
            {canEdit ? (
                <>
                    {/* Platform Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Pilih Media Sosial
                        </label>
                        <div className="relative">
                            <select
                                value={config.platform || 'instagram'}
                                onChange={(e) => handleUpdate({
                                    socialMockupConfig: { ...config, platform: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all appearance-none"
                            >
                                <option value="instagram">Instagram</option>
                                <option value="twitter">Twitter / X</option>
                                <option value="tiktok">TikTok</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Username Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Username / ID
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={config.username || ''}
                                onChange={(e) => handleUpdate({
                                    socialMockupConfig: { ...config, username: e.target.value }
                                })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                placeholder="contoh: tamuu.id"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Media Sosial Dikunci</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Instagram className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">@{config.username || 'Belum diatur'}</p>
                    </div>
                </div>
            )}

            {/* STYLING TOGGLE */}
            {permissions.canEditStyle && (
                <div className="pt-2 border-t border-slate-100">
                    <button
                        onClick={() => setShowStyling(!showStyling)}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-teal-500 transition-colors"
                    >
                        <Palette className="w-3.5 h-3.5" />
                        STYLING
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStyling ? 'rotate-180' : ''}`} />
                    </button>

                    {showStyling && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tema Visual</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['luxury', 'solid', 'transparent'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => handleUpdate({
                                                socialMockupConfig: { ...config, variant: v }
                                            })}
                                            className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all ${config.variant === v ? 'bg-teal-500 border-teal-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-teal-200'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
