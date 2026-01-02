/**
 * TamuuID CDN Worker
 * Serves BiRefNet model from R2 with CORS and caching
 */


export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const key = url.pathname.slice(1);

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }

        // Only allow GET/HEAD
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        // Get object from R2
        const object = await env.BUCKET.get(key);

        if (!object) {
            return new Response('Not Found', { status: 404 });
        }

        // Return with proper headers
        const headers = new Headers();
        headers.set('Content-Type', 'application/octet-stream');
        headers.set('Content-Length', object.size);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('ETag', object.httpEtag);

        return new Response(object.body, { headers });
    },
};
