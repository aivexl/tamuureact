/**
 * Tamuu SEO & Social Proxy Worker
 * Intercepts requests from crawlers (WhatsApp, Telegram, etc.) to inject dynamic OG meta tags.
 * For regular users, it proxies to the correct Pages project (Landing vs App).
 * EXACT LEGACY BEHAVIOR: Invitations (/slug) stay on tamuu.id but are served by tamuu-app.pages.dev.
 */

const API_BASE = 'https://api.tamuu.id';
const LANDING_PAGES_DOMAIN = 'tamuu.pages.dev'; // Next.js Landing Page
const APP_PAGES_DOMAIN = 'tamuu-app.pages.dev'; // Vite App & Editor

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const userAgent = request.headers.get('User-Agent') || '';
        
        // 1. CRAWLER DETECTION
        const isCrawler = /bot|facebook|whatsapp|telegram|slack|twitter|linkedin|discord|bing|google/i.test(userAgent);
        
        // 2. ROUTE CLASSIFICATION
        const pathParts = url.pathname.split('/').filter(p => p);
        
        // Next.js internal requests should ALWAYS go to Next.js App
        const isNextInternal = url.searchParams.has('_rsc') || url.pathname.startsWith('/_next') || url.pathname.startsWith('/api/_next');

        // Legacy Admin should go to Vite App
        const isLegacyAdmin = pathParts[0] === 'admin';

        // Define known Public/App routes that are handled by Next.js (apps/main)
        // These include the new homepage (shop), landing (undangan-digital), auth, dashboard, etc.
        const isNextRoute = isNextInternal || 
                           url.pathname === '/' || 
                           ['login', 'signup', 'forgot-password', 'dashboard', 'onboarding', 'upgrade', 'billing', 'blog', 'undangan-digital', 'invitations', 'terms', 'privacy', 'about', 'contact', 'support', 'vendor', 'editor', 'user', 'shop', 'c'].includes(pathParts[0]);

        // An invitation link is a top-level slug that isn't a known Next.js route or legacy admin
        const isInvitationLink = pathParts.length >= 1 && 
                                !url.pathname.includes('.') && 
                                !url.pathname.startsWith('/api') &&
                                !url.pathname.startsWith('/assets') &&
                                !isNextRoute && 
                                !isLegacyAdmin;

        // 3. SEO INTERCEPTION FOR INVITATIONS
        if (isCrawler && isInvitationLink) {
            console.log(`[SEO Proxy] Crawler detected: ${userAgent} for path: ${url.pathname}`);
            return await handleCrawler(request, pathParts);
        }

        // 4. PROXY ROUTING
        const targetUrl = new URL(request.url);
        
        if (isInvitationLink || isLegacyAdmin) {
            // Serve Invitations and Legacy Admin from the Vite App project
            targetUrl.hostname = APP_PAGES_DOMAIN;
        } else {
            // Default: Serve everything else from the Next.js App
            targetUrl.hostname = LANDING_PAGES_DOMAIN;
        }
        
        return fetch(targetUrl, request);
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
                const gRes = await fetch(`${API_BASE}/api/guests/slug/${guestSlug}`);
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
        // Standard: Always prioritize personalized dynamic cards for guests
        let dynamicOgImage = invitation.og_image || invitation.thumbnail_url;
        
        const ogSettings = invitation.og_settings ? (typeof invitation.og_settings === 'string' ? JSON.parse(invitation.og_settings) : invitation.og_settings) : null;
        
        if (ogSettings) {
            const params = new URLSearchParams({
                event: ogSettings.event || 'The Wedding of',
                n1: ogSettings.n1 || '',
                n2: ogSettings.n2 || '',
                time: ogSettings.time || '',
                loc: ogSettings.loc || '',
                to: guestName, // DYNAMIC: Personalized for guest
                qr: guestSlug ? `https://tamuu.id/${slug}/${guestSlug}` : `https://tamuu.id/${slug}`
            });
            
            // We point to our internal generator for the personalized view
            // WhatsApp/Social platforms will call this URL to get the SVG/PNG
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
        
        // GRACEFUL FALLBACK (Enterprise Standard)
        // If API fails, we STILL provide a valid OG HTML structure with a default image
        // so WhatsApp doesn't show a broken/empty link card.
        const defaultTitle = `Undangan - ${slug.toUpperCase()}`;
        const defaultDesc = 'Buka link ini untuk melihat detail undangan digital.';
        const defaultImage = 'https://api.tamuu.id/assets/tamuu-logo-header.png'; // Fallback image

        const fallbackHtml = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>${defaultTitle}</title>
    <meta name="description" content="${defaultDesc}">
    <meta property="og:title" content="${defaultTitle}">
    <meta property="og:description" content="${defaultDesc}">
    <meta property="og:image" content="${defaultImage}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${request.url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${defaultTitle}">
    <meta name="twitter:description" content="${defaultDesc}">
    <meta name="twitter:image" content="${defaultImage}">
</head>
<body>
    <script>window.location.href = "${request.url}";</script>
</body>
</html>`;

        return new Response(fallbackHtml, {
            headers: { 'Content-Type': 'text/html; charset=UTF-8', 'X-Proxy-Fallback': 'true' }
        });
    }
}
