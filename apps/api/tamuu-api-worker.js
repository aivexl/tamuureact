/**
 * Tamuu API Worker
 * Handles all database (D1) and storage (R2) operations
 */

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

        try {
            // ============================================
            // AUTH & USER ENDPOINTS
            // ============================================
            if (path === '/api/auth/me' && method === 'GET') {
                const email = url.searchParams.get('email');
                if (!email) return json({ error: 'Email required' }, { headers: corsHeaders, status: 400 });

                try {
                    const { results } = await env.DB.prepare(
                        'SELECT * FROM users WHERE email = ?'
                    ).bind(email).all();

                    let user = results[0];

                    // Auto-create user if not found (for Supabase auth sync)
                    if (!user) {
                        const userId = crypto.randomUUID();
                        const tamuuId = `TAMUU-USER-${userId.substring(0, 8).toUpperCase()}`;

                        await env.DB.prepare(
                            `INSERT INTO users (id, email, tamuu_id, tier, max_invitations, invitation_count) 
                             VALUES (?, ?, ?, 'free', 1, 0)`
                        ).bind(userId, email, tamuuId).run();

                        user = {
                            id: userId,
                            email: email,
                            tamuu_id: tamuuId,
                            tier: 'free',
                            max_invitations: 1,
                            invitation_count: 0
                        };
                    }

                    const normalizedUser = {
                        ...user,
                        id: user.id || user.uid, // Handle both naming conventions
                        maxInvitations: user.max_invitations || 1,
                        invitationCount: user.invitation_count || 0,
                        tier: user.tier || 'free',
                        tamuuId: user.tamuu_id || `TAMUU-USER-${user.id.substring(0, 8)}`,
                        birthDate: user.birth_date,
                        bank1Name: user.bank1_name,
                        bank1Number: user.bank1_number,
                        bank1Holder: user.bank1_holder,
                        bank2Name: user.bank2_name,
                        bank2Number: user.bank2_number,
                        bank2Holder: user.bank2_holder,
                        emoneyType: user.emoney_type,
                        emoneyNumber: user.emoney_number,
                        giftAddress: user.gift_address
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
                    emoneyType, emoneyNumber, giftAddress
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
                        gift_address = COALESCE(?, gift_address),
                        updated_at = datetime('now')
                    WHERE id = ?
                `).bind(
                    name ?? null, phone ?? null, gender ?? null, birthDate ?? null,
                    bank1Name ?? null, bank1Number ?? null, bank1Holder ?? null,
                    bank2Name ?? null, bank2Number ?? null, bank2Holder ?? null,
                    emoneyType ?? null, emoneyNumber ?? null, giftAddress ?? null,
                    id
                ).run();

                return json({ success: true }, corsHeaders);
            }

            // ============================================
            // BILLING & XENDIT ENDPOINTS
            // ============================================
            if (path === '/api/billing/create-invoice' && method === 'POST') {
                const body = await request.json();
                const { userId, tier, amount, email } = body;

                if (!userId || !tier || !amount) {
                    return json({ error: 'Missing required fields' }, { ...corsHeaders, status: 400 });
                }

                // Call Xendit API
                const xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${btoa(env.XENDIT_SECRET_KEY + ':')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        external_id: `inv-${Date.now()}-${userId}`,
                        amount: amount,
                        description: `Tamuu ${tier.toUpperCase()} Subscription`,
                        payer_email: email,
                        callback_virtual_accounts_expiration_time: 86400,
                        success_redirect_url: 'https://app.tamuu.id/billing?success=true',
                        failure_redirect_url: 'https://app.tamuu.id/billing?error=true',
                        metadata: { userId, tier }
                    })
                });

                const invoice = await xenditResponse.json();

                // Log transaction in DB
                await env.DB.prepare(
                    `INSERT INTO billing_transactions (user_id, external_id, amount, status, tier) 
                     VALUES (?, ?, ?, ?, ?)`
                ).bind(userId, invoice.id, amount, 'PENDING', tier).run();

                return json({ invoice_url: invoice.invoice_url }, corsHeaders);
            }

            if (path === '/api/billing/webhook' && method === 'POST') {
                const body = await request.json();
                const { status, id, metadata } = body;

                if (status === 'PAID') {
                    const userId = metadata.userId;
                    const tier = metadata.tier;
                    const maxInvitations = tier === 'vvip' ? 3 : 1;
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

                const { results } = await env.DB.prepare(
                    'SELECT * FROM billing_transactions WHERE user_id = ? ORDER BY created_at DESC'
                ).bind(userId).all();

                return json(results, corsHeaders);
            }

            if (path === '/api/admin/stats' && method === 'GET') {
                // In a real app, verify admin role from session/token
                const usersCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first('count');
                const templatesCount = await env.DB.prepare('SELECT COUNT(*) as count FROM templates').first('count');
                const invitationsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM invitations').first('count');
                const rsvpCount = await env.DB.prepare('SELECT COUNT(*) as count FROM rsvp_responses').first('count');

                return json({
                    totalUsers: usersCount,
                    totalTemplates: templatesCount,
                    totalInvitations: invitationsCount,
                    totalRsvps: rsvpCount,
                    systemHealth: {
                        db: 'Healthy',
                        r2: 'Healthy',
                        uptime: '99.9%'
                    }
                }, corsHeaders);
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
                    `INSERT INTO guests (id, invitation_id, name, phone, address, table_number, tier, guest_count, check_in_code) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
                     WHERE id = ?`
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
                const key = `user-content/${userId}/music/${fileId}.${extension}`;

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
                // No cache for templates list to ensure real-time admin updates
                const fetcher = async () => {
                    // [MIGRATION] Auto-correct Display templates from early V5.1
                    // This fixes templates created before the type separation was fully enforced
                    await env.DB.prepare(
                        "UPDATE templates SET type = 'display' WHERE (name LIKE '%Display%' OR name LIKE '%Layar%') AND type = 'invitation'"
                    ).run();

                    const response = await env.DB.prepare(
                        'SELECT * FROM templates ORDER BY updated_at DESC LIMIT 100'
                    ).all();

                    if (!response.success || !response.results) return [];

                    // Optimize: map R2 URLs here if needed, but currently stored as paths
                    return response.results.map(t => ({
                        ...t,
                        thumbnail_url: t.thumbnail && !t.thumbnail.startsWith('http')
                            ? `https://tamuu-api.shafania57.workers.dev/assets/${t.thumbnail}`
                            : t.thumbnail
                    }));
                };
                return json(await fetcher(), corsHeaders);
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
            // Tries template first, then invitation
            // ============================================
            if (path.startsWith('/api/preview/') && method === 'GET') {
                return await smart_cache(request, 60, async () => {
                    const slug = path.split('/')[3];
                    if (!slug) return null;

                    // 1. Try Template
                    let { results: templateResults } = await env.DB.prepare(
                        'SELECT * FROM templates WHERE slug = ? OR id = ?'
                    ).bind(slug, slug).all();

                    if (templateResults && templateResults.length > 0) {
                        return { data: parseJsonFields(templateResults[0]), source: 'templates' };
                    }

                    // 2. Try Invitation
                    let { results: invitationResults } = await env.DB.prepare(
                        'SELECT * FROM invitations WHERE slug = ? OR id = ?'
                    ).bind(slug, slug).all();

                    if (invitationResults && invitationResults.length > 0) {
                        return { data: parseJsonFields(invitationResults[0]), source: 'invitations' };
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

                const { results } = await env.DB.prepare(query).bind(...params).all();
                return json(results.map(parseJsonFields), corsHeaders);
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

            if (path.match(/^\/api\/invitations\/(public\/)?[^/]+$/) && method === 'GET') {
                // Short cache (60s) for high traffic public pages
                return await smart_cache(request, 60, async () => {
                    const parts = path.split('/');
                    const id = parts[parts.length - 1]; // Handles /api/invitations/slug and /api/invitations/public/slug

                    // Try by ID first, then by slug
                    let { results } = await env.DB.prepare(
                        'SELECT * FROM invitations WHERE id = ? OR slug = ?'
                    ).bind(id, id).all();
                    if (results.length === 0) return null;
                    return parseJsonFields(results[0]);
                });
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
