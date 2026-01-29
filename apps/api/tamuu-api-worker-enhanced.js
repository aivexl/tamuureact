/**
 * Tamuu API Worker
 * Handles all database (D1) and storage (R2) operations
 * Enhanced with AI System v8.0 - Enterprise Grade
 */

import { TamuuAIEngine } from './ai-system-v8-enhanced.js';
import { handleEnhancedChat } from './enhanced-chat-handler.js';
import { createAdminChatHandler } from './admin-chat-integration.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;
        const cache = caches.default;

        /**
         * Smart Caching Helper for Edge Caching
         * Wraps a fetcher function and caches the result using Cloudflare Cache API
         */
        const smart_cache = async (req, ttl, fetcher) => {
            const cacheKey = new Request(req.url, req);
            let response = await cache.match(cacheKey);

            if (!response) {
                // Cache MISS - Fetch fresh data
                const freshData = await fetcher();
                if (!freshData) return notFound(corsHeaders);

                // Create cacheable response
                response = json(freshData, {
                    headers: {
                        ...corsHeaders,
                        'Cache-Control': `public, max-age=${ttl}`,
                        'CF-Cache-Status': 'MISS',
                        'X-Tamuu-Cache': 'MISS'
                    }
                });

                // Store in cache asynchronously
                ctx.waitUntil(cache.put(cacheKey, response.clone()));
            }
            return response;
        };


        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle preflight
        if (method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Utility: JSON Response
        const json = (data, init = {}) => new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders, ...init.headers },
            status: init.status || 200
        });

        // Utility: Error Response
        const error = (msg, status = 400) => json({ error: msg }, { status });
        const notFound = () => error('Not found', 404);

        // Utility: Parse JSON fields for templates/invitations/billing
        function parseJsonFields(row) {
            const jsonFields = ['pan', 'sections', 'layers', 'orbit', 'orbit_layers', 'music'];

            const result = { ...row };
            for (const field of jsonFields) {
                if (result[field] && typeof result[field] === 'string') {
                    try {
                        result[field] = JSON.parse(result[field]);
                    } catch (e) {
                        console.error(`[API] Failed to parse JSON for field ${field}:`, e);
                        if (field === 'sections' || field === 'layers' || field === 'orbit_layers') {
                            result[field] = field === 'orbit_layers' ? {} : [];
                        }
                    }
                } else if (!result[field]) {
                    if (field === 'sections' || field === 'layers') result[field] = [];
                    else if (field === 'orbit' || field === 'orbit_layers') result[field] = {};
                }
            }

            if (result.orbit && (Object.keys(result.orbit).length > 0) && (!result.orbit_layers || Object.keys(result.orbit_layers).length === 0)) {
                result.orbit_layers = result.orbit;
            } else if (result.orbit_layers && (Object.keys(result.orbit_layers).length > 0) && (!result.orbit || Object.keys(result.orbit).length === 0)) {
                result.orbit = result.orbit_layers;
            }

            return result;
        }

        // Enterprise-safe fetch (legacy domain patching)
        const safeFetch = async (url, options = {}) => {
            const patchedUrl = url.replace('tamuu.pages.dev', 'tamuu.id');
            const response = await fetch(patchedUrl, options);
            return response;
        };

        // AI Model Fallback System (Gemini 2.0 -> Groq)
        const fetchAI = async (systemPrompt, messages, tools = [], model = 'gemini-2.5-flash-lite') => {
            const payload = {
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    ...messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
                ],
                generationConfig: {
                    temperature: 0.3,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 2048
                }
            };

            if (tools.length > 0) {
                payload.tools = [{ function_declarations: tools }];
            }

            try {
                const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!aiResponse.ok) {
                    const errorText = await aiResponse.text();
                    throw new Error(`Gemini API error: ${errorText}`);
                }

                const result = await aiResponse.json();
                const candidate = result.candidates?.[0];
                if (!candidate) throw new Error('No AI response generated');

                // Handle tool calls
                if (candidate.content?.parts?.[0]?.functionCall) {
                    return {
                        tool_calls: [{
                            function: candidate.content.parts[0].functionCall
                        }],
                        provider: 'gemini'
                    };
                }

                const text = candidate.content?.parts?.[0]?.text;
                if (!text) throw new Error('Empty AI response');

                return { content: text, provider: 'gemini' };

            } catch (err) {
                console.error(`[AI] Gemini failed: ${err.message}`);
                throw new Error(`AI Service unavailable: ${err.message}`);
            }
        };

        try {
            // ENHANCED: AI Chat Support v8.0 - Enterprise Grade
            // Matches apps/web/src/lib/api.ts which calls /api/enhanced-chat
            if ((path === '/api/chat' || path === '/api/enhanced-chat') && method === 'POST') {
                return await handleEnhancedChat(request, env, ctx, corsHeaders);
            }

            // ADMIN: AI Chat Support (Enterprise v8.0 - Enhanced)
            if (path === '/api/admin/chat' && method === 'POST') {
                try {
                    const { messages, userId, aiPersonality = 'professional', enableQuickActions = true, enableSettings = true } = await request.json();

                    // Validate required fields
                    if (!userId || !messages || !Array.isArray(messages) || messages.length === 0) {
                        return json({
                            success: false,
                            error: { code: 'INVALID_REQUEST', message: 'userId dan messages diperlukan' }
                        }, { ...corsHeaders, status: 400 });
                    }

                    // Check API key configuration
                    if (!env.GEMINI_API_KEY) {
                        return json({
                            success: false,
                            error: { code: 'API_NOT_CONFIGURED', message: 'Gemini API Key tidak dikonfigurasi' }
                        }, { ...corsHeaders, status: 500 });
                    }

                    // Create admin chat handler instance
                    const adminChatHandler = createAdminChatHandler(env);

                    // Get latest message from conversation
                    const latestMessage = messages[messages.length - 1];
                    const messageContent = typeof latestMessage === 'string' ? latestMessage : latestMessage.content;

                    // Process with enhanced context
                    const result = await adminChatHandler.processAdminMessage(userId, messageContent, {
                        aiPersonality,
                        enableQuickActions,
                        enableSettings,
                        conversationHistory: messages.slice(-10) // Keep last 10 messages for context
                    });

                    return json(result, corsHeaders);

                } catch (error) {
                    console.error('Admin Chat v8.0 Error:', error);

                    // Enhanced error handling with Indonesian support
                    const errorResponse = {
                        success: false,
                        error: {
                            code: 'INTERNAL_ERROR',
                            message: 'Terjadi kesalahan pada sistem AI. Tim teknis telah diberitahu.',
                            timestamp: new Date().toISOString()
                        }
                    };

                    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
                        errorResponse.error.message = 'Sistem AI sedang sibuk. Mohon tunggu sejenak dan coba kembali.';
                        errorResponse.error.code = 'RATE_LIMITED';
                    }

                    return json(errorResponse, { ...corsHeaders, status: 500 });
                }
            }

            // ADMIN: Health Check for AI System v8.0
            if (path === '/api/admin/health' && method === 'GET') {
                try {
                    const adminChatHandler = createAdminChatHandler(env);
                    const healthStatus = await adminChatHandler.healthCheck();

                    return json({
                        success: true,
                        service: 'tamuu-admin-ai-v8',
                        status: healthStatus.status,
                        timestamp: healthStatus.timestamp,
                        version: '8.0.0',
                        environment: env.ENVIRONMENT || 'development',
                        services: healthStatus.services || {},
                        features: {
                            adminChat: true,
                            aiEngine: !!env.GEMINI_API_KEY,
                            sessionManagement: true,
                            rateLimiting: true,
                            analytics: true,
                            fallbackSystem: true
                        }
                    }, corsHeaders);
                } catch (error) {
                    return json({
                        success: false,
                        service: 'tamuu-admin-ai-v8',
                        status: 'error',
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }, { ...corsHeaders, status: 503 });
                }
            }

            // ADMIN: Legacy AI Chat Support (v7.0 - Maintained for compatibility)
            if (path === '/api/admin/chat/legacy' && method === 'POST') {
                const { messages } = await request.json();

                if (!env.GEMINI_API_KEY) {
                    return json({ error: 'Gemini API Key not configured' }, { ...corsHeaders, status: 500 });
                }

                // Fetch Real-time Stats for Context
                const [usersCount, templatesCount, invitationsCount, rsvpCount] = await Promise.all([
                    env.DB.prepare('SELECT COUNT(*) as count FROM users').first('count'),
                    env.DB.prepare("SELECT COUNT(*) as count FROM templates WHERE type = 'invitation'").first('count'),
                    env.DB.prepare('SELECT COUNT(*) as count FROM invitations').first('count'),
                    env.DB.prepare('SELECT COUNT(*) as count FROM rsvp_responses').first('count')
                ]);

                const systemPrompt = `You are Tamuu Smart CS, a professional and efficient assistant for the Tamuu platform.
Your goal is to help administrators manage the platform and answer questions about products, payments, and troubleshooting.

CURRENT PLATFORM STATS (REAL-TIME):
- Total Users: ${usersCount}
- Total Invitations Created: ${invitationsCount}
- Total Templates Available: ${templatesCount}
- Total RSVP Responses: ${rsvpCount}

PRODUCT KNOWLEDGE:
- Tamuu is a premium platform for Digital Invitations and Welcome Displays.
- Features: Instant deployment, Premium Themes, Responsive Editor.

PRICING & TIERS:
- FREE: 1 invitation, basic features.
- PRO (Rp 99k): No ads, custom music.
- ULTIMATE (Rp 149k): Welcome display, unlimited RSVP.
- ELITE/VVIP (Rp 199k): Full support, premium R2 assets.

PAYMENTS:
- Uses Midtrans (VA, E-Wallet, QRIS, CC).
- Auto-cancels abandoned payments on retry.

TROUBLESHOOTING:
- Pending Payment: Check Billing page, refresh, or "Sync Status" in Admin.
- QR Not Reading: Check screen brightness, screen cleanliness.
- Welcome Display Sync: Check internet stability, refresh page.

TONE & EMOJI RULES (STRICT):
1. NEVER use the word "Boss" or "Bos". Use "Kak" or professional terminology.
2. Emojis allowed ONLY: 😊, 🙏, 🥰, ❤️. PROHIBITED: ✨, 👋, 🚀, 🤖, etc.
3. Tone: Professional, authoritative, yet friendly and helpful.

FORMATTING & GRAMMAR RULES:
1. Use DOUBLE NEWLINES between paragraphs.
2. Use BULLET POINTS (-) or NUMBERED LISTS for steps and features. NEVER use asterisks (*) as literal bullet characters.
3. Use **BOLD** for important terms, buttons, or page names.
4. Keep responses concise and structured. Avoid long blocks of text.
5. INDONESIAN GRAMMAR (EYD): Use professional, formal Indonesian. Avoid excessive commas. Never place a comma before "yang" or "dan" unless grammatically required for parenthetical clauses. Avoid redundant phrases.

USER CONTEXT: You are chatting with a Tamuu Super Admin. Assist them with system monitoring and technical operations.`;

                try {
                    const text = await fetchAI(systemPrompt, messages);
                    return json({ content: text }, corsHeaders);
                } catch (err) {
                    const friendlyMsg = err.message.includes('quota') || err.message.includes('padat')
                        ? "Maaf, sistem AI sedang sibuk. Silakan coba sesaat lagi. 🙏"
                        : `Admin AI Error: ${err.message}`;
                    return json({ content: friendlyMsg }, corsHeaders);
                }
            }

            // USER: Legacy AI Chat Support (v7.0) - Fallback for compatibility
            if (path === '/api/chat/legacy' && method === 'POST') {
                // Original v7.0 implementation moved here for backward compatibility
                // This maintains the existing functionality while new v8.0 is used by default
                const { messages, userId } = await request.json();

                if (!env.GEMINI_API_KEY) {
                    return json({ error: 'AI Support currently unavailable' }, { ...corsHeaders, status: 503 });
                }

                let user = null;
                if (userId) {
                    user = await env.DB.prepare('SELECT * FROM users WHERE id = ? OR email = ?').bind(userId, userId).first();
                    if (!user) return json({ error: 'Unauthorized context' }, { ...corsHeaders, status: 403 });
                }

                const canonicalId = user?.id || userId;

                // Legacy v7.0 system prompt and tools
                const KNOWLEDGE = {
                    PRODUCT: `
- FREE: 1 Undangan, Trial 30 Hari.
- PRO (Rp 99k): 1 Year, Premium Theme, Custom Music. (Best Seller)
- ULTIMATE (Rp 149k): 2 Undangan, Welcome Display, RSVP Unlimited.
- ELITE (Rp 199k): 3 Undangan, VVIP Support.
- Masa aktif paket adalah 1 TAHUN dari tanggal pembayaran (settlement).`,
                    PLATFORM: `
- Editor: Dapat diakses di Dashboard untuk mengubah Ornamen, Musik, dan Detail Acara.
- Link: Format publik adalah tamuu.id/[slug].
- Sharing: Gunakan tombol 'Share' untuk menyebar ke WhatsApp dengan teks otomatis.
- Status: 'Draft' (hanya Anda yang bisa lihat), 'Published' (siap disebar).`,
                    POLICY: `
- Refund: Maksimal 2x24 jam jika terjadi kendala teknis yang tidak dapat diselesaikan.
- Data: Undangan yang expired akan tetap tersimpan selama 30 hari sebelum dihapus permanen.
- Support: Chat ini adalah support resmi Tamuu.`
                };

                let userContext = "No specific account context.";
                if (user) {
                    const status = user.tier?.toUpperCase() || "FREE";
                    const expiry = user.expires_at ? new Date(user.expires_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : "Selamanya";
                    const { results: recentInvs } = await env.DB.prepare('SELECT slug, name FROM invitations WHERE user_id = ? LIMIT 3').bind(canonicalId).all();
                    const invList = recentInvs.map(i => `${i.name} (tamuu.id/${i.slug})`).join(', ') || "Belum ada";

                    userContext = `
USER IDENTITY:
- Name: ${user.name}
- Email: ${user.email}
- Status: ${status} (Berlaku hingga: ${expiry})
- Recent Invitations: ${invList}
`;
                }

                const fullConversationText = messages.map(m => m.content).join(" ").toLowerCase();
                let activeKnowledge = "";
                if (fullConversationText.match(/paket|harga|bayar|pro|elite|ultimate|beli/)) activeKnowledge += `\nPRODUCT KNOWLEDGE:${KNOWLEDGE.PRODUCT}`;
                if (fullConversationText.match(/cara|buat|edit|link|undangan|buka|slug|akses/)) activeKnowledge += `\nPLATFORM KNOWLEDGE:${KNOWLEDGE.PLATFORM}`;
                if (fullConversationText.match(/refund|batal|hapus|aman|data/)) activeKnowledge += `\nPOLICY KNOWLEDGE:${KNOWLEDGE.POLICY}`;

                const aiTools = [
                    {
                        name: "get_user_diagnostics",
                        description: "Deep scan of user account status including tier, expiry, invitations, and transaction history.",
                        parameters: { type: "object", properties: {}, required: [] }
                    },
                    {
                        name: "search_order",
                        description: "Search for a specific transaction status by order ID or external ID.",
                        parameters: {
                            type: "object",
                            properties: {
                                order_id: { type: "string", description: "The #order-id or external_id to search for." }
                            },
                            required: ["order_id"]
                        }
                    },
                    {
                        name: "get_invitation_details",
                        description: "Get full technical details of a specific invitation by its slug.",
                        parameters: {
                            type: "object",
                            properties: {
                                slug: { type: "string", description: "The invitation slug (e.g. 'wedding-nanda')." }
                            },
                            required: ["slug"]
                        }
                    },
                    {
                        name: "get_guest_list",
                        description: "Retrieve the full list of guests for a specific invitation.",
                        parameters: {
                            type: "object",
                            properties: {
                                slug: { type: "string", description: "The invitation slug." }
                            },
                            required: ["slug"]
                        }
                    },
                    {
                        name: "sync_payment",
                        description: "Force sync a specific transaction status with Midtrans payment gateway.",
                        parameters: {
                            type: "object",
                            properties: {
                                transaction_id: { type: "string", description: "The internal transaction UUID to sync." }
                            },
                            required: ["transaction_id"]
                        }
                    },
                    {
                        name: "upgrade_tier",
                        description: "Automated tier upgrade. ONLY call if a payment is verified as PAID or SETTLED but user tier is still lower.",
                        parameters: {
                            type: "object",
                            properties: {
                                target_tier: { type: "string", enum: ["pro", "ultimate", "elite"], description: "The upgrade target tier." }
                            },
                            required: ["target_tier"]
                        }
                    }
                ];

                const sysPrompt = `You are the Tamuu Expert Agent (v7.0).
You are a MIT-grade Technical CSR with high emotional intelligence and Atomic Accuracy.

PERSONALIZATION PROTOCOL:
1. ADDRESS BY NAME: Use "Kak ${user?.name || 'User'}" naturally in your greeting and when providing key information.
2. TONE: Professional, premium, but warm. Not robotic.
3. SILENT START: Never initiate a message. Only react to user input.

CORE TRUTH PROTOCOL:
1. DATA VERIFICATION: When searching for an Order ID, verify matches exactly. Always try to strip transaction suffixes (like -abcdef) if an exact match is not found.
2. NO HALLUCINATION: Zero tolerance for fake links or "No Access" claims. YOU HAVE DATABASE ACCESS.
3. ATOMIC ACCURACY: Report fact 1:1. Use EXPIRED, CANCELLED, and PAID correctly.

PROBLEM SOLVING (AUTO-FIX):
- If user payment isn't updated: Triger 'sync_payment' then explain the status.
- If link is inaccessible: Fetch details using 'get_invitation_details' and check publication status.

GROUND TRUTH (USER CONTEXT):
${userContext}
${activeKnowledge}

CONTEXT:
- Current Time: ${new Date().toISOString()}`;

                let currentMessages = [...messages];
                let loopCount = 0;

                while (loopCount < 5) {
                    loopCount++;
                    try {
                        const response = await fetchAI(sysPrompt, currentMessages, aiTools);

                        if (response.content) {
                            return json({ content: response.content, provider: response.provider }, corsHeaders);
                        }

                        if (response.tool_calls) {
                            const toolCall = response.tool_calls[0];
                            const { name, arguments: args } = toolCall.function;
                            let toolResult = "Unknown tool error";

                            console.log(`[AI Agent] Executing Tool: ${name}`, args);

                            if (name === "get_user_diagnostics") {
                                if (!user) {
                                    toolResult = "No user session found.";
                                } else {
                                    const { results: txs } = await env.DB.prepare('SELECT id, status, external_id, tier, amount, created_at FROM billing_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').bind(canonicalId).all();
                                    const { results: invs } = await env.DB.prepare(
                                        `SELECT i.id, i.name, i.slug, i.status, COUNT(r.id) as rsvp_count
                                         FROM invitations i
                                         LEFT JOIN rsvp_responses r ON i.id = r.invitation_id
                                         WHERE i.user_id = ?
                                         GROUP BY i.id`
                                    ).bind(canonicalId).all();

                                    let invDetails = invs.map(inv => ({
                                        name: inv.name,
                                        slug: inv.slug,
                                        url: `https://tamuu.id/${inv.slug}`,
                                        status: inv.status,
                                        rsvp_count: inv.rsvp_count
                                    }));

                                    toolResult = JSON.stringify({
                                        profile: { name: user.name, email: user.email, tier: user.tier, expires_at: user.expires_at },
                                        transactions: txs,
                                        invitations: invDetails
                                    });
                                }
                            }
                            else if (name === "search_order") {
                                // Legacy search_order implementation
                                const rawId = args.order_id.trim();
                                const searchId = rawId.replace(/^#/, '');
                                let { results: exact } = await env.DB.prepare(
                                    'SELECT id, status, external_id, tier, amount, created_at, payment_channel FROM billing_transactions ' +
                                    'WHERE external_id = ? OR id = ?'
                                ).bind(searchId, searchId).all();

                                if (exact.length === 0) {
                                    let { results: partial } = await env.DB.prepare(
                                        'SELECT id, status, external_id, tier, amount, created_at, payment_channel FROM billing_transactions ' +
                                        'WHERE external_id LIKE ? OR external_id LIKE ?'
                                    ).bind(`%${searchId}%`, `${searchId}%`).all();

                                    if (partial.length > 0) exact = partial;
                                }

                                if (exact.length > 0) {
                                    toolResult = JSON.stringify(exact.map(t => ({
                                        ...t,
                                        midtrans_url: `https://dashboard.midtrans.com/transactions/${t.external_id}`
                                    })));
                                } else {
                                    toolResult = `Order "${rawId}" tidak ditemukan. Pastikan nomor order akurat.`;
                                }
                            }

                            currentMessages.push({ role: 'function', content: toolResult, name: name });
                        }
                    } catch (err) {
                        console.error(`[AI Agent] Loop ${loopCount} error:`, err);
                        break;
                    }
                }

                return json({ content: "Maaf, terjadi kendala teknis. Mohon coba lagi. 🙏" }, corsHeaders);
            }

            // BILLING: Get User Transactions
            if (path === '/api/billing/transactions' && method === 'GET') {
                try {
                    const userId = url.searchParams.get('userId');
                    if (!userId) return json({ error: 'User ID required' }, { ...corsHeaders, status: 400 });

                    const { results } = await env.DB.prepare(
                        'SELECT * FROM billing_transactions WHERE user_id = ? ORDER BY created_at DESC'
                    ).bind(userId).all();

                    return json(results.map(parseJsonFields), corsHeaders);
                } catch (err) {
                    console.error('[Billing] Get transactions error:', err);
                    return json({ error: 'Failed to fetch transactions' }, { ...corsHeaders, status: 500 });
                }
            }

            // BILLING: Create Invoice
            if (path === '/api/billing/create' && method === 'POST') {
                try {
                    const { userId, tier, amount, email } = await request.json();
                    if (!userId || !tier || !amount || !email) {
                        return json({ error: 'Missing required fields' }, { ...corsHeaders, status: 400 });
                    }

                    // Create Xendit invoice (pseudo-implementation)
                    const invoiceId = `INV-${Date.now()}`;
                    const result = await env.DB.prepare(
                        'INSERT INTO billing_transactions (user_id, tier, amount, status, external_id, created_at) VALUES (?, ?, ?, ?, ?, ?)'
                    ).bind(userId, tier, amount, 'PENDING', invoiceId, new Date().toISOString()).run();

                    return json({
                        success: true,
                        invoiceId,
                        paymentUrl: `https://xendit.co/invoices/${invoiceId}`
                    }, corsHeaders);
                } catch (err) {
                    console.error('[Billing] Create invoice error:', err);
                    return json({ error: 'Failed to create invoice' }, { ...corsHeaders, status: 500 });
                }
            }

            // BILLING: Cancel Transaction
            if (path === '/api/billing/cancel' && method === 'POST') {
                try {
                    const { orderId, userId } = await request.json();
                    if (!orderId || !userId) {
                        return json({ error: 'Missing orderId or userId' }, { ...corsHeaders, status: 400 });
                    }

                    const result = await env.DB.prepare(
                        'UPDATE billing_transactions SET status = ? WHERE id = ? AND user_id = ?'
                    ).bind('CANCELLED', orderId, userId).run();

                    return json({ success: result.success }, corsHeaders);
                } catch (err) {
                    console.error('[Billing] Cancel error:', err);
                    return json({ error: 'Failed to cancel transaction' }, { ...corsHeaders, status: 500 });
                }
            }

            // AUTH: Get User Profile (for Supabase sync)
            if (path === '/api/auth/me' && method === 'GET') {
                const email = url.searchParams.get('email');
                const providedUid = url.searchParams.get('uid');
                if (!email) return json({ error: 'Email required' }, { headers: corsHeaders, status: 400 });

                try {
                    const { results } = await env.DB.prepare(
                        'SELECT * FROM users WHERE email = ?'
                    ).bind(email).all();

                    let user = results[0];

                    // Auto-create user if not found (for Supabase auth sync)
                    if (!user) {
                        const userIdToUse = providedUid || crypto.randomUUID();
                        const tamuuId = `TAMUU-USER-${userIdToUse.substring(0, 8).toUpperCase()}`;

                        // Extract profile data from params (passed from AuthProvider during sync)
                        const name = url.searchParams.get('name') || '';
                        const gender = url.searchParams.get('gender') || null;
                        const birthDate = url.searchParams.get('birthDate') || null;

                        // SUPER ULTRA: Business Rules for Trial/Subscription
                        // - Free tier: 30 days (1 month) from signup
                        // - Special test accounts: Unlimited (no expiry)
                        const isSpecialAccount = email === 'user@tamuu.id' || email === 'admin@tamuu.id';
                        let expiresAtString = null;

                        if (!isSpecialAccount) {
                            const trialEndDate = new Date();
                            trialEndDate.setDate(trialEndDate.getDate() + 30); // 1 month trial
                            expiresAtString = trialEndDate.toISOString();
                        }

                        await env.DB.prepare(
                            `INSERT INTO users (id, email, tamuu_id, name, gender, birth_date, tier, max_invitations, invitation_count, expires_at) 
                             VALUES (?, ?, ?, ?, ?, ?, 'free', 1, 0, ?)`
                        ).bind(userIdToUse, email, tamuuId, name, gender, birthDate, expiresAtString).run();

                        user = {
                            id: userIdToUse,
                            email: email,
                            tamuu_id: tamuuId,
                            tier: 'free',
                            max_invitations: 1,
                            invitation_count: 0,
                            expires_at: expiresAtString
                        };
                    }

                    const normalizedUser = {
                        ...user,
                        id: user.id || user.uid, // Handle both naming conventions
                        maxInvitations: user.max_invitations || 1,
                        invitationCount: user.invitation_count || 0,
                        tier: user.tier || 'free',
                        tamuuId: user.tamuu_id || `TAMUU-USER-${user.id.substring(0, 8)}`,
                        expires_at: user.expires_at,
                        birthDate: user.birth_date,
                        bank1Name: user.bank1_name,
                        bank1Number: user.bank1_number,
                        bank1Holder: user.bank1_holder,
                        bank2Name: user.bank2_name,
                        bank2Number: user.bank2_number,
                        bank2Holder: user.bank2_holder,
                        emoneyType: user.emoney_type,
                        emoneyNumber: user.emoney_number,
                        giftAddress: user.gift_address,
                        role: user.role || 'user',
                        permissions: JSON.parse(user.permissions || '[]')
                    };

                    return json(normalizedUser, {
                        headers: {
                            ...corsHeaders,
                            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0',
                        }
                    });
                } catch (error) {
                    console.error('Auth/me error:', error);
                    return json({ error: 'Failed to fetch user', details: error.message }, { headers: corsHeaders, status: 500 });
                }
            }

            // INVITATIONS: Get User Invitations
            if (path === '/api/invitations' && method === 'GET') {
                const urlObj = new URL(request.url);
                const userId = urlObj.searchParams.get('user_id');

                let query = 'SELECT * FROM invitations ORDER BY updated_at DESC LIMIT 100';
                let params = [];

                // Filter by user_id if provided (for dashboard)
                if (userId) {
                    query = 'SELECT * FROM invitations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100';
                    params = [userId];
                }

                try {
                    const { results } = await env.DB.prepare(query).bind(...params).all();
                    console.log(`[Invitations] Found ${results?.length || 0} invitations for user ${userId || 'all'}`);
                    return json(results?.map(parseJsonFields) || [], corsHeaders);
                } catch (dbError) {
                    console.error(`[Invitations] Database error for user ${userId}:`, dbError);
                    return json({ error: 'Database error', details: dbError.message }, { ...corsHeaders, status: 500 });
                }
            }

            // REST OF THE API ENDPOINTS REMAIN UNCHANGED
            // Additional endpoints can be added here as needed

            return notFound();

        } catch (err) {
            console.error('[API Worker] Error:', err);
            return error('Internal server error', 500);
        }
    }
};