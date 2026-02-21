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

        // HELPER: Hybrid AI (Gemini 2.0 -> Groq Fallback)
        const fetchAI = async (sysPrompt, userMsgs, tools = null) => {
            const providers = [
                {
                    name: 'Gemini',
                    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`,
                    type: 'google'
                }
            ];

            for (const provider of providers) {
                try {
                    // Gemini is the only model supported for tools right now
                    if (provider.name === 'Gemini' && !env.GEMINI_API_KEY) {
                        console.warn("[AI] Gemini API Key missing, skipping to fallback.");
                        continue;
                    }

                    let response;
                    if (provider.type === 'google') {
                        const body = {
                            system_instruction: { parts: [{ text: sysPrompt }] },
                            contents: (userMsgs || []).map(m => ({
                                role: m.role === 'assistant' ? 'model' : (m.role === 'tool' ? 'function' : 'user'),
                                parts: m.tool_calls
                                    ? m.tool_calls.map(tc => ({ functionCall: { name: tc.function.name, args: tc.function.arguments } }))
                                    : (m.role === 'tool'
                                        ? [{ functionResponse: { name: m.name, response: { content: m.content } } }]
                                        : [{ text: m.content || "" }])
                            }))
                        };

                        if (tools) body.tools = [{ function_declarations: tools }];

                        response = await fetch(provider.url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        });

                        const data = await response.json();
                        if (response.status === 429 || response.status === 400 || response.status === 401) {
                            console.warn(`[AI] ${provider.name} error (${response.status}), falling back...`);
                            continue;
                        }
                        if (data.error) {
                            console.error(`[AI] ${provider.name} data error:`, data.error.message);
                            continue;
                        }

                        const candidate = data.candidates?.[0];
                        const parts = candidate?.content?.parts || [];
                        let toolCalls = [];
                        let textContent = "";

                        for (const p of parts) {
                            if (p.functionCall) {
                                toolCalls.push({
                                    id: `call_${Math.random().toString(36).substring(2, 11)}`,
                                    type: 'function',
                                    function: { name: p.functionCall.name, arguments: p.functionCall.args }
                                });
                            }
                            if (p.text) textContent += p.text;
                        }

                        if (toolCalls.length > 0) return { role: 'assistant', tool_calls: toolCalls, provider: provider.name };
                        if (textContent.trim()) return { content: textContent.trim(), provider: provider.name };
                    } else if (provider.type === 'openai') {
                        // Fallback provider (Groq) - Tell it that tools are unavailable to prevent hallucination
                        const fallbackPrompt = `${sysPrompt}\n\n[SISTEM]: Saat ini sistem pendukung (tools) sedang sibuk. Jawablah berdasarkan KNOWLEDGE dan USER CONTEXT yang tersedia saja. Jangan klaim tidak memiliki akses, cukup katakan data spesifik tersebut tidak ditemukan atau sistem sedang sibuk.`;

                        response = await fetch(provider.url, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${provider.key}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                model: 'llama-3.3-70b-versatile',
                                messages: [
                                    { role: 'system', content: fallbackPrompt },
                                    ...(userMsgs || []).filter(m => m.role !== 'tool').map(m => ({
                                        role: m.role || 'user',
                                        content: m.content || ""
                                    }))
                                ]
                            })
                        });
                        const data = await response.json();
                        if (response.status === 429) continue;
                        if (data.error) throw new Error(data.error.message);
                        const text = data.choices?.[0]?.message?.content;
                        if (text) return { content: text, provider: provider.name };
                    }
                } catch (err) {
                    console.error(`Provider ${provider.name} failed:`, err);
                    if (provider === providers[providers.length - 1]) throw err;
                }
            }
            throw new Error("Trafik AI sedang padat sekali.");
        };

        // HELPER: Sync Midtrans Status with DB (Common Logic)
        const syncMidtransStatus = async (transactionId) => {
            const transaction = await env.DB.prepare('SELECT * FROM billing_transactions WHERE id = ?').bind(transactionId).first();
            if (!transaction) return { success: false, error: 'transaction_not_found' };

            const orderId = transaction.external_id;
            const isSandbox = orderId.includes('sandbox') || env.MIDTRANS_SERVER_KEY.startsWith('SB-');
            const baseUrl = isSandbox ? 'https://api.sandbox.midtrans.com/v2' : 'https://api.midtrans.com/v2';
            const authHeader = `Basic ${btoa(env.MIDTRANS_SERVER_KEY + ':')}`;

            const res = await fetch(`${baseUrl}/${orderId}/status`, { headers: { 'Authorization': authHeader, 'Accept': 'application/json' } });

            if (!res.ok) {
                if (res.status === 404) return { success: false, error: 'midtrans_404', message: 'Not found in Midtrans' };
                return { success: false, error: 'midtrans_error', details: await res.json() };
            }

            const data = await res.json();
            const status = data.transaction_status;
            const paymentType = data.payment_type;

            let newStatus = transaction.status;
            if (status === 'settlement' || status === 'capture') newStatus = 'PAID';
            else if (status === 'pending') newStatus = 'PENDING';
            else if (status === 'expire') newStatus = 'EXPIRED';
            else if (status === 'cancel' || status === 'deny') newStatus = 'CANCELLED';

            if (newStatus !== transaction.status) {
                await env.DB.prepare('UPDATE billing_transactions SET status = ?, payment_channel = ?, updated_at = datetime("now") WHERE id = ?').bind(newStatus, paymentType || transaction.payment_channel, transactionId).run();

                if (newStatus === 'PAID') {
                    const userId = transaction.user_id;
                    const tier = transaction.tier;
                    let maxInvitations = tier === 'elite' ? 3 : (tier === 'ultimate' ? 2 : 1);
                    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

                    await env.DB.prepare('UPDATE users SET tier = ?, max_invitations = ?, expires_at = ?, updated_at = datetime("now") WHERE id = ?').bind(tier, maxInvitations, expiresAt, userId).run();
                    await env.DB.prepare('UPDATE billing_transactions SET paid_at = datetime("now") WHERE id = ?').bind(transactionId).run();
                }
            }

            return { success: true, status: newStatus, midtrans_status: status, updated: newStatus !== transaction.status };
        };

        try {
            // ============================================
            // AI CHAT ENDPOINTS (System v8.0)
            // ============================================

            // ENHANCED: AI Chat Support v8.0 - Enterprise Grade
            if ((path === '/api/chat' || path === '/api/enhanced-chat') && method === 'POST') {
                return await handleEnhancedChat(request, env, ctx, corsHeaders);
            }

            // ADMIN: AI Chat Support (Enterprise v8.0 - Enhanced)
            if (path === '/api/admin/chat' && method === 'POST') {
                try {
                    const { messages, userId, aiPersonality = 'professional', enableQuickActions = true, enableSettings = true } = await request.json();

                    if (!userId || !messages || !Array.isArray(messages) || messages.length === 0) {
                        return json({ success: false, error: { code: 'INVALID_REQUEST', message: 'userId dan messages diperlukan' } }, { ...corsHeaders, status: 400 });
                    }

                    if (!env.GEMINI_API_KEY) {
                        return json({ success: false, error: { code: 'API_NOT_CONFIGURED', message: 'Gemini API Key tidak dikonfigurasi' } }, { ...corsHeaders, status: 500 });
                    }

                    const adminChatHandler = createAdminChatHandler(env);
                    const latestMessage = messages[messages.length - 1];
                    const messageContent = typeof latestMessage === 'string' ? latestMessage : latestMessage.content;

                    const result = await adminChatHandler.processAdminMessage(userId, messageContent, {
                        aiPersonality, enableQuickActions, enableSettings, conversationHistory: messages.slice(-10)
                    });

                    return json(result, corsHeaders);
                } catch (error) {
                    console.error('Admin Chat v8.0 Error:', error);
                    return json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada sistem AI.' } }, { ...corsHeaders, status: 500 });
                }
            }

            // ADMIN: Health Check for AI System v8.0
            if (path === '/api/admin/health' && method === 'GET') {
                try {
                    const adminChatHandler = createAdminChatHandler(env);
                    const healthStatus = await adminChatHandler.healthCheck();
                    return json({ success: true, service: 'tamuu-admin-ai-v8', status: healthStatus.status, timestamp: healthStatus.timestamp }, corsHeaders);
                } catch (error) {
                    return json({ success: false, status: 'error', error: error.message }, { ...corsHeaders, status: 503 });
                }
            }

            // ============================================
            // AUTH & USER ENDPOINTS
            // ============================================
            if (path === '/api/auth/me' && method === 'GET') {
                const email = url.searchParams.get('email');
                const providedUid = url.searchParams.get('uid');
                if (!email) return json({ error: 'Email required' }, { headers: corsHeaders, status: 400 });

                try {
                    const { results } = await env.DB.prepare(
                        'SELECT * FROM users WHERE email = ?'
                    ).bind(email).all();

                    let user = results[0];

                    // PROACTIVE SILENT HEALING: Check for pending transactions if user exists
                    if (user && env.MIDTRANS_SERVER_KEY) {
                        ctx.waitUntil((async () => {
                            try {
                                const pendingTx = await env.DB.prepare(
                                    'SELECT id FROM billing_transactions WHERE user_id = ? AND status = ? LIMIT 1'
                                ).bind(user.id, 'PENDING').first();

                                if (pendingTx) {
                                    console.log(`[Silent Heal] Running sync for User ${user.id}...`);
                                    await syncMidtransStatus(pendingTx.id);
                                }
                            } catch (healError) {
                                console.error('[Silent Heal] Failed:', healError);
                            }
                        })());
                    }

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
                        giftRecipient: user.gift_recipient,
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

            if (path === '/api/user/profile' && method === 'PATCH') {
                const body = await request.json();
                const {
                    id, name, phone, gender, birthDate,
                    bank1Name, bank1Number, bank1Holder,
                    bank2Name, bank2Number, bank2Holder,
                    emoneyType, emoneyNumber, giftRecipient, giftAddress
                } = body;

                if (!id) return json({ error: 'User ID required' }, { ...corsHeaders, status: 400 });

                await env.DB.prepare(`
                    UPDATE users SET 
                        name = COALESCE(?, name),
                        phone = COALESCE(?, phone),
                        gender = COALESCE(?, gender),
                        birth_date = COALESCE(?, birth_date),
                        bank1_name = COALESCE(?, bank1_name),
                        bank1_number = COALESCE(?, bank1_number),
                        bank1_holder = COALESCE(?, bank1_holder),
                        bank2_name = COALESCE(?, bank2_name),
                        bank2_number = COALESCE(?, bank2_number),
                        bank2_holder = COALESCE(?, bank2_holder),
                        emoney_type = COALESCE(?, emoney_type),
                        emoney_number = COALESCE(?, emoney_number),
                        gift_recipient = COALESCE(?, gift_recipient),
                        gift_address = COALESCE(?, gift_address),
                        updated_at = datetime('now')
                    WHERE id = ?
                `).bind(
                    name ?? null, phone ?? null, gender ?? null, birthDate ?? null,
                    bank1Name ?? null, bank1Number ?? null, bank1Holder ?? null,
                    bank2Name ?? null, bank2Number ?? null, bank2Holder ?? null,
                    emoneyType ?? null, emoneyNumber ?? null, giftRecipient ?? null, giftAddress ?? null,
                    id
                ).run();

                return json({ success: true }, corsHeaders);
            }

            // ============================================
            // MIDTRANS PAYMENT ENDPOINTS
            // ============================================
            if (path === '/api/billing/midtrans/token' && method === 'POST') {
                try {
                    const body = await request.json();
                    let { userId, tier, amount, email, name } = body;

                    // Legacy Mapping
                    if (tier === 'vip') tier = 'pro';
                    if (tier === 'platinum') tier = 'ultimate';
                    if (tier === 'vvip') tier = 'elite';

                    if (!userId || !tier || !amount) {
                        return json({ error: 'Missing required fields' }, { ...corsHeaders, status: 400 });
                    }

                    // Server-side Pricing Safeguard
                    const pricing = { 'pro': 99000, 'ultimate': 149000, 'elite': 199000 };
                    const expectedPrice = pricing[tier];
                    if (expectedPrice && amount !== expectedPrice) {
                        console.warn(`[Billing] Price mismatch detected for ${tier}. Expected ${expectedPrice}, got ${amount}. Overriding.`);
                        amount = expectedPrice;
                    }

                    // BLOCKING LOGIC: Check for existing PENDING transaction
                    try {
                        const { results: pendingResults } = await env.DB.prepare(
                            'SELECT * FROM billing_transactions WHERE user_id = ? AND status = ?'
                        ).bind(userId, 'PENDING').all();

                        if (pendingResults && pendingResults.length > 0) {
                            console.log(`[Billing] User ${userId} has ${pendingResults.length} pending transactions. Auto-cancelling for new session.`);
                            await env.DB.prepare(
                                'UPDATE billing_transactions SET status = ? WHERE user_id = ? AND status = ?'
                            ).bind('CANCELLED', userId, 'PENDING').run();
                        }
                    } catch (dbErr) {
                        console.error('DB Error checking pending:', dbErr);
                    }

                    if (!env.MIDTRANS_SERVER_KEY) {
                        return json({ error: 'Midtrans Server Key is not configured in worker environment' }, { ...corsHeaders, status: 500 });
                    }

                    const orderId = `order-${Date.now()}-${userId.substring(0, 8)}`;
                    const authHeader = `Basic ${btoa(env.MIDTRANS_SERVER_KEY + ':')}`;

                    const midtransResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
                        method: 'POST',
                        headers: {
                            'Authorization': authHeader,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            transaction_details: {
                                order_id: orderId,
                                gross_amount: amount
                            },
                            item_details: [{
                                id: tier,
                                price: amount,
                                quantity: 1,
                                name: `Tamuu ${tier.toUpperCase()} Subscription`
                            }],
                            customer_details: {
                                first_name: name || 'User',
                                email: email
                            },
                            enabled_payments: [
                                "bni_va", "cimb_va", "shopeepay", "permata_va",
                                "bri_va", "qris", "bsi_va", "gopay", "echannel", "dana"
                            ],
                            credit_card: {
                                secure: true
                            }
                        })
                    });

                    const data = await midtransResponse.json();

                    if (!midtransResponse.ok) {
                        console.error('Midtrans API Error:', data);
                        return json({
                            error: 'Midtrans API rejected the request',
                            details: data.error_messages || data.message || data
                        }, { ...corsHeaders, status: midtransResponse.status });
                    }

                    if (data.token) {
                        try {
                            // Log transaction in DB
                            await env.DB.prepare(
                                `INSERT INTO billing_transactions (user_id, external_id, amount, status, tier, payment_method, payment_url) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?)`
                            ).bind(userId, orderId, amount, 'PENDING', tier, 'MIDTRANS', data.redirect_url).run();
                            console.log(`[Billing/Token] Transaction logged successfully: ${orderId}`);
                        } catch (dbError) {
                            console.error('[Billing/Token] CRITICAL: Database Error logging transaction:', dbError);
                            // Return the token WITH a warning so frontend knows there's an issue
                            return json({
                                ...data,
                                warning: 'Transaction created but DB logging failed. Please contact support if issues persist.',
                                orderId: orderId
                            }, corsHeaders);
                        }
                    }

                    return json({ ...data, orderId: orderId }, corsHeaders);
                } catch (err) {
                    console.error('Server Side Error:', err);
                    return json({
                        error: 'Failed to generate payment session',
                        details: err.message
                    }, { ...corsHeaders, status: 500 });
                }
            }

            if (path === '/api/billing/midtrans/cancel' && method === 'POST') {
                const { orderId, userId } = await request.json();

                if (!orderId || !userId) {
                    return json({ error: 'Missing orderId or userId' }, { ...corsHeaders, status: 400 });
                }

                try {
                    console.log(`[Billing/Cancel] Request received for OrderID: ${orderId}, UserID: ${userId}`);

                    // First, check if transaction exists and its current status
                    const existingTx = await env.DB.prepare(
                        'SELECT status FROM billing_transactions WHERE external_id = ? AND user_id = ?'
                    ).bind(orderId, userId).first();

                    console.log(`[Billing/Cancel] Existing transaction:`, JSON.stringify(existingTx));

                    if (!existingTx) {
                        console.warn(`[Billing/Cancel] Transaction not found in DB: ${orderId}`);
                        return json({
                            error: 'Transaction not found. It may not have been recorded properly.',
                            code: 'NOT_FOUND'
                        }, { ...corsHeaders, status: 404 });
                    }

                    if (existingTx.status === 'PAID') {
                        return json({
                            error: 'Cannot cancel a paid transaction',
                            code: 'ALREADY_PAID'
                        }, { ...corsHeaders, status: 400 });
                    }

                    if (existingTx.status === 'CANCELLED') {
                        console.log(`[Billing/Cancel] Transaction already cancelled: ${orderId}`);
                        return json({
                            success: true,
                            message: 'Transaction was already cancelled',
                            alreadyCancelled: true
                        }, corsHeaders);
                    }

                    // Update status to CANCELLED (works for PENDING or EXPIRED)
                    const result = await env.DB.prepare(
                        'UPDATE billing_transactions SET status = ?, updated_at = datetime("now") WHERE external_id = ? AND user_id = ?'
                    ).bind('CANCELLED', orderId, userId).run();

                    console.log(`[Billing/Cancel] DB Update Result:`, JSON.stringify(result));

                    if (result.meta?.changes === 0) {
                        console.error(`[Billing/Cancel] Update failed unexpectedly for: ${orderId}`);
                        return json({ error: 'Failed to update transaction status' }, { ...corsHeaders, status: 500 });
                    }

                    console.log(`[Billing/Cancel] Successfully cancelled order: ${orderId}`);
                    return json({ success: true, message: 'Pesanan berhasil dibatalkan' }, corsHeaders);
                } catch (err) {
                    console.error('[Billing/Cancel] Error:', err);
                    return json({ error: 'Internal server error during cancellation', details: err.message }, { ...corsHeaders, status: 500 });
                }
            }

            if (path === '/api/billing/midtrans/webhook' && method === 'POST') {
                const body = await request.json();
                const {
                    transaction_status,
                    order_id,
                    status_code,
                    gross_amount,
                    signature_key,
                    payment_type
                } = body;

                // Verify Signature using SHA-512
                const payload = order_id + status_code + gross_amount + env.MIDTRANS_SERVER_KEY;
                const msgUint8 = new TextEncoder().encode(payload);
                const hashBuffer = await crypto.subtle.digest('SHA-512', msgUint8);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashedPayload = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                if (hashedPayload !== signature_key) {
                    return json({ error: 'Invalid signature' }, { ...corsHeaders, status: 403 });
                }

                // Handle status
                if (transaction_status === 'settlement' || transaction_status === 'capture') {
                    // Find transaction to get full data
                    const transaction = await env.DB.prepare(
                        'SELECT * FROM billing_transactions WHERE external_id = ?'
                    ).bind(order_id).first();

                    if (transaction && transaction.status !== 'PAID') {
                        const userId = transaction.user_id;
                        const tier = transaction.tier;
                        let maxInvitations = 1;
                        if (tier === 'elite') maxInvitations = 3;
                        else if (tier === 'ultimate') maxInvitations = 2;

                        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

                        // 1. Update Transaction
                        await env.DB.prepare(
                            'UPDATE billing_transactions SET status = ?, paid_at = datetime("now"), payment_channel = ? WHERE external_id = ?'
                        ).bind('PAID', payment_type || 'midtrans', order_id).run();

                        // 2. Provision User
                        await env.DB.prepare(
                            'UPDATE users SET tier = ?, max_invitations = ?, expires_at = ?, updated_at = datetime("now") WHERE id = ?'
                        ).bind(tier, maxInvitations, expiresAt, userId).run();
                    }
                } else if (transaction_status === 'expire') {
                    // IMPORTANT: Don't overwrite CANCELLED status with EXPIRED
                    // Check current status first
                    const existingTx = await env.DB.prepare(
                        'SELECT status FROM billing_transactions WHERE external_id = ?'
                    ).bind(order_id).first();

                    if (existingTx && existingTx.status !== 'CANCELLED' && existingTx.status !== 'PAID') {
                        await env.DB.prepare(
                            'UPDATE billing_transactions SET status = ?, updated_at = datetime("now") WHERE external_id = ?'
                        ).bind('EXPIRED', order_id).run();
                        console.log(`[Webhook] Transaction ${order_id} expired`);
                    } else {
                        console.log(`[Webhook] Skipping expire for ${order_id}, current status: ${existingTx?.status}`);
                    }
                } else if (transaction_status === 'cancel' || transaction_status === 'deny') {

                    await env.DB.prepare(
                        'UPDATE billing_transactions SET status = ?, updated_at = datetime("now") WHERE external_id = ?'
                    ).bind('CANCELLED', order_id).run();
                }

                return json({ success: true }, corsHeaders);
            }

            if (path === '/api/billing/webhook' && method === 'POST') {
                const body = await request.json();
                const { status, id, metadata } = body;

                if (status === 'PAID') {
                    const userId = metadata.userId;
                    const tier = metadata.tier;
                    let maxInvitations = 1;
                    if (tier === 'elite') maxInvitations = 3;
                    else if (tier === 'ultimate') maxInvitations = 2;

                    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

                    // 1. Update Transaction
                    await env.DB.prepare(
                        'UPDATE billing_transactions SET status = ?, paid_at = datetime("now"), payment_method = ?, payment_channel = ? WHERE external_id = ?'
                    ).bind('PAID', body.payment_method ?? null, body.payment_channel ?? null, id).run();

                    // 2. Provision User
                    await env.DB.prepare(
                        'UPDATE users SET tier = ?, max_invitations = ?, expires_at = ?, updated_at = datetime("now") WHERE id = ?'
                    ).bind(tier, maxInvitations, expiresAt, userId).run();
                }

                return json({ success: true }, corsHeaders);
            }

            if (path === '/api/billing/transactions' && method === 'GET') {
                const userId = url.searchParams.get('userId');
                if (!userId) return json({ error: 'User ID required' }, { ...corsHeaders, status: 400 });

                try {
                    const { results } = await env.DB.prepare(
                        'SELECT * FROM billing_transactions WHERE user_id = ? ORDER BY created_at DESC'
                    ).bind(userId).all();

                    console.log(`[Billing] Found ${results?.length || 0} transactions for user ${userId}`);
                    return json(results || [], corsHeaders);
                } catch (dbError) {
                    console.error(`[Billing] Database error for user ${userId}:`, dbError);
                    return json({ error: 'Database error', details: dbError.message }, { ...corsHeaders, status: 500 });
                }
            }

            if (path === '/api/admin/stats' && method === 'GET') {
                const search = url.searchParams.get('search') || '';
                const filter = url.searchParams.get('filter') || 'all';

                // In a real app, verify admin role from session/token
                const [usersCount, templatesCount, invitationsCount, displaysCount, rsvpCount] = await Promise.all([
                    env.DB.prepare('SELECT COUNT(*) as count FROM users').first('count'),
                    env.DB.prepare("SELECT COUNT(*) as count FROM templates WHERE type = 'invitation'").first('count'),
                    env.DB.prepare('SELECT COUNT(*) as count FROM invitations').first('count'),
                    env.DB.prepare("SELECT COUNT(*) as count FROM templates WHERE type = 'display'").first('count'),
                    env.DB.prepare('SELECT COUNT(*) as count FROM rsvp_responses').first('count')
                ]);

                // Real Recent Activity with Search & Filter
                const searchQuery = `%${search}%`;
                const { results: recentActivity } = await env.DB.prepare(`
                    SELECT * FROM (
                        SELECT 'user' as type, COALESCE(name, email) as user, id as user_id, id as target_id, 'Joined Tamuu' as action, created_at as time FROM users
                        UNION ALL
                        SELECT 'invitation' as type, COALESCE(u.name, u.email, 'Unknown') as user, i.user_id, i.id as target_id, 'Created new invitation: ' || i.name as action, i.created_at as time 
                        FROM invitations i LEFT JOIN users u ON i.user_id = u.id
                        UNION ALL
                        SELECT 'rsvp' as type, r.name as user, i.user_id, r.invitation_id as target_id, 'Submitted RSVP for ' || COALESCE(i.name, 'invitation') as action, r.submitted_at as time 
                        FROM rsvp_responses r LEFT JOIN invitations i ON r.invitation_id = i.id
                    ) 
                    WHERE (user LIKE ? OR action LIKE ?)
                    AND (? = 'all' OR type = ?)
                    ORDER BY time DESC LIMIT 20
                `).bind(searchQuery, searchQuery, filter, filter).all();

                return json({
                    totalUsers: usersCount,
                    totalInvitations: invitationsCount,
                    totalTemplates: templatesCount,
                    totalDisplays: displaysCount,
                    totalRsvps: rsvpCount,
                    recentActivity,
                    systemHealth: {
                        db: 'Healthy',
                        r2: 'Healthy',
                        uptime: '99.9%'
                    }
                }, corsHeaders);
            }

            // ADMIN: Update User Subscription (expires_at)
            if (path.startsWith('/api/admin/users/') && path.endsWith('/subscription') && method === 'PUT') {
                const userId = path.split('/')[4];
                const { expires_at, tier, max_invitations } = await request.json();

                // Build dynamic update query
                const updates = [];
                const values = [];

                if (expires_at !== undefined) {
                    updates.push('expires_at = ?');
                    values.push(expires_at); // Can be null for unlimited
                }
                if (tier) {
                    updates.push('tier = ?');
                    values.push(tier);
                }
                if (max_invitations !== undefined) {
                    updates.push('max_invitations = ?');
                    values.push(max_invitations);
                }

                if (updates.length === 0) {
                    return json({ error: 'No fields to update' }, { ...corsHeaders, status: 400 });
                }

                updates.push('updated_at = datetime("now")');
                values.push(userId);

                await env.DB.prepare(
                    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
                ).bind(...values).run();

                // Fetch and return updated user
                const updatedUser = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();

                // Format permissions for response
                if (updatedUser) {
                    updatedUser.permissions = JSON.parse(updatedUser.permissions || '[]');
                }

                return json({
                    success: true,
                    message: 'User subscription updated',
                    user: updatedUser
                }, corsHeaders);
            }

            // ADMIN: Create New Account (Manual)
            if (path === '/api/admin/users' && method === 'POST') {
                const { email, name, gender, birthDate, role, tier, permissions, expires_at, max_invitations, uid } = await request.json();

                if (!email) return json({ error: 'Email required' }, { ...corsHeaders, status: 400 });

                // Check for existing
                const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
                if (existing) return json({ success: true, user: existing }); // If exists, return it (to avoid race conditions)

                const id = uid || crypto.randomUUID();
                const tamuuId = `TAMUU-USER-${id.substring(0, 8).toUpperCase()}`;

                await env.DB.prepare(
                    `INSERT INTO users (id, email, tamuu_id, name, gender, birth_date, role, tier, permissions, expires_at, max_invitations, invitation_count) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
                ).bind(
                    id, email, tamuuId, name || '', gender || null, birthDate || null,
                    role || 'user', tier || 'free',
                    JSON.stringify(permissions || []),
                    expires_at || null,
                    max_invitations || 1
                ).run();

                const newUser = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
                if (newUser) newUser.permissions = JSON.parse(newUser.permissions || '[]');

                return json({ success: true, user: newUser }, corsHeaders);
            }

            // ============================================
            // SHOP ECOSYSTEM (TAMUU NEXUS)
            // ============================================

            // 1. Merchant Onboarding (Escalate User -> Merchant)
            if (path === '/api/shop/merchant/onboard' && method === 'POST') {
                try {
                    const body = await request.json();
                    const { user_id, nama_toko, slug, category_id, deskripsi } = body;

                    if (!user_id || !nama_toko || !slug || !category_id) {
                        return json({ error: 'Missing required fields' }, { ...corsHeaders, status: 400 });
                    }

                    // Strict slug validation (only lowercase letters, numbers, hyphens)
                    const validSlug = /^[a-z0-9-]+$/.test(slug);
                    if (!validSlug) {
                        return json({ error: 'Format custom URL (slug) tidak valid.' }, { ...corsHeaders, status: 400 });
                    }

                    // Check if slug is already taken globally
                    const existingSlug = await env.DB.prepare('SELECT id FROM shop_merchants WHERE slug = ?').bind(slug).first();
                    if (existingSlug) {
                        return json({ error: 'URL Toko sudah digunakan oleh merchant lain.' }, { ...corsHeaders, status: 409 });
                    }

                    // Check if user is already a merchant
                    const existingMerchant = await env.DB.prepare('SELECT id FROM shop_merchants WHERE user_id = ?').bind(user_id).first();
                    if (existingMerchant) {
                        return json({ error: 'User ini sudah memiliki toko.' }, { ...corsHeaders, status: 409 });
                    }

                    const merchantId = crypto.randomUUID();

                    // Insert Merchant Profile
                    await env.DB.prepare(
                        `INSERT INTO shop_merchants (id, user_id, slug, nama_toko, deskripsi, category_id, is_verified) 
                         VALUES (?, ?, ?, ?, ?, ?, 0)`
                    ).bind(merchantId, user_id, slug, nama_toko, deskripsi || null, category_id).run();

                    // Seed empty Contact profile
                    await env.DB.prepare(
                        `INSERT INTO shop_contacts (merchant_id) VALUES (?)`
                    ).bind(merchantId).run();

                    // Mark user global role as merchant if needed (optional syncing)
                    try {
                        await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind('merchant', user_id).run();
                    } catch (e) { }

                    return json({ success: true, merchantId: merchantId, slug: slug }, corsHeaders);
                } catch (error) {
                    console.error('[Shop] Merchant Onboard Error:', error);
                    return json({ error: 'Gagal membuat toko', details: error.message }, { ...corsHeaders, status: 500 });
                }
            }

            // 2. Fetch User's Specific Merchant Data (For Smart Dashboard)
            if (path === '/api/shop/merchant/me' && method === 'GET') {
                const userId = url.searchParams.get('userId');
                if (!userId) return json({ error: 'User ID required' }, { ...corsHeaders, status: 400 });

                try {
                    const merchant = await env.DB.prepare(
                        'SELECT m.*, c.nama_kategori FROM shop_merchants m LEFT JOIN shop_category c ON m.category_id = c.id WHERE m.user_id = ?'
                    ).bind(userId).first();

                    if (!merchant) {
                        return json({ isMerchant: false }, corsHeaders);
                    }

                    // Fetch associated contacts
                    const contacts = await env.DB.prepare('SELECT * FROM shop_contacts WHERE merchant_id = ?').bind(merchant.id).first();

                    // Light analytics pull for the dashboard card
                    const analytics = await env.DB.prepare(
                        "SELECT COUNT(*) as views FROM shop_analytics WHERE merchant_id = ? AND action_type = 'VIEW_PROFILE'"
                    ).bind(merchant.id).first();

                    return json({
                        isMerchant: true,
                        merchant: merchant,
                        contacts: contacts || {},
                        stats: { views: analytics?.views || 0 }
                    }, corsHeaders);

                } catch (error) {
                    console.error('[Shop] Fetch Merchant Error:', error);
                    return json({ error: 'Failed to fetch merchant data' }, { ...corsHeaders, status: 500 });
                }
            }

            // 3. Update Merchant Settings
            if (path === '/api/shop/merchant/settings' && method === 'PUT') {
                try {
                    const body = await request.json();
                    const {
                        merchant_id,
                        nama_toko,
                        slug,
                        deskripsi_panjang,
                        logo_url,
                        banner_url,
                        whatsapp,
                        instagram,
                        email,
                        alamat
                    } = body;

                    if (!merchant_id) return json({ error: 'Merchant ID required' }, { ...corsHeaders, status: 400 });

                    // Strict slug validation
                    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
                        return json({ error: 'Format custom URL (slug) tidak valid.' }, { ...corsHeaders, status: 400 });
                    }

                    // Check slug uniqueness if changed
                    if (slug) {
                        const existingSlug = await env.DB.prepare('SELECT id FROM shop_merchants WHERE slug = ? AND id != ?').bind(slug, merchant_id).first();
                        if (existingSlug) {
                            return json({ error: 'URL Toko sudah digunakan oleh merchant lain.' }, { ...corsHeaders, status: 409 });
                        }
                    }

                    // 1. Update shop_merchants
                    await env.DB.prepare(`
                        UPDATE shop_merchants 
                        SET nama_toko = COALESCE(?, nama_toko),
                            slug = COALESCE(?, slug),
                            deskripsi_panjang = COALESCE(?, deskripsi_panjang),
                            logo_url = COALESCE(?, logo_url),
                            banner_url = COALESCE(?, banner_url),
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).bind(nama_toko, slug, deskripsi_panjang, logo_url, banner_url, merchant_id).run();

                    // 2. Update shop_contacts (Upsert via REPLACE INTO or UPDATE)
                    // We know they have a row because onboarding seeded it, but we can do an UPDATE.
                    await env.DB.prepare(`
                        UPDATE shop_contacts
                        SET whatsapp = COALESCE(?, whatsapp),
                            instagram = COALESCE(?, instagram),
                            email = COALESCE(?, email),
                            alamat = COALESCE(?, alamat),
                            updated_at = CURRENT_TIMESTAMP
                        WHERE merchant_id = ?
                    `).bind(whatsapp, instagram, email, alamat, merchant_id).run();

                    return json({ success: true, message: 'Settings saved successfully' }, corsHeaders);
                } catch (error) {
                    console.error('[Shop] Update Settings Error:', error);
                    return json({ error: 'Failed to update settings', details: error.message }, { ...corsHeaders, status: 500 });
                }
            }

            // 4. Product Management (CRUD)
            if (path.startsWith('/api/shop/merchant/products')) {
                // GET ALL PRODUCTS
                if (method === 'GET') {
                    const merchantId = url.searchParams.get('merchant_id');
                    if (!merchantId) return json({ error: 'Merchant ID required' }, { ...corsHeaders, status: 400 });

                    try {
                        const products = await env.DB.prepare(
                            'SELECT * FROM shop_products WHERE merchant_id = ? ORDER BY created_at DESC'
                        ).bind(merchantId).all();

                        // Fetch images for all products efficiently
                        const productIds = products.results.map(p => p.id);
                        let images = [];
                        if (productIds.length > 0) {
                            const placeholders = productIds.map(() => '?').join(',');
                            const imagesQuery = `SELECT * FROM shop_product_images WHERE product_id IN (${placeholders}) ORDER BY order_index ASC`;
                            const imagesRes = await env.DB.prepare(imagesQuery).bind(...productIds).all();
                            images = imagesRes.results;
                        }

                        // Attach images to products
                        const productsWithImages = products.results.map(p => ({
                            ...p,
                            images: images.filter(img => img.product_id === p.id)
                        }));

                        return json({ products: productsWithImages }, corsHeaders);
                    } catch (error) {
                        return json({ error: 'Failed to fetch products', details: error.message }, { ...corsHeaders, status: 500 });
                    }
                }

                // POST (CREATE PRODUCT)
                if (method === 'POST') {
                    try {
                        const body = await request.json();
                        const { merchant_id, nama_produk, deskripsi, harga_estimasi, status, images } = body;

                        if (!merchant_id || !nama_produk || !deskripsi) {
                            return json({ error: 'Missing required fields' }, { ...corsHeaders, status: 400 });
                        }

                        const productId = crypto.randomUUID();

                        await env.DB.prepare(`
                            INSERT INTO shop_products (id, merchant_id, nama_produk, deskripsi, harga_estimasi, status)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `).bind(productId, merchant_id, nama_produk, deskripsi, harga_estimasi || null, status || 'DRAFT').run();

                        // Insert images if provided (array of URL strings)
                        if (Array.isArray(images) && images.length > 0) {
                            for (let i = 0; i < images.length; i++) {
                                await env.DB.prepare(`
                                    INSERT INTO shop_product_images (id, product_id, image_url, order_index)
                                    VALUES (?, ?, ?, ?)
                                `).bind(crypto.randomUUID(), productId, images[i], i).run();
                            }
                        }

                        return json({ success: true, productId }, corsHeaders);
                    } catch (error) {
                        return json({ error: 'Failed to create product', details: error.message }, { ...corsHeaders, status: 500 });
                    }
                }

                // PUT (UPDATE PRODUCT)
                if (method === 'PUT') {
                    try {
                        const productId = url.searchParams.get('id');
                        if (!productId) return json({ error: 'Product ID required' }, { ...corsHeaders, status: 400 });

                        const body = await request.json();
                        const { nama_produk, deskripsi, harga_estimasi, status, images } = body;

                        await env.DB.prepare(`
                            UPDATE shop_products 
                            SET nama_produk = COALESCE(?, nama_produk),
                                deskripsi = COALESCE(?, deskripsi),
                                harga_estimasi = COALESCE(?, harga_estimasi),
                                status = COALESCE(?, status),
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        `).bind(nama_produk, deskripsi, harga_estimasi, status, productId).run();

                        // Sync images if provided (delete all and re-insert for simplicity)
                        if (Array.isArray(images)) {
                            await env.DB.prepare('DELETE FROM shop_product_images WHERE product_id = ?').bind(productId).run();
                            for (let i = 0; i < images.length; i++) {
                                await env.DB.prepare(`
                                    INSERT INTO shop_product_images (id, product_id, image_url, order_index)
                                    VALUES (?, ?, ?, ?)
                                `).bind(crypto.randomUUID(), productId, images[i], i).run();
                            }
                        }

                        return json({ success: true }, corsHeaders);
                    } catch (error) {
                        return json({ error: 'Failed to update product', details: error.message }, { ...corsHeaders, status: 500 });
                    }
                }

                // DELETE (DELETE PRODUCT)
                if (method === 'DELETE') {
                    try {
                        const productId = url.searchParams.get('id');
                        if (!productId) return json({ error: 'Product ID required' }, { ...corsHeaders, status: 400 });

                        await env.DB.prepare('DELETE FROM shop_products WHERE id = ?').bind(productId).run();

                        return json({ success: true }, corsHeaders);
                    } catch (error) {
                        return json({ error: 'Failed to delete product', details: error.message }, { ...corsHeaders, status: 500 });
                    }
                }
            }

            // 5. PUBLIC DISCOVERY: Shop Directory (with Sponsored Ads)
            if (path === '/api/shop/directory' && method === 'GET') {
                try {
                    const category = url.searchParams.get('category');
                    const search = url.searchParams.get('q');

                    let query = `
                        SELECT m.id, m.nama_toko, m.slug, m.logo_url, m.banner_url, m.is_sponsored, c.nama_kategori 
                        FROM shop_merchants m 
                        LEFT JOIN shop_category c ON m.category_id = c.id
                        WHERE m.is_verified = 1
                    `;
                    let params = [];

                    if (category) {
                        query += ` AND m.category_id = ?`;
                        params.push(category);
                    }
                    if (search) {
                        query += ` AND (m.nama_toko LIKE ? OR m.deskripsi LIKE ?)`;
                        params.push(`%${search}%`, `%${search}%`);
                    }

                    // Priority: Sponsored first, then newest
                    query += ` ORDER BY m.is_sponsored DESC, m.created_at DESC LIMIT 50`;

                    const merchants = await env.DB.prepare(query).bind(...params).all();
                    return json({ success: true, merchants: merchants.results }, corsHeaders);
                } catch (error) {
                    return json({ error: 'Failed to fetch directory' }, { ...corsHeaders, status: 500 });
                }
            }

            // 10. PUBLIC DISCOVERY: Wishlist Management
            if (path === '/api/shop/wishlist' && method === 'GET') {
                const userId = url.searchParams.get('user_id');
                if (!userId) return json({ error: 'User ID required' }, { ...corsHeaders, status: 400 });

                try {
                    const results = await env.DB.prepare(`
                        SELECT p.*, m.nama_toko, m.slug as merchant_slug
                        FROM shop_wishlist w
                        JOIN shop_products p ON w.product_id = p.id
                        JOIN shop_merchants m ON p.merchant_id = m.id
                        WHERE w.user_id = ?
                    `).bind(userId).all();
                    return json({ success: true, wishlist: results.results }, corsHeaders);
                } catch (error) {
                    return json({ error: 'Failed to fetch wishlist' }, { ...corsHeaders, status: 500 });
                }
            }

            if (path === '/api/shop/wishlist/toggle' && method === 'POST') {
                try {
                    const { user_id, product_id } = await request.json();
                    if (!user_id || !product_id) return json({ error: 'Missing fields' }, { ...corsHeaders, status: 400 });

                    const existing = await env.DB.prepare('SELECT id FROM shop_wishlist WHERE user_id = ? AND product_id = ?').bind(user_id, product_id).first();

                    if (existing) {
                        await env.DB.prepare('DELETE FROM shop_wishlist WHERE user_id = ? AND product_id = ?').bind(user_id, product_id).run();
                        return json({ success: true, action: 'removed' }, corsHeaders);
                    } else {
                        await env.DB.prepare('INSERT INTO shop_wishlist (id, user_id, product_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)')
                            .bind(crypto.randomUUID(), user_id, product_id).run();

                        // Also track as FAVORITE_PRODUCT in analytics
                        const prod = await env.DB.prepare('SELECT merchant_id FROM shop_products WHERE id = ?').bind(product_id).first();
                        if (prod) {
                            await env.DB.prepare('INSERT INTO shop_analytics (id, merchant_id, action_type, product_id, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)')
                                .bind(crypto.randomUUID(), prod.merchant_id, 'FAVORITE_PRODUCT', product_id).run();
                        }

                        return json({ success: true, action: 'added' }, corsHeaders);
                    }
                } catch (error) {
                    return json({ error: 'Failed to toggle wishlist' }, { ...corsHeaders, status: 500 });
                }
            }

            // 6. PUBLIC DISCOVERY: Storefront by Slug
            if (path === '/api/shop/storefront' && method === 'GET') {
                const slug = url.searchParams.get('slug');
                if (!slug) return json({ error: 'Slug required' }, { ...corsHeaders, status: 400 });

                try {
                    const merchant = await env.DB.prepare(
                        'SELECT m.*, c.nama_kategori FROM shop_merchants m LEFT JOIN shop_category c ON m.category_id = c.id WHERE m.slug = ?'
                    ).bind(slug).first();

                    if (!merchant) return json({ error: 'Store not found' }, { ...corsHeaders, status: 404 });

                    // Fetch published products
                    const productsRows = await env.DB.prepare(
                        'SELECT * FROM shop_products WHERE merchant_id = ? AND status = "PUBLISHED" ORDER BY created_at DESC'
                    ).bind(merchant.id).all();

                    const products = productsRows.results;

                    // Fetch images for products
                    const productIds = products.map(p => p.id);
                    let productImages = [];
                    if (productIds.length > 0) {
                        const placeholders = productIds.map(() => '?').join(',');
                        const imagesRes = await env.DB.prepare(`SELECT * FROM shop_product_images WHERE product_id IN (${placeholders}) ORDER BY order_index ASC`).bind(...productIds).all();
                        productImages = imagesRes.results;
                    }

                    // Attach images to products
                    const productsWithImages = products.map(p => ({
                        ...p,
                        images: productImages.filter(img => img.product_id === p.id)
                    }));

                    // PRIVACY REDACTION: CURIOSITY GAP
                    // Check if request has a valid session (optional, but for enterprise we check headers)
                    const authHeader = request.headers.get('Authorization');
                    const contacts = await env.DB.prepare('SELECT * FROM shop_contacts WHERE merchant_id = ?').bind(merchant.id).first();

                    const isAuthorized = authHeader && authHeader.length > 20; // Basic check for JWT presence

                    const redactedContacts = {
                        alamat: isAuthorized ? contacts?.alamat : "Login untuk melihat alamat",
                        whatsapp: isAuthorized ? contacts?.whatsapp : "08xxxxxxxxxx",
                        instagram: isAuthorized ? contacts?.instagram : "@xxxxxxxx",
                        email: isAuthorized ? contacts?.email : "xxxxx@xxxxx.xxx",
                        isLocked: !isAuthorized
                    };

                    return json({
                        success: true,
                        merchant,
                        products: productsWithImages,
                        contacts: redactedContacts
                    }, corsHeaders);
                } catch (error) {
                    return json({ error: 'Failed to fetch storefront' }, { ...corsHeaders, status: 500 });
                }
            }

            // 7. PUBLIC DISCOVERY: Product Details (PDP)
            if (path === '/api/shop/product' && method === 'GET') {
                const productId = url.searchParams.get('id');
                if (!productId) return json({ error: 'Product ID required' }, { ...corsHeaders, status: 400 });

                try {
                    const product = await env.DB.prepare(
                        'SELECT p.*, m.nama_toko, m.slug as merchant_slug, m.logo_url FROM shop_products p JOIN shop_merchants m ON p.merchant_id = m.id WHERE p.id = ?'
                    ).bind(productId).first();

                    if (!product) return json({ error: 'Product not found' }, { ...corsHeaders, status: 404 });

                    const images = await env.DB.prepare('SELECT * FROM shop_product_images WHERE product_id = ? ORDER BY order_index ASC').bind(productId).all();

                    return json({
                        success: true,
                        product: { ...product, images: images.results }
                    }, corsHeaders);
                } catch (error) {
                    return json({ error: 'Failed to fetch product' }, { ...corsHeaders, status: 500 });
                }
            }

            // 8. PUBLIC ANALYTICS: Track Interaction
            if (path === '/api/shop/analytics/track' && method === 'POST') {
                try {
                    const body = await request.json();
                    const { merchant_id, action_type, product_id } = body;

                    if (!merchant_id || !action_type) return json({ error: 'Invalid payload' }, { ...corsHeaders, status: 400 });

                    await env.DB.prepare(
                        'INSERT INTO shop_analytics (id, merchant_id, action_type, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
                    ).bind(crypto.randomUUID(), merchant_id, action_type).run();

                    return json({ success: true }, corsHeaders);
                } catch (error) {
                    return json({ error: 'Failed to track analytics' }, { ...corsHeaders, status: 500 });
                }
            }

            // 9. Business Analytics (Aggregations)
            if (path === '/api/shop/merchant/analytics' && method === 'GET') {
                const merchantId = url.searchParams.get('merchant_id');
                if (!merchantId) return json({ error: 'Merchant ID required' }, { ...corsHeaders, status: 400 });

                try {
                    // Overall totals
                    const totalsRows = await env.DB.prepare(
                        'SELECT action_type, COUNT(*) as count FROM shop_analytics WHERE merchant_id = ? GROUP BY action_type'
                    ).bind(merchantId).all();

                    const totals = {
                        profileViews: 0,
                        contactClicks: 0,
                        productViews: 0,
                        favorites: 0,
                        shares: 0
                    };

                    totalsRows.results.forEach(row => {
                        if (row.action_type === 'VIEW_PROFILE') totals.profileViews = row.count;
                        if (row.action_type === 'CLICK_CONTACT') totals.contactClicks = row.count;
                        if (row.action_type === 'VIEW_PRODUCT') totals.productViews = row.count;
                        if (row.action_type === 'FAVORITE_PRODUCT') totals.favorites = row.count;
                        if (row.action_type === 'SHARE_PRODUCT') totals.shares = row.count;
                    });

                    // Activity over last 7 days (Daily aggregation based on created_at DATETIME)
                    const dailyRows = await env.DB.prepare(`
                        SELECT DATE(created_at) as date, action_type, COUNT(*) as count 
                        FROM shop_analytics 
                        WHERE merchant_id = ? AND created_at >= date('now', '-7 days')
                        GROUP BY DATE(created_at), action_type
                        ORDER BY date ASC
                    `).bind(merchantId).all();

                    // Structure for charts
                    let chartData = [];
                    // Fallback to empty days
                    for (let i = 6; i >= 0; i--) {
                        let d = new Date();
                        d.setDate(d.getDate() - i);
                        let dateStr = d.toISOString().split('T')[0];

                        let dayStats = { date: dateStr, views: 0, clicks: 0, productViews: 0 };

                        dailyRows.results.forEach(r => {
                            if (r.date === dateStr) {
                                if (r.action_type === 'VIEW_PROFILE') dayStats.views = r.count;
                                if (r.action_type === 'CLICK_CONTACT') dayStats.clicks = r.count;
                                if (r.action_type === 'VIEW_PRODUCT') dayStats.productViews = r.count;
                            }
                        });

                        chartData.push(dayStats);
                    }

                    return json({ success: true, totals, chartData }, corsHeaders);
                } catch (error) {
                    console.error('[Shop) Analytics Error:', error);
                    return json({ error: 'Failed to fetch analytics', details: error.message }, { ...corsHeaders, status: 500 });
                }
            }

            // 11. MERCHANT: Update Profile
            if (path === '/api/shop/merchant/profile' && method === 'PATCH') {
                try {
                    const body = await request.json();
                    const { merchant_id, user_id, nama_toko, deskripsi, logo_url, banner_url, category_id } = body;

                    // SECURITY: Verify user owns the merchant
                    const owner = await env.DB.prepare('SELECT user_id FROM shop_merchants WHERE id = ?').bind(merchant_id).first();
                    if (!owner || owner.user_id !== user_id) return json({ error: 'Unauthorized' }, { ...corsHeaders, status: 403 });

                    await env.DB.prepare(`
                        UPDATE shop_merchants 
                        SET nama_toko = COALESCE(?, nama_toko), 
                            deskripsi = COALESCE(?, deskripsi),
                            logo_url = COALESCE(?, logo_url),
                            banner_url = COALESCE(?, banner_url),
                            category_id = COALESCE(?, category_id)
                        WHERE id = ?
                    `).bind(nama_toko, deskripsi, logo_url, banner_url, category_id, merchant_id).run();

                    return json({ success: true }, corsHeaders);
                } catch (error) {
                    return json({ error: 'Failed to update profile' }, { ...corsHeaders, status: 500 });
                }
            }

            // 12. MERCHANT: Toggle Product Status
            if (path === '/api/shop/product/status' && method === 'PATCH') {
                try {
                    const body = await request.json();
                    const { product_id, user_id, status } = body; // status: 'DRAFT' or 'PUBLISHED'

                    // SECURITY: Verify user owns the product via merchant
                    const prod = await env.DB.prepare(`
                        SELECT p.id FROM shop_products p 
                        JOIN shop_merchants m ON p.merchant_id = m.id 
                        WHERE p.id = ? AND m.user_id = ?
                    `).bind(product_id, user_id).first();

                    if (!prod) return json({ error: 'Unauthorized or product not found' }, { ...corsHeaders, status: 403 });

                    await env.DB.prepare('UPDATE shop_products SET status = ? WHERE id = ?').bind(status, product_id).run();

                    return json({ success: true }, corsHeaders);
                } catch (error) {
                    return json({ error: 'Failed to update product status' }, { ...corsHeaders, status: 500 });
                }
            }

            // 13. MERCHANT: Ads Boost (Placeholder for Payment Integration)
            if (path === '/api/shop/merchant/ads/boost' && method === 'POST') {
                try {
                    const body = await request.json();
                    const { merchant_id, user_id, duration_days } = body;

                    // SECURITY: Verify owner
                    const owner = await env.DB.prepare('SELECT user_id FROM shop_merchants WHERE id = ?').bind(merchant_id).first();
                    if (!owner || owner.user_id !== user_id) return json({ error: 'Unauthorized' }, { ...corsHeaders, status: 403 });

                    // In a real scenario, this would trigger a Midtrans transaction.
                    // For now, we'll simulate an instant upgrade for testing high-end features.
                    await env.DB.prepare('UPDATE shop_merchants SET is_sponsored = 1 WHERE id = ?').bind(merchant_id).run();

                    return json({
                        success: true,
                        message: 'Shop boosted successfully! You are now featured at the top of the directory.'
                    }, corsHeaders);
                } catch (error) {
                    return json({ error: 'Failed to boost shop' }, { ...corsHeaders, status: 500 });
                }
            }

            // ADMIN: AI Chat Support (Internal CS)
            if (path === '/api/admin/chat' && method === 'POST') {
                const { messages } = await request.json();

                if (!env.GEMINI_API_KEY) {
                    return json({ error: 'Gemini API Key not configured' }, { ...corsHeaders, status: 500 });
                }

                // Fetch Real-time Stats for Context
                const usersCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first('count');
                const templatesCount = await env.DB.prepare("SELECT COUNT(*) as count FROM templates WHERE type = 'invitation'").first('count');
                const invitationsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM invitations').first('count');
                const rsvpCount = await env.DB.prepare('SELECT COUNT(*) as count FROM rsvp_responses').first('count');


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
                        ? "Maaf, sistem AI sedang sangat padat. Mohon tunggu sejenak dan coba kembali ya. 🙏"
                        : `Admin AI Error: ${err.message}`;
                    return json({ content: friendlyMsg }, corsHeaders);
                }
            }

            // USER: AI Chat Support (Intelligence v5.0 - Proactive Agent)
            if (path === '/api/chat' && method === 'POST') {
                const { messages, userId } = await request.json();

                if (!env.GEMINI_API_KEY) {
                    return json({ error: 'AI Support currently unavailable' }, { ...corsHeaders, status: 503 });
                }

                // SECURITY: Strict session verification
                let user = null;
                if (userId) {
                    user = await env.DB.prepare('SELECT * FROM users WHERE id = ? OR email = ?').bind(userId, userId).first();
                    if (!user) return json({ error: 'Unauthorized context' }, { ...corsHeaders, status: 403 });
                }

                const canonicalId = user?.id || userId;

                // TOOLSET DEFINITION (Expert Level v5.2)
                // --- TAMUU EXPERT SYSTEM v7.0 (MODULAR-KAP) ---
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

                // PRE-GROUNDING: Fetch User Context immediately
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

                // TRIGGER ENGINE: Detect context needs
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

                // SYSTEM PROMPT (The 30-Year Expert v7.0 - ATOMIC & PERSONAL)
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

                // AUTONOMOUS LOOP (Limit to 5 turns)
                let currentMessages = [...messages];
                let loopCount = 0;

                while (loopCount < 5) {
                    loopCount++;
                    try {
                        const response = await fetchAI(sysPrompt, currentMessages, aiTools);

                        // If AI returned a final text response, exit loop and return to user
                        if (response.content) {
                            return json({ content: response.content, provider: response.provider }, corsHeaders);
                        }

                        // If AI returned a tool call, execute it
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
                                    const { results: rawInvs } = await env.DB.prepare(`
                                        SELECT
                                            i.name,
                                            i.slug,
                                            i.status,
                                            COUNT(r.id) as rsvp_count
                                        FROM invitations i
                                        LEFT JOIN rsvp_responses r ON i.id = r.invitation_id
                                        WHERE i.user_id = ?
                                        GROUP BY i.id
                                    `).bind(canonicalId).all();

                                    const invDetails = rawInvs.map(inv => ({
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
                                // Atomic Search Strategy:
                                // User might provide "order-1769272498101-74b5da22"
                                // DB stores "order-1769272498101" or the full thing.
                                const rawId = args.order_id.trim();
                                const searchId = rawId.replace(/^#/, '');

                                console.log(`[AI Agent] search_order searching for: ${searchId}`);

                                // Attempt 1: Exact Match (High Reliability)
                                let { results: exact } = await env.DB.prepare(
                                    'SELECT id, status, external_id, tier, amount, created_at, payment_channel FROM billing_transactions ' +
                                    'WHERE external_id = ? OR id = ?'
                                ).bind(searchId, searchId).all();

                                // Attempt 1.5: Prefix/Suffix Resilience
                                if (exact.length === 0) {
                                    // Try matching part of external_id
                                    let { results: partial } = await env.DB.prepare(
                                        'SELECT id, status, external_id, tier, amount, created_at, payment_channel FROM billing_transactions ' +
                                        'WHERE external_id LIKE ? OR external_id LIKE ?'
                                    ).bind(`%${searchId}%`, `${searchId}%`).all();

                                    if (partial.length > 0) exact = partial;
                                }

                                // Attempt 2: Strip Transaction Suffix (Resilience)
                                // If searchId matches order-\d+-\w+, try stripping the last part
                                if (exact.length === 0 && searchId.startsWith('order-')) {
                                    const parts = searchId.split('-');
                                    if (parts.length > 2) {
                                        const strippedId = `${parts[0]}-${parts[1]}`;
                                        let { results: strippedMatch } = await env.DB.prepare(
                                            'SELECT id, status, external_id, tier, amount, created_at, payment_channel FROM billing_transactions ' +
                                            'WHERE external_id = ? OR external_id LIKE ?'
                                        ).bind(strippedId, `${strippedId}%`).all();
                                        exact = strippedMatch;
                                    }
                                }

                                if (exact && exact.length > 0) {
                                    toolResult = JSON.stringify(exact.map(t => ({
                                        ...t,
                                        midtrans_url: `https://dashboard.midtrans.com/transactions/${t.external_id}`
                                    })));
                                } else {
                                    // Attempt 3: Numeric Core Match (Safety Net)
                                    const numericId = rawId.replace(/\D/g, '');
                                    if (numericId.length >= 8) {
                                        let { results: fuzzy } = await env.DB.prepare(
                                            'SELECT id, status, external_id, tier, amount, created_at, payment_channel FROM billing_transactions ' +
                                            'WHERE external_id LIKE ? OR id LIKE ? ' +
                                            'ORDER BY created_at DESC LIMIT 3'
                                        ).bind(`%${numericId}%`, `%${numericId}%`).all();

                                        if (fuzzy && fuzzy.length > 0) {
                                            toolResult = JSON.stringify(fuzzy);
                                        } else {
                                            toolResult = `Order "${rawId}" tidak ditemukan. Pastikan nomor order akurat (contoh: order-12345678).`;
                                        }
                                    } else {
                                        toolResult = `Format Order "${rawId}" tidak valid atau tidak ditemukan.`;
                                    }
                                }
                            }
                            else if (name === "get_invitation_details") {
                                const inv = await env.DB.prepare('SELECT id, name, slug, is_published, category, created_at, user_id FROM invitations WHERE slug = ?').bind(args.slug).first();
                                if (inv) {
                                    const rsvp = await env.DB.prepare('SELECT COUNT(*) as total FROM rsvp_responses WHERE invitation_id = ?').bind(inv.id).first();
                                    const invOwner = await env.DB.prepare('SELECT tier, expires_at FROM users WHERE id = ?').bind(inv.user_id).first();
                                    const isExpired = invOwner?.expires_at ? new Date(invOwner.expires_at) < new Date() : false;

                                    toolResult = JSON.stringify({
                                        ...inv,
                                        rsvp_count: rsvp.total,
                                        owner_tier: invOwner?.tier,
                                        is_accessible: inv.is_published && !isExpired,
                                        diag_msg: !inv.is_published ? "Status is DRAFT. User must click PUBLISH." : (isExpired ? "Subscription EXPIRED. User must renew." : "Link should be active.")
                                    });
                                } else {
                                    toolResult = `Invitation with slug "${args.slug}" not found.`;
                                }
                            }
                            else if (name === "get_guest_list") {
                                const inv = await env.DB.prepare('SELECT id FROM invitations WHERE slug = ?').bind(args.slug).first();
                                if (inv) {
                                    const { results: guests } = await env.DB.prepare('SELECT name, tier, guest_count, checked_in_at FROM guests WHERE invitation_id = ? ORDER BY name ASC').bind(inv.id).all();
                                    toolResult = JSON.stringify(guests);
                                } else {
                                    toolResult = `Cannot fetch guests: Invitation "${args.slug}" not found.`;
                                }
                            }
                            else if (name === "sync_payment") {
                                let txId = args.transaction_id;

                                // If transaction_id looks like an external_id (e.g. starts with order-), resolve it first
                                if (txId.startsWith('order-')) {
                                    const tx = await env.DB.prepare('SELECT id FROM billing_transactions WHERE external_id = ?').bind(txId).first();
                                    if (tx) txId = tx.id;
                                    else {
                                        // Try partial match if exact external_id fails
                                        const txPartial = await env.DB.prepare('SELECT id FROM billing_transactions WHERE external_id LIKE ?').bind(`${txId}%`).first();
                                        if (txPartial) txId = txPartial.id;
                                    }
                                }

                                const result = await syncMidtransStatus(txId, env);
                                toolResult = JSON.stringify(result);
                            }
                            else if (name === "upgrade_tier") {
                                // Double check authorization & Transaction Reality (Anti-Hallucination)
                                if (user) {
                                    const paidTx = await env.DB.prepare('SELECT id FROM billing_transactions WHERE user_id = ? AND status = "PAID" LIMIT 1').bind(canonicalId).first();
                                    if (paidTx) {
                                        await env.DB.prepare('UPDATE users SET tier = ?, updated_at = datetime("now") WHERE id = ?').bind(args.target_tier.toLowerCase(), canonicalId).run();
                                        toolResult = `Successfully upgraded user ${canonicalId} to ${args.target_tier} based on verified PAID transaction.`;
                                    } else {
                                        toolResult = "Execution FAILED: No PAID transactions found in database for this user. Cannot upgrade.";
                                    }
                                } else {
                                    toolResult = "Unauthorized: No user session.";
                                }
                            }

                            // Add the tool execution result to the message chain
                            currentMessages.push(response); // Assistant's tool call
                            currentMessages.push({
                                role: 'tool',
                                name: name,
                                content: toolResult
                            });
                        }

                        break; // Safety break
                    } catch (err) {
                        return json({ content: `Expert AI Error: ${err.message}` }, corsHeaders);
                    }
                }

                return json({ content: "Maaf Kak, saya butuh waktu lebih untuk menganalisis ini. Mohon hubungi admin ya. 🙏" }, corsHeaders);
            }



            // ============================================
            // BLOG SYSTEM ENDPOINTS (Phase 1)
            // ============================================

            // PUBLIC: List Blog Posts
            if (path === '/api/blog' && method === 'GET') {
                // Edge Cache Control: 60 seconds
                const cacheControl = { ...corsHeaders, 'Cache-Control': 'public, max-age=60, s-maxage=60' };
                const limit = parseInt(url.searchParams.get('limit') || '10');
                const offset = parseInt(url.searchParams.get('offset') || '0');
                const tag = url.searchParams.get('tag');

                try {
                    const isFeatured = url.searchParams.get('featured') === '1';
                    const category = url.searchParams.get('category');

                    let query = `
                        SELECT id, slug, title, excerpt, featured_image, category, tags, is_featured, published_at, author_id, view_count, created_at 
                        FROM blog_posts 
                        WHERE is_published = 1 
                    `;
                    const params = [];

                    if (isFeatured) {
                        query += ` AND is_featured = 1 `;
                    }

                    if (category && category !== 'All') {
                        query += ` AND category = ? `;
                        params.push(category);
                    }

                    if (tag) {
                        query += ` AND (tags LIKE ? OR seo_keywords LIKE ?) `;
                        params.push(`%${tag}%`, `%${tag}%`);
                    }

                    query += ` ORDER BY published_at DESC LIMIT ? OFFSET ?`;
                    params.push(limit, offset);

                    const { results } = await env.DB.prepare(query).bind(...params).all();
                    return json(results, cacheControl);
                } catch (err) {
                    console.error('[API] Blog List failure:', err.message);
                    return json({ success: false, error: 'Database error', message: err.message }, { ...corsHeaders, status: 500 });
                }
            }

            // PUBLIC: Get Single Post by Slug
            if (path.startsWith('/api/blog/post/') && method === 'GET') {
                const slug = path.split('/').pop();
                // Edge Cache Control: 5 minutes
                const cacheControl = { ...corsHeaders, 'Cache-Control': 'public, max-age=300, s-maxage=300' };

                try {
                    const post = await env.DB.prepare(
                        'SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1'
                    ).bind(slug).first();

                    if (!post) {
                        return json({ error: 'Post not found' }, { ...corsHeaders, status: 404 });
                    }

                    // Async View Count Update (Fire and forget)
                    ctx.waitUntil(
                        env.DB.prepare('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?').bind(post.id).run()
                            .catch(err => console.error('[API] View Count failed:', err.message))
                    );

                    return json(post, cacheControl);
                } catch (err) {
                    console.error('[API] Blog Post failure:', err.message);
                    return json({ success: false, error: 'Database error', message: err.message }, { ...corsHeaders, status: 500 });
                }
            }

            // PUBLIC: Check Slug Availability
            if (path === '/api/blog/check-slug' && method === 'GET') {
                const slug = url.searchParams.get('slug');
                const excludeId = url.searchParams.get('excludeId');
                if (!slug) return json({ error: 'Slug required' }, corsHeaders);

                let query = 'SELECT id FROM blog_posts WHERE slug = ?';
                let params = [slug];

                if (excludeId) {
                    query += ' AND id != ?';
                    params.push(excludeId);
                }

                const existing = await env.DB.prepare(query).bind(...params).first();
                return json({ available: !existing }, corsHeaders);
            }

            // PUBLIC: Subscribe
            if (path === '/api/blog/subscribe' && method === 'POST') {
                const { email } = await request.json();
                if (!email) return json({ error: 'Email required' }, { ...corsHeaders, status: 400 });

                try {
                    await env.DB.prepare(
                        'INSERT INTO blog_subscribers (id, email) VALUES (?, ?)'
                    ).bind(crypto.randomUUID(), email).run();
                    return json({ success: true }, corsHeaders);
                } catch (e) {
                    if (e.message.includes('UNIQUE')) {
                        return json({ success: true, message: 'Already subscribed' }, corsHeaders);
                    }
                    return json({ error: 'Database error' }, { ...corsHeaders, status: 500 });
                }
            }

            // PUBLIC: Analytics (Record Read)
            if (path === '/api/blog/analytics' && method === 'POST') {
                try {
                    const { post_id, type } = await request.json(); // type: 'view' or 'read'
                    if (!post_id) return json({ success: false, error: 'post_id required' }, { ...corsHeaders, status: 400 });

                    const date = new Date().toISOString().split('T')[0];

                    if (type === 'read') {
                        await env.DB.prepare(`
                            INSERT INTO blog_daily_stats (date, post_id, reads) VALUES (?, ?, 1)
                            ON CONFLICT(date, post_id) DO UPDATE SET reads = reads + 1
                        `).bind(date, post_id).run();
                    } else {
                        await env.DB.prepare(`
                            INSERT INTO blog_daily_stats (date, post_id, views, visitors) VALUES (?, ?, 1, 1)
                            ON CONFLICT(date, post_id) DO UPDATE SET views = views + 1, visitors = visitors + 1
                        `).bind(date, post_id).run();
                    }

                    return json({ success: true }, corsHeaders);
                } catch (err) {
                    console.error('[API] Blog Analytics failure:', err.message);
                    return json({ success: false, error: 'Analytics error', message: err.message }, { ...corsHeaders, status: 500 });
                }
            }

            // PUBLIC: Related Posts
            if (path.startsWith('/api/blog/related/') && method === 'GET') {
                const id = path.split('/').pop();
                const { results } = await env.DB.prepare(
                    `SELECT id, slug, title, featured_image, category FROM blog_posts 
                     WHERE is_published = 1 AND id != ?
                     ORDER BY published_at DESC LIMIT 3`
                ).bind(id).all();

                return json(results, { ...corsHeaders, 'Cache-Control': 'public, max-age=300' });
            }

            // PUBLIC: Categories
            if (path === '/api/blog/categories' && method === 'GET') {
                const { results } = await env.DB.prepare(
                    'SELECT * FROM blog_categories ORDER BY name ASC'
                ).all();
                return json(results, { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' });
            }

            // ADMIN: List Posts
            // ADMIN: Get Categories
            if (path === '/api/admin/blog/categories' && method === 'GET') {
                const { results } = await env.DB.prepare(
                    'SELECT * FROM blog_categories ORDER BY name ASC'
                ).all();
                return json(results, corsHeaders);
            }

            // ADMIN: Get Posts
            if (path === '/api/admin/blog/posts' && method === 'GET') {
                const { results } = await env.DB.prepare(
                    'SELECT * FROM blog_posts ORDER BY created_at DESC'
                ).all();
                return json(results, corsHeaders);
            }

            // ADMIN: Get Single Post
            if (path.match(/^\/api\/admin\/blog\/posts\/[^/]+$/) && method === 'GET') {
                const id = path.split('/').pop();
                const { results } = await env.DB.prepare(
                    'SELECT * FROM blog_posts WHERE id = ?'
                ).bind(id).all();

                if (results && results.length > 0) {
                    return json(results[0], corsHeaders);
                }
                return notFound(corsHeaders);
            }

            // ADMIN: Create Post
            if (path === '/api/admin/blog/posts' && method === 'POST') {
                const body = await request.json();
                const { slug, title, content, excerpt, featured_image, category, tags, is_featured, author_id, author_email, status, seo_title, seo_description, seo_keywords, image_meta, image_alt } = body;

                let finalStatus = status || 'draft';
                // Enforcement: Only admin can publish directly
                if (finalStatus === 'published' && author_email !== 'admin@tamuu.id') {
                    finalStatus = 'pending';
                }

                const id = crypto.randomUUID ? crypto.randomUUID() : `alt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                let finalAuthorId = author_id;

                if ((!finalAuthorId || finalAuthorId === 'placeholder') && author_email) {
                    const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(author_email).first();
                    if (user) {
                        finalAuthorId = user.id;
                    } else {
                        finalAuthorId = null;
                    }
                }

                if (!finalAuthorId || finalAuthorId === 'placeholder') {
                    finalAuthorId = null;
                }

                if (!id || !slug) {
                    return json({ success: false, error: 'Missing ID or Slug' }, corsHeaders);
                }

                try {
                    // 1. Upsert Category if provided
                    if (category) {
                        const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        const catId = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                        // Insert or Ignore (name/slug unique)
                        await env.DB.prepare(`
                            INSERT INTO blog_categories (id, name, slug) VALUES (?, ?, ?)
                            ON CONFLICT(name) DO NOTHING
                        `).bind(catId, category, catSlug).run();
                    }

                    // 2. Insert Post
                    await env.DB.prepare(`
                        INSERT INTO blog_posts (
                            id, slug, title, content, excerpt, featured_image, category, tags, is_featured, author_id, status, is_published,
                            published_at, seo_title, seo_description, seo_keywords, image_meta, image_alt
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        id,
                        slug || '',
                        title || '',
                        content || '',
                        excerpt || '',
                        featured_image || '',
                        category || '',
                        typeof tags === 'object' ? JSON.stringify(tags) : (tags || '[]'),
                        is_featured ? 1 : 0,
                        finalAuthorId,
                        finalStatus || 'draft',
                        finalStatus === 'published' ? 1 : 0,
                        finalStatus === 'published' ? new Date().toISOString() : null,
                        seo_title || '',
                        seo_description || '',
                        seo_keywords || '',
                        typeof image_meta === 'object' ? JSON.stringify(image_meta) : (image_meta || ''),
                        image_alt || ''
                    ).run();

                } catch (dbError) {
                    console.error('D1 Insert Error:', dbError.message);
                    return json({ success: false, error: dbError.message }, corsHeaders);
                }

                return json({ success: true, id, status: finalStatus }, corsHeaders);
            }

            // ADMIN: Update Post
            if (path.startsWith('/api/admin/blog/posts/') && method === 'PUT') {
                const id = path.split('/').pop();
                const body = await request.json();
                const { author_email } = body;

                // Upsert Category if provided in update
                if (body.category) {
                    const catSlug = body.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const catId = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                    try {
                        await env.DB.prepare(`
                             INSERT INTO blog_categories (id, name, slug) VALUES (?, ?, ?)
                             ON CONFLICT(name) DO NOTHING
                        `).bind(catId, body.category, catSlug).run();
                    } catch (e) { console.error('Category upsert error:', e); }
                }

                const updates = [];
                const values = [];

                const fields = ['slug', 'title', 'content', 'excerpt', 'featured_image', 'category', 'tags', 'is_featured', 'seo_title', 'seo_description', 'seo_keywords', 'image_meta', 'image_alt'];
                fields.forEach(f => {
                    if (body[f] !== undefined) {
                        updates.push(`${f} = ?`);
                        // Special handling for JSON fields if needed, but client sends string or obj
                        if (f === 'image_meta' && typeof body[f] === 'object') {
                            values.push(JSON.stringify(body[f]));
                        } else if (f === 'tags' && typeof body[f] === 'object') {
                            values.push(JSON.stringify(body[f]));
                        } else if (f === 'is_featured') {
                            values.push(body[f] ? 1 : 0);
                        } else {
                            values.push(body[f]);
                        }
                    }
                });

                if (body.status !== undefined) {
                    let newStatus = body.status;
                    // Enforcement: Only admin can publish
                    if (newStatus === 'published' && author_email !== 'admin@tamuu.id') {
                        newStatus = 'pending';
                    }

                    updates.push('status = ?');
                    values.push(newStatus);

                    updates.push('is_published = ?');
                    values.push(newStatus === 'published' ? 1 : 0);

                    if (newStatus === 'published') {
                        updates.push("published_at = COALESCE(published_at, datetime('now'))");
                    }
                }

                if (updates.length > 0) {
                    updates.push("updated_at = datetime('now')");
                    values.push(id);
                    await env.DB.prepare(`UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
                }

                return json({ success: true }, corsHeaders);
            }

            if (path.startsWith('/api/admin/blog/posts/') && method === 'DELETE') {
                const id = path.split('/').pop();
                await env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(id).run();
                return json({ success: true }, corsHeaders);
            }

            // ADMIN: List Transactions (with filtering)
            if (path.startsWith('/api/admin/transactions') && method === 'GET') {
                const url = new URL(request.url);
                const status = url.searchParams.get('status');
                const startDate = url.searchParams.get('startDate');
                const endDate = url.searchParams.get('endDate');

                let query = `
SELECT
t.*,
    u.name as user_name,
    u.email as user_email
    FROM billing_transactions t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE 1 = 1
    `;
                const params = [];

                if (status && status !== 'all') {
                    query += ` AND t.status = ? `;
                    params.push(status);
                }

                if (startDate) {
                    query += ` AND t.created_at >= ? `;
                    params.push(startDate); // Start of day or specific timestamp
                }

                if (endDate) {
                    query += ` AND t.created_at <= ? `;
                    params.push(endDate); // End of day
                }

                query += ` ORDER BY t.created_at DESC LIMIT 500`;

                const transactions = await env.DB.prepare(query).bind(...params).all();
                return json(transactions.results, corsHeaders);
            }

            // Helper function to sync Midtrans transaction status
            const syncMidtransStatus = async (transactionId, env) => {
                try {
                    // 1. Fetch transaction from DB to get external_id (orderId)
                    const transaction = await env.DB.prepare(
                        'SELECT * FROM billing_transactions WHERE id = ?'
                    ).bind(transactionId).first();

                    if (!transaction) {
                        return { success: false, error: 'transaction_not_found', message: 'Transaction not found' };
                    }

                    const orderId = transaction.external_id;
                    const isSandbox = orderId.includes('sandbox') || env.MIDTRANS_SERVER_KEY.startsWith('SB-');
                    const baseUrl = isSandbox
                        ? 'https://api.sandbox.midtrans.com/v2'
                        : 'https://api.midtrans.com/v2';

                    const authHeader = `Basic ${btoa(env.MIDTRANS_SERVER_KEY + ':')} `;

                    // 2. Fetch status from Midtrans
                    const midtransRes = await fetch(`${baseUrl} /${orderId}/status`, {
                        headers: {
                            'Authorization': authHeader,
                            'Accept': 'application/json'
                        }
                    });

                    if (!midtransRes.ok) {
                        const errorData = await midtransRes.json();
                        // Special handling for 404 (Transaction not found in Midtrans)
                        if (midtransRes.status === 404) {
                            return {
                                success: false,
                                error: 'midtrans_404',
                                message: 'Transaksi ini tidak ditemukan di data Midtrans (mungkin belum memilih metode pembayaran).',
                                status_code: 404
                            };
                        }
                        return { success: false, error: 'midtrans_api_error', message: 'Midtrans API error', details: errorData, status_code: midtransRes.status };
                    }

                    const data = await midtransRes.json();
                    const status = data.transaction_status;
                    const paymentType = data.payment_type;

                    // 3. Map status to our DB status
                    let newStatus = transaction.status;
                    if (status === 'settlement' || status === 'capture') {
                        newStatus = 'PAID';
                    } else if (status === 'pending') {
                        newStatus = 'PENDING';
                    } else if (status === 'expire') {
                        newStatus = 'EXPIRED';
                    } else if (status === 'cancel' || status === 'deny') {
                        newStatus = 'CANCELLED';
                    }

                    // 4. Update DB if status changed
                    if (newStatus !== transaction.status) {
                        await env.DB.prepare(
                            'UPDATE billing_transactions SET status = ?, payment_channel = ?, updated_at = datetime("now") WHERE id = ?'
                        ).bind(newStatus, paymentType || transaction.payment_channel, transactionId).run();

                        // Provision if PAID
                        if (newStatus === 'PAID') {
                            const userId = transaction.user_id;
                            const tier = transaction.tier;
                            let maxInvitations = 1;
                            if (tier === 'elite') maxInvitations = 3;
                            else if (tier === 'ultimate') maxInvitations = 2;

                            const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

                            await env.DB.prepare(
                                'UPDATE users SET tier = ?, max_invitations = ?, expires_at = ?, updated_at = datetime("now") WHERE id = ?'
                            ).bind(tier, maxInvitations, expiresAt, userId).run();

                            await env.DB.prepare(
                                'UPDATE billing_transactions SET paid_at = datetime("now") WHERE id = ?'
                            ).bind(transactionId).run();
                        }
                    }

                    return {
                        success: true,
                        status: newStatus,
                        midtrans_status: status,
                        updated: newStatus !== transaction.status
                    };

                } catch (err) {
                    console.error('[Admin/Sync] Error:', err);
                    return { success: false, error: 'sync_failed', message: err.message };
                }
            };

            // ADMIN: Sync Midtrans Transaction Status
            if (path.startsWith('/api/admin/transactions/') && path.endsWith('/sync') && method === 'GET') {
                const transactionId = path.split('/')[4];
                const result = await syncMidtransStatus(transactionId, env);
                if (!result.success) {
                    const statusCode = result.status_code || (result.error === 'transaction_not_found' || result.error === 'midtrans_404' ? 404 : 500);
                    return json({ error: result.error, message: result.message || 'Sync failed', details: result.details }, { ...corsHeaders, status: statusCode });
                }
                return json(result, corsHeaders);
            }

            // ADMIN: Update User Access (Role & Permissions)
            if (path.startsWith('/api/admin/users/') && path.endsWith('/access') && method === 'PUT') {
                const userId = path.split('/')[4];
                const { role, permissions } = await request.json();

                const updates = [];
                const values = [];

                if (role) {
                    updates.push('role = ?');
                    values.push(role);
                }
                if (permissions) {
                    updates.push('permissions = ?');
                    values.push(JSON.stringify(permissions));
                }

                if (updates.length > 0) {
                    values.push(userId);
                    await env.DB.prepare(
                        `UPDATE users SET ${updates.join(', ')}, updated_at = datetime("now") WHERE id = ? `
                    ).bind(...values).run();
                }

                const updatedUser = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
                if (updatedUser) updatedUser.permissions = JSON.parse(updatedUser.permissions || '[]');

                return json({ success: true, user: updatedUser }, corsHeaders);
            }

            // ADMIN: List All Users
            if (path === '/api/admin/users' && method === 'GET') {
                const roleFilter = url.searchParams.get('role');
                let query = 'SELECT id, email, name, role, permissions, tier, expires_at, max_invitations, invitation_count, created_at FROM users';
                let params = [];

                if (roleFilter) {
                    query += ' WHERE role = ?';
                    params.push(roleFilter);
                }

                query += ' ORDER BY created_at DESC';

                const { results } = await env.DB.prepare(query).bind(...params).all();

                // Format permissions JSON
                const formatted = results.map(u => ({
                    ...u,
                    permissions: JSON.parse(u.permissions || '[]')
                }));

                return json(formatted, corsHeaders);
            }

            // ADMIN: Delete User (Permanent Removal)
            if (path.startsWith('/api/admin/users/') && method === 'DELETE') {
                const userId = path.split('/')[4];
                if (!userId) return json({ error: 'User ID required' }, { ...corsHeaders, status: 400 });

                try {
                    // Start deletion sequence (Cascade is handled by DB ideally, but D1 sometimes needs manual clean-up)
                    // 1. Delete associated invitations
                    await env.DB.prepare('DELETE FROM invitations WHERE user_id = ?').bind(userId).run();

                    // 2. Delete associated assets
                    await env.DB.prepare('DELETE FROM assets WHERE user_id = ?').bind(userId).run();

                    // 3. Delete user
                    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

                    return json({ success: true, message: 'User and all associated data deleted permanently' }, corsHeaders);
                } catch (error) {
                    return json({ error: 'Failed to delete user', details: error.message }, { ...corsHeaders, status: 500 });
                }
            }

            // ============================================
            // GUESTS ENDPOINTS
            // ============================================
            if (path === '/api/guests' && method === 'GET') {
                const invitationId = url.searchParams.get('invitationId');
                if (!invitationId) return json({ error: 'Invitation ID required' }, { ...corsHeaders, status: 400 });
                const { results } = await env.DB.prepare(
                    'SELECT * FROM guests WHERE invitation_id = ? ORDER BY created_at DESC'
                ).bind(invitationId).all();
                return json(results, corsHeaders);
            }

            if (path.startsWith('/api/guests/') && method === 'GET') {
                const id = path.split('/')[3];
                const guest = await env.DB.prepare('SELECT * FROM guests WHERE id = ?').bind(id).first();
                if (!guest) return json({ error: 'Guest not found' }, { ...corsHeaders, status: 404 });
                return json(guest, corsHeaders);
            }

            if (path === '/api/guests' && method === 'POST') {
                const body = await request.json();
                const id = body.id || crypto.randomUUID();
                await env.DB.prepare(
                    `INSERT INTO guests(id, invitation_id, name, phone, address, table_number, tier, guest_count, check_in_code)
VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    id,
                    body.invitation_id,
                    body.name,
                    body.phone || null,
                    body.address || 'di tempat',
                    body.table_number || null,
                    body.tier || 'reguler',
                    body.guest_count || 1,
                    body.check_in_code || null
                ).run();
                return json({ id, ...body }, corsHeaders);
            }

            if (path.startsWith('/api/guests/') && method === 'PATCH') {
                const id = path.split('/')[3];
                const body = await request.json();
                await env.DB.prepare(
                    `UPDATE guests SET
name = COALESCE(?, name),
    phone = COALESCE(?, phone),
    address = COALESCE(?, address),
    table_number = COALESCE(?, table_number),
    tier = COALESCE(?, tier),
    guest_count = COALESCE(?, guest_count),
    shared_at = COALESCE(?, shared_at),
    checked_in_at = COALESCE(?, checked_in_at),
    checked_out_at = COALESCE(?, checked_out_at)
     WHERE id = ? `
                ).bind(
                    body.name ?? null,
                    body.phone ?? null,
                    body.address ?? null,
                    body.table_number ?? null,
                    body.tier ?? null,
                    body.guest_count ?? null,
                    body.shared_at ?? null,
                    body.checked_in_at ?? null,
                    body.checked_out_at ?? null,
                    id
                ).run();
                return json({ success: true }, corsHeaders);
            }

            if (path.startsWith('/api/guests/') && method === 'DELETE') {
                const id = path.split('/')[3];
                await env.DB.prepare('DELETE FROM guests WHERE id = ?').bind(id).run();
                return json({ success: true }, corsHeaders);
            }

            // ============================================
            // GUEST CHECK-IN ENDPOINT (Enterprise Feature)
            // POST /api/guests/:id/checkin OR /api/guests/code/:code/checkin
            // ============================================
            if (path.match(/\/api\/guests\/[^/]+\/checkin/) && method === 'POST') {
                const parts = path.split('/');
                const idOrCode = parts[3];
                const isCodeLookup = parts[2] === 'code';

                // Find guest by ID or check_in_code
                let guest;
                if (isCodeLookup || idOrCode.length < 20) {
                    // Short code lookup (e.g., "ABC123")
                    guest = await env.DB.prepare('SELECT * FROM guests WHERE check_in_code = ?').bind(idOrCode).first();
                } else {
                    // UUID lookup
                    guest = await env.DB.prepare('SELECT * FROM guests WHERE id = ?').bind(idOrCode).first();
                }

                if (!guest) {
                    return json({ success: false, error: 'Guest not found', code: 'NOT_FOUND' }, { ...corsHeaders, status: 404 });
                }

                // Duplicate check-in prevention
                if (guest.checked_in_at) {
                    return json({
                        success: false,
                        error: 'Guest already checked in',
                        code: 'ALREADY_CHECKED_IN',
                        guest: {
                            id: guest.id,
                            name: guest.name,
                            tier: guest.tier,
                            table_number: guest.table_number,
                            checked_in_at: guest.checked_in_at
                        }
                    }, { ...corsHeaders, status: 409 });
                }

                // Perform check-in
                const checkedInAt = new Date().toISOString();
                await env.DB.prepare(`
    UPDATE guests SET checked_in_at = ? WHERE id = ?
    `).bind(checkedInAt, guest.id).run();

                return json({
                    success: true,
                    code: 'CHECK_IN_SUCCESS',
                    guest: {
                        id: guest.id,
                        name: guest.name,
                        tier: guest.tier,
                        table_number: guest.table_number,
                        guest_count: guest.guest_count,
                        checked_in_at: checkedInAt
                    }
                }, corsHeaders);
            }

            // ============================================
            // GUEST CHECK-OUT ENDPOINT (Enterprise Feature)
            // POST /api/guests/:id/checkout
            // ============================================
            if (path.match(/\/api\/guests\/[^/]+\/checkout/) && method === 'POST') {
                const parts = path.split('/');
                const idOrCode = parts[3];

                // Find guest by ID or check_in_code
                let guest;
                if (idOrCode.length < 20) {
                    guest = await env.DB.prepare('SELECT * FROM guests WHERE check_in_code = ?').bind(idOrCode).first();
                } else {
                    guest = await env.DB.prepare('SELECT * FROM guests WHERE id = ?').bind(idOrCode).first();
                }

                if (!guest) {
                    return json({ success: false, error: 'Guest not found', code: 'NOT_FOUND' }, { ...corsHeaders, status: 404 });
                }

                // Must be checked in first
                if (!guest.checked_in_at) {
                    return json({
                        success: false,
                        error: 'Guest has not checked in yet',
                        code: 'NOT_CHECKED_IN',
                        guest: { id: guest.id, name: guest.name }
                    }, { ...corsHeaders, status: 400 });
                }

                // Already checked out prevention
                if (guest.checked_out_at) {
                    return json({
                        success: false,
                        error: 'Guest already checked out',
                        code: 'ALREADY_CHECKED_OUT',
                        guest: {
                            id: guest.id,
                            name: guest.name,
                            checked_in_at: guest.checked_in_at,
                            checked_out_at: guest.checked_out_at
                        }
                    }, { ...corsHeaders, status: 409 });
                }

                // Perform check-out
                const checkedOutAt = new Date().toISOString();
                await env.DB.prepare(`
    UPDATE guests SET checked_out_at = ? WHERE id = ?
    `).bind(checkedOutAt, guest.id).run();

                return json({
                    success: true,
                    code: 'CHECK_OUT_SUCCESS',
                    guest: {
                        id: guest.id,
                        name: guest.name,
                        tier: guest.tier,
                        table_number: guest.table_number,
                        checked_in_at: guest.checked_in_at,
                        checked_out_at: checkedOutAt
                    }
                }, corsHeaders);
            }

            // ============================================
            // MUSIC ENDPOINTS
            // ============================================
            if (path === '/api/music' && method === 'GET') {
                return await smart_cache(request, 3600, async () => {
                    const { results } = await env.DB.prepare('SELECT * FROM music_library ORDER BY title ASC').all();
                    return results;
                });
            }

            // [NEW] Generate Presigned URL for User Music Upload
            if (path === '/api/music/presigned-url' && method === 'POST') {
                const body = await request.json();
                const { userId, fileName, contentType } = body;

                if (!userId || !fileName) {
                    return json({ error: 'User ID and File Name required' }, { ...corsHeaders, status: 400 });
                }

                // Verify VVIP tier (Enterprise Security)
                const user = await env.DB.prepare('SELECT tier FROM users WHERE id = ?').bind(userId).first();
                if (!user || user.tier !== 'vvip') {
                    return json({ error: 'VVIP tier required for custom music' }, { ...corsHeaders, status: 403 });
                }

                const fileId = crypto.randomUUID();
                const extension = fileName.split('.').pop() || 'm4a';
                const key = `user - content / ${userId} /music/${fileId}.${extension} `;

                // For R2, we can't easily generate a presigned URL *inside* a worker without the aws-sdk or a custom signer.
                // Alternative: Use a "Upload Proxy" endpoint in the worker that pipes the request to R2, 
                // but for "Unicorn" scale, we use Pre-signed. 
                // I will implement a simple "Direct Upload" endpoint via Worker that enforces the key structure.

                return json({
                    uploadUrl: `https://api.tamuu.id/api/music/upload?key=${encodeURIComponent(key)}`,
                    publicUrl: `https://api.tamuu.id/assets/${key}`,
                    key: key
                }, corsHeaders);
            }

            // [NEW] Direct Upload Handle (Secured Proxy to R2)
            if (path === '/api/music/upload' && method === 'PUT') {
                const key = url.searchParams.get('key');
                if (!key || !key.startsWith('user-content/')) {
                    return json({ error: 'Invalid upload key' }, { ...corsHeaders, status: 400 });
                }

                // Stream the body directly to R2
                await env.ASSETS.put(key, request.body, {
                    httpMetadata: {
                        contentType: request.headers.get('Content-Type') || 'audio/mp4',
                        cacheControl: 'public, max-age=31536000, immutable'
                    }
                });

                return json({ success: true, key }, corsHeaders);
            }

            // ============================================
            // ASSETS UPLOAD ENDPOINT (Gallery Photos)
            // POST /api/assets/upload - Multipart form upload
            // ============================================
            if (path === '/api/assets/upload' && method === 'POST') {
                try {
                    const formData = await request.formData();
                    const file = formData.get('file');
                    const invitationId = formData.get('invitationId');
                    const assetType = formData.get('type') || 'gallery';

                    if (!file) {
                        return json({ error: 'No file provided' }, { ...corsHeaders, status: 400 });
                    }

                    // Generate unique key
                    const fileId = crypto.randomUUID();
                    const extension = file.name?.split('.').pop() || 'png';
                    const key = `gallery/${invitationId || 'unknown'}/${fileId}.${extension}`;

                    // Optimize: Convert to WebP if image and compress
                    // For now, just upload directly (client-side cropping already handles optimization)
                    const arrayBuffer = await file.arrayBuffer();

                    await env.ASSETS.put(key, arrayBuffer, {
                        httpMetadata: {
                            contentType: file.type || 'image/png',
                            cacheControl: 'public, max-age=31536000, immutable'
                        },
                        customMetadata: {
                            invitationId: invitationId || '',
                            uploadedAt: new Date().toISOString(),
                            type: assetType
                        }
                    });

                    const publicUrl = `https://api.tamuu.id/assets/${key}`;

                    return json({
                        success: true,
                        url: publicUrl,
                        key: key,
                        id: fileId
                    }, corsHeaders);
                } catch (err) {
                    console.error('[Assets Upload] Error:', err);
                    return json({ error: 'Upload failed', details: err.message }, { ...corsHeaders, status: 500 });
                }
            }

            // ============================================
            // WISHLIST ENDPOINTS
            // ============================================

            // Get user's wishlist
            if (path === '/api/wishlist' && method === 'GET') {
                const userId = url.searchParams.get('user_id');
                if (!userId) return json({ error: 'User ID required' }, { ...corsHeaders, status: 400 });

                const { results } = await env.DB.prepare(
                    'SELECT template_id FROM user_wishlist WHERE user_id = ? ORDER BY created_at DESC'
                ).bind(userId).all();

                return json(results.map(r => r.template_id), corsHeaders);
            }

            // Add to wishlist
            if (path === '/api/wishlist' && method === 'POST') {
                const body = await request.json();
                const { user_id, template_id } = body;

                if (!user_id || !template_id) {
                    return json({ error: 'user_id and template_id required' }, { ...corsHeaders, status: 400 });
                }

                try {
                    await env.DB.prepare(
                        'INSERT OR IGNORE INTO user_wishlist (user_id, template_id) VALUES (?, ?)'
                    ).bind(user_id, template_id).run();
                    return json({ success: true, added: true }, corsHeaders);
                } catch (err) {
                    return json({ success: false, error: err.message }, { ...corsHeaders, status: 500 });
                }
            }

            // Remove from wishlist
            if (path === '/api/wishlist' && method === 'DELETE') {
                const body = await request.json();
                const { user_id, template_id } = body;

                if (!user_id || !template_id) {
                    return json({ error: 'user_id and template_id required' }, { ...corsHeaders, status: 400 });
                }

                await env.DB.prepare(
                    'DELETE FROM user_wishlist WHERE user_id = ? AND template_id = ?'
                ).bind(user_id, template_id).run();

                return json({ success: true, removed: true }, corsHeaders);
            }

            // ============================================
            // TEMPLATE CATEGORIES ENDPOINTS
            // ============================================

            // List all categories
            // List all categories (Cached 1 hour)
            if (path === '/api/categories' && method === 'GET') {
                return await smart_cache(request, 3600, async () => {
                    const { results } = await env.DB.prepare(
                        'SELECT * FROM template_categories WHERE is_active = 1 ORDER BY display_order ASC'
                    ).all();
                    return results || [];
                });
            }

            // Create category (Admin only)
            if (path === '/api/categories' && method === 'POST') {
                const body = await request.json();
                const { name, icon, color } = body;

                if (!name) {
                    return json({ error: 'Category name is required' }, { ...corsHeaders, status: 400 });
                }

                const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                const id = crypto.randomUUID();

                // Get max order
                const maxOrder = await env.DB.prepare(
                    'SELECT MAX(display_order) as max_order FROM template_categories'
                ).first();
                const newOrder = (maxOrder?.max_order || 0) + 1;

                await env.DB.prepare(
                    'INSERT INTO template_categories (id, name, slug, icon, color, display_order) VALUES (?, ?, ?, ?, ?, ?)'
                ).bind(id, name, slug, icon || '📁', color || '#6366F1', newOrder).run();

                return json({ id, name, slug, icon, color, display_order: newOrder }, corsHeaders);
            }

            // Update category
            if (path.match(/^\/api\/categories\/[^/]+$/) && method === 'PUT') {
                const id = path.split('/').pop();
                const body = await request.json();

                await env.DB.prepare(
                    `UPDATE template_categories SET 
        name = COALESCE(?, name),
        icon = COALESCE(?, icon),
        color = COALESCE(?, color),
        display_order = COALESCE(?, display_order),
        updated_at = datetime('now')
     WHERE id = ?`
                ).bind(body.name ?? null, body.icon ?? null, body.color ?? null, body.display_order ?? null, id).run();

                return json({ id, updated: true }, corsHeaders);
            }

            // Delete category (soft delete)
            if (path.match(/^\/api\/categories\/[^/]+$/) && method === 'DELETE') {
                const id = path.split('/').pop();

                await env.DB.prepare(
                    'UPDATE template_categories SET is_active = 0, updated_at = datetime(\'now\') WHERE id = ?'
                ).bind(id).run();

                return json({ id, deleted: true }, corsHeaders);
            }

            // ============================================
            // TEMPLATES ENDPOINTS
            // ============================================
            if (path === '/api/templates' && method === 'GET') {
                // Use smart cache with 60s TTL
                return await smart_cache(request, 60, async () => {
                    // [MIGRATION] Auto-correct Display templates from early V5.1
                    // This fixes templates created before the type separation was fully enforced
                    await env.DB.prepare(
                        "UPDATE templates SET type = 'display' WHERE (name LIKE '%Display%' OR name LIKE '%Layar%') AND type = 'invitation'"
                    ).run();

                    // Support type filter (e.g., ?type=display)
                    const type = url.searchParams.get('type');
                    let query = 'SELECT * FROM templates';
                    if (type) {
                        query += ` WHERE type = '${type}'`;
                    }
                    query += ' ORDER BY updated_at DESC LIMIT 100';

                    const response = await env.DB.prepare(query).all();

                    if (!response.success || !response.results) return [];

                    // Optimize: map R2 URLs here if needed, but currently stored as paths
                    return response.results.map(t => ({
                        ...t,
                        thumbnail_url: t.thumbnail && !t.thumbnail.startsWith('http')
                            ? `https://tamuu-api.shafania57.workers.dev/assets/${t.thumbnail}`
                            : t.thumbnail
                    }));
                });
            }



            if (path === '/api/templates' && method === 'POST') {
                const body = await request.json();
                const id = crypto.randomUUID();
                const orbitRaw = body.orbit !== undefined ? body.orbit : body.orbit_layers;
                const orbit = orbitRaw !== undefined ? JSON.stringify(orbitRaw) : '{}';

                await env.DB.prepare(
                    `INSERT INTO templates(id, name, slug, category, sections, layers, orbit, orbit_layers, type, thumbnail, music) 
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    id,
                    body.name || 'Untitled Template',
                    body.slug ?? null,
                    body.category || 'Wedding',
                    JSON.stringify(body.sections || []),
                    JSON.stringify(body.layers || []),
                    orbit, // orbit
                    orbit, // orbit_layers
                    body.type || 'invitation',
                    body.thumbnail ?? null,
                    body.music ? JSON.stringify(body.music) : null
                ).run();
                return json({ id, ...body }, corsHeaders);
            }

            if (path.startsWith('/api/templates/') && method === 'GET') {
                return await smart_cache(request, 300, async () => {
                    const idOrSlug = path.split('/')[3];
                    // First try by ID
                    let { results } = await env.DB.prepare(
                        'SELECT * FROM templates WHERE id = ?'
                    ).bind(idOrSlug).all();
                    // If not found, try by slug
                    if (results.length === 0) {
                        const slugResult = await env.DB.prepare(
                            'SELECT * FROM templates WHERE slug = ?'
                        ).bind(idOrSlug).all();
                        results = slugResult.results;
                    }
                    if (results.length === 0) return null; // Will trigger 404 in smart_cache or needs handling
                    return parseJsonFields(results[0]);
                });
            }


            if (path.startsWith('/api/templates/') && method === 'PUT') {
                const id = path.split('/')[3];
                try {
                    const body = await request.json();
                    const orbitRaw = body.orbit !== undefined ? body.orbit : body.orbit_layers;
                    const orbit = orbitRaw !== undefined ? JSON.stringify(orbitRaw) : null;

                    await env.DB.prepare(
                        `UPDATE templates SET 
            name = COALESCE(?, name),
            slug = COALESCE(?, slug),
            thumbnail = COALESCE(?, thumbnail),
            category = COALESCE(?, category),
            type = COALESCE(?, type),
            zoom = COALESCE(?, zoom),
            pan = COALESCE(?, pan),
            sections = COALESCE(?, sections),
            layers = COALESCE(?, layers),
            orbit = COALESCE(?, orbit),
            orbit_layers = COALESCE(?, orbit_layers),
            music = COALESCE(?, music),
            updated_at = datetime('now')
         WHERE id = ?`
                    ).bind(
                        body.name ?? null,
                        body.slug ?? null,
                        body.thumbnail ?? null,
                        body.category ?? null,
                        body.type ?? null,
                        body.zoom ?? null,
                        body.pan ? JSON.stringify(body.pan) : null,
                        body.sections ? JSON.stringify(body.sections) : null,
                        body.layers ? JSON.stringify(body.layers) : null,
                        orbit, // Update orbit
                        orbit, // Update orbit_layers (redundancy)
                        body.music ? JSON.stringify(body.music) : null,
                        id
                    ).run();
                    return json({ id, updated: true }, corsHeaders);
                } catch (error) {
                    console.error('Template update error:', error);
                    return json({ error: 'Failed to update template', details: error.message }, { ...corsHeaders, status: 500 });
                }
            }

            if (path.startsWith('/api/templates/') && method === 'DELETE') {
                const id = path.split('/')[3];
                await env.DB.prepare('DELETE FROM templates WHERE id = ?').bind(id).run();
                return json({ id, deleted: true }, corsHeaders);
            }

            // ============================================
            // USER DISPLAY DESIGNS ENDPOINTS (NEW)
            // ============================================
            if (path === '/api/user-display-designs' && method === 'GET') {
                // Filter by user_id or invitation_id (for editor panel use case)
                const urlObj = new URL(request.url);
                const userId = urlObj.searchParams.get('user_id');
                const invitationId = urlObj.searchParams.get('invitation_id');

                let query = 'SELECT * FROM user_display_designs ORDER BY updated_at DESC';
                let params = [];

                if (userId) {
                    query = 'SELECT * FROM user_display_designs WHERE user_id = ? ORDER BY updated_at DESC';
                    params = [userId];
                } else if (invitationId) {
                    query = 'SELECT * FROM user_display_designs WHERE invitation_id = ? ORDER BY updated_at DESC';
                    params = [invitationId];
                }

                try {
                    const { results } = await env.DB.prepare(query).bind(...params).all();
                    return json(results || [], corsHeaders);
                } catch (dbError) {
                    console.error('DB Error fetching display designs:', dbError);
                    return json([], corsHeaders); // Return empty array instead of 500
                }
            }

            if (path === '/api/user-display-designs' && method === 'POST') {
                const body = await request.json();
                const id = crypto.randomUUID();
                await env.DB.prepare(
                    `INSERT INTO user_display_designs(id, user_id, name, content, thumbnail_url, source_template_id) 
     VALUES(?, ?, ?, ?, ?, ?)`
                ).bind(
                    id,
                    body.user_id, // Frontend must send this!
                    body.name || 'Untitled Display',
                    JSON.stringify(body.content || {}),
                    body.thumbnail_url || null,
                    body.source_template_id || null
                ).run();
                return json({ id, ...body }, corsHeaders);
            }


            if (path.match(/^\/api\/user-display-designs\/[^/]+$/) && method === 'PUT') {
                const id = path.split('/')[3];
                const body = await request.json();
                await env.DB.prepare(
                    `UPDATE user_display_designs SET 
         name = COALESCE(?, name),
        content = COALESCE(?, content),
        thumbnail_url = COALESCE(?, thumbnail_url),
        updated_at = datetime('now')
      WHERE id = ? `
                ).bind(
                    body.name ?? null,
                    body.content ? JSON.stringify(body.content) : null,
                    body.thumbnail_url ?? null,
                    id
                ).run();
                return json({ id, updated: true }, corsHeaders);
            }

            if (path.match(/^\/api\/user-display-designs\/[^/]+$/) && method === 'GET') {
                const id = path.split('/')[3];
                const { results } = await env.DB.prepare(
                    'SELECT * FROM user_display_designs WHERE id = ?'
                ).bind(id).all();
                const design = results?.[0];
                if (!design) return notFound(corsHeaders);
                // Parse Content JSON
                design.content = JSON.parse(design.content || '{}');
                return json(design, corsHeaders);
            }

            if (path.match(/^\/api\/user-display-designs\/[^/]+$/) && method === 'DELETE') {
                const id = path.split('/')[3];
                await env.DB.prepare('DELETE FROM user_display_designs WHERE id = ?').bind(id).run();
                return json({ id, deleted: true }, corsHeaders);
            }

            // Welcome Elite: Real-time Multi-Device Command Bus
            if (path.startsWith('/api/trigger/') && (method === 'GET' || method === 'POST')) {
                const parts = path.split('/');
                const id = parts[3];

                let effect = parts[4] || 'confetti';
                let guestName = '';
                let style = 'cinematic';

                if (method === 'POST') {
                    const body = await request.json();
                    effect = body.effect || effect;
                    guestName = body.name || '';
                    style = body.style || 'cinematic';
                }

                const timestamp = Date.now();
                const triggerPayload = JSON.stringify({
                    effect,
                    name: guestName,
                    style,
                    timestamp
                });

                // CTO Optimization: Use D1 prepared statements to broadcast to display designs
                await env.DB.prepare(`
    UPDATE user_display_designs 
    SET content = json_set(COALESCE(content, '{}'), '$.activeTrigger', json(?)),
        updated_at = datetime('now')
    WHERE id = ?
        `).bind(triggerPayload, id).run();

                // Broadcast to invitations (slug or ID)
                await env.DB.prepare(`
    UPDATE invitations 
    SET sections = json_set(COALESCE(sections, '[]'), '$[0].activeTrigger', json(?)),
        updated_at = datetime('now')
    WHERE id = ? OR slug = ?
        `).bind(triggerPayload, id, id).run();

                return json({ triggered: true, effect, name: guestName }, corsHeaders);
            }

            // ============================================
            // SMART PREVIEW RESOLVER (Universal)
            // Tries template first, then invitation (with Expiry Check)
            // ============================================
            if (path.startsWith('/api/preview/') && method === 'GET') {
                return await smart_cache(request, 60, async () => {
                    const slug = path.split('/')[3];
                    if (!slug) return null;

                    // 1. Try Template (Templates never expire)
                    let { results: templateResults } = await env.DB.prepare(
                        'SELECT * FROM templates WHERE slug = ? OR id = ?'
                    ).bind(slug, slug).all();

                    if (templateResults && templateResults.length > 0) {
                        return { data: parseJsonFields(templateResults[0]), source: 'templates' };
                    }

                    // 2. Try Invitation (Join with user to check expiry)
                    let { results: invitationResults } = await env.DB.prepare(`
        SELECT i.*, u.expires_at as user_expires_at, u.tier as user_tier
        FROM invitations i
        JOIN users u ON i.user_id = u.id
        WHERE i.slug = ? OR i.id = ?
    `).bind(slug, slug).all();

                    if (invitationResults && invitationResults.length > 0) {
                        const invitation = invitationResults[0];

                        // SUPER ULTRA LOGIC: Check for Subscription Expiry
                        const now = new Date();
                        const expiresAt = invitation.user_expires_at ? new Date(invitation.user_expires_at) : null;

                        // If expired, return limited data and expired flag
                        if (expiresAt && now > expiresAt) {
                            return {
                                data: {
                                    id: invitation.id,
                                    name: invitation.name,
                                    slug: invitation.slug,
                                    expired: true
                                },
                                source: 'invitations',
                                status: 'EXPIRED'
                            };
                        }

                        return { data: parseJsonFields(invitation), source: 'invitations' };
                    }

                    return null;
                });
            }

            // ============================================
            // INVITATIONS ENDPOINTS
            // ============================================
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

            if (path === '/api/invitations' && method === 'POST') {
                try {
                    const body = await request.json();
                    const userId = body.user_id;

                    // Check Gating: Invitation Limit
                    if (userId) {
                        const { results } = await env.DB.prepare(
                            'SELECT tier, max_invitations, invitation_count FROM users WHERE id = ?'
                        ).bind(userId).all();

                        const user = results[0];
                        if (user && user.invitation_count >= (user.max_invitations || 1)) {
                            return json({ error: 'Invitation limit reached. Please upgrade your plan.' }, { headers: corsHeaders, status: 403 });
                        }
                    }

                    // CTO UNICORN FIX: Smart Slug Resolver
                    // Instead of failing with 409, we auto-resolve collisions to ensure zero-friction onboarding
                    let slug = body.slug ? body.slug.toLowerCase().replace(/\s+/g, '-') : null;
                    if (slug) {
                        // Check for collision
                        const existing = await env.DB.prepare(
                            'SELECT id FROM invitations WHERE slug = ?'
                        ).bind(slug).first();

                        if (existing) {
                            // Collision detected! Append a random suffix to make it unique
                            // In a high-traffic env, we might loop, but for now a 4-char hash is statistically safe
                            const suffix = Math.random().toString(36).substring(2, 6);
                            slug = `${slug}-${suffix}`;
                        }
                    }

                    const id = crypto.randomUUID();
                    let finalUserId = userId;

                    // CTO FIX: If user_id is missing, try to resolve it from email if provided in body
                    if (!finalUserId && body.email) {
                        const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email).first();
                        if (user) finalUserId = user.id;
                    }

                    // If template_id provided, fetch template data for cloning
                    let templateData = null;
                    if (body.template_id) {
                        const { results } = await env.DB.prepare(
                            'SELECT * FROM templates WHERE id = ?'
                        ).bind(body.template_id).all();
                        templateData = results?.[0];
                    }

                    // Merge template data with request body (request body takes priority)
                    const sections = body.sections || (templateData?.sections ? (typeof templateData.sections === 'string' ? JSON.parse(templateData.sections) : templateData.sections) : []);
                    const layers = body.layers || (templateData?.layers ? (typeof templateData.layers === 'string' ? JSON.parse(templateData.layers) : templateData.layers) : []);
                    const orbit = body.orbit || body.orbit_layers || (templateData?.orbit ? (typeof templateData.orbit === 'string' ? JSON.parse(templateData.orbit) : templateData.orbit) : {});
                    const music = body.music || (templateData?.music ? (typeof templateData.music === 'string' ? JSON.parse(templateData.music) : templateData.music) : null);
                    const zoom = body.zoom ?? templateData?.zoom ?? 1;
                    const pan = body.pan || (templateData?.pan ? (typeof templateData.pan === 'string' ? JSON.parse(templateData.pan) : templateData.pan) : { x: 0, y: 0 });
                    const category = body.category || templateData?.category || 'Wedding';
                    const thumbnailUrl = body.thumbnail_url || templateData?.thumbnail || null;

                    const orbitStr = JSON.stringify(orbit);

                    await env.DB.prepare(
                        `INSERT INTO invitations(id, user_id, name, slug, category, zoom, pan, sections, layers, orbit_layers, orbit, music, thumbnail_url, template_id, is_published, event_date, event_location, venue_name, address, google_maps_url, seo_title, seo_description, og_image) 
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                    ).bind(
                        id,
                        userId || null,
                        body.name || 'Untitled Invitation',
                        slug,
                        category,
                        zoom,
                        JSON.stringify(pan),
                        JSON.stringify(sections),
                        JSON.stringify(layers),
                        orbitStr, // orbit_layers
                        orbitStr, // orbit (alias)
                        music ? JSON.stringify(music) : null,
                        thumbnailUrl,
                        body.template_id || null,
                        body.is_published ? 1 : 0,
                        body.event_date || null,
                        body.event_location || null,
                        body.venue_name || null,
                        body.address || null,
                        body.google_maps_url || null,
                        body.seo_title || null,
                        body.seo_description || null,
                        body.og_image || null
                    ).run();

                    // Update User's Invitation Count
                    if (userId) {
                        await env.DB.prepare(
                            'UPDATE users SET invitation_count = invitation_count + 1 WHERE id = ?'
                        ).bind(userId).run();
                    }

                    return json({
                        id,
                        name: body.name,
                        slug: slug,
                        category,
                        zoom,
                        pan,
                        sections,
                        layers,
                        orbit_layers: orbit,
                        music,
                        thumbnail_url: thumbnailUrl,
                        template_id: body.template_id
                    }, corsHeaders);
                } catch (error) {
                    console.error('Create invitation error:', error);
                    return json({
                        error: 'Failed to create invitation',
                        details: error.message,
                        stack: error.stack,
                        context: 'POST /api/invitations'
                    }, { headers: corsHeaders, status: 500 });
                }
            }


            if (path.startsWith('/api/invitations/check-slug/') && method === 'GET') {
                const slug = path.split('/').pop();
                if (!slug) return json({ error: 'Slug required' }, { ...corsHeaders, status: 400 });

                // Check invitations table
                const { results: invResults } = await env.DB.prepare(
                    'SELECT id FROM invitations WHERE slug = ?'
                ).bind(slug).all();

                // Check templates table to avoid collisions with system slugs
                const { results: tempResults } = await env.DB.prepare(
                    'SELECT id FROM templates WHERE slug = ?'
                ).bind(slug).all();

                return json({
                    available: invResults.length === 0 && tempResults.length === 0,
                    slug
                }, corsHeaders);
            }

            // Public Invitation Fetch (Cached for 60s)
            if (path.match(/^\/api\/invitations\/public\/[^/]+$/) && method === 'GET') {
                return await smart_cache(request, 60, async () => {
                    const parts = path.split('/');
                    const id = parts[parts.length - 1];
                    let { results } = await env.DB.prepare(
                        'SELECT * FROM invitations WHERE id = ? OR slug = ?'
                    ).bind(id, id).all();
                    if (results.length === 0) return null;
                    return parseJsonFields(results[0]);
                });
            }

            // Private Invitation Fetch (For Editor - Never Cached)
            if (path.match(/^\/api\/invitations\/[^/]+$/) && method === 'GET' && !path.includes('/public/')) {
                const parts = path.split('/');
                const id = parts[parts.length - 1];
                let { results } = await env.DB.prepare(
                    'SELECT * FROM invitations WHERE id = ? OR slug = ?'
                ).bind(id, id).all();

                if (results.length === 0) return notFound(corsHeaders);
                return json(parseJsonFields(results[0]), corsHeaders);
            }

            if (path.match(/^\/api\/invitations\/[^/]+$/) && method === 'PUT') {
                const id = path.split('/')[3];
                const body = await request.json();
                const traceId = Math.random().toString(36).substring(7);
                console.log(`[PUT Invitations] [${traceId}] Updating invitation ${id}, published: ${body.is_published}`);

                // CTO FIX: Handle partial updates by only stringifying if field is present
                const pan = body.pan !== undefined ? JSON.stringify(body.pan) : null;
                const sections = body.sections !== undefined ? JSON.stringify(body.sections) : null;
                const layers = body.layers !== undefined ? JSON.stringify(body.layers) : null;
                const orbitRaw = body.orbit !== undefined ? body.orbit : body.orbit_layers;
                const orbit = orbitRaw !== undefined ? JSON.stringify(orbitRaw) : null;
                const music = body.music !== undefined ? JSON.stringify(body.music) : null;

                try {
                    console.log(`[DB] Updating invitation ${id} with:`, {
                        name: body.name,
                        is_published: body.is_published,
                        has_sections: !!body.sections,
                        has_music: !!music
                    });
                    await env.DB.prepare(
                        `UPDATE invitations SET 
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        thumbnail_url = COALESCE(?, thumbnail_url),
        category = COALESCE(?, category),
        zoom = COALESCE(?, zoom),
        pan = COALESCE(?, pan),
        sections = COALESCE(?, sections),
        layers = COALESCE(?, layers),
        orbit_layers = COALESCE(?, orbit_layers),
        orbit = COALESCE(?, orbit),
        is_published = COALESCE(?, is_published),
        music = COALESCE(?, music),
        event_date = COALESCE(?, event_date),
        event_location = COALESCE(?, event_location),
        venue_name = COALESCE(?, venue_name),
        address = COALESCE(?, address),
        google_maps_url = COALESCE(?, google_maps_url),
        seo_title = COALESCE(?, seo_title),
        seo_description = COALESCE(?, seo_description),
        og_image = COALESCE(?, og_image),
        gallery_photos = COALESCE(?, gallery_photos),
        livestream_url = COALESCE(?, livestream_url),
        love_story = COALESCE(?, love_story),
        quote_text = COALESCE(?, quote_text),
        quote_author = COALESCE(?, quote_author),
        lucky_draw_settings = COALESCE(?, lucky_draw_settings),
        display_design_id = COALESCE(?, display_design_id),
        updated_at = datetime('now')
     WHERE id = ? OR slug = ?`
                    ).bind(
                        body.name ?? null,
                        body.slug ?? null,
                        body.thumbnail_url ?? null,
                        body.category ?? null,
                        body.zoom ?? null,
                        pan,
                        sections,
                        layers,
                        orbit, // orbit_layers
                        orbit, // orbit (alias)
                        body.is_published !== undefined ? (body.is_published ? 1 : 0) : null,
                        music,
                        body.event_date ?? null,
                        body.event_location ?? null,
                        body.venue_name ?? null,
                        body.address ?? null,
                        body.google_maps_url ?? null,
                        body.seo_title ?? null,
                        body.seo_description ?? null,
                        body.og_image ?? null,
                        body.gallery_photos ? JSON.stringify(body.gallery_photos) : null,
                        body.livestream_url ?? null,
                        body.love_story ? JSON.stringify(body.love_story) : null,
                        body.quote_text ?? null,
                        body.quote_author ?? null,
                        body.lucky_draw_settings ? JSON.stringify(body.lucky_draw_settings) : null,
                        body.display_design_id ?? null,
                        id, // WHERE id = ?
                        id  // OR slug = ?
                    ).run();
                    return json({ id, updated: true }, corsHeaders);
                } catch (dbError) {
                    console.error('[DB Error] Update invitation failed:', dbError.message);
                    return json({
                        error: 'Database update failed',
                        details: dbError.message,
                        code: 'DB_ERROR'
                    }, { headers: corsHeaders, status: 500 });
                }
            }

            if (path.match(/^\/api\/invitations\/[^/]+$/) && method === 'DELETE') {
                const id = path.split('/')[3];

                // Get invitation to find user_id
                const { results } = await env.DB.prepare('SELECT user_id FROM invitations WHERE id = ?').bind(id).all();
                const invitation = results[0];

                await env.DB.prepare('DELETE FROM invitations WHERE id = ? OR slug = ?').bind(id, id).run();

                // If deleted by user, decrement count
                if (invitation && invitation.user_id) {
                    await env.DB.prepare(
                        'UPDATE users SET invitation_count = MAX(0, invitation_count - 1) WHERE id = ?'
                    ).bind(invitation.user_id).run();
                }

                return json({ id, deleted: true }, corsHeaders);
            }

            // ============================================
            // RSVP & WISHES ENDPOINTS
            // ============================================

            // New endpoint to fetch all wishes with invitation details
            if (path === '/api/wishes' && method === 'GET') {
                const { results } = await env.DB.prepare(`
    SELECT r.*, i.name as invitation_name, i.slug as invitation_slug
    FROM rsvp_responses r
    JOIN invitations i ON r.invitation_id = i.id
    WHERE r.deleted_at IS NULL
    ORDER BY r.submitted_at DESC
    LIMIT 200
        `).all();
                return json(results, corsHeaders);
            }

            if (path.match(/^\/api\/invitations\/[^/]+\/rsvp$/) && method === 'GET') {
                const invitationId = path.split('/')[3];
                const { results } = await env.DB.prepare(
                    `SELECT * FROM rsvp_responses 
     WHERE invitation_id = ? AND is_visible = 1 AND deleted_at IS NULL
     ORDER BY submitted_at DESC`
                ).bind(invitationId).all();
                return json(results, corsHeaders);
            }

            if (path.match(/^\/api\/invitations\/[^/]+\/rsvp$/) && method === 'POST') {
                const invitationId = path.split('/')[3];
                const body = await request.json();
                const id = crypto.randomUUID();
                await env.DB.prepare(
                    `INSERT INTO rsvp_responses
        (id, invitation_id, name, email, phone, attendance, guest_count, message, ip_address, user_agent)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    id, invitationId,
                    body.name, body.email || null, body.phone || null,
                    body.attendance, body.guest_count || 1, body.message || null,
                    request.headers.get('CF-Connecting-IP'),
                    request.headers.get('User-Agent')
                ).run();
                return json({ id, success: true }, corsHeaders);
            }

            // RSVPs moderation (PUT/DELETE)
            if (path.startsWith('/api/rsvp/') && (method === 'PUT' || method === 'DELETE')) {
                const id = path.split('/')[3];
                if (method === 'DELETE') {
                    await env.DB.prepare(
                        'UPDATE rsvp_responses SET deleted_at = datetime("now") WHERE id = ?'
                    ).bind(id).run();
                    return json({ id, deleted: true }, corsHeaders);
                }

                const body = await request.json();
                await env.DB.prepare(
                    `UPDATE rsvp_responses SET 
        is_visible = COALESCE(?, is_visible),
        attendance = COALESCE(?, attendance),
        message = COALESCE(?, message),
        updated_at = datetime('now')
     WHERE id = ? `
                ).bind(
                    body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : null,
                    body.attendance ?? null,
                    body.message ?? null,
                    id
                ).run();
                return json({ id, updated: true }, corsHeaders);
            }

            // INVITIATION ANALYTICS
            if (path.match(/^\/api\/invitations\/[^/]+\/analytics$/) && method === 'GET') {
                const invitationId = path.split('/')[3];

                // 1. Fetch RSVP stats
                const rsvpStats = await env.DB.prepare(`
    SELECT 
        COUNT(*) as total_rsvp,
        SUM(CASE WHEN attendance = 'attending' THEN 1 ELSE 0 END) as attending_count,
        SUM(CASE WHEN attendance = 'not_attending' THEN 1 ELSE 0 END) as not_attending_count,
        SUM(CASE WHEN attendance = 'maybe' THEN 1 ELSE 0 END) as maybe_count,
        SUM(CASE WHEN attendance = 'attending' THEN guest_count ELSE 0 END) as total_pax
    FROM rsvp_responses 
    WHERE invitation_id = ? AND deleted_at IS NULL
`).bind(invitationId).first();

                // 2. Fetch Guest stats
                const guestStats = await env.DB.prepare(`
    SELECT 
        COUNT(*) as total_guests,
        SUM(CASE WHEN checked_in_at IS NOT NULL THEN 1 ELSE 0 END) as checked_in_count
    FROM guests 
    WHERE invitation_id = ?
`).bind(invitationId).first();

                return json({
                    rsvp: {
                        total: rsvpStats.total_rsvp || 0,
                        attending: rsvpStats.attending_count || 0,
                        notAttending: rsvpStats.not_attending_count || 0,
                        maybe: rsvpStats.maybe_count || 0,
                        totalPax: rsvpStats.total_pax || 0
                    },
                    guests: {
                        total: guestStats.total_guests || 0,
                        checkedIn: guestStats.checked_in_count || 0,
                        presenceRatio: guestStats.total_guests > 0
                            ? Math.round((guestStats.checked_in_count / guestStats.total_guests) * 100)
                            : 0
                    }
                }, corsHeaders);
            }


            // ============================================
            // ASSET UPLOAD (R2)
            // ============================================
            if (path === '/api/upload' && method === 'POST') {
                const formData = await request.formData();
                const file = formData.get('file');
                if (!file) {
                    return new Response(JSON.stringify({ error: 'No file provided' }), {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                const filename = `${Date.now()} - ${file.name}`;
                const key = `uploads / ${filename}`;

                await env.ASSETS.put(key, file.stream(), {
                    httpMetadata: { contentType: file.type }
                });

                const publicUrl = `https://tamuu-api.shafania57.workers.dev/assets/${key}`;

                // Get user_id from form data if provided
                const userId = formData.get('user_id');

                // Save to database with user_id
                const id = crypto.randomUUID();
                await env.DB.prepare(
                    `INSERT INTO assets (id, user_id, filename, content_type, size, r2_key, public_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
                ).bind(id, userId || null, file.name, file.type, file.size, key, publicUrl).run();

                return json({ id, url: publicUrl, key }, corsHeaders);
            }

            // ============================================
            // SERVE ASSETS FROM R2
            // ============================================
            if (path.startsWith('/assets/')) {
                const key = path.replace('/assets/', '');
                const object = await env.ASSETS.get(key);
                if (!object) return notFound(corsHeaders);

                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set('etag', object.httpEtag);
                headers.set('Cache-Control', 'public, max-age=31536000, immutable');

                // CORS & COEP/CORP Headers - Required for cross-origin embedding
                headers.set('Access-Control-Allow-Origin', '*');
                headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

                return new Response(object.body, { headers });
            }

            // ============================================
            // HEALTH CHECK
            // ============================================
            if (path === '/api/health') {
                return json({ status: 'ok', timestamp: new Date().toISOString() }, corsHeaders);
            }

            return notFound(corsHeaders);

        } catch (error) {
            console.error('API Error:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
}

function json(data, options = {}) {
    // Handle both json(data, corsHeaders) and json(data, { headers: corsHeaders, status: 200 })
    let headers = {};
    let status = 200;

    if (options['Access-Control-Allow-Origin']) {
        // corsHeaders was passed directly
        headers = options;
    } else {
        // Options object was passed
        headers = options.headers || {};
        status = options.status || 200;
    }

    return new Response(JSON.stringify(data), {
        status: status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            ...headers
        }
    });
}

function notFound(corsHeaders) {
    return json({ error: 'Not found' }, { headers: corsHeaders, status: 404 });
}

function parseJsonFields(row) {
    const jsonFields = ['pan', 'sections', 'layers', 'orbit', 'orbit_layers', 'music'];

    const result = { ...row };
    for (const field of jsonFields) {
        if (result[field] && typeof result[field] === 'string') {
            try {
                result[field] = JSON.parse(result[field]);
            } catch (e) {
                console.error(`[API] Failed to parse JSON for field ${field}:`, e);
                // Fallback to defaults for critical fields
                if (field === 'sections' || field === 'layers' || field === 'orbit_layers') {
                    result[field] = field === 'orbit_layers' ? {} : [];
                }
            }
        } else if (!result[field]) {
            // Provide defaults if field is null/missing
            if (field === 'sections' || field === 'layers') result[field] = [];
            else if (field === 'orbit' || field === 'orbit_layers') result[field] = {};
        }
    }

    // Aliasing logic for backward compatibility
    if (result.orbit && (Object.keys(result.orbit).length > 0) && (!result.orbit_layers || Object.keys(result.orbit_layers).length === 0)) {
        result.orbit_layers = result.orbit;
    } else if (result.orbit_layers && (Object.keys(result.orbit_layers).length > 0) && (!result.orbit || Object.keys(result.orbit).length === 0)) {
        result.orbit = result.orbit_layers;
    }

    return result;
}
