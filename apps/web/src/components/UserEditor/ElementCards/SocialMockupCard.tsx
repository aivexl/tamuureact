import React, { useState } from 'react';
import { Share2, User, ChevronDown, Palette, Lock, Instagram, Twitter, ExternalLink, ChevronRight } from 'lucide-react';
import { ElementCardProps } from './Registry';

const XLogo = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298L17.607 20.65z" />
    </svg>
);

const InstagramLogo = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.44-.645-1.44-1.44s.645-1.44 1.44-1.44z" />
    </svg>
);

const TikTokLogo = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-.99 0-1.49.18-3.4 2.36-6.38 5.53-7.16.07-.02.14-.03.21-.04v4.28c-.57.08-1.14.24-1.64.52-.99.55-1.62 1.58-1.75 2.71-.02.19-.02.39 0 .58.02 1.13.51 2.24 1.43 2.94.39.3.85.52 1.32.63.45.11.92.17 1.39.13 1.17-.02 2.26-.67 2.84-1.63.46-.75.67-1.63.68-2.51.01-4.02-.01-8.04.01-12.06z" />
    </svg>
);

const WhatsAppLogo = ({ size = 14, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.13.57-.072 1.758-.713 2.008-1.403.25-.69.25-1.282.175-1.403-.075-.121-.272-.195-.57-.343zm-4.933 8.235c-2.392 0-4.726-.62-6.786-1.791L0 24l1.411-5.189c-1.285-2.228-1.965-4.768-1.965-7.363 0-6.612 5.388-12 12-12s12 5.388 12 12-5.388 12-12 12zm0-22c-5.514 0-10 4.486-10 10 0 2.225 1.238 4.377 3.213 5.61l.272.17-.85 3.12 3.2-.84.26.15c1.17.7 2.52 1.07 3.91 1.07 5.514 0 10-4.486 10-10s-4.486-10-10-10z" />
    </svg>
);

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

    const getPreviewIcon = () => {
        switch (config.platform) {
            case 'instagram': return <InstagramLogo size={18} className="text-[#E4405F]" />;
            case 'twitter': 
            case 'x': return <XLogo size={16} className="text-slate-700" />;
            case 'tiktok': return <TikTokLogo size={18} className="text-slate-700" />;
            case 'whatsapp': return <WhatsAppLogo size={18} className="text-[#25D366]" />;
            default: return <Share2 className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-5">
            {canEdit ? (
                <>
                    {/* Platform Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Platform Sosial
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
                                <option value="twitter">X (Twitter)</option>
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
                                placeholder="contoh: username"
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
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center">
                            {getPreviewIcon()}
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
