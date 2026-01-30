/**
 * Admin Chat Integration Layer
 * Connects Admin Chat Components with TamuuAIEngine v8.0
 * Enterprise-grade with security, monitoring, and fallback systems
 */

import { TamuuAIEngine } from './ai-system-v8-enhanced.js';
import { InputSanitizer } from './security-utils.js';

/**
 * Admin Chat Handler - Enterprise Grade
 * Handles AI-powered conversations for admin users with enhanced security
 */
export class AdminChatHandler {
    constructor(env) {
        this.env = env;
        this.aiEngine = new TamuuAIEngine(env);
        this.sessionCache = new Map();
        this.rateLimiter = new Map();
        
        // Enterprise configuration
        this.config = {
            maxRequestsPerMinute: 60,
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            maxMessageLength: 4000,
            enableAnalytics: true,
            enableFallback: true,
            logLevel: env.LOG_LEVEL || 'info'
        };
    }

    /**
     * Process admin chat message with enterprise security
     */
    async processAdminMessage(userId, message, context = {}) {
        try {
            // Security validation
            if (!this.validateInput(userId, message)) {
                return this.createErrorResponse('INVALID_INPUT', 'Input tidak valid');
            }

            // Rate limiting
            if (!this.checkRateLimit(userId)) {
                return this.createErrorResponse('RATE_LIMITED', 'Terlalu banyak permintaan. Mohon tunggu sebentar.');
            }

            // Session management
            const sessionId = this.getOrCreateSession(userId);
            const session = this.getSession(sessionId);

            // Context enrichment
            const enrichedContext = await this.enrichContext(userId, context);
            
            // AI Processing with TamuuAIEngine
            const aiResponse = await this.aiEngine.buildEnhancedContext(
                userId, 
                [...session.messages, { role: 'user', content: message }], 
                this.env
            );

            // Update session
            session.messages.push({ role: 'user', content: message });
            session.messages.push({ role: 'assistant', content: aiResponse.content });
            session.lastActivity = Date.now();

            // Analytics logging
            if (this.config.enableAnalytics) {
                this.logAnalytics(userId, 'admin_chat', {
                    messageLength: message.length,
                    responseLength: aiResponse.content.length,
                    intent: aiResponse.intent,
                    personality: enrichedContext.aiPersonality
                });
            }

            return {
                success: true,
                response: aiResponse.content,
                sessionId: sessionId,
                metadata: {
                    intent: aiResponse.intent,
                    personality: enrichedContext.aiPersonality,
                    confidence: aiResponse.confidence,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('Admin Chat Error:', error);
            
            // Fallback response
            if (this.config.enableFallback) {
                return this.createFallbackResponse(error);
            }
            
            return this.createErrorResponse('INTERNAL_ERROR', 'Terjadi kesalahan internal');
        }
    }

    /**
     * Validate input with enterprise security standards (Standardized)
     */
    validateInput(userId, message) {
        // Use central InputSanitizer
        const userCheck = InputSanitizer.sanitizeUserId(userId);
        if (!userCheck.isSafe) return false;

        const messageCheck = InputSanitizer.sanitizeChatMessage(message);
        if (!messageCheck.isSafe) return false;

        // Additional length check from config
        if (message.length > this.config.maxMessageLength) return false;

        return true;
    }

    /**
     * Rate limiting untuk enterprise security
     */
    checkRateLimit(userId) {
        const now = Date.now();
        const windowStart = now - 60000; // 1 minute window
        
        if (!this.rateLimiter.has(userId)) {
            this.rateLimiter.set(userId, []);
        }

        const requests = this.rateLimiter.get(userId);
        
        // Clean old requests
        const validRequests = requests.filter(time => time > windowStart);
        
        if (validRequests.length >= this.config.maxRequestsPerMinute) {
            return false;
        }

        validRequests.push(now);
        this.rateLimiter.set(userId, validRequests);
        
        return true;
    }

    /**
     * Session management untuk admin chat
     */
    getOrCreateSession(userId) {
        const sessionId = `admin_${userId}`;
        
        if (!this.sessionCache.has(sessionId)) {
            this.sessionCache.set(sessionId, {
                userId: userId,
                messages: [],
                context: {},
                createdAt: Date.now(),
                lastActivity: Date.now()
            });
        }

        return sessionId;
    }

    getSession(sessionId) {
        const session = this.sessionCache.get(sessionId);
        
        if (!session) {
            return null;
        }

        // Check timeout
        if (Date.now() - session.lastActivity > this.config.sessionTimeout) {
            this.sessionCache.delete(sessionId);
            return null;
        }

        return session;
    }

    /**
     * Enrich context dengan admin-specific data
     */
    async enrichContext(userId, context) {
        const enriched = { ...context };
        
        // Add admin-specific context
        enriched.userRole = 'admin';
        enriched.permissions = ['admin_chat', 'analytics_access', 'system_config'];
        enriched.timestamp = new Date().toISOString();
        
        // AI Personality from admin preferences
        enriched.aiPersonality = context.aiPersonality || 'professional';
        enriched.enableQuickActions = context.enableQuickActions !== false;
        enriched.enableSettings = context.enableSettings !== false;
        
        return enriched;
    }

    /**
     * Create error response dengan Indonesian language support
     */
    createErrorResponse(errorCode, message) {
        return {
            success: false,
            error: {
                code: errorCode,
                message: message,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Create fallback response untuk error handling
     */
    createFallbackResponse(error) {
        const errorMessage = error.message?.toLowerCase() || '';
        
        // Database errors
        if (errorMessage.includes('database') || errorMessage.includes('sql')) {
            return {
                success: false,
                fallback: true,
                response: "Maaf Kak, ada gangguan di database kami. Tim teknis sedang memperbaikinya. Mohon coba lagi dalam 5-10 menit.",
                error: 'DATABASE_ERROR'
            };
        }

        // API errors
        if (errorMessage.includes('api') || errorMessage.includes('external')) {
            return {
                success: false,
                fallback: true,
                response: "Maaf Kak, layanan pihak ketiga sedang mengalami masalah. Kami sedang menyelesaikannya. Silakan coba lagi nanti.",
                error: 'API_ERROR'
            };
        }

        // Generic fallback
        return {
            success: false,
            fallback: true,
            response: "Maaf Kak, terjadi sedikit kendala teknis. Tim kami telah diberitahu dan sedang menyelesaikannya. Mohon coba lagi dalam beberapa saat.",
            error: 'GENERIC_ERROR'
        };
    }

    /**
     * Analytics logging untuk enterprise monitoring
     */
    logAnalytics(userId, eventType, data) {
        const analyticsData = {
            userId,
            eventType,
            timestamp: new Date().toISOString(),
            data,
            sessionId: `admin_${userId}`
        };

        // Log to console (in production, this would go to analytics service)
        if (this.config.logLevel === 'debug') {
            console.log('📊 Analytics:', JSON.stringify(analyticsData));
        }
    }

    /**
     * Health check untuk monitoring
     */
    async healthCheck() {
        try {
            // Test AI Engine connection
            await this.aiEngine.buildEnhancedContext('health_check', [], this.env);
            
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    aiEngine: 'connected',
                    sessionCache: this.sessionCache.size,
                    rateLimiter: this.rateLimiter.size
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }
}

/**
 * Factory function untuk membuat AdminChatHandler instance
 */
export function createAdminChatHandler(env) {
    return new AdminChatHandler(env);
}

export default AdminChatHandler;