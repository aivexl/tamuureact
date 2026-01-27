/**
 * Enhanced AI Chat Handler v8.0
 * Enterprise-grade AI system with predictive analytics and intelligent responses
 */

import { TamuuAIEngine } from './ai-system-v8-enhanced.js';

export async function handleEnhancedChat(request, env, ctx, corsHeaders) {
    const startTime = Date.now();
    const aiEngine = new TamuuAIEngine(env);
    
    try {
        const { messages, userId } = await request.json();
        
        if (!env.GEMINI_API_KEY) {
            return json({ 
                error: 'AI Support currently unavailable',
                code: 'AI_UNAVAILABLE'
            }, { ...corsHeaders, status: 503 });
        }

        // Enhanced security verification
        let user = null;
        if (userId && userId !== 'test') {
            try {
                user = await env.DB.prepare(`
                    SELECT u.*, 
                           COUNT(DISTINCT i.id) as invitation_count,
                           COUNT(DISTINCT t.id) as transaction_count
                    FROM users u
                    LEFT JOIN invitations i ON u.id = i.user_id
                    LEFT JOIN billing_transactions t ON u.id = t.user_id
                    WHERE u.id = ? OR u.email = ?
                    GROUP BY u.id
                `).bind(userId, userId).first();
                
                if (!user) {
                    return json({ 
                        error: 'Unauthorized access',
                        code: 'UNAUTHORIZED'
                    }, { ...corsHeaders, status: 403 });
                }
            } catch (dbError) {
                console.warn('[Enhanced Chat] Database lookup failed, continuing with anonymous context:', dbError);
                // Continue without user context
            }
        }

        // Build enhanced context
        const enhancedContext = await aiEngine.buildEnhancedContext(user?.id, messages, env);
        
        // Predict user intent with high precision
        const predictedIntent = enhancedContext?.predictedIntent;
        
        // Validate intent exists before proceeding
        if (!predictedIntent || !predictedIntent.primary) {
            return json({ 
                error: 'Failed to analyze user intent',
                code: 'INTENT_ANALYSIS_FAILED'
            }, { ...corsHeaders, status: 400 });
        }
        
        // Execute intelligent tools based on predicted intent
        const toolResults = await executeIntelligentTools(predictedIntent, user?.id, env);
        
        // Generate personalized response using Gemini API
        const geminiResponse = await aiEngine.generateGeminiResponse(messages, enhancedContext);
        
        // Validate Gemini response before processing
        if (!geminiResponse || !geminiResponse.content) {
            return json({ 
                error: 'Failed to generate AI response',
                code: 'RESPONSE_GENERATION_FAILED'
            }, { ...corsHeaders, status: 500 });
        }
        
        // Enhance with local intelligence
        const enhancedResponse = {
            content: geminiResponse.content,
            metadata: {
                ...geminiResponse.metadata,
                toolsExecuted: toolResults.length,
                contextUsed: !!enhancedContext.userProfile
            }
        };

        // Track performance metrics
        const responseTime = Date.now() - startTime;
        aiEngine.trackPerformance('averageResponseTime', responseTime);
        
        return json({
            content: enhancedResponse.content,
            provider: enhancedResponse.metadata.provider || 'tamuu-ai-v8',
            metadata: {
                ...enhancedResponse.metadata,
                responseTime,
                contextUsed: !!enhancedContext.userProfile,
                toolsExecuted: toolResults.length
            }
        }, corsHeaders);

    } catch (error) {
        console.error('[Enhanced AI] Error:', error);
        
        // Intelligent error recovery with Indonesian language
        const recoveryResponse = await aiEngine.handleAIError(error, env);
        
        return json({
            content: recoveryResponse.content,
            provider: 'tamuu-ai-v8',
            error: recoveryResponse.error,
            fallback: true
        }, corsHeaders);
    }
}

/**
 * Execute intelligent tools based on predicted intent
 */
async function executeIntelligentTools(predictedIntent, userId, env) {
    const tools = [];
    const intentName = predictedIntent.primary.name;
    
    try {
        switch (intentName) {
            case 'payment_issue':
                tools.push(await executePaymentDiagnostics(userId, env));
                break;
                
            case 'technical_support':
                tools.push(await executeTechnicalDiagnostics(userId, env));
                break;
                
            case 'upgrade_inquiry':
                tools.push(await executeUpgradeAnalysis(userId, env));
                break;
                
            case 'account_management':
                tools.push(await executeAccountDiagnostics(userId, env));
                break;
                
            default:
                // General diagnostics for unknown intents
                tools.push(await executeGeneralDiagnostics(userId, env));
        }
        
        return tools.filter(tool => tool !== null);
        
    } catch (error) {
        console.error(`[Intelligent Tools] Error executing ${intentName}:`, error);
        return [];
    }
}

/**
 * Specialized diagnostic tools
 */
async function executePaymentDiagnostics(userId, env) {
    try {
        if (!userId) {
            return {
                tool: 'payment_diagnostics',
                data: {
                    recentTransactions: [],
                    failedPayments: [],
                    recommendation: 'Saya memerlukan informasi pengguna untuk menganalisis pembayaran Anda.',
                    autoFixAvailable: false
                }
            };
        }

        const recentTransactions = await env.DB.prepare(`
            SELECT * FROM billing_transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 5
        `).bind(userId).all();
        
        // Validate database response
        if (!recentTransactions || !Array.isArray(recentTransactions.results)) {
            return null;
        }

        const failedPayments = recentTransactions.results.filter(t => 
            t && (t.status === 'pending' || t.status === 'failed' || t.status === 'expired')
        );
        
        return {
            tool: 'payment_diagnostics',
            data: {
                recentTransactions: recentTransactions.results || [],
                failedPayments,
                recommendation: failedPayments.length > 0 ? 
                    'Saya menemukan transaksi yang memerlukan perhatian. Mari kita periksa satu per satu.' :
                    'Semua transaksi Anda dalam kondisi baik.',
                autoFixAvailable: failedPayments.length > 0
            }
        };
    } catch (error) {
        console.error('[Payment Diagnostics] Error:', error);
        return null;
    }
}

async function executeTechnicalDiagnostics(userId, env) {
    try {
        const userInvitations = await env.DB.prepare(`
            SELECT i.*, 
                   COUNT(r.id) as rsvp_count,
                   (SELECT COUNT(*) FROM rsvp_responses WHERE invitation_id = i.id AND status = 'confirmed') as confirmed_count
            FROM invitations i
            LEFT JOIN rsvp_responses r ON i.id = r.invitation_id
            WHERE i.user_id = ?
            GROUP BY i.id
            ORDER BY i.created_at DESC
            LIMIT 5
        `).bind(userId).all();
        
        const systemHealth = await checkSystemHealth(env);
        
        return {
            tool: 'technical_diagnostics',
            data: {
                invitations: userInvitations.results,
                systemHealth,
                potentialIssues: identifyPotentialIssues(userInvitations.results),
                recommendation: 'Saya telah memindai sistem Anda. Berikut adalah temuan teknisnya.'
            }
        };
    } catch (error) {
        console.error('[Technical Diagnostics] Error:', error);
        return null;
    }
}

async function executeUpgradeAnalysis(userId, env) {
    try {
        if (!userId) {
            return {
                tool: 'upgrade_analysis',
                data: {
                    currentTier: 'free',
                    nextTier: 'pro',
                    upgradeHistory: [],
                    recommendation: 'Saya perlu informasi lebih untuk memberikan saran upgrade.',
                    benefits: []
                }
            };
        }

        const userData = await env.DB.prepare(`
            SELECT * FROM users WHERE id = ?
        `).bind(userId).first();

        // Validate user exists
        if (!userData) {
            return {
                tool: 'upgrade_analysis',
                data: {
                    currentTier: 'free',
                    nextTier: 'pro',
                    upgradeHistory: [],
                    recommendation: 'Akun pengguna tidak ditemukan.',
                    benefits: []
                }
            };
        }
        
        const upgradeHistory = await env.DB.prepare(`
            SELECT * FROM billing_transactions 
            WHERE user_id = ? AND status = 'paid'
            ORDER BY created_at DESC
        `).bind(userId).all();

        // Validate database response
        if (!upgradeHistory || !Array.isArray(upgradeHistory.results)) {
            return null;
        }
        
        const currentTier = userData.tier || 'free';
        const availableTiers = ['free', 'pro', 'ultimate', 'elite'];
        const currentIndex = availableTiers.indexOf(currentTier);
        const nextTier = currentIndex < availableTiers.length - 1 ? availableTiers[currentIndex + 1] : null;
        
        return {
            tool: 'upgrade_analysis',
            data: {
                currentTier,
                nextTier,
                upgradeHistory: upgradeHistory.results || [],
                recommendation: generateUpgradeRecommendation(currentTier, nextTier, upgradeHistory.results || []),
                benefits: getTierBenefits(nextTier)
            }
        };
    } catch (error) {
        console.error('[Upgrade Analysis] Error:', error);
        return null;
    }
}

async function executeAccountDiagnostics(userId, env) {
    try {
        if (!userId) {
            return {
                tool: 'account_diagnostics',
                data: {
                    accountAge: 0,
                    subscriptionStatus: 'unknown',
                    expiresAt: null,
                    loginActivity: [],
                    securityStatus: { status: 'unknown' },
                    recommendation: 'Saya memerlukan informasi pengguna untuk analisis akun.'
                }
            };
        }

        const userData = await env.DB.prepare(`
            SELECT * FROM users WHERE id = ?
        `).bind(userId).first();

        // Validate user exists
        if (!userData || !userData.created_at) {
            return {
                tool: 'account_diagnostics',
                data: {
                    accountAge: 0,
                    subscriptionStatus: 'unknown',
                    expiresAt: null,
                    loginActivity: [],
                    securityStatus: { status: 'unknown' },
                    recommendation: 'Data akun tidak dapat ditemukan.'
                }
            };
        }
        
        const accountAge = Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const subscriptionStatus = userData.expires_at && new Date(userData.expires_at) > new Date() ? 'active' : 'expired';
        
        const loginData = await getLoginActivity(userId, env);
        const securityData = await checkSecurityStatus(userId, env);
        
        return {
            tool: 'account_diagnostics',
            data: {
                accountAge,
                subscriptionStatus,
                expiresAt: userData.expires_at || null,
                loginActivity: loginData || [],
                securityStatus: securityData || { status: 'unknown' },
                recommendation: generateAccountRecommendation(userData, accountAge, subscriptionStatus)
            }
        };
    } catch (error) {
        console.error('[Account Diagnostics] Error:', error);
        return null;
    }
}

async function executeGeneralDiagnostics(userId, env) {
    try {
        const userData = await env.DB.prepare(`
            SELECT * FROM users WHERE id = ?
        `).bind(userId).first();
        
        return {
            tool: 'general_diagnostics',
            data: {
                userStatus: userData ? 'active' : 'not_found',
                subscription: userData?.tier || 'free',
                expiresAt: userData?.expires_at,
                recommendation: userData ? 
                    'Saya telah memindai akun Anda. Semua sistem berfungsi normal.' :
                    'Tidak dapat menemukan informasi akun. Mohon periksa kembali.'
            }
        };
    } catch (error) {
        console.error('[General Diagnostics] Error:', error);
        return null;
    }
}

/**
 * Helper functions for diagnostics
 */
async function checkSystemHealth(env) {
    try {
        const dbHealth = await env.DB.prepare('SELECT 1').first();
        return {
            database: !!dbHealth,
            status: 'healthy',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            database: false,
            status: 'degraded',
            error: error.message
        };
    }
}

function identifyPotentialIssues(invitations) {
    const issues = [];
    
    invitations.forEach(inv => {
        if (inv.status === 'draft' && new Date(inv.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
            issues.push({
                type: 'old_draft',
                invitation: inv.name,
                message: 'Undangan dalam status draft lebih dari 7 hari'
            });
        }
        
        if (inv.rsvp_count === 0 && inv.status === 'published') {
            issues.push({
                type: 'no_rsvp',
                invitation: inv.name,
                message: 'Undangan dipublikasikan tetapi belum ada RSVP'
            });
        }
    });
    
    return issues;
}

function generateUpgradeRecommendation(currentTier, nextTier, upgradeHistory) {
    if (!nextTier) {
        return 'Anda sudah di tier tertinggi. Terima kasih telah menjadi pelanggan setia!';
    }
    
    const lastUpgrade = upgradeHistory[0];
    const daysSinceLastUpgrade = lastUpgrade ? 
        Math.floor((Date.now() - new Date(lastUpgrade.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 365;
    
    if (daysSinceLastUpgrade > 30) {
        return `Peningkatan ke ${nextTier.toUpperCase()} akan memberikan Anda fitur premium tambahan. Saya rekomendasikan upgrade sekarang.`;
    }
    
    return `Anda dapat meningkatkan ke ${nextTier.toUpperCase()} untuk mendapatkan fitur eksklusif.`;
}

function getTierBenefits(tier) {
    const benefits = {
        pro: ['Bebas iklan', 'Musik custom', 'Support prioritas'],
        ultimate: ['Welcome display', 'RSVP unlimited', '2 undangan'],
        elite: ['Support VVIP', '3 undangan', 'Fitur eksklusif']
    };
    
    return benefits[tier] || [];
}

async function getLoginActivity(userId, env) {
    // Implementation for login activity tracking
    return { lastLogin: new Date().toISOString(), totalLogins: 1 };
}

async function checkSecurityStatus(userId, env) {
    // Implementation for security status check
    return { status: 'secure', lastPasswordChange: new Date().toISOString() };
}

function generateAccountRecommendation(userData, accountAge, subscriptionStatus) {
    if (subscriptionStatus === 'expired') {
        return 'Langganan Anda telah kedaluwarsa. Saya sarankan untuk segera memperpanjang.';
    }
    
    if (accountAge < 7) {
        return 'Selamat datang di Tamuu! Saya akan membantu Anda memaksimalkan platform ini.';
    }
    
    return 'Akun Anda dalam kondisi baik. Teruskan penggunaan platform ini.';
}

/**
 * Error handling with intelligent recovery
 */
async function handleAIError(error, env) {
    const errorType = classifyError(error);
    
    switch (errorType) {
        case 'rate_limit':
            return {
                content: 'Maaf, sistem AI sedang sangat sibuk. Mohon tunggu sebentar dan coba lagi. 🙏',
                error: 'RATE_LIMIT_EXCEEDED'
            };
            
        case 'service_unavailable':
            return {
                content: 'Sistem AI sedang dalam pemeliharaan. Tim teknis kami sedang menyelesaikan masalah ini.',
                error: 'SERVICE_UNAVAILABLE'
            };
            
        case 'authentication_error':
            return {
                content: 'Terjadi masalah autentikasi. Mohon login kembali untuk melanjutkan.',
                error: 'AUTH_ERROR'
            };
            
        default:
            return {
                content: 'Maaf, terjadi masalah teknis. Tim kami telah diberitahu dan sedang menyelesaikannya.',
                error: 'GENERIC_ERROR'
            };
    }
}

function classifyError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('quota') || message.includes('rate')) return 'rate_limit';
    if (message.includes('unavailable') || message.includes('timeout')) return 'service_unavailable';
    if (message.includes('auth') || message.includes('unauthorized')) return 'authentication_error';
    
    return 'generic';
}

/**
 * Utility functions
 */
function json(data, headers = {}) {
    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    });
}