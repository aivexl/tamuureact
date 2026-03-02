import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical, Plus, Minus, Palette, ChevronDown, Settings2, Type as FontIcon } from 'lucide-react';
import { SUPPORTED_FONTS } from '@/lib/fonts';
import { useStore } from '@/store/useStore';
import { ElementCardProps } from './Registry';

export const TextCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);
    const { elementDimensions } = useStore();

    return (
        <div className="space-y-4">
            {/* Layer Identity - Billionaire Clarity */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nama Elemen
                </label>
                <input
                    type="text"
                    value={element.name || ''}
                    onChange={(e) => handleUpdate({ name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
                    placeholder="Contoh: Nama Pasangan"
                />
            </div>

            {/* Content Input */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Konten Teks
                </label>
                {permissions.canEditText ? (
                    <textarea
                        value={element.content || ''}
                        onChange={(e) => handleUpdate({ content: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none resize-none"
                        rows={Math.max(1, Math.min(6, (element.content?.split('\n').length || 1)))}
                        placeholder="Mulai mengetik... (Enter untuk baris baru)"
                        style={{ minHeight: '48px' }}
                    />
                ) : (
                    <div className="px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-medium text-slate-400 italic whitespace-pre-wrap">
                        {element.content || 'Konten dikunci oleh admin'}
                    </div>
                )}
            </div>

            {(permissions.canEditStyle || permissions.canEditText) && (
                <div className="pt-2 border-t border-slate-100">
                    <button
                        onClick={() => setShowStyling(!showStyling)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${showStyling ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Settings2 className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Styling</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showStyling ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showStyling && (
                            <m.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex bg-slate-50 p-1 rounded-xl">
                                            <button
                                                onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontWeight: element.textStyle?.fontWeight === 'bold' ? 'normal' : 'bold' } as any })}
                                                className={`p-2 rounded-lg transition-all ${element.textStyle?.fontWeight === 'bold' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <Bold className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontStyle: element.textStyle?.fontStyle === 'italic' ? 'normal' : 'italic' } as any })}
                                                className={`p-2 rounded-lg transition-all ${element.textStyle?.fontStyle === 'italic' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <Italic className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textDecoration: element.textStyle?.textDecoration === 'underline' ? 'none' : 'underline' } as any })}
                                                className={`p-2 rounded-lg transition-all ${element.textStyle?.textDecoration === 'underline' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <Underline className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex bg-slate-50 p-1 rounded-xl">
                                            <button
                                                onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textAlign: 'left' } as any })}
                                                className={`p-2 rounded-lg transition-all ${element.textStyle?.textAlign === 'left' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <AlignLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textAlign: 'center' } as any })}
                                                className={`p-2 rounded-lg transition-all ${element.textStyle?.textAlign === 'center' || !element.textStyle?.textAlign ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <AlignCenter className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textAlign: 'right' } as any })}
                                                className={`p-2 rounded-lg transition-all ${element.textStyle?.textAlign === 'right' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <AlignRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {(() => {
                                            const SAFE_MARGIN = 64;
                                            const CANVAS_WIDTH = 414;
                                            const detectedDim = elementDimensions[element.id];
                                            const currentWidth = detectedDim?.width || element.width || 300;

                                            return (
                                                <div className="flex bg-slate-50 p-1 rounded-xl">
                                                    <button
                                                        onClick={() => handleUpdate({ x: SAFE_MARGIN })}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50"
                                                    >
                                                        <AlignStartVertical className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate({ x: (CANVAS_WIDTH - currentWidth) / 2 })}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50"
                                                    >
                                                        <AlignCenterVertical className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate({ x: CANVAS_WIDTH - currentWidth - SAFE_MARGIN })}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50"
                                                    >
                                                        <AlignEndVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="relative group/font flex-1 min-w-[140px]">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <FontIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <select
                                                value={element.textStyle?.fontFamily || 'Inter'}
                                                onChange={(e) => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontFamily: e.target.value } as any })}
                                                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none outline-none transition-all"
                                            >
                                                {SUPPORTED_FONTS.map(f => (
                                                    <option key={f.name} value={f.name}>{f.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/font:text-teal-500 transition-colors">
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl px-2">
                                            <button
                                                onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontSize: Math.max(8, (element.textStyle?.fontSize || 24) - 2) } as any })}
                                                className="p-1.5 text-slate-400 hover:text-teal-600"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="flex flex-col items-center min-w-[32px]">
                                                <span className="text-[10px] font-black text-slate-800 leading-none">
                                                    {(element.textStyle?.fontSize || 24)}
                                                </span>
                                                <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">Size</span>
                                            </div>
                                            <button
                                                onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontSize: Math.min(100, (element.textStyle?.fontSize || 24) + 2) } as any })}
                                                className="p-1.5 text-slate-400 hover:text-teal-600"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl px-2">
                                            <div className="flex items-center gap-1">
                                                {['#ffffff', '#000000', '#bfa181', '#ef4444'].map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), color } as any })}
                                                        className={`w-4 h-4 rounded-full border border-white shadow-sm transition-transform hover:scale-125 ${element.textStyle?.color === color ? 'ring-2 ring-teal-500' : ''}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="w-[1px] h-4 bg-slate-200" />
                                            <div className="relative w-6 h-6 rounded-lg flex items-center justify-center bg-white border border-slate-100 shadow-sm group/color overflow-hidden">
                                                <Palette className="w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    type="color"
                                                    value={element.textStyle?.color || '#ffffff'}
                                                    onChange={(e) => handleUpdate({ textStyle: { ...(element.textStyle || {}), color: e.target.value } as any })}
                                                    className="w-full h-full opacity-0 absolute cursor-pointer inset-0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 px-3 rounded-xl border border-slate-100">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Line Height</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), lineHeight: Math.max(0.5, parseFloat(Number((element.textStyle?.lineHeight || 1.2) - 0.1).toFixed(1))) } as any })}
                                                    className="w-6 h-6 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-teal-600 shadow-sm"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-[10px] font-black text-slate-700 min-w-[28px] text-center">
                                                    {Number(element.textStyle?.lineHeight || 1.2).toFixed(1)}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), lineHeight: Math.min(3, parseFloat(Number((element.textStyle?.lineHeight || 1.2) + 0.1).toFixed(1))) } as any })}
                                                    className="w-6 h-6 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-teal-600 shadow-sm"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 px-3 rounded-xl border border-slate-100">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Spacing</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), letterSpacing: Math.max(-10, (element.textStyle?.letterSpacing || 0) - 1) } as any })}
                                                    className="w-6 h-6 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-teal-600 shadow-sm"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-[10px] font-black text-slate-700 min-w-[28px] text-center">
                                                    {element.textStyle?.letterSpacing || 0}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), letterSpacing: Math.min(100, (element.textStyle?.letterSpacing || 0) + 1) } as any })}
                                                    className="w-6 h-6 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-teal-600 shadow-sm"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
