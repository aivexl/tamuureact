/**
 * Cloudflare Pages Function
 * Path: functions/welcome/[invitationId]/[guestId].ts
 *
 * Intercepts requests ke /welcome/:invitationId/:guestId
 * Fetch data tamu dari API, lalu inject OG meta tags ke HTML
 * sebelum dikirim ke browser / WA crawler.
 *
 * PENTING: WA crawler tidak jalankan JavaScript, jadi OG tags
 * HARUS ada di dalam HTML mentah dari server - itulah fungsi file ini.
 */

interface Env {
  // Tidak perlu env vars tambahan - kita fetch dari api.tamuu.id
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { params, request } = context;
  const invitationId = params.invitationId as string;
  const guestId = params.guestId as string;

  const url = new URL(request.url);
  const origin = url.origin; // e.g. https://app.tamuu.id

  // ─── 1. Fetch data tamu dari API ────────────────────────────────────────────
  let guest: any = null;
  let invitation: any = null;

  try {
    const [guestRes, invRes] = await Promise.all([
      fetch(`https://api.tamuu.id/api/guests/${guestId}`),
      fetch(`https://api.tamuu.id/api/invitations/${invitationId}`),
    ]);

    if (guestRes.ok) guest = await guestRes.json();
    if (invRes.ok) invitation = await invRes.json();
  } catch (_) {
    // Gagal fetch data - lanjut tanpa OG tags custom
  }

  // ─── 2. Fetch index.html dari Cloudflare Pages asset ────────────────────────
  const response = await context.next();

  // Hanya proses HTML
  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) return response;

  let html = await response.text();

  // ─── 3. Build OG Image URL ──────────────────────────────────────────────────
  // Mengarah ke endpoint /api/og-image yang kita buat di functions/api/og-image.ts
  const ogParams = new URLSearchParams({
    guestId,
    invitationId,
    name: guest?.name || 'Tamu Undangan',
    event: invitation?.name || 'Acara Spesial',
    date: invitation?.event_date || '',
    venue: invitation?.venue_name || '',
  });

  const ogImageUrl = `${origin}/api/og-image?${ogParams.toString()}`;
  const pageUrl = `${origin}/welcome/${invitationId}/${guestId}`;
  const guestName = guest?.name || 'Tamu Undangan';
  const eventName = invitation?.name || 'Acara Spesial';
  const pageTitle = `Undangan untuk ${guestName} | ${eventName}`;
  const pageDesc = [
    `${guestName} diundang hadir di ${eventName}`,
    invitation?.event_date,
    invitation?.venue_name,
  ]
    .filter(Boolean)
    .join(' · ');

  // ─── 4. Inject OG tags ke dalam <head> ──────────────────────────────────────
  const ogTags = `
    <!-- OG Tags injected by Cloudflare Pages Function for WhatsApp preview -->
    <title>${esc(pageTitle)}</title>
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Tamuu" />
    <meta property="og:title" content="${esc(pageTitle)}" />
    <meta property="og:description" content="${esc(pageDesc)}" />
    <meta property="og:url" content="${esc(pageUrl)}" />
    <meta property="og:image" content="${esc(ogImageUrl)}" />
    <meta property="og:image:width" content="800" />
    <meta property="og:image:height" content="420" />
    <meta property="og:image:type" content="image/svg+xml" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(pageTitle)}" />
    <meta name="twitter:description" content="${esc(pageDesc)}" />
    <meta name="twitter:image" content="${esc(ogImageUrl)}" />
    <!-- End OG Tags -->`;

  // Ganti <title> yang sudah ada (dari index.html default) agar tidak duplikat
  html = html.replace(/<title>[^<]*<\/title>/, '');

  // Insert sebelum </head>
  html = html.replace('</head>', `${ogTags}\n</head>`);

  return new Response(html, {
    status: response.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      // Salin headers lain dari response asli
      ...Object.fromEntries(
        [...response.headers.entries()].filter(
          ([k]) => !['content-type', 'cache-control'].includes(k.toLowerCase())
        )
      ),
    },
  });
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
