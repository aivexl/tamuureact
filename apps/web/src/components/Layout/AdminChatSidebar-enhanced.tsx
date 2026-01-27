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
    HelpCircle,
    Brain,
    Zap,
    AlertTriangle,
    Settings,
    BarChart3
} from 'lucide-react';
import { admin } from '../../lib/api';
import { PremiumLoader } from '../ui/PremiumLoader';
import EnhancedAIService, { MessageFormatter, AIPerformanceMonitor } from '../../lib/enhanced-ai';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: number;
    metadata?: {
        responseTime?: number;
        contextUsed?: boolean;
        toolsExecuted?: number;
        error?: string;
        fallback?: boolean;
    };
}

export const AdminChatSidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
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

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { 
            role: 'user', 
            content: input,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Enhanced acknowledgment message
        const ackMsg: Message = {
            role: 'assistant',
            content: MessageFormatter.getTypingIndicator(),
            isIntermediate: true,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, ackMsg]);

        try {
            // Use enhanced AI service
            const response = await aiService.sendMessage(input);
            
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
            
            console.error('[Enhanced Admin AI Chat] Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        const quickActions = {
            'analytics': 'Tampilkan analisis performa sistem',
            'users': 'Berikan statistik pengguna hari ini',
            'orders': 'Tampilkan ringkasan pesanan',
            'system': 'Cek status sistem dan kesehatan'
        };
        
        handleSend(quickActions[action as keyof typeof quickActions]);
    };

    const clearChat = () => {
        aiService.clearHistory();
        setMessages([]);
    };

    const quickActions = [
        { key: 'analytics', label: 'Analytics', icon: '📊' },
        { key: 'users', label: 'Users', icon: '👥' },
        { key: 'orders', label: 'Orders', icon: '📦' },
        { key: 'system', label: 'System', icon: '⚙️' }
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
                className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl z-50 hover:shadow-blue-500/25 transition-all duration-300"
            >
                <MessageSquare className="w-6 h-6" />
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
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <Bot className="w-8 h-8" />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">Tamuu Admin AI</h3>
                                            <p className="text-sm opacity-90">{isLoading ? 'Processing...' : 'Ready'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setShowAnalytics(!showAnalytics)}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                            title="Toggle Analytics"
                                        >
                                            <BarChart3 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
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

                            {/* Analytics Panel */}
                            {showAnalytics && performanceMetrics && (
                                <div className="bg-blue-50 p-4 border-b">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-blue-900 flex items-center">
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            AI Performance Analytics
                                        </h4>
                                        <button
                                            onClick={() => setShowAnalytics(false)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-white p-3 rounded-lg">
                                            <div className="text-blue-600 font-medium">Success Rate</div>
                                            <div className="text-2xl font-bold text-blue-900">
                                                {Math.round(performanceMetrics.successRate * 100)}%
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg">
                                            <div className="text-blue-600 font-medium">Avg Response</div>
                                            <div className="text-2xl font-bold text-blue-900">
                                                {Math.round(performanceMetrics.averageResponseTime)}ms
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg">
                                            <div className="text-blue-600 font-medium">Total Requests</div>
                                            <div className="text-2xl font-bold text-blue-900">
                                                {performanceMetrics.totalRequests}
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg">
                                            <div className="text-blue-600 font-medium">Error Rate</div>
                                            <div className="text-2xl font-bold text-red-600">
                                                {Math.round(performanceMetrics.errorRate * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {performanceMetrics.recentErrors.length > 0 && (
                                        <div className="mt-3">
                                            <div className="text-red-600 font-medium text-sm mb-2">Recent Errors:</div>
                                            <div className="space-y-1">
                                                {performanceMetrics.recentErrors.map((error, index) => (
                                                    <div key={index} className="text-xs text-red-700 bg-red-50 p-2 rounded">
                                                        {error}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Chat Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center py-8">
                                        <Bot className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                                        <h4 className="font-semibold text-gray-800 mb-2">Admin AI Assistant</h4>
                                        <p className="text-gray-600 text-sm mb-6">
                                            Halo Admin! Saya siap membantu mengelola sistem, 
                                            menganalisis data, dan memberikan insight bisnis.
                                        </p>
                                        
                                        {/* Quick Actions */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {quickActions.map((action) => (
                                                <button
                                                    key={action.key}
                                                    onClick={() => handleQuickAction(action.key)}
                                                    className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    <div className="text-lg mb-1">{action.icon}</div>
                                                    <div>{action.label}</div>
                                                </button>
                                            ))}
                                        </div>
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
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                                                : 'bg-gray-100 text-gray-800'
                                        } ${message.metadata?.isIntermediate ? 'opacity-70' : ''}`}>
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
                                            placeholder="Ask about analytics, users, orders, or system status..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                                        className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                                            <span>Clear chat</span>
                                        </button>
                                        
                                        {performanceMetrics?.errorRate > 0.1 && (
                                            <div className="flex items-center space-x-1 text-xs text-orange-600">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span>High error rate detected</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="text-xs text-gray-400">
                                        Press Enter to send
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

export default AdminChatSidebar;