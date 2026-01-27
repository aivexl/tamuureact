import { supabase } from './supabase';

// Enhanced API library for Tamuu AI v8.0 Enterprise
export interface AIResponse {
    content: string;
    metadata: {
        provider: string;
        intent?: string;
        confidence?: number;
        responseTime?: number;
        fallback?: boolean;
        error?: string;
    };
}

export interface AIContext {
    userId?: string;
    userProfile?: any;
    sessionId?: string;
    userTier?: string;
    personality?: 'professional' | 'friendly' | 'casual';
    responseSpeed?: 'instant' | 'normal' | 'thoughtful';
    isSilentDiagnostic?: boolean;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
    metadata?: any;
}

// Enterprise-grade API client with world-class standards
export const enhancedAPI = {
    // Enhanced AI chat with enterprise features
    async chatWithAIEnhanced(params: {
        messages: ChatMessage[];
        context: AIContext;
    }): Promise<AIResponse> {
        try {
            const response = await fetch('/api/enhanced-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Version': '8.0',
                    'X-Client-ID': params.context.userId || 'anonymous',
                    'X-Session-ID': params.context.sessionId || 'default',
                    'X-User-Tier': params.context.userTier || 'free',
                },
                body: JSON.stringify({
                    messages: params.messages,
                    context: params.context,
                    timestamp: new Date().toISOString(),
                    clientInfo: {
                        userAgent: navigator.userAgent,
                        screenResolution: `${window.screen.width}x${window.screen.height}`,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        language: navigator.language,
                        platform: navigator.platform,
                        connection: (navigator as any).connection?.effectiveType || 'unknown'
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add performance tracking
            if (data.metadata) {
                data.metadata.responseTime = Date.now() - performance.now();
                data.metadata.clientTimestamp = new Date().toISOString();
            }

            return data;
        } catch (error) {
            console.error('Enhanced AI chat error:', error);
            
            // Fallback response with Indonesian language
            return {
                content: 'Maaf Kak, saya sedang mengalami kendala teknis. Tim kami sedang menyelesaikan masalah ini. Mohon coba lagi dalam beberapa saat. 🙏',
                metadata: {
                    provider: 'fallback',
                    error: 'NETWORK_ERROR',
                    fallback: true,
                    responseTime: 0
                }
            };
        }
    },

    // Get AI suggestions for content
    async getAISuggestions(params: {
        type: 'invitation' | 'message' | 'design' | 'music';
        context: string;
        userTier?: string;
        preferences?: any;
    }) {
        try {
            const response = await fetch('/api/ai-suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Version': '8.0',
                    'X-User-Tier': params.userTier || 'free',
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('AI suggestions error:', error);
            return { suggestions: [], error: 'Failed to get suggestions' };
        }
    },

    // Analyze user behavior for personalization
    async analyzeUserBehavior(userId: string) {
        try {
            const response = await fetch(`/api/user-behavior/${userId}`, {
                method: 'GET',
                headers: {
                    'X-API-Version': '8.0',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('User behavior analysis error:', error);
            return { insights: {}, error: 'Failed to analyze user behavior' };
        }
    },

    // Get system health status
    async getSystemHealth() {
        try {
            const response = await fetch('/api/system-health', {
                method: 'GET',
                headers: {
                    'X-API-Version': '8.0',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('System health check error:', error);
            return { status: 'unknown', uptime: 0, latency: 0, error: 'Failed to check system health' };
        }
    },

    // Track user interactions for analytics
    async trackInteraction(event: {
        type: string;
        userId?: string;
        sessionId?: string;
        metadata?: any;
        timestamp?: string;
    }) {
        try {
            const response = await fetch('/api/track-interaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Version': '8.0',
                },
                body: JSON.stringify({
                    ...event,
                    timestamp: event.timestamp || new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    screenResolution: `${window.screen.width}x${window.screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Interaction tracking error:', error);
            return { success: false, error: 'Failed to track interaction' };
        }
    }
};

// Backward compatibility - extend existing users object
export const users = {
    ...enhancedAPI,
    
    // Legacy chat method for backward compatibility
    async chatWithAI(messages: ChatMessage[], context?: AIContext): Promise<AIResponse> {
        return enhancedAPI.chatWithAIEnhanced({ messages, context: context || {} });
    }
};

export default users;