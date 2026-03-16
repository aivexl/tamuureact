/**
 * Tamuu SEO & Social Proxy Worker
 * Intercepts requests from crawlers (WhatsApp, Telegram, etc.) to inject dynamic OG meta tags.
 * For regular users, it serves the standard index.html from Pages.
 */

const API_BASE = 'https://api.tamuu.id';
const PAGES_DOMAIN = 'tamuu.pages.dev'; // Base Pages domain

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const userAgent = request.headers.get('User-Agent') || '';
        
        // CRAWLER DETECTION: Identify social media and search bots
        const isCrawler = /bot|facebook|whatsapp|telegram|slack|twitter|linkedin|discord|bing|google/i.test(userAgent);
        
        // Only intercept path-based invitation links (e.g., /wedding-slug or /wedding-slug/guest-slug)
        const pathParts = url.pathname.split('/').filter(p => p);
        const isInvitationLink = pathParts.length >= 1 && 
                                !url.pathname.includes('.') && 
                                !url.pathname.startsWith('/api') &&
                                !url.pathname.startsWith('/assets') &&
                                !['dashboard', 'login', 'signup', 'onboarding', 'upgrade', 'billing', 'admin'].includes(pathParts[0]);

        if (isCrawler && isInvitationLink) {
            console.log(`[SEO Proxy] Crawler detected: ${userAgent} for path: ${url.pathname}`);
            return await handleCrawler(request, pathParts);
        }

        // For regular users or non-invitation paths, forward to the Pages site
        // We fetch from the Pages domain but keep the original request URL details
        const pagesUrl = new URL(request.url);
        pagesUrl.hostname = PAGES_DOMAIN;
        
        return fetch(pagesUrl, request);
    },
};

async function handleCrawler(request, pathParts) {
    const slug = pathParts[0];
    const guestSlug = pathParts[1];
    
    try {
        // Fetch invitation data from API
        const response = await fetch(`${API_BASE}/api/preview/${slug}`);
        if (!response.ok) throw new Error('API fetch failed');
        
        const preview = await response.json();
        if (!preview || !preview.data) throw new Error('Invalid preview data');
        
        const invitation = preview.data;
        
        // Resolve Guest Name if guestSlug exists
        let guestName = 'Bapak/Ibu/Saudara/i';
        if (guestSlug) {
            try {
                const gRes = await fetch(`${API_BASE}/api/guests/by-slug/${guestSlug}`);
                if (gRes.ok) {
                    const guest = await gRes.json();
                    guestName = guest.name || guestName;
                }
            } catch (e) {
                console.warn('[SEO Proxy] Guest resolution failed:', e.message);
            }
        }

        // UNIFIED IDENTITY: SEO Metadata Construction
        const baseTitle = (invitation.seo_title || invitation.name || slug).toUpperCase();
        const seoTitle = guestSlug ? `${baseTitle} - KHUSUS UNTUK ${guestName.toUpperCase()}` : baseTitle;
        const seoDescription = invitation.seo_description || 'Exclusive Digital Invitation - Private Access';
        
        // DYNAMIC OG IMAGE ENGINE
        let dynamicOgImage = invitation.og_image || invitation.thumbnail_url;
        
        // Construct API OG URL if settings exist
        const ogSettings = invitation.og_settings ? (typeof invitation.og_settings === 'string' ? JSON.parse(invitation.og_settings) : invitation.og_settings) : null;
        
        if (ogSettings) {
            const params = new URLSearchParams({
                event: ogSettings.event || 'The Wedding of',
                n1: ogSettings.n1 || '',
                n2: ogSettings.n2 || '',
                time: ogSettings.time || '',
                loc: ogSettings.loc || '',
                to: guestName,
                qr: `https://tamuu.id/${slug}`
            });
            dynamicOgImage = `${API_BASE}/api/og?${params.toString()}`;
        }

        // Return a minimal HTML with meta tags for the crawler
        const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>${seoTitle}</title>
    <meta name="description" content="${seoDescription}">
    
    <!-- OpenGraph -->
    <meta property="og:title" content="${seoTitle}">
    <meta property="og:description" content="${seoDescription}">
    <meta property="og:image" content="${dynamicOgImage}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${request.url}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seoTitle}">
    <meta name="twitter:description" content="${seoDescription}">
    <meta name="twitter:image" content="${dynamicOgImage}">
</head>
<body>
    <h1>${seoTitle}</h1>
    <p>${seoDescription}</p>
    <img src="${dynamicOgImage}" alt="Preview">
    <script>window.location.href = "${request.url}";</script>
</body>
</html>`;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=UTF-8' }
        });

    } catch (error) {
        console.error('[SEO Proxy] Error:', error.message);
        // Fallback to default Pages behavior on error
        const pagesUrl = new URL(request.url);
        pagesUrl.hostname = PAGES_DOMAIN;
        return fetch(pagesUrl, request);
    }
}
