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
                const { results } = await env.DB.prepare(
                    'SELECT * FROM templates ORDER BY updated_at DESC LIMIT 100'
                ).all();
                return json(results, corsHeaders);
            }

            if (path === '/api/templates' && method === 'POST') {
                const body = await request.json();
                const id = crypto.randomUUID();
                await env.DB.prepare(
                    `INSERT INTO templates (id, name, slug, category, sections, layers) 
                     VALUES (?, ?, ?, ?, ?, ?)`
                ).bind(
                    id,
                    body.name || 'Untitled Template',
                    body.slug || null,
                    body.category || 'Wedding',
                    JSON.stringify(body.sections || []),
                    JSON.stringify(body.layers || [])
                ).run();
                return json({ id, ...body }, corsHeaders);
            }

            if (path.startsWith('/api/templates/') && method === 'GET') {
                const id = path.split('/')[3];
                const { results } = await env.DB.prepare(
                    'SELECT * FROM templates WHERE id = ?'
                ).bind(id).all();
                if (results.length === 0) return notFound(corsHeaders);
                return json(parseJsonFields(results[0]), corsHeaders);
            }

            if (path.startsWith('/api/templates/') && method === 'PUT') {
                const id = path.split('/')[3];
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
                    body.name, body.slug, body.thumbnail, body.category,
                    body.zoom, JSON.stringify(body.pan),
                    JSON.stringify(body.sections), JSON.stringify(body.layers),
                    id
                ).run();
                return json({ id, updated: true }, corsHeaders);
            }

            if (path.startsWith('/api/templates/') && method === 'DELETE') {
                const id = path.split('/')[3];
                await env.DB.prepare('DELETE FROM templates WHERE id = ?').bind(id).run();
                return json({ id, deleted: true }, corsHeaders);
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
                await env.DB.prepare(
                    `INSERT INTO invitations (id, name, slug, category, sections, layers, orbit_layers) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    id,
                    body.name || 'Untitled Invitation',
                    body.slug || null,
                    body.category || 'Wedding',
                    JSON.stringify(body.sections || []),
                    JSON.stringify(body.layers || []),
                    JSON.stringify(body.orbit_layers || [])
                ).run();
                return json({ id, ...body }, corsHeaders);
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
                        updated_at = datetime('now')
                     WHERE id = ?`
                ).bind(
                    body.name, body.slug, body.thumbnail_url, body.category,
                    body.zoom, JSON.stringify(body.pan),
                    JSON.stringify(body.sections), JSON.stringify(body.layers),
                    JSON.stringify(body.orbit_layers), body.is_published ? 1 : 0,
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
            // RSVP ENDPOINTS
            // ============================================
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

                const publicUrl = `https://assets.tamuu.id/${key}`;

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
    const jsonFields = ['pan', 'sections', 'layers', 'orbit_layers'];
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
