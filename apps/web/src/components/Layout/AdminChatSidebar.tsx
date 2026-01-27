import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    X,
    Send,
    Bot,
    User,
    Loader2,
    Sparkles,
    ChevronRight,
    HelpCircle
} from 'lucide-react';
import { admin } from '../../lib/api';
import { PremiumLoader } from '../ui/PremiumLoader';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const AdminChatSidebar: React.FC = () => {
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

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await admin.askAI([...messages, userMsg]);
            setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Maaf, ada kendala teknis: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-[60] w-16 h-16 bg-teal-500 text-slate-900 rounded-full shadow-[0_20px_50px_rgba(20,184,166,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
            >
                <MessageSquare className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md bg-[#0A0A0A] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 bg-teal-500/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                        <Bot className="w-6 h-6 text-slate-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white leading-none">Tamuu Smart CS</h3>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Online | AI Engine V1</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Chat Content */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                            >
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                        <Sparkles className="w-12 h-12 text-teal-500" />
                                        <div>
                                            <p className="text-white font-bold">Halo Admin! 👋</p>
                                            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Saya asisten AI Tamuu. Tanyakan apapun tentang produk, pembayaran, atau troubleshoot.</p>
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
                                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-white/10 border-white/10' : 'bg-teal-500/10 border-teal-500/20'}`}>
                                                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-teal-400" />}
                                            </div>
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                                ? 'bg-teal-500 text-slate-900 font-medium rounded-tr-none'
                                                : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                                                }`}>
                                                {msg.content.split(/(\*\*.*?\*\*)/).map((part, index) => {
                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                        return <strong key={index} className="font-black text-white">{part.slice(2, -2)}</strong>;
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
                                            <PremiumLoader variant="inline" size="sm" color="#14b8a6" />
                                            <span className="text-xs text-slate-400 font-medium">Berpikir...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-6 border-t border-white/10 bg-[#0F0F0F]">
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
                                        placeholder="Tulis pesan..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all resize-none max-h-32"
                                        rows={2}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className="absolute right-3 bottom-3 p-3 bg-teal-500 text-slate-900 rounded-xl hover:bg-teal-400 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 text-center uppercase font-black tracking-widest opacity-50 flex items-center justify-center gap-2">
                                    <HelpCircle className="w-3 h-3" /> Press Enter to send
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
