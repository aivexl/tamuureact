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

    // Helper to extract local date and time strings correctly
    const getDateString = (isoString?: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getTimeString = (isoString?: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '';
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleDateTimeChange = (newDate: string, newTime: string) => {
        if (!newDate) return;
        
        // CTO: Parse DD/MM/YYYY or YYYY-MM-DD
        let year, month, day;
        if (newDate.includes('-')) {
            [year, month, day] = newDate.split('-').map(Number);
        } else if (newDate.includes('/')) {
            [day, month, year] = newDate.split('/').map(Number);
        } else {
            return;
        }

        const [hours, minutes] = (newTime || '00:00').split(':').map(Number);
        
        const dateObj = new Date(year, month - 1, day, hours, minutes);
        if (!isNaN(dateObj.getTime())) {
            handleUpdate({
                countdownConfig: { ...config, targetDate: dateObj.toISOString() }
            });
        }
    };

    return (
        <div className="space-y-5 relative">
            {/* DEPLOYMENT PROOF TAG */}
            <div className="absolute -top-10 -right-2 px-2 py-0.5 bg-slate-900 text-[7px] text-white font-black rounded-full uppercase tracking-widest z-50 shadow-xl border border-white/10 animate-pulse">
                CTO MEGA FIX V4 ACTIVE
            </div>

            {canEdit ? (
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-700">
                                <Calendar className="w-4 h-4 text-teal-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Pengaturan Tanggal Target</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Tanggal (DD/MM/YYYY)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="DD/MM/YYYY"
                                            value={(() => {
                                                const iso = config.targetDate;
                                                if (!iso) return '';
                                                const d = new Date(iso);
                                                const pad = (n: number) => String(n).padStart(2, '0');
                                                return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
                                            })()}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Basic pattern check for DD/MM/YYYY
                                                if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
                                                    handleDateTimeChange(val, getTimeString(config.targetDate));
                                                }
                                            }}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                        />
                                        <input 
                                            type="date" 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 cursor-pointer"
                                            onChange={(e) => handleDateTimeChange(e.target.value, getTimeString(config.targetDate))}
                                        />
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                    </div>
                                    <p className="text-[8px] text-slate-400 ml-1 italic font-medium">Ketik langsung (misal: 20/11/2026) atau klik ikon kalender.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Waktu (Format 24 Jam)
                                    </label>
                                    <input
                                        type="time"
                                        step="60"
                                        value={getTimeString(config.targetDate)}
                                        onChange={(e) => handleDateTimeChange(getDateString(config.targetDate), e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                    />
                                    <p className="text-[8px] text-slate-400 ml-1 italic font-medium">Format 24 Jam (Contoh: 13:00 untuk jam 1 siang)</p>
                                </div>
                            </div>

                            {/* Live Calculation Preview */}
                            {config.targetDate && (
                                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-teal-100">
                                            <Clock className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Sisa Waktu</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {(() => {
                                                    const diff = new Date(config.targetDate).getTime() - Date.now();
                                                    if (diff <= 0) return 'Acara sudah selesai';
                                                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                                    return `${days} Hari Lagi`;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
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
