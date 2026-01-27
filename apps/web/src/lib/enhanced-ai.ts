/**
 * Enhanced AI Service v8.0
 * Enterprise-grade AI integration with intelligent error handling and UI improvements
 */

import { users } from './api';

export interface AIResponse {
    content: string;
    provider: string;
    metadata?: {
        responseTime: number;
        contextUsed: boolean;
        toolsExecuted: number;
        persona?: string;
        intent?: string;
        confidence?: number;
    };
    error?: string;
    fallback?: boolean;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    isIntermediate?: boolean;
    timestamp?: number;
    metadata?: AIResponse['metadata'];
}

export class EnhancedAIService {
    private static instance: EnhancedAIService;
    private messageHistory: Message[] = [];
    private maxHistoryLength = 20;
    private performanceMetrics = {
        totalRequests: 0,
        successfulResponses: 0,
        averageResponseTime: 0,
        errorRate: 0
    };

    static getInstance(): EnhancedAIService {
        if (!EnhancedAIService.instance) {
            EnhancedAIService.instance = new EnhancedAIService();
        }
        return EnhancedAIService.instance;
    }

    /**
     * Enhanced AI chat with intelligent error handling and performance monitoring
     */
    async sendMessage(content: string, userId?: string, token?: string): Promise<AIResponse> {
        const startTime = Date.now();
        
        try {
            // Add user message to history
            const userMessage: Message = {
                role: 'user',
                content,
                timestamp: Date.now()
            };
            this.addToHistory(userMessage);

            // Prepare messages for AI
            const messages = this.messageHistory.filter(m => !m.isIntermediate);
            
            // Call enhanced AI API
            const response = await users.askAI(messages, userId, token);
            
            const responseTime = Date.now() - startTime;
            
            // Update performance metrics
            this.updateMetrics(responseTime, true);
            
            // Add AI response to history
            const aiMessage: Message = {
                role: 'assistant',
                content: response.content,
                timestamp: Date.now(),
                metadata: response.metadata
            };
            this.addToHistory(aiMessage);
            
            return {
                ...response,
                metadata: {
                    ...response.metadata,
                    responseTime
                }
            };
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, false);
            
            // Intelligent error handling
            const errorResponse = this.handleAIError(error);
            
            // Add error response to history
            const errorMessage: Message = {
                role: 'assistant',
                content: errorResponse.content,
                timestamp: Date.now(),
                metadata: {
                    responseTime,
                    contextUsed: false,
                    toolsExecuted: 0,
                    error: errorResponse.error
                }
            };
            this.addToHistory(errorMessage);
            
            return errorResponse;
        }
    }

    /**
     * Intelligent error handling with user-friendly messages
     */
    private handleAIError(error: any): AIResponse {
        const errorMessage = error.message?.toLowerCase() || '';
        
        // Rate limiting
        if (errorMessage.includes('quota') || errorMessage.includes('rate')) {
            return {
                content: "Maaf Kak, sistem AI sedang sangat ramai. Mohon tunggu sebentar dan coba lagi ya. Saya akan terus membantu Anda! 🙏",
                provider: 'error-handler',
                error: 'RATE_LIMIT_EXCEEDED',
                fallback: true
            };
        }
        
        // Service unavailable
        if (errorMessage.includes('unavailable') || errorMessage.includes('timeout')) {
            return {
                content: "Sistem sedang dalam pemeliharaan. Tim teknis kami sedang menyelesaikan masalah ini. Mohon coba beberapa saat lagi.",
                provider: 'error-handler',
                error: 'SERVICE_UNAVAILABLE',
                fallback: true
            };
        }
        
        // Authentication issues
        if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
            return {
                content: "Terjadi masalah autentikasi. Mohon logout dan login kembali untuk melanjutkan percakapan.",
                provider: 'error-handler',
                error: 'AUTHENTICATION_ERROR',
                fallback: true
            };
        }
        
        // Network issues
        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
            return {
                content: "Koneksi sedang tidak stabil. Mohon periksa koneksi internet Anda dan coba lagi.",
                provider: 'error-handler',
                error: 'NETWORK_ERROR',
                fallback: true
            };
        }
        
        // Generic fallback
        return {
            content: "Maaf Kak, terjadi sedikit kendala. Tim kami telah diberitahu dan sedang menyelesaikannya. Mohon coba lagi dalam beberapa saat.",
            provider: 'error-handler',
            error: 'GENERIC_ERROR',
            fallback: true
        };
    }

    /**
     * Get conversation history
     */
    getHistory(): Message[] {
        return [...this.messageHistory];
    }

    /**
     * Clear conversation history
     */
    clearHistory(): void {
        this.messageHistory = [];
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return { ...this.performanceMetrics };
    }

    /**
     * Analyze conversation sentiment
     */
    analyzeSentiment(): {
        overallSentiment: 'positive' | 'neutral' | 'negative';
        userSatisfaction: number;
        frustrationIndicators: string[];
    } {
        const recentMessages = this.messageHistory.slice(-10);
        
        let positiveCount = 0;
        let negativeCount = 0;
        const frustrationIndicators = [];
        
        recentMessages.forEach(msg => {
            const content = msg.content.toLowerCase();
            
            // Positive indicators
            if (content.includes('terima kasih') || content.includes('mantap') || content.includes('bagus')) {
                positiveCount++;
            }
            
            // Negative indicators
            if (content.includes('error') || content.includes('gagal') || content.includes('masalah')) {
                negativeCount++;
            }
            
            // Frustration indicators
            if (content.includes('tidak bisa') || content.includes('sulit') || content.includes('bingung')) {
                frustrationIndicators.push(content);
            }
        });
        
        const total = positiveCount + negativeCount;
        const userSatisfaction = total > 0 ? (positiveCount / total) * 100 : 50;
        
        let overallSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
        if (positiveCount > negativeCount) overallSentiment = 'positive';
        else if (negativeCount > positiveCount) overallSentiment = 'negative';
        
        return {
            overallSentiment,
            userSatisfaction,
            frustrationIndicators
        };
    }

    /**
     * Get intelligent suggestions based on conversation context
     */
    getSuggestions(): string[] {
        const recentMessages = this.messageHistory.slice(-5);
        const suggestions = new Set<string>();
        
        recentMessages.forEach(msg => {
            const content = msg.content.toLowerCase();
            
            // Payment-related suggestions
            if (content.includes('bayar') || content.includes('payment')) {
                suggestions.add('Cek status pembayaran');
                suggestions.add('Lihat riwayat transaksi');
            }
            
            // Invitation-related suggestions
            if (content.includes('undangan') || content.includes('link')) {
                suggestions.add('Cek status undangan');
                suggestions.add('Bagikan undangan');
            }
            
            // Account-related suggestions
            if (content.includes('akun') || content.includes('profil')) {
                suggestions.add('Lihat informasi akun');
                suggestions.add('Update profil');
            }
            
            // Technical issues
            if (content.includes('error') || content.includes('gagal')) {
                suggestions.add('Laporkan masalah teknis');
                suggestions.add('Cek status sistem');
            }
        });
        
        return Array.from(suggestions).slice(0, 3);
    }

    /**
     * Private methods
     */
    private addToHistory(message: Message): void {
        this.messageHistory.push(message);
        
        // Keep history size manageable
        if (this.messageHistory.length > this.maxHistoryLength) {
            this.messageHistory = this.messageHistory.slice(-this.maxHistoryLength);
        }
    }

    private updateMetrics(responseTime: number, success: boolean): void {
        this.performanceMetrics.totalRequests++;
        
        if (success) {
            this.performanceMetrics.successfulResponses++;
        }
        
        // Update average response time (moving average)
        const currentAvg = this.performanceMetrics.averageResponseTime;
        const totalRequests = this.performanceMetrics.totalRequests;
        this.performanceMetrics.averageResponseTime = 
            (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;
        
        // Update error rate
        this.performanceMetrics.errorRate = 
            (this.performanceMetrics.totalRequests - this.performanceMetrics.successfulResponses) / 
            this.performanceMetrics.totalRequests;
    }
}

/**
 * Enhanced message formatter with intelligent response processing
 */
export class MessageFormatter {
    /**
     * Format AI response for display
     */
    static formatResponse(response: AIResponse): string {
        let content = response.content;
        
        // Add performance indicator for fast responses
        if (response.metadata?.responseTime < 2000) {
            content = `⚡ ${content}`;
        }
        
        // Add context indicator
        if (response.metadata?.contextUsed) {
            content = `🎯 ${content}`;
        }
        
        // Add tool usage indicator
        if (response.metadata?.toolsExecuted && response.metadata.toolsExecuted > 0) {
            content = `🔧 ${content}`;
        }
        
        return content;
    }

    /**
     * Format message with metadata
     */
    static formatMessage(message: Message): string {
        if (message.isIntermediate) {
            return `⏳ ${message.content}`;
        }
        
        if (message.metadata?.error) {
            return `❌ ${message.content}`;
        }
        
        if (message.metadata?.fallback) {
            return `🔄 ${message.content}`;
        }
        
        return message.content;
    }

    /**
     * Generate typing indicator based on context
     */
    static getTypingIndicator(context?: AIResponse['metadata']): string {
        const indicators = [
            "Sedang memikirkan...",
            "Menganalisis permintaan Anda...",
            "Memeriksa data Anda...",
            "Menyiapkan jawaban terbaik..."
        ];
        
        if (context?.toolsExecuted && context.toolsExecuted > 0) {
            return "Mengeksekusi alat bantu...";
        }
        
        if (context?.contextUsed) {
            return "Menganalisis konteks akun Anda...";
        }
        
        return indicators[Math.floor(Math.random() * indicators.length)];
    }
}

/**
 * AI Performance Monitor
 */
export class AIPerformanceMonitor {
    private static metrics: {
        timestamp: number;
        responseTime: number;
        success: boolean;
        error?: string;
    }[] = [];

    static recordMetric(responseTime: number, success: boolean, error?: string): void {
        this.metrics.push({
            timestamp: Date.now(),
            responseTime,
            success,
            error
        });
        
        // Keep only last 100 metrics
        if (this.metrics.length > 100) {
            this.metrics = this.metrics.slice(-100);
        }
    }

    static getPerformanceReport(): {
        averageResponseTime: number;
        successRate: number;
        totalRequests: number;
        errorRate: number;
        recentErrors: string[];
    } {
        const recentMetrics = this.metrics.slice(-50);
        
        const totalRequests = recentMetrics.length;
        const successfulRequests = recentMetrics.filter(m => m.success).length;
        const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
        
        const recentErrors = recentMetrics
            .filter(m => !m.success && m.error)
            .map(m => m.error!)
            .slice(-5);
        
        return {
            averageResponseTime,
            successRate: successfulRequests / totalRequests,
            totalRequests,
            errorRate: (totalRequests - successfulRequests) / totalRequests,
            recentErrors
        };
    }

    static clearMetrics(): void {
        this.metrics = [];
    }
}

export default EnhancedAIService;