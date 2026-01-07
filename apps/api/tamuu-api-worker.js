/**
 * Tamuu API Worker
 * Handles all database (D1) and storage (R2) operations
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

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
            // TEMPLATES ENDPOINTS
            // ============================================
            if (path === '/api/templates' && method === 'GET') {
                console.log('GET /api/templates - Start');
                const response = await env.DB.prepare(
                    'SELECT * FROM templates ORDER BY updated_at DESC LIMIT 100'
                ).all();
                console.log('D1 Response success:', response.success);
                console.log('D1 Results length:', response.results ? response.results.length : 'undefined');
                return json(response.results || [], corsHeaders);
            }



            if (path === '/api/templates' && method === 'POST') {
                const body = await request.json();
                const id = crypto.randomUUID();
                await env.DB.prepare(
                    `INSERT INTO templates (id, name, slug, category, sections, layers, type, thumbnail) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    id,
                    body.name || 'Untitled Template',
                    body.slug || null,
                    body.category || 'Wedding',
                    JSON.stringify(body.sections || []),
                    JSON.stringify(body.layers || []),
                    body.type || 'invitation',
                    body.thumbnail_url || null
                ).run();
                return json({ id, ...body }, corsHeaders);
            }

            if (path.startsWith('/api/templates/') && method === 'GET') {
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
                if (results.length === 0) return notFound(corsHeaders);
                return json(parseJsonFields(results[0]), corsHeaders);
            }


            if (path.startsWith('/api/templates/') && method === 'PUT') {
                const id = path.split('/')[3];
                try {
                    const body = await request.json();
                    await env.DB.prepare(
                        `UPDATE templates SET 
                            name = COALESCE(?, name),
                            slug = COALESCE(?, slug),
                            thumbnail = COALESCE(?, thumbnail),
                            category = COALESCE(?, category),
                            zoom = COALESCE(?, zoom),
                            pan = COALESCE(?, pan),
                            sections = COALESCE(?, sections),
                            layers = COALESCE(?, layers),
                            updated_at = datetime('now')
                         WHERE id = ?`
                    ).bind(
                        body.name || null,
                        body.slug || null,
                        body.thumbnail || null,
                        body.category || null,
                        body.zoom ?? null,
                        body.pan ? JSON.stringify(body.pan) : null,
                        body.sections ? JSON.stringify(body.sections) : null,
                        body.layers ? JSON.stringify(body.layers) : null,
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
                // In a real app, strict User ID filtering happens here via auth token.
                // For this worker prototype, we assume the frontend sends a query param or header,
                // BUT current architecture is open. We'll simply list all for now or filter by user_id if passed.
                // Assuming RLS usually handles this, but since this worker interacts with D1 directly with service role, 
                // we should filter.

                const urlObj = new URL(request.url);
                const userId = urlObj.searchParams.get('user_id');

                let query = 'SELECT * FROM user_display_designs ORDER BY updated_at DESC';
                let params = [];

                if (userId) {
                    query = 'SELECT * FROM user_display_designs WHERE user_id = ? ORDER BY updated_at DESC';
                    params = [userId];
                }

                const { results } = await env.DB.prepare(query).bind(...params).all();
                return json(results, corsHeaders);
            }

            if (path === '/api/user-display-designs' && method === 'POST') {
                const body = await request.json();
                const id = crypto.randomUUID();
                await env.DB.prepare(
                    `INSERT INTO user_display_designs (id, user_id, name, content, thumbnail_url, source_template_id) 
                     VALUES (?, ?, ?, ?, ?, ?)`
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
                      WHERE id = ?`
                ).bind(
                    body.name,
                    JSON.stringify(body.content),
                    body.thumbnail_url,
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
            // INVITATIONS ENDPOINTS
            // ============================================
            if (path === '/api/invitations' && method === 'GET') {
                const { results } = await env.DB.prepare(
                    'SELECT * FROM invitations ORDER BY updated_at DESC LIMIT 100'
                ).all();
                return json(results.map(parseJsonFields), corsHeaders);
            }

            if (path === '/api/invitations' && method === 'POST') {
                const body = await request.json();
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
                const sections = body.sections || (templateData?.sections ? JSON.parse(templateData.sections) : []);
                const layers = body.layers || (templateData?.layers ? JSON.parse(templateData.layers) : []);
                const orbit = body.orbit || body.orbit_layers || (templateData?.orbit ? JSON.parse(templateData.orbit) : {});
                const zoom = body.zoom ?? templateData?.zoom ?? 1;
                const pan = body.pan || (templateData?.pan ? JSON.parse(templateData.pan) : { x: 0, y: 0 });
                const category = body.category || templateData?.category || 'Wedding';
                const thumbnailUrl = body.thumbnail_url || templateData?.thumbnail || null;

                await env.DB.prepare(
                    `INSERT INTO invitations (id, name, slug, category, zoom, pan, sections, layers, orbit_layers, thumbnail_url, template_id, is_published, display_design_id) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    id,
                    body.name || 'Untitled Invitation',
                    body.slug || null,
                    category,
                    zoom,
                    JSON.stringify(pan),
                    JSON.stringify(sections),
                    JSON.stringify(layers),
                    JSON.stringify(orbit),
                    thumbnailUrl,
                    body.template_id || null,
                    body.is_published ? 1 : 0,
                    body.display_design_id || null
                ).run();

                return json({
                    id,
                    name: body.name,
                    slug: body.slug,
                    category,
                    zoom,
                    pan,
                    sections,
                    layers,
                    orbit_layers: orbit,
                    thumbnail_url: thumbnailUrl,
                    template_id: body.template_id
                }, corsHeaders);
            }


            if (path.match(/^\/api\/invitations\/[^/]+$/) && method === 'GET') {
                const id = path.split('/')[3];
                // Try by ID first, then by slug
                let { results } = await env.DB.prepare(
                    'SELECT * FROM invitations WHERE id = ? OR slug = ?'
                ).bind(id, id).all();
                if (results.length === 0) return notFound(corsHeaders);
                return json(parseJsonFields(results[0]), corsHeaders);
            }

            if (path.match(/^\/api\/invitations\/[^/]+$/) && method === 'PUT') {
                const id = path.split('/')[3];
                const body = await request.json();
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
                        is_published = COALESCE(?, is_published),
                        display_design_id = COALESCE(?, display_design_id),
                        updated_at = datetime('now')
                     WHERE id = ?`
                ).bind(
                    body.name, body.slug, body.thumbnail_url, body.category,
                    body.zoom, JSON.stringify(body.pan),
                    JSON.stringify(body.sections), JSON.stringify(body.layers),
                    JSON.stringify(body.orbit_layers), body.is_published !== undefined ? (body.is_published ? 1 : 0) : null,
                    body.display_design_id !== undefined ? body.display_design_id : null,
                    id
                ).run();
                return json({ id, updated: true }, corsHeaders);
            }

            if (path.match(/^\/api\/invitations\/[^/]+$/) && method === 'DELETE') {
                const id = path.split('/')[3];
                await env.DB.prepare('DELETE FROM invitations WHERE id = ?').bind(id).run();
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
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
                     WHERE id = ?`
                ).bind(
                    body.is_visible !== undefined ? (body.is_visible ? 1 : 0) : null,
                    body.attendance,
                    body.message,
                    id
                ).run();
                return json({ id, updated: true }, corsHeaders);
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

                const filename = `${Date.now()}-${file.name}`;
                const key = `uploads/${filename}`;

                await env.ASSETS.put(key, file.stream(), {
                    httpMetadata: { contentType: file.type }
                });

                const publicUrl = `https://api.tamuu.id/assets/${key}`;

                // Save to database
                const id = crypto.randomUUID();
                await env.DB.prepare(
                    `INSERT INTO assets (id, filename, content_type, size, r2_key, public_url)
                     VALUES (?, ?, ?, ?, ?, ?)`
                ).bind(id, file.name, file.type, file.size, key, publicUrl).run();

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
                headers.set('Cache-Control', 'public, max-age=31536000');

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
};

// Helper functions
function json(data, corsHeaders) {
    return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

function notFound(corsHeaders) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

function parseJsonFields(row) {
    const jsonFields = ['pan', 'sections', 'layers', 'orbit_layers', 'orbit'];

    const result = { ...row };
    for (const field of jsonFields) {
        if (result[field] && typeof result[field] === 'string') {
            try {
                result[field] = JSON.parse(result[field]);
            } catch (e) {
                // keep as string if parse fails
            }
        }
    }
    return result;
}
