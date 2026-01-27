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
    HelpCircle,
    Brain,
    Zap,
    AlertTriangle
} from 'lucide-react';
import { users } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { PremiumLoader } from '../ui/PremiumLoader';
import EnhancedAIService, { MessageFormatter, AIPerformanceMonitor } from '../../lib/enhanced-ai';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isIntermediate?: boolean;
    timestamp?: number;
    metadata?: {
        responseTime?: number;
        contextUsed?: boolean;
        toolsExecuted?: number;
        error?: string;
        fallback?: boolean;
    };
}

export const UserChatSidebar: React.FC = () => {
    const { user, token } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const aiService = EnhancedAIService.getInstance();

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Update performance metrics
    useEffect(() => {
        const interval = setInterval(() => {
            setPerformanceMetrics(AIPerformanceMonitor.getPerformanceReport());
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    const handleSend = async (forcedInput?: string) => {
        const messageText = forcedInput || input;
        if (!messageText.trim() || isLoading) return;

        const isSilentDiagnostic = forcedInput?.includes("audit diagnostik");

        // Only show user message if not a silent diagnostic
        if (!isSilentDiagnostic) {
            const userMsg: Message = { 
                role: 'user', 
                content: messageText,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, userMsg]);
        }

        setInput('');
        setIsLoading(true);
        setShowSuggestions(false);

        // Enhanced acknowledgment message with intelligence indicators
        if (!isSilentDiagnostic) {
            const ackMsg: Message = {
                role: 'assistant',
                content: MessageFormatter.getTypingIndicator(),
                isIntermediate: true,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, ackMsg]);
        }

        try {
            // Use enhanced AI service
            const response = await aiService.sendMessage(messageText, user?.id, token || undefined);
            
            // Remove intermediate message
            setMessages(prev => prev.filter(m => !m.isIntermediate));
            
            // Add AI response with enhanced formatting
            const aiMsg: Message = {
                role: 'assistant',
                content: MessageFormatter.formatResponse(response),
                timestamp: Date.now(),
                metadata: response.metadata
            };
            setMessages(prev => [...prev, aiMsg]);
            
            // Record performance metric
            AIPerformanceMonitor.recordMetric(
                response.metadata?.responseTime || 0,
                !response.error,
                response.error
            );
            
        } catch (err: any) {
            // Remove intermediate message
            setMessages(prev => prev.filter(m => !m.isIntermediate));
            
            // Enhanced error handling
            const errorResponse = aiService.handleAIError(err);
            const errorMsg: Message = {
                role: 'assistant',
                content: errorResponse.content,
                timestamp: Date.now(),
                metadata: { error: errorResponse.error, fallback: true }
            };
            setMessages(prev => [...prev, errorMsg]);
            
            console.error('[Enhanced AI Chat] Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        const quickActions = {
            'payment': 'Cek status pembayaran saya',
            'invitations': 'Lihat undangan saya',
            'account': 'Cek status akun saya',
            'help': 'Bantu saya membuat undangan'
        };
        
        handleSend(quickActions[action as keyof typeof quickActions]);
    };

    const getSuggestions = () => {
        return aiService.getSuggestions();
    };

    const analyzeSentiment = () => {
        return aiService.analyzeSentiment();
    };

    const clearChat = () => {
        aiService.clearHistory();
        setMessages([]);
        setShowSuggestions(true);
    };

    const quickActions = [
        { key: 'payment', label: 'Cek Pembayaran', icon: '💳' },
        { key: 'invitations', label: 'Undangan Saya', icon: '📧' },
        { key: 'account', label: 'Status Akun', icon: '👤' },
        { key: 'help', label: 'Bantuan', icon: '❓' }
    ];

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-full shadow-2xl z-50 hover:shadow-pink-500/25 transition-all duration-300"
            >
                <MessageCircle className="w-6 h-6" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />

                        {/* Chat Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <Sparkles className="w-8 h-8" />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Tamuu AI Assistant</h3>
                                            <p className="text-sm opacity-90">{isLoading ? 'Mengetik...' : 'Online'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                {/* Performance Metrics */}
                                {performanceMetrics && (
                                    <div className="mt-3 flex items-center space-x-4 text-xs opacity-80">
                                        <div className="flex items-center space-x-1">
                                            <Zap className="w-3 h-3" />
                                            <span>{Math.round(performanceMetrics.averageResponseTime)}ms</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Brain className="w-3 h-3" />
                                            <span>{Math.round(performanceMetrics.successRate * 100)}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center py-8">
                                        <Sparkles className="w-16 h-16 mx-auto text-pink-500 mb-4" />
                                        <h4 className="font-semibold text-gray-800 mb-2">Halo Kak {user?.name || ''}! 👋</h4>
                                        <p className="text-gray-600 text-sm mb-6">
                                            Saya AI Assistant dari Tamuu, siap membantu Anda 24/7. 
                                            Tanya apa saja tentang undangan, pembayaran, atau bantuan teknis.
                                        </p>
                                        
                                        {/* Sentiment Analysis */}
                                        {messages.length > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Brain className="w-4 h-4" />
                                                    <span>Analisis Percakapan:</span>
                                                </div>
                                                <div className="text-left">
                                                    {Object.entries(analyzeSentiment()).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span>{key}:</span>
                                                            <span className="font-medium">{typeof value === 'number' ? `${Math.round(value)}%` : value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {messages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            message.role === 'user' 
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                                                : 'bg-gray-100 text-gray-800'
                                        } ${message.isIntermediate ? 'opacity-70' : ''}`}>
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            
                                            {/* Metadata indicators */}
                                            {message.metadata && (
                                                <div className="mt-1 flex items-center space-x-2 text-xs opacity-70">
                                                    {message.metadata.contextUsed && <span title="Context-aware response">🎯</span>}
                                                    {message.metadata.toolsExecuted && message.metadata.toolsExecuted > 0 && (
                                                        <span title={`${message.metadata.toolsExecuted} tools executed`}>🔧</span>
                                                    )}
                                                    {message.metadata.fallback && <span title="Fallback response">🔄</span>}
                                                    {message.metadata.responseTime && (
                                                        <span title="Response time">{message.metadata.responseTime}ms</span>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {message.timestamp && (
                                                <div className="mt-1 text-xs opacity-50">
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                                            <PremiumLoader size="sm" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            {showSuggestions && (
                                <div className="px-6 pb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {quickActions.map((action) => (
                                            <button
                                                key={action.key}
                                                onClick={() => handleQuickAction(action.key)}
                                                disabled={isLoading}
                                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                <span className="mr-1">{action.icon}</span>
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Intelligent Suggestions */}
                                    {messages.length > 0 && (
                                        <div className="mt-3">
                                            <div className="text-xs text-gray-500 mb-2 flex items-center">
                                                <Brain className="w-3 h-3 mr-1" />
                                                Saran Cerdas:
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {getSuggestions().map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSend(suggestion)}
                                                        className="px-2 py-1 bg-pink-50 text-pink-600 rounded text-xs hover:bg-pink-100 transition-colors"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="border-t p-6">
                                <div className="flex items-end space-x-3">
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                            placeholder="Tanya tentang undangan, pembayaran, atau bantuan..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                            rows={1}
                                            disabled={isLoading}
                                        />
                                        
                                        {/* AI Intelligence Indicator */}
                                        <div className="absolute right-2 top-2 flex items-center space-x-1 text-xs text-gray-400">
                                            <Brain className="w-3 h-3" />
                                            <span>AI v8.0</span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim() || isLoading}
                                        className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={clearChat}
                                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                                        >
                                            <X className="w-3 h-3" />
                                            <span>Bersihkan chat</span>
                                        </button>
                                        
                                        {performanceMetrics?.errorRate > 0.1 && (
                                            <div className="flex items-center space-x-1 text-xs text-orange-600">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>Koneksi tidak stabil</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="text-xs text-gray-400">
                                        Tekan Enter untuk kirim
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default UserChatSidebar;