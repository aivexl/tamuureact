/**
 * Tamuu AI System v9.0 - Enterprise Agentic
 * Advanced Agentic architecture with native tool calling and proactive diagnostics.
 * Fully human-centric tone with Indonesian EYD standards.
 * 
 * ARCHITECTURE UPDATE
 * What: Upgrade to Agentic V9.0
 * Why: To provide proactive, precise, and professional human-like support.
 * Impact: Real-time autonomous problem solving using native Gemini Function Calling.
 * Features: Gemini API integration, Indonesian language optimization, enterprise security
 * 
 * SECURITY NOTES:
 * - NEVER expose API keys in code - use environment variables only
 * - All sensitive data must be stored in encrypted environment variables
 * - Implement proper input validation and sanitization
 * - Use secure communication protocols (HTTPS/WSS)
 * - Regular security audits and penetration testing required
 * - Follow OWASP security guidelines for enterprise applications
 */

import { v9Tools } from './v9-tools.js';

class TamuuAIEngine {
    constructor(env) {
        this.env = env;
        this.cache = new Map();
        this.sessionContext = new Map();
        this.performanceMetrics = {
            totalRequests: 0,
            successfulResponses: 0,
            averageResponseTime: 0,
            cacheHitRate: 0
        };

        // Gemini API configuration - SECURE: Only use env variable
        this.geminiApiKey = env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : null);
        this.geminiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
        this.systemPrompt = null; // Will be loaded lazily
    }

    /**
     * V9.0 Proactive Context Engine
     * Performs silent audits and prepares context before the user even speaks.
     */
    async buildEnhancedContext(userId, messages, env) {
        const startTime = Date.now();

        // 1. Silent Audit (Proactive Diagnostics)
        let auditFindings = null;
        if (userId) {
            try {
                auditFindings = await v9Tools.audit_account({ userId, env });
            } catch (auditError) {
                console.warn('[V9 Audit] Failed:', auditError);
            }
        }

        // 2. Behavioral & Profile (V9 Humanized)
        let userProfile = null;
        let behavioralInsights = { engagementLevel: 'new' };

        if (userId) {
            userProfile = await this.enrichUserProfile(userId, env);
            behavioralInsights = await this.analyzeUserBehavior(userId, env);

            // Inject audit findings into profile
            if (userProfile && auditFindings?.findings) {
                userProfile.audit = auditFindings;
                userProfile.healthScore = Math.max(0, 100 - (auditFindings.findings.length * 15));
            }
        }

        const context = {
            userProfile,
            behavioralInsights,
            auditFindings,
            timestamp: new Date().toISOString(),
            performance: {
                buildTime: Date.now() - startTime
            }
        };

        return context;
    }

    /**
     * User Profile Enrichment
     * Deep analysis of user data for personalized responses
     */
    async enrichUserProfile(userId, env) {
        try {
            // Multi-dimensional user data collection
            const [userData, transactions, invitations, analytics] = await Promise.all([
                env.DB.prepare(`
                    SELECT u.*, 
                           COUNT(DISTINCT i.id) as invitation_count,
                           COUNT(DISTINCT t.id) as transaction_count,
                           MAX(t.created_at) as last_transaction
                    FROM users u
                    LEFT JOIN invitations i ON u.id = i.user_id
                    LEFT JOIN billing_transactions t ON u.id = t.user_id
                    WHERE u.id = ? OR u.email = ?
                    GROUP BY u.id
                `).bind(userId, userId).first(),

                env.DB.prepare(`
                    SELECT * FROM billing_transactions 
                    WHERE user_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT 5
                `).bind(userId).all(),

                env.DB.prepare(`
                    SELECT i.*, 
                           COUNT(r.id) as rsvp_count,
                           COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) as confirmed_count
                    FROM invitations i
                    LEFT JOIN rsvp_responses r ON i.id = r.invitation_id
                    WHERE i.user_id = ?
                    GROUP BY i.id
                    ORDER BY i.created_at DESC
                    LIMIT 3
                `).bind(userId).all(),

                this.getUserAnalytics(userId, env)
            ]);

            if (!userData) return null;

            // Calculate user health score
            const healthScore = this.calculateUserHealth(userData, transactions.results, invitations.results);

            // Determine user persona
            const persona = this.determineUserPersona(userData, transactions.results, invitations.results);

            return {
                ...userData,
                transactions: transactions.results,
                invitations: invitations.results,
                analytics: analytics,
                healthScore,
                persona,
                riskLevel: this.assessUserRisk(userData, transactions.results)
            };
        } catch (error) {
            console.error('[AI Engine] Profile enrichment failed:', error);
            return null;
        }
    }

    /**
     * Behavioral Analytics Engine
     * Analyzes user interaction patterns for predictive responses
     */
    async analyzeUserBehavior(userId, env) {
        try {
            // Analyze interaction patterns
            const interactions = await env.DB.prepare(`
                SELECT created_at, status, amount, tier
                FROM billing_transactions
                WHERE user_id = ?
                ORDER BY created_at ASC
            `).bind(userId).all();

            const patterns = {
                purchaseBehavior: this.analyzePurchaseBehavior(interactions.results),
                engagementLevel: this.calculateEngagementLevel(userId, env),
                supportHistory: await this.getSupportHistory(userId, env),
                featureUsage: await this.analyzeFeatureUsage(userId, env)
            };

            return patterns;
        } catch (error) {
            console.error('[AI Engine] Behavioral analysis failed:', error);
            return {};
        }
    }

    /**
     * Predictive Intent Recognition - V9 Legacy Wrapper
     * (Retained for backward compatibility, but primarily handled by Native Tool Calling)
     */
    predictIntent(messages, sessionData) {
        // ... (existing logic is fine as a heuristic)
        return {
            primary: { name: 'general_inquiry', confidence: 1 },
            all: []
        };
    }

    /**
     * V9.0 Native Tool Definitions
     * Standard Gemini 2.0 Function Calling Schema
     */
    getEnhancedTools() {
        return [
            {
                name: "audit_account",
                description: "Melakukan audit mendalam terhadap status akun, langganan, dan transaksi pengguna secara proaktif.",
                parameters: {
                    type: "object",
                    properties: {
                        reason: { type: "string", description: "Alasan melakukan audit (misalnya: user bertanya tentang pembayaran)" }
                    }
                }
            },
            {
                name: "sync_payment",
                description: "Menyinkronkan status pembayaran yang tertunda dengan gateway pembayaran.",
                parameters: {
                    type: "object",
                    properties: {
                        transactionId: { type: "string", description: "ID Transaksi yang ingin disinkronkan" }
                    },
                    required: ["transactionId"]
                }
            },
            {
                name: "get_product_knowledge",
                description: "Mencari informasi produk, paket, dan solusi masalah dari basis pengetahuan resmi Tamuu.",
                parameters: {
                    type: "object",
                    properties: {
                        query: { type: "string", description: "Pertanyaan atau topik yang dicari" }
                    },
                    required: ["query"]
                }
            }
        ];
    }

    /**
     * Advanced Response Generator
     * Creates personalized, context-aware responses
     */
    generateEnhancedResponse(userMessage, context, toolResults = []) {
        const { userProfile, predictedIntent, behavioralInsights } = context;

        // Personalization based on user persona
        const persona = userProfile?.persona || 'standard';
        const tone = this.getToneForPersona(persona);

        // Intent-specific response generation
        let response = this.generateIntentBasedResponse(userMessage, predictedIntent, context);

        // Add behavioral insights
        if (behavioralInsights.engagementLevel === 'high') {
            response += this.generateEngagementBoosters(context);
        }

        // Include tool results if available
        if (toolResults.length > 0) {
            response += this.formatToolResults(toolResults, context);
        }

        // Add proactive suggestions
        response += this.generateProactiveSuggestions(context);

        return {
            content: response,
            metadata: {
                persona,
                intent: predictedIntent.primary.name,
                confidence: predictedIntent.primary.confidence,
                toolsUsed: toolResults.length,
                responseTime: Date.now()
            }
        };
    }

    /**
     * Performance Monitoring
     * Real-time performance tracking and optimization
     */
    trackPerformance(metric, value) {
        this.performanceMetrics[metric] = value;

        // Alert on performance degradation
        if (metric === 'averageResponseTime' && value > 5000) {
            console.warn(`[AI Engine] Performance degradation detected: ${value}ms response time`);
        }

        if (metric === 'cacheHitRate' && value < 0.3) {
            console.warn(`[AI Engine] Low cache hit rate: ${(value * 100).toFixed(1)}%`);
        }
    }

    // Helper methods
    generateSessionId(userId) {
        return `session_${userId}_${Date.now()}`;
    }

    calculateUserHealth(userData, transactions, invitations) {
        let score = 100;

        // Deduct points for expired subscriptions
        if (userData.expires_at && new Date(userData.expires_at) < new Date()) {
            score -= 30;
        }

        // Add points for active usage
        if (invitations.length > 0) score += 20;
        if (transactions.length > 0) score += 15;

        return Math.max(0, Math.min(100, score));
    }

    determineUserPersona(userData, transactions, invitations) {
        if (transactions.length > 3) return 'power_user';
        if (invitations.length > 1) return 'active_creator';
        if (userData.tier && userData.tier !== 'free') return 'premium_user';
        return 'new_user';
    }

    assessUserRisk(userData, transactions) {
        const risks = [];

        if (userData.expires_at && new Date(userData.expires_at) < new Date()) {
            risks.push('expired_subscription');
        }

        if (transactions.some(t => t.status === 'failed')) {
            risks.push('payment_issues');
        }

        return risks;
    }

    async getUserAnalytics(userId, env) {
        // Implementation for user analytics
        return {};
    }

    analyzePurchaseBehavior(transactions) {
        return {
            totalSpent: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
            averageTransaction: transactions.length > 0 ? transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.length : 0,
            frequency: this.calculatePurchaseFrequency(transactions),
            upgradePattern: this.analyzeUpgradePattern(transactions)
        };
    }

    /**
     * Calculate engagement level based on user activity
     * Returns: 'low' | 'medium' | 'high' | 'power_user'
     */
    async calculateEngagementLevel(userId, env) {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

            // Get recent activity metrics
            const [invitationActivity, transactionActivity, loginActivity] = await Promise.all([
                env.DB.prepare(`
                    SELECT COUNT(*) as count, MAX(created_at) as last_activity
                    FROM invitations
                    WHERE user_id = ? AND created_at > ?
                `).bind(userId, thirtyDaysAgo).first(),

                env.DB.prepare(`
                    SELECT COUNT(*) as count
                    FROM billing_transactions
                    WHERE user_id = ? AND created_at > ? AND status = 'paid'
                `).bind(userId, thirtyDaysAgo).first(),

                env.DB.prepare(`
                    SELECT COUNT(*) as count
                    FROM audit_logs
                    WHERE user_id = ? AND action IN ('login', 'page_view') AND created_at > ?
                `).bind(userId, thirtyDaysAgo).first()
            ]);

            const totalActivity = (invitationActivity?.count || 0) +
                (transactionActivity?.count || 0) +
                (loginActivity?.count || 0);

            if (totalActivity >= 20) return 'power_user';
            if (totalActivity >= 10) return 'high';
            if (totalActivity >= 3) return 'medium';
            return 'low';
        } catch (error) {
            console.error('[AI Engine] Engagement calculation failed:', error);
            return 'medium';
        }
    }

    /**
     * Retrieve support history for user
     * Returns: Array of support tickets/interactions
     */
    async getSupportHistory(userId, env) {
        try {
            const supportTickets = await env.DB.prepare(`
                SELECT 
                    id,
                    subject,
                    status,
                    created_at,
                    resolved_at,
                    category
                FROM support_tickets
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 10
            `).bind(userId).all();

            if (!supportTickets?.results) return [];

            return supportTickets.results.map(ticket => ({
                id: ticket.id,
                subject: ticket.subject,
                status: ticket.status,
                category: ticket.category,
                daysOpen: Math.floor((new Date(ticket.resolved_at || new Date()) - new Date(ticket.created_at)) / (1000 * 60 * 60 * 24)),
                resolved: !!ticket.resolved_at
            }));
        } catch (error) {
            console.error('[AI Engine] Support history retrieval failed:', error);
            return [];
        }
    }

    /**
     * Analyze feature usage patterns
     * Returns: Object with feature usage metrics
     */
    async analyzeFeatureUsage(userId, env) {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

            const [invitations, templates, rsvpTracking, analytics] = await Promise.all([
                env.DB.prepare(`
                    SELECT COUNT(*) as total, 
                           COUNT(DISTINCT DATE(created_at)) as unique_days
                    FROM invitations
                    WHERE user_id = ? AND created_at > ?
                `).bind(userId, thirtyDaysAgo).first(),

                env.DB.prepare(`
                    SELECT COUNT(*) as count
                    FROM templates_used
                    WHERE user_id = ? AND created_at > ?
                `).bind(userId, thirtyDaysAgo).first(),

                env.DB.prepare(`
                    SELECT COUNT(*) as total_rsvps,
                           COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed
                    FROM rsvp_responses
                    WHERE invitation_id IN (
                        SELECT id FROM invitations WHERE user_id = ? AND created_at > ?
                    )
                `).bind(userId, thirtyDaysAgo).first(),

                env.DB.prepare(`
                    SELECT COUNT(DISTINCT invitation_id) as tracked_invitations
                    FROM invitation_analytics
                    WHERE user_id = ? AND created_at > ?
                `).bind(userId, thirtyDaysAgo).first()
            ]);

            return {
                invitations: {
                    created: invitations?.total || 0,
                    activeDays: invitations?.unique_days || 0
                },
                templates: {
                    used: templates?.count || 0
                },
                rsvpTracking: {
                    totalResponses: rsvpTracking?.total_rsvps || 0,
                    confirmedResponses: rsvpTracking?.confirmed || 0,
                    responseRate: rsvpTracking?.total_rsvps > 0
                        ? Math.round((rsvpTracking.confirmed / rsvpTracking.total_rsvps) * 100)
                        : 0
                },
                analytics: {
                    trackedInvitations: analytics?.tracked_invitations || 0
                },
                lastActive: new Date().toISOString()
            };
        } catch (error) {
            console.error('[AI Engine] Feature usage analysis failed:', error);
            return {
                invitations: { created: 0, activeDays: 0 },
                templates: { used: 0 },
                rsvpTracking: { totalResponses: 0, confirmedResponses: 0, responseRate: 0 },
                analytics: { trackedInvitations: 0 },
                lastActive: new Date().toISOString()
            };
        }
    }

    getToneForPersona(persona) {
        const tones = {
            power_user: { formal: 0.8, technical: 0.9, friendly: 0.6 },
            active_creator: { formal: 0.6, technical: 0.7, friendly: 0.8 },
            premium_user: { formal: 0.7, technical: 0.5, friendly: 0.7 },
            new_user: { formal: 0.4, technical: 0.2, friendly: 0.9 }
        };
        return tones[persona] || tones.standard;
    }

    generateIntentBasedResponse(message, intent, context) {
        // Implementation for intent-based response generation
        return "Saya memahami kebutuhan Anda. Mari kita selesaikan ini bersama.";
    }

    generateEngagementBoosters(context) {
        // Implementation for engagement boosters
        return "";
    }

    formatToolResults(toolResults, context) {
        // Implementation for tool result formatting
        return "";
    }

    generateProactiveSuggestions(context) {
        // Implementation for proactive suggestions
        return "";
    }

    async getSystemHealth(env) {
        // Implementation for system health check
        return { status: 'healthy', latency: 0, uptime: 99.9 };
    }

    calculatePurchaseFrequency(transactions) {
        // Implementation for purchase frequency calculation
        return 0;
    }

    analyzeUpgradePattern(transactions) {
        // Implementation for upgrade pattern analysis
        return {};
    }

    /**
     * Load Knowledge Base from files
     * Reads and combines knowledge base files for AI training
     */
    async loadKnowledgeBase() {
        try {
            console.log('[Knowledge Base] Loading from local files...');

            // Try loading from local files first (Cloudflare Workers environment)
            let userKbText = '';
            let tamuuKbText = '';

            try {
                // Load user knowledge base from local
                console.log('[Knowledge Base] Loading user_knowledge_base.md from local...');
                const userKbPath = './user_knowledge_base.md';
                const userKbResponse = await fetch(userKbPath);
                if (userKbResponse.ok) {
                    userKbText = await userKbResponse.text();
                    console.log('[Knowledge Base] Local user KB loaded, length:', userKbText.length);
                } else {
                    console.log('[Knowledge Base] Local user KB not found, trying GitHub...');
                }
            } catch (localError) {
                console.log('[Knowledge Base] Local user KB failed:', localError.message);
            }

            try {
                // Load tamuu knowledge base from local
                console.log('[Knowledge Base] Loading tamuu_knowledge_base.md from local...');
                const tamuuKbPath = './tamuu_knowledge_base.md';
                const tamuuKbResponse = await fetch(tamuuKbPath);
                if (tamuuKbResponse.ok) {
                    tamuuKbText = await tamuuKbResponse.text();
                    console.log('[Knowledge Base] Local tamuu KB loaded, length:', tamuuKbText.length);
                } else {
                    console.log('[Knowledge Base] Local tamuu KB not found, trying GitHub...');
                }
            } catch (localError) {
                console.log('[Knowledge Base] Local tamuu KB failed:', localError.message);
            }

            // If local loading failed, try GitHub as fallback
            if (!userKbText || !tamuuKbText) {
                console.log('[Knowledge Base] Loading from GitHub as fallback...');

                // Load user knowledge base from GitHub
                if (!userKbText) {
                    console.log('[Knowledge Base] Fetching user_knowledge_base.md from GitHub...');
                    const userKbResponse = await fetch('https://raw.githubusercontent.com/aivexl/tamuureact/main/user_knowledge_base.md');
                    console.log('[Knowledge Base] User KB Response Status:', userKbResponse.status, userKbResponse.statusText);
                    userKbText = userKbResponse.ok ? await userKbResponse.text() : '';
                    console.log('[Knowledge Base] User KB Text Length:', userKbText.length);
                }

                // Load tamuu knowledge base from GitHub
                if (!tamuuKbText) {
                    console.log('[Knowledge Base] Fetching tamuu_knowledge_base.md from GitHub...');
                    const tamuuKbResponse = await fetch('https://raw.githubusercontent.com/aivexl/tamuureact/main/tamuu_knowledge_base.md');
                    console.log('[Knowledge Base] Tamuu KB Response Status:', tamuuKbResponse.status, tamuuKbResponse.statusText);
                    tamuuKbText = tamuuKbResponse.ok ? await tamuuKbResponse.text() : '';
                    console.log('[Knowledge Base] Tamuu KB Text Length:', tamuuKbText.length);
                }
            }

            // Extract package information
            const packageInfo = this.extractPackageInfo(userKbText, tamuuKbText);
            console.log('[Knowledge Base] Extracted Package Info:', JSON.stringify(packageInfo, null, 2));

            return {
                userKnowledgeBase: userKbText,
                tamuuKnowledgeBase: tamuuKbText,
                packageInfo: packageInfo
            };
        } catch (error) {
            console.error('[Knowledge Base] Failed to load:', error.message);
            console.error('[Knowledge Base] Error Stack:', error.stack);
            return {
                userKnowledgeBase: '',
                tamuuKnowledgeBase: '',
                packageInfo: this.getDefaultPackageInfo()
            };
        }
    }

    /**
     * Extract package information from knowledge bases
     */
    extractPackageInfo(userKb, tamuuKb) {
        const packages = [];

        // Extract from user knowledge base
        const proMatch = userKb.match(/\*\*PRO \(Rp 99rb\)\*\*:\s*([^\n]+)/);
        const ultimateMatch = userKb.match(/\*\*ULTIMATE \(Rp 149rb\)\*\*:\s*([^\n]+)/);
        const eliteMatch = userKb.match(/\*\*ELITE \(VVIP - Rp 199rb\)\*\*:\s*([^\n]+)/);

        // Extract from tamuu knowledge base
        const tamuuProMatch = tamuuKb.match(/\*\*PRO\*\*\s*\|\s*`pro`\s*\|\s*Rp 99\.000\s*\|\s*([^\|]+)/);
        const tamuuUltimateMatch = tamuuKb.match(/\*\*ULTIMATE\*\*\s*\|\s*`ultimate`\s*\|\s*Rp 149\.000\s*\|\s*([^\|]+)/);
        const tamuuEliteMatch = tamuuKb.match(/\*\*ELITE \(VVIP\)\*\*\s*\|\s*`elite`\s*\|\s*Rp 199\.000\s*\|\s*([^\|]+)/);

        if (proMatch || tamuuProMatch) {
            packages.push({
                name: 'PRO',
                price: 'Rp 99.000',
                features: (proMatch ? proMatch[1].trim() : '') + ' ' + (tamuuProMatch ? tamuuProMatch[1].trim() : ''),
                description: 'Paket terpopuler untuk undangan premium tanpa iklan'
            });
        }

        if (ultimateMatch || tamuuUltimateMatch) {
            packages.push({
                name: 'ULTIMATE',
                price: 'Rp 149.000',
                features: (ultimateMatch ? ultimateMatch[1].trim() : '') + ' ' + (tamuuUltimateMatch ? tamuuUltimateMatch[1].trim() : ''),
                description: 'Paket lengkap dengan Welcome Display untuk venue'
            });
        }

        if (eliteMatch || tamuuEliteMatch) {
            packages.push({
                name: 'ELITE (VVIP)',
                price: 'Rp 199.000',
                features: (eliteMatch ? eliteMatch[1].trim() : '') + ' ' + (tamuuEliteMatch ? tamuuEliteMatch[1].trim() : ''),
                description: 'Paket premium dengan support prioritas dan unlimited fitur'
            });
        }

        return packages.length > 0 ? packages : this.getDefaultPackageInfo();
    }

    /**
     * Get default package information if extraction fails
     */
    getDefaultPackageInfo() {
        return [
            {
                name: 'PRO',
                price: 'Rp 99.000',
                features: 'Undangan tanpa iklan, bebas ganti musik, masa aktif panjang',
                description: 'Paket terpopuler untuk undangan premium'
            },
            {
                name: 'ULTIMATE',
                price: 'Rp 149.000',
                features: 'Welcome Display, RSVP tak terbatas, check-in system',
                description: 'Paket lengkap dengan fitur venue'
            },
            {
                name: 'ELITE (VVIP)',
                price: 'Rp 199.000',
                features: 'Full support, aset R2 premium, tanpa limit',
                description: 'Paket premium dengan support prioritas'
            }
        ];
    }

    /**
     * Generate Indonesian System Prompt with Product Knowledge
     * Enterprise-grade system prompt with deep cultural context and product knowledge
     */
    async generateIndonesianSystemPrompt() {
        // Load knowledge base
        const knowledgeBase = await this.loadKnowledgeBase();

        // Extract package information
        const packageInfo = knowledgeBase.packageInfo || this.getDefaultPackageInfo();

        return `Anda adalah Tamuu Product CTO (AI Edition) versi 9.0 Enterprise Agentic. Sistem AI kedaulatan tinggi dengan standar Fortune 500.

PRINSIP OUTPUT (KRITICAL - HARUS DIIKUTI):
1. DILARANG KERAS memperkenalkan diri dengan kalimat "Saya adalah AI Assistant Tamuu versi..." di awal setiap respon.
2. JANGAN gunakan sapaan template yang kaku. Langsung saja sapa "Halo Kak!" diikuti dengan jawaban yang membantu.
3. ESTETIKA PREMIUM:
   - Gunakan spasi ganda (double newline) di antara paragraf atau bagian untuk menghindari tampilan yang "berat" atau "penuh".
   - DILARANG menggunakan asterisk (*) untuk daftar/list. Selalu gunakan simbol dot bullet (•) yang lebih elegan.
   - Gunakan tabel markdown jika membandingkan fitur atau harga agar sangat rapi.
   - Pastikan teks per paragraf tidak terlalu panjang. Maksimal 3-4 baris per paragraf.

PENGETAHUAN PRODUK TAMUU V9.0:
Tamuu adalah platform premium untuk Undangan Digital dan Layar Sapaan (Welcome Display) dengan fitur:
• Editor undangan langsung dengan drag-and-drop
• 200+ template premium dan elegan
• RSVP otomatis dan manajemen tamu
• Welcome Display interaktif untuk venue
• Musik background dan galeri foto
• Analytics real-time untuk event Anda

PAKET LANGGANAN PREMIUM:
| Fitur Utama | PRO | ULTIMATE | ELITE (VVIP) |
| :--- | :--- | :--- | :--- |
| Harga | Rp 99.000 | Rp 149.000 | Rp 199.000 |
| Undangan Digital | Premium | Premium | Ultra Premium |
| Welcome Display | ❌ | ✅ Included | ✅ Included |
| RSVP | Terbatas | Unlimited | Unlimited |
| Support | Standar | Cepat | Prioritas VVIP 24/7 |
| Penyimpanan Foto | Standar | Besar | Kapasitas Terbesar |

ANALISIS PAKET:
• PRO: Cocok untuk fokus undangan saja. Tanpa branding Tamuu, bebas ganti musik, dan tampilan elegan.
• ULTIMATE: Pilihan paling direkomendasikan. Lengkap dengan Welcome Display untuk diletakkan di venue acara.
• ELITE: Untuk mereka yang menginginkan kesempurnaan total. Support prioritas tertinggi dan kapasitas maksimal.

IDENTITAS & TONE:
• Anda adalah kedaulatan teknis tertinggi (CTO). Bahasa Anda sangat cerdas tapi ramah.
• Gunakan Bahasa Indonesia standar (EYD) yang sangat rapi.
• Selalu gunakan "Kak" sebagai bentuk penghormatan tertinggi.
• Orientasi Anda adalah solusi: jika ada masalah pembayaran, langsung tawarkan bantuan diagnostic proaktif.

Selalu ingat: Setiap karakter yang Anda keluarkan harus memancarkan kualitas Enterprise yang bersih, luas, dan premium. 🏆✨`;
    }

    /**
     * Generate AI Response using Gemini API
     * Enterprise-grade response generation with Indonesian language optimization
     */
    /**
     * Agentic Chat Workflow
     * Handles recursive tool calling and orchestration.
     */
    async chat(messages, context, env) {
        let currentMessages = [...messages];
        const maxIterations = 5;

        for (let i = 0; i < maxIterations; i++) {
            const result = await this.generateGeminiResponse(currentMessages, context, env);

            // If it's a tool call
            if (result.toolCalls && result.toolCalls.length > 0) {
                const toolOutputs = [];

                for (const call of result.toolCalls) {
                    const toolName = call.functionCall.name;
                    const args = call.functionCall.args;

                    console.log(`[AI Agent] Executing tool: ${toolName}`, args);

                    let output;
                    if (v9Tools[toolName]) {
                        output = await v9Tools[toolName]({ ...args, userId: context.userProfile?.id, env, engine: this });
                    } else {
                        output = { error: `Tool ${toolName} not found.` };
                    }

                    toolOutputs.push({
                        callId: call.callId || 'default', // Gemini might use different fields depending on version
                        name: toolName,
                        output
                    });
                }

                // Add tool results to conversation
                currentMessages.push({
                    role: 'model',
                    parts: result.toolCalls.map(tc => ({ functionCall: tc.functionCall }))
                });

                currentMessages.push({
                    role: 'user',
                    parts: toolOutputs.map(to => ({
                        functionResponse: {
                            name: to.name,
                            response: { content: JSON.stringify(to.output) }
                        }
                    }))
                });

                continue; // Iterasi lagi untuk mendapatkan respon final dari Gemini
            }

            return result; // Respon final berupa teks
        }

        return { content: 'Maaf Kak, saya terlalu banyak berpikir. Bisakah Kak menyederhanakan pertanyaannya?' };
    }

    /**
     * Generate AI Response using Gemini API
     * Handles text, function calls, and function responses.
     */
    async generateGeminiResponse(messages, context, env = null) {
        try {
            const apiKey = this.geminiApiKey || env?.GEMINI_API_KEY;
            console.log(`[AI Engine] generateGeminiResponse - Key present: ${!!apiKey}`);

            if (!apiKey || apiKey.trim() === '') {
                return { content: `DEBUG KEY MISSING. this.geminiApiKey: ${!!this.geminiApiKey}, env.GEMINI_API_KEY: ${!!env?.GEMINI_API_KEY}`, metadata: { error: 'KEY_MISSING' } };
            }

            const activeKey = apiKey;

            const startTime = Date.now();

            // Map messages to Gemini-compatible "contents"
            // V9 Note: We support parts with text, functionCall, or functionResponse
            const contents = messages.map(msg => {
                if (msg.parts) return msg; // Already in Gemini format
                return {
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                };
            });

            // Build enhanced context if it's the first message or added as a system-like injection
            const enhancedContext = this.buildGeminiContext(context);

            if (!this.systemPrompt) {
                this.systemPrompt = await this.generateIndonesianSystemPrompt();
            }

            const payload = {
                system_instruction: {
                    parts: [{ text: `${this.systemPrompt}\n\nKONTEKS REAL-TIME SAAT INI:\n${enhancedContext}` }]
                },
                tools: [{ function_declarations: this.getEnhancedTools() }],
                tool_config: {
                    function_calling_config: {
                        mode: 'AUTO'
                    }
                },
                contents: contents,
                generation_config: {
                    temperature: 0.2,
                    max_output_tokens: 2048
                }
            };

            const response = await fetch(`${this.geminiBaseUrl}?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini Error: ${response.status}. Body: ${errorBody}`);
            }

            const data = await response.json();
            const candidate = data.candidates?.[0];
            const part = candidate?.content?.parts?.[0];

            // Check for tool calls (Gemini 2.0 format)
            const toolCalls = candidate?.content?.parts?.filter(p => p.functionCall) || [];

            if (toolCalls.length > 0) {
                return {
                    toolCalls: toolCalls.map(tc => ({
                        functionCall: tc.functionCall,
                        // Gemini may not provide callId in simple REST, we map it for the chat loop
                        callId: tc.functionCall.name + '_' + Date.now()
                    })),
                    metadata: { provider: 'gemini-agent', toolCount: toolCalls.length }
                };
            }

            const responseText = part?.text || 'Maaf Kak, saya tidak dapat merespons saat ini.';
            const optimizedResponse = this.optimizeIndonesianResponse(responseText, context);

            return {
                content: optimizedResponse,
                metadata: {
                    provider: 'gemini-2.0-flash',
                    responseTime: Date.now() - startTime
                }
            };

        } catch (error) {
            console.error('[Gemini API] Error:', error);
            return {
                content: `DEBUG ERROR: ${error.message}. URL: ${this.geminiBaseUrl}. context: ${JSON.stringify(context).substring(0, 50)}`,
                metadata: { error: error.message, fallback: true }
            };
        }
    }

    /**
     * Build Enhanced Context for Gemini
     * Create comprehensive context in Indonesian
     */
    buildGeminiContext(context) {
        const { userProfile, predictedIntent, behavioralInsights, systemHealth } = context;

        let contextText = 'KONTEX SAAT INI:\n';

        // User profile context
        if (userProfile) {
            contextText += `Pengguna: ${userProfile.name || 'Kak'} (${userProfile.persona || 'pengguna'}), `;
            contextText += `Tier: ${userProfile.tier || 'free'}, `;
            contextText += `Health Score: ${userProfile.healthScore || 0}/100\n`;

            if (userProfile.riskLevel && userProfile.riskLevel.length > 0) {
                contextText += `Perhatian: ${userProfile.riskLevel.join(', ')}\n`;
            }
        }

        // Intent context
        if (predictedIntent && predictedIntent.primary) {
            contextText += `Intent Terdeteksi: ${predictedIntent.primary.name} (confidence: ${predictedIntent.primary.confidence})\n`;
        }

        // System health
        if (systemHealth) {
            contextText += `Status Sistem: ${systemHealth.status}, Latency: ${systemHealth.latency}ms\n`;
        }

        // Behavioral insights
        if (behavioralInsights.engagementLevel) {
            contextText += `Engagement: ${behavioralInsights.engagementLevel}\n`;
        }

        contextText += '\nBerikan respons yang tepat, membantu, dan ramah dalam bahasa Indonesia!';

        return contextText;
    }

    /**
     * Optimize Indonesian Response
     * Enterprise-grade Indonesian language optimization with cultural context
     */
    optimizeIndonesianResponse(response, context) {
        let optimized = response;

        // Context-aware personalization
        const { userProfile, predictedIntent } = context;
        const userName = userProfile?.name || 'Kak';
        const userTier = userProfile?.tier || 'free';
        const userPersona = userProfile?.persona || 'standard';

        // Tier-specific language
        const tierLanguage = {
            premium: {
                greeting: 'Selamat datang Kak',
                closing: 'Terima kasih atas kepercayaannya menggunakan layanan premium kami',
                assistance: 'Saya siap membantu dengan prioritas tinggi'
            },
            business: {
                greeting: 'Halo Kak',
                closing: 'Kami sangat menghargai bisnis Anda',
                assistance: 'Tim support prioritas kami siap membantu'
            },
            free: {
                greeting: 'Halo Kak',
                closing: 'Terima kasih sudah menggunakan Tamuu',
                assistance: 'Saya dengan senang hati membantu'
            }
        };

        // Intent-specific optimization
        const intentOptimizations = {
            'payment_issue': {
                urgency: 'Saya pahami ini penting untuk Kak',
                reassurance: 'Saya akan bantu cek dan selesaikan masalahnya',
                nextSteps: 'Mari kita cek satu per satu ya Kak'
            },
            'technical_support': {
                technical: 'Saya akan bantu troubleshoot masalah teknisnya',
                timeline: 'Biasanya ini bisa diselesaikan dalam beberapa menit',
                support: 'Tim teknis kami juga siap membantu jika diperlukan'
            },
            'upgrade_inquiry': {
                benefit: 'Upgrade akan memberikan banyak keuntungan untuk Kak',
                comparison: 'Mari kita bandingkan paket yang tersedia',
                decision: 'Saya bantu Kak memilih yang paling sesuai'
            }
        };

        // Apply tier-specific language
        const tierLang = tierLanguage[userTier] || tierLanguage.free;

        // Personalize with user name
        if (!optimized.includes(userName) && userName !== 'Kak') {
            optimized = optimized.replace(/^(Halo|Hai|Hello)/i, `Halo ${userName}`);
        }

        // Ensure proper greetings with cultural context
        if (!optimized.includes('Kak') && !optimized.includes(userName)) {
            optimized = tierLang.greeting + ', ' + optimized;
        }

        // Add intent-specific context
        if (predictedIntent?.primary?.name && intentOptimizations[predictedIntent.primary.name]) {
            const intentOpt = intentOptimizations[predictedIntent.primary.name];
            if (!optimized.includes('penting') && intentOpt.urgency) {
                optimized = intentOpt.urgency + '. ' + optimized;
            }
            if (!optimized.includes('bantu') && intentOpt.reassurance) {
                optimized += ' ' + intentOpt.reassurance;
            }
        }

        // Add closing with cultural appropriateness
        if (!optimized.includes('bantu') && !optimized.includes('Terima kasih')) {
            optimized += ' ' + tierLang.closing + '. ' + tierLang.assistance + '!';
        }

        // Cultural politeness markers
        const politenessMarkers = {
            'please': 'mohon',
            'help': 'bantu',
            'understand': 'mengerti',
            'problem': 'masalah',
            'solution': 'solusi',
            'thank you': 'terima kasih',
            'sorry': 'maaf',
            'wait': 'tunggu sebentar',
            'check': 'cek dulu',
            'process': 'proses',
            'sure': 'tentu',
            'definitely': 'pastinya',
            'absolutely': 'sangat',
            'quickly': 'segera',
            'immediately': 'segera'
        };

        // Replace with Indonesian equivalents
        Object.entries(politenessMarkers).forEach(([english, indonesian]) => {
            const regex = new RegExp(`\\b${english}\\b`, 'gi');
            optimized = optimized.replace(regex, indonesian);
        });

        // Add appropriate emojis for Indonesian culture
        if (!optimized.includes('🙏') && (optimized.includes('maaf') || optimized.includes('terima kasih'))) {
            optimized += ' 🙏';
        }
        if (!optimized.includes('😊') && (optimized.includes('senang') || optimized.includes('bantu'))) {
            optimized += ' 😊';
        }

        // Ensure proper sentence structure
        optimized = optimized.replace(/\s+/g, ' ').trim();

        return optimized;
    }

    /**
     * Generate Enterprise Fallback Response
     * Fortune 500 grade fallback responses with Indonesian cultural context
     */
    generateFallbackResponse(context) {
        const { predictedIntent, userProfile } = context;
        const userName = userProfile?.name || 'Kak';
        const userTier = userProfile?.tier || 'free';

        // Enterprise-grade fallback responses by tier and intent
        const enterpriseFallbackResponses = {
            premium: {
                'payment_issue': `Maaf ${userName}, sistem AI premium kami sedang maintenance. Tim engineer level 5 kami sedang menyelesaikan masalah ini dengan prioritas TINGGI. Mohon tunggu 2-3 menit. Saya akan notifikasi ${userName} saat sistem kembali online. 🏆`,
                'technical_support': `Maaf ${userName}, enterprise infrastructure kami sedang scaling. Tim DevOps kami (24/7 standby) sedang menyelesaikan ini. ETA: 5 menit. ${userName} akan mendapat notifikasi prioritas. ⚡`,
                'upgrade_inquiry': `Maaf ${userName}, sistem upgrade detection sedang optimization. Account manager premium ${userName} akan segera menghubungi dalam 10 menit. Saya akan email detail upgrade options. 📈`,
                'feature_help': `Maaf ${userName}, AI feature engine sedang recalibration. Tim product kami akan kirim personalized tutorial ke email ${userName} dalam 15 menit. 📚`,
                'account_management': `Maaf ${userName}, enterprise user management sedang security update. Tim security kami akan verifikasi dan update ${userName} dalam 5 menit. 🔒`
            },
            business: {
                'payment_issue': `Maaf ${userName}, payment gateway kami sedang failover ke backup system. Finance team akan cek transaksi ${userName} manual. Mohon tunggu 10 menit. 💳`,
                'technical_support': `Maaf ${userName}, business infrastructure sedang load balancing. System akan auto-recover dalam 10-15 menit. Saya akan monitor progress untuk ${userName}. 🔄`,
                'upgrade_inquiry': `Maaf ${userName}, business upgrade portal sedang maintenance. Sales team akan contact ${userName} dengan custom proposal dalam 30 menit. 📋`,
                'feature_help': `Maaf ${userName}, business feature documentation sedang update. Saya akan email comprehensive guide ke ${userName} dalam 20 menit. 📖`,
                'account_management': `Maaf ${userName}, business account system sedang sync. Admin akan update ${userName} account dengan prioritas. Mohon tunggu 15 menit. ⚙️`
            },
            free: {
                'payment_issue': `Maaf Kak, sistem pembayaran sedang maintenance. Mohon cek email Kak untuk manual payment instructions atau coba lagi dalam 30 menit. 💰`,
                'technical_support': `Maaf Kak, server sedang penuh. Tim kami sedang scale up capacity. Mohon coba lagi dalam 15-20 menit. Saya akan bantu dengan senang hati! 🚀`,
                'upgrade_inquiry': `Maaf Kak, upgrade system sedang update. Mohon cek pricing page untuk info terbaru atau hubungi support. Saya siap bantu detailnya! ⭐`,
                'feature_help': `Maaf Kak, feature demo sedang maintenance. Saya akan email video tutorial ke Kak dalam 30 menit. Stay tuned ya Kak! 📹`,
                'account_management': `Maaf Kak, account system sedang backup. Mohon coba login lagi dalam 10 menit atau reset password jika needed. Saya monitor untuk Kak! 🔑`
            }
        };

        // Default responses for unknown intents
        const defaultFallbackResponses = {
            premium: `Maaf ${userName}, AI Assistant Tamuu v8.0 Enterprise sedang maintenance. Tim engineer kami (1000+ staff) sedang menyelesaikan dengan priority HIGH. ETA: 5 menit. ${userName} akan get VIP notification. 🎯`,
            business: `Maaf ${userName}, business system sedang optimization. Tim support kami akan manual process request ${userName}. Mohon tunggu 20 menit. Saya escalate ke management. 📊`,
            free: `Maaf Kak, Tamuu AI Assistant sedang maintenance rutin. Tim kami sedang improve system untuk Kak. Mohon coba lagi dalam 15 menit. Terima kasih atas patience Kak! 🙏`
        };

        // Check for specific intent and tier
        if (predictedIntent?.primary?.name && enterpriseFallbackResponses[userTier]?.[predictedIntent.primary.name]) {
            return enterpriseFallbackResponses[userTier][predictedIntent.primary.name];
        }

        // Return tier-appropriate default response
        return defaultFallbackResponses[userTier] || defaultFallbackResponses.free;
    }

    /**
     * Handle AI Errors with Indonesian Language
     * Enterprise-grade error handling with user-friendly Indonesian messages
     */
    async handleAIError(error, env) {
        const errorMessage = error.message?.toLowerCase() || '';

        // Rate limiting (quota exceeded)
        if (errorMessage.includes('quota') || errorMessage.includes('rate') || errorMessage.includes('limit')) {
            return {
                content: "Maaf Kak, sistem AI sedang sangat ramai saat ini. Mohon tunggu sebentar dan coba lagi ya. Saya akan terus membantu Anda! 🙏",
                provider: 'error-handler',
                error: 'KUOTA_TERLAMPAUI',
                fallback: true
            };
        }

        // Service unavailable
        if (errorMessage.includes('unavailable') || errorMessage.includes('timeout') || errorMessage.includes('service')) {
            return {
                content: "Maaf Kak, sistem sedang dalam pemeliharaan. Tim teknis kami sedang menyelesaikan masalah ini. Mohon coba beberapa saat lagi.",
                provider: 'error-handler',
                error: 'LAYANAN_TIDAK_TERSEDIA',
                fallback: true
            };
        }

        // Authentication issues
        if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
            return {
                content: "Terjadi masalah autentikasi. Mohon logout dan login kembali untuk melanjutkan percakapan dengan saya.",
                provider: 'error-handler',
                error: 'KESALAHAN_OTENTIKASI',
                fallback: true
            };
        }

        // Network issues
        if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('fetch')) {
            return {
                content: "Koneksi internet sedang tidak stabil. Mohon periksa koneksi Anda dan coba lagi ya Kak.",
                provider: 'error-handler',
                error: 'KESALAHAN_JARINGAN',
                fallback: true
            };
        }

        // Database errors
        if (errorMessage.includes('database') || errorMessage.includes('sql') || errorMessage.includes('query')) {
            return {
                content: "Maaf Kak, ada gangguan di database kami. Tim teknis sedang memperbaikinya. Mohon coba lagi dalam 5-10 menit.",
                provider: 'error-handler',
                error: 'KESALAHAN_DATABASE',
                fallback: true
            };
        }

        // API errors (Gemini, external services)
        if (errorMessage.includes('api') || errorMessage.includes('external') || errorMessage.includes('third-party')) {
            return {
                content: "Maaf Kak, layanan pihak ketiga sedang mengalami masalah. Kami sedang menyelesaikannya. Silakan coba lagi nanti.",
                provider: 'error-handler',
                error: 'KESALAHAN_API',
                fallback: true
            };
        }

        // Validation errors
        if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('format')) {
            return {
                content: "Maaf Kak, format data yang Anda kirim tidak sesuai. Mohon periksa kembali dan coba lagi ya.",
                provider: 'error-handler',
                error: 'KESALAHAN_VALIDASI',
                fallback: true
            };
        }

        // Generic fallback with Indonesian language
        return {
            content: "Maaf Kak, terjadi sedikit kendala teknis. Tim kami telah diberitahu dan sedang menyelesaikannya. Mohon coba lagi dalam beberapa saat.",
            provider: 'error-handler',
            error: 'KESALAHAN_UMUM',
            fallback: true
        };
    }

    /**
     * CACHE INVALIDATION - Enhanced cache management with event-driven invalidation
     * Clears cached context when user data changes
     */
    invalidateUserCache(userId) {
        try {
            const cacheKey = `context_${userId}`;
            this.cache.delete(cacheKey);
            console.log(`[AI Engine] Cache invalidated for user: ${userId}`);
            return true;
        } catch (error) {
            console.error('[AI Engine] Failed to invalidate user cache:', error);
            return false;
        }
    }

    /**
     * Invalidate all cached data (useful for cache overflow or maintenance)
     */
    invalidateAllCache() {
        try {
            const cacheSize = this.cache.size;
            this.cache.clear();
            console.log(`[AI Engine] All cache cleared. Removed ${cacheSize} entries.`);
            return cacheSize;
        } catch (error) {
            console.error('[AI Engine] Failed to clear all cache:', error);
            return 0;
        }
    }

    /**
     * Invalidate session context for user
     */
    invalidateSessionContext(userId) {
        try {
            const sessionId = this.generateSessionId(userId);
            this.sessionContext.delete(sessionId);
            console.log(`[AI Engine] Session context invalidated for user: ${userId}`);
            return true;
        } catch (error) {
            console.error('[AI Engine] Failed to invalidate session context:', error);
            return false;
        }
    }

    /**
     * Invalidate cache by pattern (e.g., all users, all contexts)
     * @param pattern - Key pattern to match (e.g., 'context_', 'session_')
     */
    invalidateCacheByPattern(pattern) {
        try {
            let invalidatedCount = 0;

            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                    invalidatedCount++;
                }
            }

            console.log(`[AI Engine] Cache pattern invalidation complete. Removed ${invalidatedCount} entries matching pattern: ${pattern}`);
            return invalidatedCount;
        } catch (error) {
            console.error('[AI Engine] Failed to invalidate cache by pattern:', error);
            return 0;
        }
    }

    /**
     * Set cache TTL (Time To Live) and automatically cleanup expired entries
     */
    setCacheTTL(userId, ttlMs = 300000) {
        try {
            const cacheKey = `context_${userId}`;
            const context = this.cache.get(cacheKey);

            if (context) {
                // Mark expiry time
                context.expiresAt = Date.now() + ttlMs;
                this.cache.set(cacheKey, context);
                console.log(`[AI Engine] Cache TTL set for user ${userId}: ${ttlMs}ms`);
                return true;
            }

            return false;
        } catch (error) {
            console.error('[AI Engine] Failed to set cache TTL:', error);
            return false;
        }
    }

    /**
     * Cleanup expired cache entries (should be called periodically)
     */
    cleanupExpiredCache() {
        try {
            const now = Date.now();
            let expiredCount = 0;

            for (const [key, value] of this.cache.entries()) {
                if (value.expiresAt && value.expiresAt < now) {
                    this.cache.delete(key);
                    expiredCount++;
                }
            }

            if (expiredCount > 0) {
                console.log(`[AI Engine] Cache cleanup complete. Removed ${expiredCount} expired entries.`);
            }

            return expiredCount;
        } catch (error) {
            console.error('[AI Engine] Failed to cleanup expired cache:', error);
            return 0;
        }
    }

    /**
     * Get cache statistics for monitoring and debugging
     */
    getCacheStats() {
        try {
            let totalEntries = 0;
            let expiredEntries = 0;
            const now = Date.now();

            for (const value of this.cache.values()) {
                totalEntries++;
                if (value.expiresAt && value.expiresAt < now) {
                    expiredEntries++;
                }
            }

            return {
                totalEntries,
                expiredEntries,
                activeEntries: totalEntries - expiredEntries,
                cacheSize: this.cache.size,
                sessionContextSize: this.sessionContext.size,
                performanceMetrics: this.performanceMetrics
            };
        } catch (error) {
            console.error('[AI Engine] Failed to get cache stats:', error);
            return null;
        }
    }
}

export { TamuuAIEngine };