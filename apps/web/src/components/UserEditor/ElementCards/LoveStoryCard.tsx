import React, { useState } from 'react';
import { Heart, Plus, Trash2, Calendar, Type, ChevronDown, Palette } from 'lucide-react';
import { ElementCardProps } from './Registry';
import { LoveStoryConfig } from '@/store/layersSlice';
import { generateId } from '@/lib/utils';

export const LoveStoryCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);

    // CTO: Resilience Initialization with any cast to bypass missing props in fallback
    const config: LoveStoryConfig = element.loveStoryConfig || ({
        events: [],
        layout: 'timeline',
        theme: 'standard',
        customColor: '#ec4899'
    } as any);

    const handleAddEvent = () => {
        const newEvents = [
            ...(config.events || []),
            { id: generateId(), date: '', title: 'Momen Baru', description: '', image: '' }
        ];
        handleUpdate({
            loveStoryConfig: { ...config, events: newEvents } as any
        });
    };

    const handleUpdateEvent = (id: string, updates: any) => {
        const newEvents = (config.events || []).map(ev => 
            ev.id === id ? { ...ev, ...updates } : ev
        );
        handleUpdate({
            loveStoryConfig: { ...config, events: newEvents } as any
        });
    };

    const handleRemoveEvent = (id: string) => {
        const newEvents = (config.events || []).filter(ev => ev.id !== id);
        handleUpdate({
            loveStoryConfig: { ...config, events: newEvents } as any
        });
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Momen Cerita ({config.events?.length || 0})
                </label>
                {permissions.canEditText && (
                    <button
                        onClick={handleAddEvent}
                        className="flex items-center gap-1.5 text-pink-500 hover:text-pink-600 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Momen
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {(config.events || []).map((ev) => (
                    <div key={ev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group/event">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal/Tahun</label>
                                <input
                                    type="text"
                                    value={ev.date || ''}
                                    onChange={(e) => handleUpdateEvent(ev.id, { date: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500"
                                    placeholder="2024"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Momen</label>
                                <input
                                    type="text"
                                    value={ev.title || ''}
                                    onChange={(e) => handleUpdateEvent(ev.id, { title: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500"
                                    placeholder="Pertemuan Pertama"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Cerita Singkat</label>
                            <textarea
                                value={ev.description || ''}
                                onChange={(e) => handleUpdateEvent(ev.id, { description: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 min-h-[60px] resize-none"
                                placeholder="Tuliskan cerita singkat momen ini..."
                            />
                        </div>
                        <button
                            onClick={() => handleRemoveEvent(ev.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover/event:opacity-100 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {(config.events || []).length === 0 && (
                    <div className="text-center py-8 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                        <Heart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada momen cerita</p>
                    </div>
                )}
            </div>

            {/* STYLING TOGGLE */}
            {permissions.canEditStyle && (
                <div className="pt-2 border-t border-slate-100">
                    <button
                        onClick={() => setShowStyling(!showStyling)}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-pink-500 transition-colors"
                    >
                        <Palette className="w-3.5 h-3.5" />
                        STYLING
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStyling ? 'rotate-180' : ''}`} />
                    </button>

                    {showStyling && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Aksen</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={(config as any).customColor || '#ec4899'}
                                        onChange={(e) => handleUpdate({
                                            loveStoryConfig: { ...config, customColor: e.target.value } as any
                                        })}
                                        className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                    />
                                    <span className="text-xs font-mono text-slate-500 self-center">{(config as any).customColor || '#ec4899'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
