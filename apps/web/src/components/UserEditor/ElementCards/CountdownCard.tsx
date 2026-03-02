import React, { useState } from 'react';
import { Clock, Calendar, ChevronDown, Palette, Lock } from 'lucide-react';
import { ElementCardProps } from './Registry';

export const CountdownCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);

    const config = element.countdownConfig || ({
        targetDate: new Date().toISOString(),
        showDays: true,
        showHours: true,
        showMinutes: true,
        showSeconds: true,
        theme: 'standard',
        customColor: '#000000'
    } as any);

    const canEdit = permissions.canEditText || permissions.canEditContent;

    return (
        <div className="space-y-5">
            {canEdit ? (
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Tanggal Target Acara
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <input
                            type="datetime-local"
                            value={config.targetDate ? new Date(config.targetDate).toISOString().slice(0, 16) : ''}
                            onChange={(e) => handleUpdate({
                                countdownConfig: { ...config, targetDate: new Date(e.target.value).toISOString() }
                            })}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                        />
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Countdown Dikunci</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold">
                            {config.targetDate ? new Date(config.targetDate).toLocaleDateString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : 'Belum diatur'}
                        </span>
                    </div>
                </div>
            )}

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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Angka</label>
                                <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-lg">
                                    <input
                                        type="color"
                                        value={config.customColor || '#000000'}
                                        onChange={(e) => handleUpdate({
                                            countdownConfig: { ...config, customColor: e.target.value }
                                        })}
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                    />
                                    <span className="text-[10px] font-mono text-slate-500">{config.customColor || '#000'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
