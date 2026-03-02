import React, { useState } from 'react';
import { MapPin, Link as LinkIcon, ChevronDown, Palette, Lock } from 'lucide-react';
import { ElementCardProps } from './Registry';

export const MapsCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);

    // CTO: Resilience Initialization with any cast to bypass missing props in fallback
    const config = element.mapsConfig || ({
        url: '',
        title: 'Lokasi Acara',
        borderRadius: 12,
        zoom: 15,
        theme: 'standard'
    } as any);

    const canEdit = permissions.canEditText || permissions.canEditContent;

    return (
        <div className="space-y-5">
            {canEdit ? (
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Google Maps Link (Embed/URL)
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <LinkIcon className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={config.url || ''}
                            onChange={(e) => handleUpdate({
                                mapsConfig: { ...config, url: e.target.value }
                            })}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                            placeholder="Tempel link Google Maps di sini"
                        />
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Peta Lokasi Dikunci</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{config.url || 'Link belum diatur oleh admin'}</p>
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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Radius Sudut (PX)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="40"
                                    value={config.borderRadius || 12}
                                    onChange={(e) => handleUpdate({
                                        mapsConfig: { ...config, borderRadius: parseInt(e.target.value) }
                                    })}
                                    className="w-full accent-teal-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
