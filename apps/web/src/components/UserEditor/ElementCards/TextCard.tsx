import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical, Plus, Minus, Palette, ChevronDown, Settings2, Type as FontIcon } from 'lucide-react';
import { SUPPORTED_FONTS } from '@/lib/fonts';
import { useStore } from '@/store/useStore';
import { ElementCardProps } from './Registry';

export const TextCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);
    const { elementDimensions } = useStore();

    // FORTRESS: Local state and Ref for high-performance input
    const [localContent, setLocalContent] = React.useState(element.content || '');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const isTypingRef = React.useRef(false);

    // Sync local state when element.content changes externally (e.g. undo/redo, template switch)
    // ONLY sync if user is not currently typing to avoid cursor jumps
    React.useEffect(() => {
        if (!isTypingRef.current && element.content !== localContent) {
            setLocalContent(element.content || '');
        }
    }, [element.content]);

    // CITADEL: Debounced Update to avoid heavy global re-renders on every keystroke
    // But fast enough to feel "real-time" (100ms)
    const debouncedUpdate = React.useCallback(
        (() => {
            let timeout: any;
            return (val: string) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    handleUpdate({ content: val });
                    // Only release the "typing" lock after the store update has propagated
                    setTimeout(() => {
                        isTypingRef.current = false;
                    }, 50);
                }, 100);
            };
        })(),
        [handleUpdate]
    );

    return (
        <div className="space-y-6">
            {/* Content Input - Enterprise Level Refinement */}
            {(permissions.canEditText || permissions.canEditContent) && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">
                            Isi Konten Teks
                        </label>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Real-time Sync</span>
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={localContent}
                        onChange={(e) => {
                            const val = e.target.value;
                            isTypingRef.current = true;
                            setLocalContent(val);
                            debouncedUpdate(val);
                        }}
                        onBlur={() => {
                            isTypingRef.current = false;
                            handleUpdate({ content: localContent });
                        }}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none resize-none shadow-inner"
                        rows={Math.max(3, Math.min(10, (localContent.split('\n').length || 1)))}
                        placeholder="Tuliskan kata-kata Anda di sini..."
                        style={{ minHeight: '120px', lineHeight: '1.6' }}
                    />
                </div>
            )}

            {/* Read-only view if no edit permission but visible */}
            {(!permissions.canEditText && !permissions.canEditContent) && (
                <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">
                        Konten Teks (Mode Baca)
                    </label>
                    <div className="px-5 py-4 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-2xl text-base font-bold text-slate-400 italic whitespace-pre-wrap shadow-inner">
                        {element.content || 'Konten dikunci oleh admin'}
                    </div>
                </div>
            )}

            {/* Styling Controls - Enterprise V2 */}
            {permissions.canEditStyle && (
                <div className="pt-4 border-t border-slate-100">
                    <button
                        onClick={() => setShowStyling(!showStyling)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-500 ${showStyling ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg transition-colors ${showStyling ? 'bg-white/20' : 'bg-white'}`}>
                                <Settings2 className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.1em]">Pengaturan Gaya Teks</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${showStyling ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showStyling && (
                            <m.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                className="overflow-hidden"
                            >
                                <div className="pt-6 space-y-6">
                                    {/* 1. Typography Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Font Family Selection */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Huruf</span>
                                            <div className="relative group/font">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <FontIcon className="w-4 h-4" />
                                                </div>
                                                <select
                                                    value={element.textStyle?.fontFamily || 'Inter'}
                                                    onChange={(e) => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontFamily: e.target.value } as any })}
                                                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:border-teal-500 appearance-none outline-none transition-all"
                                                >
                                                    {SUPPORTED_FONTS.map(f => (
                                                        <option key={f.name} value={f.name}>{f.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Font Size Control */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ukuran Huruf</span>
                                            <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 p-1.5 rounded-xl">
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontSize: Math.max(8, (element.textStyle?.fontSize || 24) - 2) } as any })}
                                                    className="w-9 h-9 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-teal-600 shadow-sm transition-all"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <div className="flex-1 text-center">
                                                    <span className="text-sm font-black text-slate-800">{(element.textStyle?.fontSize || 24)}px</span>
                                                </div>
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontSize: Math.min(150, (element.textStyle?.fontSize || 24) + 2) } as any })}
                                                    className="w-9 h-9 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-teal-600 shadow-sm transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Format & Alignment Row */}
                                    <div className="flex flex-wrap gap-4">
                                        {/* Text Format */}
                                        <div className="space-y-2 flex-1 min-w-[120px]">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Format</span>
                                            <div className="flex bg-slate-50 border-2 border-slate-100 p-1 rounded-xl">
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontWeight: element.textStyle?.fontWeight === 'bold' ? 'normal' : 'bold' } as any })}
                                                    className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center ${element.textStyle?.fontWeight === 'bold' ? 'bg-white text-teal-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <Bold className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), fontStyle: element.textStyle?.fontStyle === 'italic' ? 'normal' : 'italic' } as any })}
                                                    className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center ${element.textStyle?.fontStyle === 'italic' ? 'bg-white text-teal-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <Italic className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textDecoration: element.textStyle?.textDecoration === 'underline' ? 'none' : 'underline' } as any })}
                                                    className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center ${element.textStyle?.textDecoration === 'underline' ? 'bg-white text-teal-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <Underline className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Alignment */}
                                        <div className="space-y-2 flex-1 min-w-[120px]">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Perataan</span>
                                            <div className="flex bg-slate-50 border-2 border-slate-100 p-1 rounded-xl">
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textAlign: 'left' } as any })}
                                                    className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center ${element.textStyle?.textAlign === 'left' ? 'bg-white text-teal-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <AlignLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textAlign: 'center' } as any })}
                                                    className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center ${(element.textStyle?.textAlign === 'center' || !element.textStyle?.textAlign) ? 'bg-white text-teal-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <AlignCenter className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), textAlign: 'right' } as any })}
                                                    className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center ${element.textStyle?.textAlign === 'right' ? 'bg-white text-teal-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <AlignRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Color & Advanced Metrics Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Color Selection */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Teks</span>
                                            <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 p-2 rounded-xl h-[52px]">
                                                <div className="flex flex-1 items-center gap-1.5">
                                                    {['#ffffff', '#000000', '#bfa181'].map(color => (
                                                        <button
                                                            key={color}
                                                            onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), color } as any })}
                                                            className={`w-6 h-6 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 ${element.textStyle?.color === color ? 'ring-2 ring-teal-500' : ''}`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="w-[1px] h-6 bg-slate-200" />
                                                <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 shadow-sm group/color overflow-hidden shrink-0">
                                                    <Palette className="w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="color"
                                                        value={element.textStyle?.color || '#ffffff'}
                                                        onChange={(e) => handleUpdate({ textStyle: { ...(element.textStyle || {}), color: e.target.value } as any })}
                                                        className="w-full h-full opacity-0 absolute cursor-pointer inset-0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Line Height */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tinggi Baris</span>
                                            <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 p-1.5 rounded-xl h-[52px]">
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), lineHeight: Math.max(0.5, parseFloat(Number((element.textStyle?.lineHeight || 1.2) - 0.1).toFixed(1))) } as any })}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-teal-600 shadow-sm transition-all"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <div className="flex-1 text-center min-w-0">
                                                    <span className="text-xs font-black text-slate-700">{Number(element.textStyle?.lineHeight || 1.2).toFixed(1)}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), lineHeight: Math.min(3, parseFloat(Number((element.textStyle?.lineHeight || 1.2) + 0.1).toFixed(1))) } as any })}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-teal-600 shadow-sm transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Letter Spacing */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Spasi Huruf</span>
                                            <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 p-1.5 rounded-xl h-[52px]">
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), letterSpacing: Math.max(-10, (element.textStyle?.letterSpacing || 0) - 1) } as any })}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-teal-600 shadow-sm transition-all"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <div className="flex-1 text-center min-w-0">
                                                    <span className="text-xs font-black text-slate-700">{element.textStyle?.letterSpacing || 0}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleUpdate({ textStyle: { ...(element.textStyle || {}), letterSpacing: Math.min(100, (element.textStyle?.letterSpacing || 0) + 1) } as any })}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-teal-600 shadow-sm transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
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
