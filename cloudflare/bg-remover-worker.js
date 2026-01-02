/**
 * Cloudflare Worker - Background Removal API
 * Uses R2 for temporary storage + Image Transformations (segment=foreground)
 * FREE: R2 (10GB) + 5,000 transformations/month
 */

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders() });
        }

        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Method not allowed' }, 405);
        }

        const imageKey = `temp/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;

        try {
            const formData = await request.formData();
            const imageFile = formData.get('image');

            if (!imageFile) {
                return jsonResponse({ error: 'No image provided' }, 400);
            }

            // Get image data
            const imageBuffer = await imageFile.arrayBuffer();
            const mimeType = imageFile.type || 'image/png';

            console.log('Uploading to R2:', imageKey, 'size:', imageBuffer.byteLength);

            // Upload to R2
            await env.R2_BUCKET.put(imageKey, imageBuffer, {
                httpMetadata: { contentType: mimeType },
            });

            // Construct the public URL through tamuu.id
            // Image transformations work on URLs through the zone
            // We need to access it via: https://tamuu.id/cdn-cgi/image/segment=foreground/r2-url

            // First, we need the R2 public URL
            // R2 bucket needs to be connected to a custom domain or use public access
            // Alternative: Use the cf.image fetch option

            // Get the object back and transform it
            const r2Object = await env.R2_BUCKET.get(imageKey);

            if (!r2Object) {
                return jsonResponse({ error: 'Failed to retrieve uploaded image' }, 500);
            }

            // For Image Transformations to work, we need to proxy through the zone
            // Using the fetch API with cf.image options
            // But this requires the image to be on a URL...

            // Alternative approach: Use the Image Resizing API directly
            // by fetching from a URL that goes through Cloudflare

            // Since R2 is internal, we'll construct a signed URL or use worker URL
            const workerUrl = new URL(request.url);
            const imageUrl = `${workerUrl.origin}/r2/${imageKey}`;

            console.log('Image URL for transform:', imageUrl);

            // Fetch with image transformation
            // Note: This requires the worker to be on a zone with Image Resizing enabled
            const transformResponse = await fetch(imageUrl, {
                cf: {
                    image: {
                        // Background removal transformation
                        segment: 'foreground',
                        format: 'png',
                    }
                }
            });

            if (!transformResponse.ok) {
                console.log('Transform failed:', transformResponse.status);
                // Return original image if transform fails
                const body = await r2Object.arrayBuffer();
                ctx.waitUntil(env.R2_BUCKET.delete(imageKey));
                return new Response(body, {
                    headers: {
                        'Content-Type': mimeType,
                        'X-Transform': 'failed',
                        ...corsHeaders(),
                    },
                });
            }

            const resultBuffer = await transformResponse.arrayBuffer();

            // Cleanup R2
            ctx.waitUntil(env.R2_BUCKET.delete(imageKey));

            return new Response(resultBuffer, {
                headers: {
                    'Content-Type': 'image/png',
                    'X-Model': 'cloudflare-birefnet',
                    ...corsHeaders(),
                },
            });

        } catch (error) {
            console.error('Error:', error);
            // Cleanup on error
            ctx.waitUntil(env.R2_BUCKET.delete(imageKey).catch(() => { }));
            return jsonResponse({ error: 'Processing failed', message: error.message }, 500);
        }
    },
};

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
}
