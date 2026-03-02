import React, { useState } from 'react';
import { MousePointer2, Type, ChevronDown, Palette, Lock } from 'lucide-react';
import { ElementCardProps } from './Registry';

export const ButtonCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);

    // CTO: Resilience Initialization with any cast to bypass missing props in fallback
    const config = element.buttonConfig || ({
        text: element.content || 'Klik di Sini',
        variant: 'solid',
        borderRadius: 12,
        backgroundColor: '#000000',
        textColor: '#ffffff',
        icon: ''
    } as any);

    const canEdit = permissions.canEditText || permissions.canEditContent;

    return (
        <div className="space-y-5">
            {canEdit ? (
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Teks Tombol
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <Type className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={config.text || element.content || ''}
                            onChange={(e) => handleUpdate({
                                content: e.target.value,
                                buttonConfig: { ...config, text: e.target.value }
                            })}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                            placeholder="Contoh: Buka Undangan"
                        />
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Tombol Dikunci</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">{config.text || element.content || 'Klik di sini'}</p>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Tombol</label>
                                    <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-lg">
                                        <input
                                            type="color"
                                            value={config.backgroundColor || '#000000'}
                                            onChange={(e) => handleUpdate({
                                                buttonConfig: { ...config, backgroundColor: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-[10px] font-mono text-slate-500">{config.backgroundColor || '#000'}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Teks</label>
                                    <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-lg">
                                        <input
                                            type="color"
                                            value={config.textColor || '#ffffff'}
                                            onChange={(e) => handleUpdate({
                                                buttonConfig: { ...config, textColor: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                        />
                                        <span className="text-[10px] font-mono text-slate-500">{config.textColor || '#fff'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
