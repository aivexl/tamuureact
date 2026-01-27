import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    HelpCircle,
    Settings,
    Volume2,
    VolumeX,
    Zap,
    Brain,
    Clock,
    Copy,
    RotateCcw,
    Check,
    Minimize2,
    Maximize2,
    BarChart3,
    Shield,
    Award,
    Crown,
    Star
} from 'lucide-react';
import { admin } from '../../lib/api';
import { PremiumLoader } from '../ui/PremiumLoader';
import { useStore } from '../../store/useStore';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    responseTime?: number;
    metadata?: {
        provider?: string;
        intent?: string;
        confidence?: number;
        fallback?: boolean;
        error?: string;
    };
}

interface ChatSession {
    id: string;
    startTime: Date;
    messageCount: number;
    totalResponseTime: number;
    averageResponseTime: number;
    userTier: 'free' | 'premium' | 'business';
    userPersona: string;
}

interface AdminChatSidebarEnhancedProps {
    userId?: string;
    enableSessionTracking?: boolean;
    enableQuickActions?: boolean;
    enableSettingsPanel?: boolean;
    aiPersonality?: 'professional' | 'strategic' | 'analytical';
}

interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
    category: 'analytics' | 'support' | 'management';
}

export const AdminChatSidebarEnhanced: React.FC<AdminChatSidebarEnhancedProps> = ({
    userId,
    enableSessionTracking = true,
    enableQuickActions = true,
    enableSettingsPanel = true,
    aiPersonality = 'professional'
}) => {
    const { user } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [session, setSession] = useState<ChatSession | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [personality, setPersonality] = useState<'professional' | 'strategic' | 'analytical'>(aiPersonality);
    const [responseSpeed, setResponseSpeed] = useState<'instant' | 'normal' | 'analytical'>('normal');
    const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Initialize session
    useEffect(() => {
        if (isOpen && !session) {
            const newSession: ChatSession = {
                id: `admin-session-${Date.now()}`,
                startTime: new Date(),
                messageCount: 0,
                totalResponseTime: 0,
                averageResponseTime: 0,
                userTier: 'business',
                userPersona: 'admin_analyst'
            };
            setSession(newSession);
        }
    }, [isOpen, session]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                setIsOpen(false);
            } else if (e.key === 'm' && e.ctrlKey) {
                setIsMuted(!isMuted);
            } else if (e.key === 's' && e.ctrlKey && enableSettingsPanel) {
                setShowSettings(!showSettings);
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isMuted, showSettings, input, isLoading, enableSettingsPanel]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const startTime = Date.now();
        const userMsg: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await admin.askAI([...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: input }]);
            const responseTime = Date.now() - startTime;

            const assistantMsg: Message = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: response.content,
                timestamp: new Date(),
                responseTime,
                metadata: response.metadata || {}
            };

            setMessages(prev => [...prev, assistantMsg]);

            // Update session stats
            if (session) {
                const newTotalResponseTime = session.totalResponseTime + responseTime;
                const newMessageCount = session.messageCount + 1;
                setSession({
                    ...session,
                    messageCount: newMessageCount,
                    totalResponseTime: newTotalResponseTime,
                    averageResponseTime: newTotalResponseTime / newMessageCount
                });
            }
        } catch (err: any) {
            const errorMsg: Message = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: `Maaf Kak, ada kendala teknis: ${err.message}. Tim engineer kami sedang menyelesaikan masalah ini dengan prioritas tinggi. 🙏`,
                timestamp: new Date(),
                metadata: { error: 'NETWORK_ERROR', fallback: true }
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyMessage = async (content: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessage(messageId);
            setTimeout(() => setCopiedMessage(null), 2000);
        } catch (err) {
            console.error('Failed to copy message:', err);
        }
    };

    const handleRegenerateMessage = async (messageIndex: number) => {
        const previousMessages = messages.slice(0, messageIndex);
        const lastUserMessage = previousMessages.reverse().find(m => m.role === 'user');

        if (lastUserMessage) {
            setMessages(messages.slice(0, messageIndex));
            setInput(lastUserMessage.content);
            setTimeout(() => handleSend(), 100);
        }
    };

    const quickActions: QuickAction[] = [
        {
            id: 'analytics',
            label: 'Analytics Dashboard',
            icon: <BarChart3 className="w-4 h-4" />,
            action: () => {
                setInput('Tampilkan analytics dashboard untuk hari ini');
                handleSend();
            },
            category: 'analytics'
        },
        {
            id: 'system-health',
            label: 'System Health',
            icon: <Shield className="w-4 h-4" />,
            action: () => {
                setInput('Cek status kesehatan sistem dan performa API');
                handleSend();
            },
            category: 'analytics'
        },
        {
            id: 'user-management',
            label: 'User Management',
            icon: <Crown className="w-4 h-4" />,
            action: () => {
                setInput('Tampilkan daftar user premium dan aktivitas mereka');
                handleSend();
            },
            category: 'management'
        },
        {
            id: 'support-tickets',
            label: 'Support Tickets',
            icon: <MessageSquare className="w-4 h-4" />,
            action: () => {
                setInput('Lihat daftar ticket support yang belum diselesaikan');
                handleSend();
            },
            category: 'support'
        }
    ];

    const getWelcomeMessage = () => {
        const tier = session?.userTier || 'business';
        const persona = personality;

        const tierMessages: any = {
            business: {
                professional: "Selamat datang di Admin Dashboard Tamuu Enterprise! 🏆 Sistem AI analitik kami siap membantu optimasi bisnis Kak dengan data-driven insights.",
                strategic: "Halo Admin Strategis! 🎯 Mari kita analisis tren market dan strategi pertumbuhan dengan AI-powered business intelligence.",
                analytical: "Selamat datang di Command Center! 📊 Sistem analitik advanced kami siap memproses big data untuk actionable insights."
            },
            premium: {
                professional: "Welcome Admin Premium! ✨ Tools advanced dan analytics premium siap mendukung decision making Kak.",
                strategic: "Halo Strategic Partner! 🚀 Mari optimalkan performance dengan premium analytics dan strategic recommendations.",
                analytical: "Admin Premium Analytics Active! 🔬 Advanced data processing siap memberikan deep insights."
            }
        };

        return tierMessages[tier]?.[persona] || tierMessages.business.professional;
    };

    const getPersonalityIcon = () => {
        switch (personality) {
            case 'strategic': return <Crown className="w-4 h-4" />;
            case 'analytical': return <Brain className="w-4 h-4" />;
            default: return <Star className="w-4 h-4" />;
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-[60] w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 rounded-full shadow-[0_20px_50px_rgba(20,184,166,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group group-hover:shadow-[0_25px_60px_rgba(20,184,166,0.4)]"
            >
                <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity" />
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
                            className={`relative bg-[#0A0A0A] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col ${isMinimized ? 'w-80' : 'w-full max-w-md'}`}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                            <Bot className="w-6 h-6 text-slate-900" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0A0A0A] animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white leading-none">Tamuu Admin AI</h3>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Enterprise AI Engine V8</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsMinimized(!isMinimized)}
                                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                                        title={isMinimized ? 'Maximize' : 'Minimize'}
                                    >
                                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                    </button>
                                    {enableSettingsPanel && (
                                        <button
                                            onClick={() => setShowSettings(!showSettings)}
                                            className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                                            title="Settings"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Settings Panel */}
                            <AnimatePresence>
                                {showSettings && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-b border-white/10 bg-white/5 overflow-hidden"
                                    >
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">AI Personality</label>
                                                <div className="flex gap-2 mt-2">
                                                    {(['professional', 'strategic', 'analytical'] as const).map((pType) => (
                                                        <button
                                                            key={pType}
                                                            onClick={() => setPersonality(pType)}
                                                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${personality === pType
                                                                ? 'bg-teal-500 text-slate-900'
                                                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {pType === 'professional' && <Star className="w-3 h-3 inline mr-1" />}
                                                            {pType === 'strategic' && <Crown className="w-3 h-3 inline mr-1" />}
                                                            {pType === 'analytical' && <Brain className="w-3 h-3 inline mr-1" />}
                                                            {pType.charAt(0).toUpperCase() + pType.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Response Speed</label>
                                                <div className="flex gap-2 mt-2">
                                                    {(['instant', 'normal', 'analytical'] as const).map((speed) => (
                                                        <button
                                                            key={speed}
                                                            onClick={() => setResponseSpeed(speed)}
                                                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${responseSpeed === speed
                                                                ? 'bg-emerald-500 text-slate-900'
                                                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {speed === 'instant' && <Zap className="w-3 h-3 inline mr-1" />}
                                                            {speed === 'normal' && <Clock className="w-3 h-3 inline mr-1" />}
                                                            {speed === 'analytical' && <Brain className="w-3 h-3 inline mr-1" />}
                                                            {speed.charAt(0).toUpperCase() + speed.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Sound Notifications</label>
                                                <button
                                                    onClick={() => setIsMuted(!isMuted)}
                                                    className={`p-2 rounded-lg transition-all ${isMuted ? 'bg-white/5 text-slate-400' : 'bg-teal-500 text-slate-900'
                                                        }`}
                                                >
                                                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Session Stats */}
                            {session && (
                                <div className="p-4 border-b border-white/10 bg-white/5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-teal-500" />
                                            <span className="font-black uppercase tracking-widest text-slate-400">Session Stats</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-400">
                                            <span>{session.messageCount} messages</span>
                                            <span>•</span>
                                            <span>{Math.round(session.averageResponseTime)}ms avg</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            {enableQuickActions && (
                                <div className="p-4 border-b border-white/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Quick Actions</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {quickActions.map((action) => (
                                            <motion.button
                                                key={action.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={action.action}
                                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all group"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="text-emerald-500">{action.icon}</div>
                                                    <span className="text-xs font-bold text-white">{action.label}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                                                    {action.category}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chat Content */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                            >
                                {messages.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center h-full text-center space-y-6"
                                    >
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Award className="w-16 h-16 text-gradient-to-r from-teal-500 to-emerald-500" />
                                        </motion.div>
                                        <div>
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="text-white font-bold text-lg"
                                            >
                                                {getWelcomeMessage()}
                                            </motion.p>
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                className="text-xs text-slate-400 mt-3 max-w-[250px] mx-auto leading-relaxed"
                                            >
                                                {enableQuickActions
                                                    ? "Gunakan quick actions di atas atau tanyakan apapun tentang analytics, system health, user management, dan strategic insights."
                                                    : "Tanyakan apapun tentang analytics, system health, user management, dan strategic insights."
                                                }
                                            </motion.p>
                                        </div>
                                    </motion.div>
                                )}

                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-white/10 border-white/10' : 'bg-gradient-to-r from-teal-500 to-emerald-500 border-teal-500/20'}`}>
                                                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                                            </div>
                                            <div className="space-y-2">
                                                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 font-medium rounded-tr-none shadow-lg'
                                                    : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-sm'
                                                    }`}>
                                                    {msg.content.split(/(\*\*.*?\*\*)/).map((part, index) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <strong key={index} className="font-black text-white">{part.slice(2, -2)}</strong>;
                                                        }
                                                        return part;
                                                    })}
                                                </div>

                                                {/* Message Actions */}
                                                <div className="flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleCopyMessage(msg.content, msg.id)}
                                                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                                                        title="Copy message"
                                                    >
                                                        {copiedMessage === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                    {msg.role === 'assistant' && (
                                                        <button
                                                            onClick={() => handleRegenerateMessage(i)}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                                                            title="Regenerate response"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <span className="text-[10px] text-slate-500">
                                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {msg.responseTime && (
                                                        <span className="text-[10px] text-emerald-500 font-bold">
                                                            {msg.responseTime}ms
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border bg-gradient-to-r from-teal-500 to-emerald-500 border-teal-500/20">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 backdrop-blur-sm">
                                                <PremiumLoader variant="inline" size="sm" color="#14b8a6" />
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {responseSpeed === 'analytical' ? 'Menganalisis data dengan AI advanced...' : 'Berpikir...'}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-6 border-t border-white/10 bg-[#0F0F0F]">
                                <div className="relative">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder={`Tanya sebagai admin... (Personality: ${personality})`}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all resize-none max-h-32 backdrop-blur-sm"
                                        rows={2}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className="absolute right-3 bottom-3 p-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 rounded-xl hover:from-teal-400 hover:to-emerald-400 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest opacity-50 flex items-center gap-2">
                                        <HelpCircle className="w-3 h-3" />
                                        {isMinimized ? 'Press Enter to send' : 'Enter: send • Ctrl+M: mute • Ctrl+S: settings • Esc: close'}
                                    </p>
                                    {session && (
                                        <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                                            {getPersonalityIcon()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};