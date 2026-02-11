/**
 * QuotesPanel - Quotes Management
 * Allows users to add custom quotes or select from library
 */

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
    Quote,
    Save,
    Check,
    AlertCircle,
    BookOpen,
    Pen,
    Sparkles
} from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { invitations as invitationsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { QUOTES_LIBRARY, QuoteItem } from '@/constants/quotes';

interface QuotesPanelProps {
    invitationId: string;
    onClose: () => void;
}

export const QuotesPanel: React.FC<QuotesPanelProps> = ({ invitationId, onClose }) => {
    const [quoteText, setQuoteText] = useState('');
    const [quoteAuthor, setQuoteAuthor] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'custom' | 'quran' | 'international'>('custom');

    const { sections, updateSectionsBatch } = useStore();

    // Load existing quote
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await invitationsApi.get(invitationId);
                if (data?.quote_text) setQuoteText(data.quote_text);
                if (data?.quote_author) setQuoteAuthor(data.quote_author);
            } catch (err) {
                console.error('[QuotesPanel] Load error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (invitationId) {
            loadData();
        }
    }, [invitationId]);

    // Use quote from library
    const useQuote = (quote: QuoteItem) => {
        const fullText = quote.textArabic
            ? `${quote.textArabic}\n\n${quote.text}`
            : quote.text;
        setQuoteText(fullText);
        setQuoteAuthor(quote.author);
        setActiveTab('custom');
    };

    // Save handler
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await invitationsApi.update(invitationId, {
                quote_text: quoteText,
                quote_author: quoteAuthor
            });

            // Sync with any Quote elements on the canvas
            const updatedSections = sections.map(s => ({
                ...s,
                elements: s.elements.map(el => {
                    if (el.type === 'quote' && el.quoteConfig) {
                        return {
                            ...el,
                            quoteConfig: {
                                ...el.quoteConfig,
                                text: quoteText,
                                author: quoteAuthor
                            }
                        };
                    }
                    return el;
                })
            }));
            updateSectionsBatch(updatedSections);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err) {
            console.error('[QuotesPanel] Save error:', err);
            setError('Gagal menyimpan quote');
        } finally {
            setSaving(false);
        }
    };

    const quranQuotes = QUOTES_LIBRARY.filter(q => q.category === 'quran');
    const intlQuotes = QUOTES_LIBRARY.filter(q => q.category === 'international');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <PremiumLoader variant="inline" showLabel label="Memuat Quote..." color="#d97706" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                        <Quote className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Quote Undangan</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Kutipan Spesial
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${saving
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : success
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                >
                    {saving && <PremiumLoader variant="inline" size="sm" color="white" />}
                    {success && <Check className="w-4 h-4" />}
                    {saving ? 'Menyimpan...' : success ? 'Tersimpan!' : 'Simpan'}
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                    onClick={() => setActiveTab('custom')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'custom'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Pen className="w-4 h-4" />
                    Tulis Sendiri
                </button>
                <button
                    onClick={() => setActiveTab('quran')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'quran'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <BookOpen className="w-4 h-4" />
                    Al-Quran
                </button>
                <button
                    onClick={() => setActiveTab('international')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'international'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    Terkenal
                </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'custom' && (
                    <m.div
                        key="custom"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {/* Quote Text */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                                Isi Quote
                            </label>
                            <textarea
                                value={quoteText}
                                onChange={(e) => setQuoteText(e.target.value)}
                                placeholder="Tuliskan kutipan yang bermakna..."
                                rows={4}
                                className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-300 outline-none text-base font-medium text-slate-700 placeholder:text-slate-300 transition-all resize-none"
                            />
                        </div>

                        {/* Quote Author */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                                Nama Author / Sumber
                            </label>
                            <input
                                type="text"
                                value={quoteAuthor}
                                onChange={(e) => setQuoteAuthor(e.target.value)}
                                placeholder="Contoh: QS. Ar-Rum: 21"
                                className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-300 outline-none text-base font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                            />
                        </div>

                        {/* Preview */}
                        {quoteText && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 space-y-3">
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Preview</p>
                                <blockquote className="text-slate-700 font-medium italic whitespace-pre-wrap leading-relaxed">
                                    "{quoteText}"
                                </blockquote>
                                {quoteAuthor && (
                                    <p className="text-sm font-bold text-amber-700">— {quoteAuthor}</p>
                                )}
                            </div>
                        )}
                    </m.div>
                )}

                {activeTab === 'quran' && (
                    <m.div
                        key="quran"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4 max-h-[400px] overflow-y-auto pr-2"
                    >
                        {quranQuotes.map((quote) => (
                            <div
                                key={quote.id}
                                className="bg-white rounded-2xl p-5 border border-slate-100 space-y-3 hover:border-amber-200 hover:shadow-sm transition-all"
                            >
                                {quote.textArabic && (
                                    <p className="text-lg text-slate-800 font-arabic text-right leading-loose" dir="rtl">
                                        {quote.textArabic}
                                    </p>
                                )}
                                <p className="text-sm text-slate-600 italic leading-relaxed">
                                    {quote.text}
                                </p>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <span className="text-xs font-bold text-amber-600">{quote.author}</span>
                                    <button
                                        onClick={() => useQuote(quote)}
                                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                                    >
                                        Gunakan quote ini
                                    </button>
                                </div>
                            </div>
                        ))}
                    </m.div>
                )}

                {activeTab === 'international' && (
                    <m.div
                        key="international"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {intlQuotes.map((quote) => (
                            <div
                                key={quote.id}
                                className="bg-white rounded-2xl p-5 border border-slate-100 space-y-3 hover:border-teal-200 hover:shadow-sm transition-all"
                            >
                                <p className="text-base text-slate-700 italic leading-relaxed">
                                    "{quote.text}"
                                </p>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <span className="text-xs font-bold text-teal-600">— {quote.author}</span>
                                    <button
                                        onClick={() => useQuote(quote)}
                                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm"
                                    >
                                        Gunakan quote ini
                                    </button>
                                </div>
                            </div>
                        ))}
                    </m.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default QuotesPanel;
