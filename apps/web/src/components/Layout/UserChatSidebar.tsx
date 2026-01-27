import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    Sparkles,
    User,
    Loader2,
    ChevronRight,
    HelpCircle
} from 'lucide-react';
import { users } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { PremiumLoader } from '../ui/PremiumLoader';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isIntermediate?: boolean;
}

export const UserChatSidebar: React.FC = () => {
    const { user, token } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (forcedInput?: string) => {
        const messageText = forcedInput || input;
        if (!messageText.trim() || isLoading) return;

        const isSilentDiagnostic = forcedInput?.includes("audit diagnostik");

        // Only show user message if not a silent diagnostic
        if (!isSilentDiagnostic) {
            const userMsg: Message = { role: 'user', content: messageText };
            setMessages(prev => [...prev, userMsg]);
        }

        setInput('');
        setIsLoading(true);

        // Immediate acknowledgment bubble (Bubble 1) - Marked as intermediate
        // Only show for non-diagnostic messages
        if (!isSilentDiagnostic) {
            const ackMsg: Message = {
                role: 'assistant',
                content: "Mohon tunggu sejenak ya Kak, saya sedang meninjau detail akun Kak untuk memberikan bantuan terbaik... 😊",
                isIntermediate: true
            };
            setMessages(prev => [...prev, ackMsg]);
        }

        try {
            // Filter out intermediate messages before sending to AI
            const filteredHistory = [...messages.filter(m => !m.isIntermediate)];
            if (!isSilentDiagnostic) {
                filteredHistory.push({ role: 'user', content: messageText });
            } else {
                // For diagnostic, we send it as the first message
                filteredHistory.push({ role: 'user', content: messageText });
            }

            const response = await users.askAI(filteredHistory, user?.id, token || undefined);

            // The final answer (Bubble 2)
            setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Maaf Kak, sepertinya sedang ada sedikit kendala koneksi. Mohon coba lagi ya! 🙏` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Minimalist Floating Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-indigo-600 text-white rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.4)] flex items-center justify-center transition-all group"
            >
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                <MessageCircle className="w-6 h-6 relative z-10" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md bg-[#0D0D0F] border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 bg-indigo-500/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white tracking-tight">Tamuu Assistant</h3>
                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Siap membantu Anda 24/7</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Chat Content */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                            >
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center animate-pulse">
                                            <MessageCircle className="w-10 h-10 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg">Ada yang bisa kami bantu? 👋</p>
                                            <p className="text-xs text-slate-400 mt-2 max-w-[240px] leading-relaxed">
                                                Tanyakan apapun seputar pembuatan undangan, pembayaran, atau fitur Tamuu lainnya.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
                                            {[
                                                "Cek status pembayaran",
                                                "Cara ganti musik undangan?",
                                                "Apa beda paket PRO, ULTIMATE & ELITE?",
                                                "Berapa jumlah RSVP saya?"
                                            ].map((q) => (
                                                <button
                                                    key={q}
                                                    onClick={() => handleSend(q)}
                                                    className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-left text-xs text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all font-medium"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5 border-white/10'
                                                }`}>
                                                {msg.role === 'user' ? <User className="w-4 h-4 text-indigo-400" /> : <Sparkles className="w-4 h-4 text-white/50" />}
                                            </div>
                                            <div className={`p-4 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-lg shadow-indigo-500/20'
                                                : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                                                }`}>
                                                {msg.content.split(/(\*\*.*?\*\*)/).map((part, index) => {
                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                        return <strong key={index} className="font-black text-indigo-300">{part.slice(2, -2)}</strong>;
                                                    }
                                                    return part;
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                                            <PremiumLoader variant="inline" size="sm" color="rgb(99, 102, 241)" />
                                            <span className="text-xs text-slate-500 font-medium italic">Sedang menganalisis data...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-6 border-t border-white/5 bg-[#0F0F11]">
                                <div className="relative">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Tanyakan sesuatu..."
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-5 pr-14 py-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none max-h-32 placeholder:text-slate-600"
                                        rows={1}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim() || isLoading}
                                        className="absolute right-2 bottom-2 p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-indigo-500/20"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-600 mt-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
                                    <HelpCircle className="w-3 h-3" /> Tekan Enter untuk mengirim
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
