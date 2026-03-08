import React, { useState } from 'react';
import { Quote as QuoteIcon, Type, User, ChevronDown, Palette, Lock, Sparkles } from 'lucide-react';
import { ElementCardProps } from './Registry';
import { QUOTES_LIBRARY } from '@/constants/quotes';

export const QuoteCard: React.FC<ElementCardProps> = ({ element, handleUpdate, permissions }) => {
    const [showStyling, setShowStyling] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);

    // CTO: Resilience Initialization with any cast to bypass missing props in fallback
    const config = element.quoteConfig || ({
        text: element.content || '',
        author: '',
        theme: 'standard',
        customColor: '#475569'
    } as any);

    const canEdit = permissions.canEditText || permissions.canEditContent;

    // FORTRESS: Local state and Ref for high-performance input
    const [localText, setLocalText] = React.useState(config.text || element.content || '');
    const isTypingRef = React.useRef(false);

    // Sync local state when external data changes
    React.useEffect(() => {
        if (!isTypingRef.current) {
            const externalText = config.text || element.content || '';
            if (externalText !== localText) {
                setLocalText(externalText);
            }
        }
    }, [config.text, element.content]);

    // CITADEL: Debounced Update
    const debouncedUpdate = React.useCallback(
        (() => {
            let timeout: any;
            return (val: string) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    handleUpdate({
                        content: val,
                        quoteConfig: { ...config, text: val }
                    });
                    setTimeout(() => { isTypingRef.current = false; }, 50);
                }, 100);
            };
        })(),
        [handleUpdate, config]
    );

    return (
        <div className="space-y-5">
            {canEdit ? (
                <>
                    {/* Quote Text */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Isi Kutipan / Ayat</label>
                        <textarea
                            value={localText}
                            onChange={(e) => {
                                const val = e.target.value;
                                isTypingRef.current = true;
                                setLocalText(val);
                                debouncedUpdate(val);
                            }}
                            onBlur={() => {
                                isTypingRef.current = false;
                                handleUpdate({
                                    content: localText,
                                    quoteConfig: { ...config, text: localText }
                                });
                            }}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all min-h-[100px] resize-none"
                            placeholder="Masukkan kutipan atau ayat..."
                        />
                    </div>

                    {/* Author Text */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sumber / Penulis</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={config.author || ''}
                                onChange={(e) => handleUpdate({
                                    quoteConfig: { ...config, author: e.target.value }
                                })}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                                placeholder="Contoh: Anonymous, Nama Pasangan, dsb."
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Kutipan Dikunci</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-600 italic leading-relaxed line-clamp-2">"{config.text || element.content || 'Belum ada kutipan'}"</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">— {config.author || 'Anonim'}</p>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                {/* LIBRARY TOGGLE */}
                {canEdit && (
                    <button
                        onClick={() => setShowLibrary(!showLibrary)}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${showLibrary ? 'text-indigo-500' : 'text-slate-400 hover:text-indigo-500'}`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        TEMPLATE
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLibrary ? 'rotate-180' : ''}`} />
                    </button>
                )}

                {/* STYLING TOGGLE */}
                {permissions.canEditStyle && (
                    <button
                        onClick={() => setShowStyling(!showStyling)}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${showStyling ? 'text-teal-500' : 'text-slate-400 hover:text-teal-500'}`}
                    >
                        <Palette className="w-3.5 h-3.5" />
                        STYLING
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStyling ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            {/* TEMPLATE LIBRARY LIST */}
            {showLibrary && canEdit && (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Pilih Template Kutipan</label>
                    <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-1 text-left">
                        {QUOTES_LIBRARY.map((quote) => (
                            <button
                                key={quote.id}
                                onClick={() => {
                                    const newText = quote.textArabic ? `${quote.textArabic}\n\n${quote.text}` : quote.text;
                                    setLocalText(newText);
                                    handleUpdate({
                                        content: newText,
                                        quoteConfig: {
                                            ...config,
                                            text: newText,
                                            textArabic: quote.textArabic,
                                            author: quote.author,
                                            category: quote.category
                                        }
                                    });
                                    setShowLibrary(false);
                                }}
                                className="w-full text-left p-3 rounded-xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all space-y-2 group"
                            >
                                {quote.textArabic && (
                                    <p className="text-sm text-slate-800 font-arabic text-right leading-relaxed" dir="rtl">
                                        {quote.textArabic}
                                    </p>
                                )}
                                <p className="text-xs text-slate-500 italic leading-relaxed">
                                    "{quote.text}"
                                </p>
                                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1">
                                    — {quote.author}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showStyling && permissions.canEditStyle && (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warna Kutipan</label>
                        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-lg">
                            <input
                                type="color"
                                value={config.customColor || '#475569'}
                                onChange={(e) => handleUpdate({
                                    quoteConfig: { ...config, customColor: e.target.value }
                                })}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                            />
                            <span className="text-[10px] font-mono text-slate-500">{config.customColor || '#475569'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
