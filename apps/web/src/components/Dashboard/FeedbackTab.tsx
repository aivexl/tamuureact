import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { feedback as feedbackApi } from '@/lib/api';
import { MessageCircle, Bug, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { PremiumLoader } from '@/components/ui/PremiumLoader';

export const FeedbackTab: React.FC = () => {
    const { user } = useStore();
    const [category, setCategory] = useState<'bug' | 'feature'>('bug');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !user?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            await feedbackApi.submit({
                userId: user.id,
                category,
                message: message.trim()
            });
            setIsSuccess(true);
            setMessage('');
        } catch (err: any) {
            console.error('[Feedback] Submit failed:', err);
            setError(err.message || 'Gagal mengirim feedback. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <m.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center px-6"
            >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Feedback Terkirim!</h3>
                <p className="text-slate-500 max-w-md mb-8">
                    Terima kasih atas kontribusi Anda. Masukan Anda sangat berharga bagi pengembangan Tamuu yang lebih baik.
                </p>
                <button 
                    onClick={() => setIsSuccess(false)}
                    className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all"
                >
                    Kirim Feedback Lain
                </button>
            </m.div>
        );
    }

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
        >
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
                    <MessageCircle className="w-8 h-8 text-teal-500" />
                    Feedback & Hubungi Kami
                </h2>
                <p className="text-slate-500 mt-2">Bantu kami membuat Tamuu menjadi lebih sempurna untuk Anda.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setCategory('bug')}
                        className={`p-6 rounded-3xl border-2 transition-all flex items-start gap-4 text-left ${category === 'bug' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${category === 'bug' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Bug className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className={`font-black text-sm uppercase tracking-widest ${category === 'bug' ? 'text-rose-600' : 'text-slate-900'}`}>Lapor Masalah</h4>
                            <p className="text-xs text-slate-500 mt-1">Temukan bug atau kesalahan sistem? Beritahu kami.</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCategory('feature')}
                        className={`p-6 rounded-3xl border-2 transition-all flex items-start gap-4 text-left ${category === 'feature' ? 'border-teal-500 bg-teal-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${category === 'feature' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className={`font-black text-sm uppercase tracking-widest ${category === 'feature' ? 'text-teal-600' : 'text-slate-900'}`}>Request Fitur</h4>
                            <p className="text-xs text-slate-500 mt-1">Punya ide fitur baru yang menarik? Kami ingin dengar!</p>
                        </div>
                    </button>
                </div>

                {/* Message Input */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block px-1">
                        Pesan Anda
                    </label>
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={category === 'bug' ? 'Jelaskan masalah yang Anda alami secara detail...' : 'Jelaskan fitur apa yang ingin Anda tambahkan di Tamuu...'}
                        className="w-full min-h-[200px] p-6 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-700 leading-relaxed font-medium"
                    />
                    
                    <div className="flex items-center gap-2 px-1 py-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feedback Anda akan dikirim ke tim pengembang</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3"
                >
                    {isLoading ? (
                        <PremiumLoader variant="inline" color="white" showLabel label="Mengirim..." />
                    ) : (
                        <>
                            Kirim Feedback <Send className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>
        </m.div>
    );
};
