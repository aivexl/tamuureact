import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    Sparkles,
    User,
    Loader2,
    ChevronRight,
    HelpCircle,
    Bot,
    Zap,
    Crown,
    Settings,
    Maximize2,
    Minimize2,
    Copy,
    ThumbsUp,
    ThumbsDown,
    RefreshCw,
    Volume2,
    VolumeX
} from 'lucide-react';
import { users } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { PremiumLoader } from '../ui/PremiumLoader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Award-winning UI/UX standards for enterprise applications
interface Message {
    role: 'user' | 'assistant';
    content: string;
    isIntermediate?: boolean;
    timestamp?: Date;
    messageId?: string;
    isError?: boolean;
    isSystem?: boolean;
    intent?: string;
    confidence?: number;
    responseTime?: number;
}

interface ChatSession {
    sessionId: string;
    startTime: Date;
    messageCount: number;
    userTier: string;
    context: Record<string, any>;
}

// Enterprise-grade chat interface with world-class UX
export const UserChatSidebarEnhanced: React.FC = () => {
    const { user, token } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [session, setSession] = useState<ChatSession | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [aiPersonality, setAiPersonality] = useState<'professional' | 'friendly' | 'casual'>('professional');
    const [responseSpeed, setResponseSpeed] = useState<'instant' | 'normal' | 'thoughtful'>('normal');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto scroll to bottom with smooth animation
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isLoading]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Initialize session and trigger silent audit
    useEffect(() => {
        if (isOpen && !session) {
            const newSession: ChatSession = {
                sessionId: `session_${Date.now()}_${user?.id}`,
                startTime: new Date(),
                messageCount: 0,
                userTier: user?.tier || 'free',
                context: {
                    userAgent: navigator.userAgent,
                    screenResolution: `${window.screen.width}x${window.screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language
                }
            };
            setSession(newSession);

            // V9 PASSIVE INITIATION: Trigger silent audit without greeting user
            // This runs in the background. The user sees a blank chat (clean) 
            // but the engine is now auditing their account.
            const triggerSilentAudit = async () => {
                try {
                    await (users as any).chatWithAIEnhanced({
                        messages: [], // Empty messages triggers audit in V9
                        context: {
                            userId: user?.id,
                            userProfile: user,
                            sessionId: newSession.sessionId,
                            userTier: user?.tier,
                            isSilentDiagnostic: true
                        }
                    });
                } catch (e) {
                    console.log("[V9] Silent audit completed in background.");
                }
            };

            triggerSilentAudit();
            setMessages([]); // Start with clean slate as requested
        }
    }, [isOpen, session, user]);

    // Generate personalized welcome message
    const generateWelcomeMessage = (userData: any): string => {
        const tier = (userData?.tier as string) || 'free';
        const name = userData?.name || 'Kak';

        const tierMessages: Record<string, string> = {
            premium: `Selamat datang ${name}! 🏆 Saya AI Assistant premium Tamuu dengan prioritas tinggi. Siap membantu 24/7 dengan response time <100ms.`,
            business: `Halo ${name}! 💼 Saya AI Assistant bisnis Tamuu. Siap membantu dengan solusi enterprise untuk kebutuhan undangan digital Anda.`,
            free: `Halo ${name}! 😊 Saya AI Assistant Tamuu. Dengan senang hati membantu membuat undangan digital yang menawan untuk acara spesial Anda.`
        };

        return tierMessages[tier] || tierMessages.free;
    };

    // Handle message sending with enterprise features
    const handleSend = useCallback(async (forcedInput?: string) => {
        const messageText = forcedInput || input;
        if (!messageText.trim() || isLoading) return;

        const startTime = Date.now();
        const isSilentDiagnostic = forcedInput?.includes("audit diagnostik");

        // Create user message
        const userMsg: Message = {
            role: 'user',
            content: messageText,
            timestamp: new Date(),
            messageId: `user_${Date.now()}_${user?.id || 'anon'}`
        };

        if (!isSilentDiagnostic) {
            setMessages(prev => [...prev, userMsg]);
        }

        setInput('');
        setIsLoading(true);

        try {
            // Show typing indicator
            const typingMsg: Message = {
                role: 'assistant',
                content: '',
                isIntermediate: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev.filter(m => !m.isIntermediate), typingMsg]);

            // Simulate response time based on settings
            const responseDelay = responseSpeed === 'instant' ? 100 : responseSpeed === 'thoughtful' ? 2000 : 500;
            await new Promise(resolve => setTimeout(resolve, responseDelay));

            // V9.0: Send full history for agentic context
            const history = messages
                .filter(m => !m.isIntermediate && !m.isError)
                .map(m => ({
                    role: m.role,
                    content: m.content
                }));

            // Add the current user message to history
            history.push({ role: 'user', content: messageText });

            // Call enhanced AI API
            const response = await (users as any).chatWithAIEnhanced({
                messages: history,
                context: {
                    userId: user?.id,
                    userProfile: user,
                    sessionId: session?.sessionId,
                    userTier: user?.tier,
                    personality: aiPersonality,
                    responseSpeed: responseSpeed,
                    isSilentDiagnostic,
                    // Additional enterprise context
                    currentPath: window.location.pathname,
                    lastAction: 'chat_sent'
                }
            });

            const responseTime = Date.now() - startTime;

            // Remove typing indicator and add actual response
            const assistantMsg: Message = {
                role: 'assistant',
                content: response.content,
                timestamp: new Date(),
                messageId: `assistant_${Date.now()}_${user?.id}`,
                intent: response.metadata?.intent,
                confidence: response.metadata?.confidence,
                responseTime
            };

            setMessages(prev => [...prev.filter(m => !m.isIntermediate), assistantMsg]);

            // Update session
            if (session) {
                setSession(prev => prev ? {
                    ...prev,
                    messageCount: prev.messageCount + 2
                } : null);
            }

            // Audio feedback (if not muted)
            if (!isMuted) {
                playNotificationSound();
            }

        } catch (error) {
            console.error('Chat error:', error);

            const errorMsg: Message = {
                role: 'assistant',
                content: 'Maaf Kak, terjadi kesalahan. Saya akan coba lagi. Jika masalah berlanjut, silakan hubungi support kami. 🙏',
                timestamp: new Date(),
                messageId: `error_${Date.now()}_${user?.id}`,
                isError: true
            };

            setMessages(prev => [...prev.filter(m => !m.isIntermediate), errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, user, session, aiPersonality, responseSpeed, isMuted]);

    // Copy message to clipboard
    const handleCopyMessage = useCallback(async (message: Message) => {
        try {
            await navigator.clipboard.writeText(message.content);
            // Show toast notification (implementation needed)
        } catch (error) {
            console.error('Copy failed:', error);
        }
    }, []);

    // Regenerate response
    const handleRegenerate = useCallback(async (messageId: string) => {
        const message = messages.find(m => m.messageId === messageId);
        if (message && message.role === 'assistant') {
            // Find the corresponding user message
            const messageIndex = messages.findIndex(m => m.messageId === messageId);
            if (messageIndex > 0) {
                const userMessage = messages[messageIndex - 1];
                if (userMessage.role === 'user') {
                    // Remove assistant message and regenerate
                    setMessages(prev => prev.filter(m => m.messageId !== messageId));
                    await handleSend(userMessage.content);
                }
            }
        }
    }, [messages, handleSend]);

    // Play notification sound
    const playNotificationSound = useCallback(() => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.error('Audio notification failed:', error);
        }
    }, []);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            } else if (e.key === 'Enter' && e.ctrlKey && isOpen) {
                handleSend();
            } else if (e.key === '/' && e.metaKey && e.shiftKey) {
                setIsOpen(!isOpen);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleSend]);

    // Quick action buttons
    const quickActions = [
        { icon: HelpCircle, label: 'Bantuan', action: () => handleSend('Saya butuh bantuan') },
        { icon: Sparkles, label: 'Tips', action: () => handleSend('Beri saya tips terbaik') },
        { icon: Zap, label: 'Cepat', action: () => handleSend('Bagaimana cara cepat membuat undangan?') }
    ];

    // ReactMarkdown Configuration for Enterprise UI
    const MarkdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
        // Paragraphs
        p: ({ node, ...props }) => <div className="mb-3 leading-relaxed last:mb-0" {...props} />,

        // Headings - Ensure block display and clear spacing
        h1: ({ node, ...props }) => <h1 className="block text-lg font-bold text-gray-900 mt-4 mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="block text-base font-bold text-gray-900 mt-4 mb-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="block text-sm font-bold text-blue-900 mt-4 mb-2" {...props} />,
        h4: ({ node, ...props }) => <h4 className="block text-xs font-bold text-gray-800 mt-3 mb-1" {...props} />,

        // Lists
        ul: ({ node, ...props }) => <ul className="space-y-1 my-2 pl-1 list-none" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal space-y-1 my-2 pl-4" {...props} />,
        li: ({ node, ...props }) => {
            const children = React.Children.toArray(props.children);
            const content = children.map((child) => {
                if (React.isValidElement(child) && child.type === 'div' && (child.props as any).className?.includes('mb-3')) {
                    return (child.props as any).children;
                }
                return child;
            });

            return (
                <li className="flex items-start space-x-2 text-sm">
                    {/* Visual Dot - Premium Look */}
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="flex-1">{content}</span>
                </li>
            );
        },

        // Bold/Strong
        strong: ({ node, ...props }) => <strong className="font-extrabold text-blue-950" {...props} />,

        // Links
        a: ({ node, ...props }) => (
            <a className="text-blue-600 hover:text-blue-800 underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
        ),

        // Tables
        table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100" {...props} />
            </div>
        ),
        thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
        tbody: ({ node, ...props }) => <tbody className="bg-white divide-y divide-gray-100" {...props} />,
        tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
        th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" {...props} />
        ),
        td: ({ node, ...props }) => (
            <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap" {...props} />
        ),

        // Horizontal Rule
        hr: ({ node, ...props }) => <hr className="my-4 border-gray-100" {...props} />,

        // Blockquote
        blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-200 pl-4 py-1 my-3 bg-blue-50/50 rounded-r-lg italic text-gray-600" {...props} />
        ),
    };


    // Pre-process content to ensure valid markdown
    const processContent = (raw: string) => {
        if (!raw) return '';
        return raw
            // 1. Ensure headers have double newlines before them (Safeguard)
            .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')

            // 2. Convert text bullets (•) to markdown bullets (-)
            .replace(/^•\s/gm, '- ')
            .replace(/\n•\s/g, '\n- ')

            // 3. Ensure lists have double newlines before them if previous line is text
            .replace(/([^\n])\n(- \w)/g, '$1\n\n$2')

            // 4. Fix bold spacing
            .replace(/\*\*\s+([^*]+?)\s+\*\*/g, '**$1**');
    };

    // Message component with enterprise features
    const MessageComponent = ({ message, index }: { message: Message; index: number }) => {
        const isUser = message.role === 'user';
        const isSystem = message.isSystem;
        const isError = message.isError;

        // Process content just before rendering
        const processedContent = processContent(message.content);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
                <div className={`max-w-[80%] group relative ${isUser ? 'order-2' : 'order-1'
                    }`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${isUser
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : isSystem
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800 border border-purple-200'
                            : isError
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-white text-gray-800 border border-gray-200 shadow-md'
                        }`}>
                        {message.isIntermediate ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Sedang mengetik...</span>
                            </div>
                        ) : (
                            <div>
                                <div className="text-sm leading-relaxed text-gray-800">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={MarkdownComponents}
                                    >
                                        {processedContent}
                                    </ReactMarkdown>
                                </div>
                                {message.responseTime && (
                                    <div className="mt-2 text-xs opacity-70">
                                        Response time: {message.responseTime}ms
                                        {message.confidence && ` • Confidence: ${(message.confidence * 100).toFixed(1)}%`}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Message actions */}
                    {!isUser && !message.isIntermediate && (
                        <div className="absolute -bottom-2 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-1 bg-white rounded-full shadow-lg border p-1">
                                <button
                                    onClick={() => handleCopyMessage(message)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Copy message"
                                >
                                    <Copy className="w-3 h-3 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => handleRegenerate(message.messageId!)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Regenerate response"
                                >
                                    <RefreshCw className="w-3 h-3 text-gray-600" />
                                </button>
                                <button
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Like"
                                >
                                    <ThumbsUp className="w-3 h-3 text-gray-600" />
                                </button>
                                <button
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Dislike"
                                >
                                    <ThumbsDown className="w-3 h-3 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Timestamp */}
                    {message.timestamp && (
                        <div className="text-xs text-gray-400 mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    // Award-winning UI design
    return (
        <>
            {/* Floating action button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
            >
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90 }}
                                animate={{ rotate: 0 }}
                                exit={{ rotate: 90 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="w-6 h-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ rotate: 90 }}
                                animate={{ rotate: 0 }}
                                exit={{ rotate: -90 }}
                                transition={{ duration: 0.2 }}
                                className="relative"
                            >
                                <Bot className="w-6 h-6" />
                                <motion.div
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </motion.div>

            {/* Chat sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-24 right-6 z-50"
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={`bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col ${isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
                            } transition-all duration-300`}>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                                        >
                                            <Bot className="w-8 h-8" />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Tamuu AI Assistant</h3>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-xs opacity-90">Online</span>
                                                {(user?.tier as any) === 'premium' && <Crown className="w-4 h-4 text-yellow-300" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setShowSettings(!showSettings)}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                            title="Settings"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setIsMinimized(!isMinimized)}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                            title={isMinimized ? 'Maximize' : 'Minimize'}
                                        >
                                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                            title="Close"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Settings Panel */}
                            {showSettings && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-gray-50 p-4 border-b border-gray-200"
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">AI Personality</label>
                                            <div className="flex space-x-2">
                                                {(['professional', 'friendly', 'casual'] as const).map(personality => (
                                                    <button
                                                        key={personality}
                                                        onClick={() => setAiPersonality(personality)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${aiPersonality === personality
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                            }`}
                                                    >
                                                        {personality.charAt(0).toUpperCase() + personality.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Response Speed</label>
                                            <div className="flex space-x-2">
                                                {(['instant', 'normal', 'thoughtful'] as const).map(speed => (
                                                    <button
                                                        key={speed}
                                                        onClick={() => setResponseSpeed(speed)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${responseSpeed === speed
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                            }`}
                                                    >
                                                        {speed.charAt(0).toUpperCase() + speed.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Sound Notifications</span>
                                            <button
                                                onClick={() => setIsMuted(!isMuted)}
                                                className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                    }`}
                                            >
                                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Messages */}
                            {!isMinimized && (
                                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                                    <AnimatePresence>
                                        {messages.map((message, index) => (
                                            <MessageComponent key={message.messageId} message={message} index={index} />
                                        ))}
                                    </AnimatePresence>

                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl">
                                                <div className="flex items-center space-x-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span className="text-sm">AI sedang berpikir...</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Quick Actions */}
                            {!isMinimized && (
                                <div className="p-4 border-t border-gray-200">
                                    <div className="flex space-x-2 mb-3">
                                        {quickActions.map((action, index) => (
                                            <motion.button
                                                key={action.label}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={action.action}
                                                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium transition-colors"
                                            >
                                                <action.icon className="w-3 h-3" />
                                                <span>{action.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>

                                    {/* Input */}
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 relative">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                                placeholder="Tulis pesan untuk CTO Tamuu... (Sapa 'Halo' untuk mulai)"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                disabled={isLoading}
                                            />
                                            {(user?.tier as any) === 'premium' && (
                                                <Crown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-yellow-500" />
                                            )}
                                        </div>
                                        <motion.button
                                            onClick={() => handleSend()}
                                            disabled={isLoading || !input.trim()}
                                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};