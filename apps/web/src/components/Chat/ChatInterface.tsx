import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Send, User, Store, Clock, CheckCheck, ChevronLeft, MessageSquare, Shield } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useStore } from '../../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ChatInterfaceProps {
    mode: 'user' | 'vendor' | 'admin';
    initialConvId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ mode, initialConvId }) => {
    const { user } = useStore();
    const { useConversations, useMessages, sendMessage, markAsRead, useAdminMonitoring, useAdminChatHistory } = useChat();
    
    // Select correct hook based on mode
    const convHook = mode === 'admin' ? useAdminMonitoring() : useConversations();
    const [selectedId, setSelectedId] = useState<string | undefined>(initialConvId);
    
    const messagesHook = mode === 'admin' 
        ? useAdminChatHistory(selectedId) 
        : useMessages(selectedId);

    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const conversations = convHook.data?.conversations || [];
    const messages = messagesHook.data?.messages || [];

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Mark as read when opening (if not admin)
    useEffect(() => {
        if (selectedId && mode !== 'admin') {
            markAsRead(selectedId);
        }
    }, [selectedId, mode]);

    const handleSend = () => {
        if (!input.trim() || !selectedId) return;
        
        const currentConv = conversations.find((c: any) => c.id === selectedId);
        if (!currentConv) return;

        // Determine recipient based on mode
        const payload = mode === 'vendor' 
            ? { recipient_id: currentConv.user_id, content: input, merchant_id: currentConv.merchant_id }
            : { merchant_id: currentConv.merchant_id, content: input };

        sendMessage(payload);
        setInput('');
    };

    const activeConv = conversations.find((c: any) => c.id === selectedId);

    return (
        <div className="flex h-[calc(100vh-200px)] bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            {/* Sidebar: Conversations List */}
            <div className={`w-full md:w-80 border-r border-slate-50 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-50">
                    <h2 className="text-lg font-black text-[#0A1128] flex items-center gap-2">
                        {mode === 'admin' ? <Shield className="w-5 h-5 text-rose-500" /> : <MessageSquare className="w-5 h-5 text-indigo-600" />}
                        Messages
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm">No messages yet.</div>
                    ) : conversations.map((conv: any) => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedId(conv.id)}
                            className={`w-full p-4 flex items-center gap-4 transition-all border-b border-slate-50/50 ${selectedId === conv.id ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                    {mode === 'vendor' ? (
                                        conv.customer_avatar ? <img src={conv.customer_avatar} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-slate-400" />
                                    ) : (
                                        conv.merchant_logo ? <img src={conv.merchant_logo} className="w-full h-full object-cover" /> : <Store className="w-6 h-6 text-slate-400" />
                                    )}
                                </div>
                                {((mode === 'user' && conv.unread_count_user > 0) || (mode === 'vendor' && conv.unread_count_vendor > 0)) && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                        {mode === 'user' ? conv.unread_count_user : conv.unread_count_vendor}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <p className="font-bold text-slate-900 truncate">
                                        {mode === 'vendor' ? conv.customer_name : conv.merchant_name}
                                    </p>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: false, locale: id })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate italic">
                                    {conv.last_message || 'Start chatting...'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Window */}
            <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                {selectedId && activeConv ? (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedId(undefined)} className="md:hidden p-2 -ml-2 text-slate-400"><ChevronLeft /></button>
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
                                    {mode === 'vendor' ? (
                                        activeConv.customer_avatar ? <img src={activeConv.customer_avatar} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        activeConv.merchant_logo ? <img src={activeConv.merchant_logo} className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 leading-tight">
                                        {mode === 'vendor' ? activeConv.customer_name : activeConv.merchant_name}
                                    </p>
                                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Active Now
                                    </p>
                                </div>
                            </div>
                            {mode === 'admin' && (
                                <div className="px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-1.5">
                                    <Shield className="w-3 h-3" /> Monitoring Mode
                                </div>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {messages.map((msg: any) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <m.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            key={msg.id}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                                                <p className="leading-relaxed font-medium">{msg.content}</p>
                                                <div className={`flex items-center gap-1.5 mt-1.5 justify-end ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold">
                                                        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && <CheckCheck className={`w-3 h-3 ${msg.read_at ? 'text-teal-300' : 'opacity-50'}`} />}
                                                </div>
                                            </div>
                                        </m.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Input Area (Hidden for Admin) */}
                        {mode !== 'admin' && (
                            <div className="p-4 bg-white border-t border-slate-50">
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 font-medium"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-indigo-200"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-[#0A1128] mb-2">Select a Conversation</h3>
                        <p className="text-slate-400 text-sm max-w-xs">Pick a chat from the sidebar to start messaging with your partner.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
