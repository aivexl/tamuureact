/**
 * Cloudflare Pages Function
 * Path: functions/api/og-image.ts
 * URL:  /api/og-image?guestId=...&name=...&event=...&date=...&venue=...
 *
 * Generate SVG image yang akan muncul sebagai preview saat link
 * /welcome/:invitationId/:guestId dibagikan di WhatsApp.
 *
 * SVG dipilih karena:
 * - Bisa digenerate murni di Cloudflare Worker (tanpa canvas/puppeteer)
 * - WhatsApp mendukung SVG sebagai og:image
 * - QR code di-fetch dari qrserver.com dan di-embed sebagai base64
 */

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  const guestId     = url.searchParams.get('guestId') || '';
  const invitationId = url.searchParams.get('invitationId') || '';
  const name        = url.searchParams.get('name') || 'Tamu Undangan';
  const event       = url.searchParams.get('event') || 'Acara Spesial';
  const date        = url.searchParams.get('date') || '';
  const venue       = url.searchParams.get('venue') || '';

  // URL yang di-encode ke dalam QR code = halaman welcome tamu
  const guestPageUrl = `${url.origin}/welcome/${invitationId}/${guestId}`;

  // Fetch QR code sebagai base64 dari qrserver.com
  let qrBase64 = '';
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(guestPageUrl)}&format=png&margin=8&color=1e1b4b`;
    const qrRes = await fetch(qrUrl, { cf: { cacheTtl: 86400 } } as any);
    if (qrRes.ok) {
      const buf = await qrRes.arrayBuffer();
      qrBase64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    }
  } catch (_) {
    // QR fetch gagal, akan tampil placeholder
  }

  const svg = buildSVG({ name, event, date, venue, qrBase64 });

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

// ─── SVG Builder ──────────────────────────────────────────────────────────────

function buildSVG({
  name,
  event,
  date,
  venue,
  qrBase64,
}: {
  name: string;
  event: string;
  date: string;
  venue: string;
  qrBase64: string;
}): string {
  const W = 800;
  const H = 420;

  const x = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

  const safeName  = x(trunc(name, 28));
  const safeEvent = x(trunc(event, 38));
  const safeDate  = x(trunc(date, 28));
  const safeVenue = x(trunc(venue, 34));

  const qrImg = qrBase64
    ? `<image href="data:image/png;base64,${qrBase64}" x="566" y="100" width="196" height="196"/>`
    : `<rect x="566" y="100" width="196" height="196" fill="#312e81" rx="4"/>
       <text x="664" y="201" text-anchor="middle" font-family="monospace" font-size="11" fill="#a5b4fc">QR Code</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f0c29"/>
      <stop offset="50%" stop-color="#302b63"/>
      <stop offset="100%" stop-color="#24243e"/>
    </linearGradient>
    <clipPath id="qrClip">
      <rect x="562" y="96" width="204" height="204" rx="16"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

  <!-- Decorative circles -->
  <circle cx="60"       cy="60"       r="130" fill="#4f46e5" fill-opacity="0.18"/>
  <circle cx="${W - 40}" cy="${H - 40}" r="110" fill="#7c3aed" fill-opacity="0.15"/>
  <circle cx="380"      cy="${H + 30}" r="170" fill="#6d28d9" fill-opacity="0.12"/>

  <!-- Subtle grid texture -->
  <rect width="${W}" height="${H}" fill="none"
        stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"
        style="background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,.03) 39px, rgba(255,255,255,.03) 40px)"/>

  <!-- Glass card border -->
  <rect x="30" y="30" width="${W - 60}" height="${H - 60}" rx="20"
        fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>

  <!-- Left accent line -->
  <rect x="50" y="80" width="3" height="80" rx="2" fill="#6366f1" fill-opacity="0.8"/>

  <!-- Label: UNDANGAN DIGITAL -->
  <text x="64" y="100"
        font-family="Arial, sans-serif" font-size="10" font-weight="700"
        fill="#818cf8" letter-spacing="4">UNDANGAN DIGITAL · TAMUU.ID</text>

  <!-- Divider line -->
  <line x1="64" y1="110" x2="240" y2="110" stroke="#4f46e5" stroke-width="1" stroke-opacity="0.6"/>

  <!-- Label: KEPADA YTH. -->
  <text x="64" y="148"
        font-family="Arial, sans-serif" font-size="11"
        fill="#94a3b8" letter-spacing="2">KEPADA YTH.</text>

  <!-- Guest Name - large bold -->
  <text x="64" y="192"
        font-family="Georgia, 'Times New Roman', serif" font-size="38" font-weight="700"
        fill="#ffffff" letter-spacing="-1">${safeName}</text>

  <!-- Divider -->
  <line x1="64" y1="210" x2="300" y2="210" stroke="#6366f1" stroke-width="0.8" stroke-opacity="0.5"/>

  <!-- Label: DIUNDANG HADIR DALAM -->
  <text x="64" y="238"
        font-family="Arial, sans-serif" font-size="10"
        fill="#64748b" letter-spacing="2">DIUNDANG HADIR DALAM</text>

  <!-- Event name -->
  <text x="64" y="268"
        font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="400"
        fill="#e0e7ff">${safeEvent}</text>

  <!-- Date (with calendar icon placeholder) -->
  ${date ? `
  <rect x="64" y="285" width="6" height="6" rx="1" fill="#818cf8" fill-opacity="0.7"/>
  <text x="78" y="294"
        font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">${safeDate}</text>
  ` : ''}

  <!-- Venue -->
  ${venue ? `
  <circle cx="67" cy="${date ? 320 : 297}" r="3" fill="#818cf8" fill-opacity="0.7"/>
  <text x="78" y="${date ? 325 : 302}"
        font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">${safeVenue}</text>
  ` : ''}

  <!-- Footer tagline -->
  <text x="64" y="${H - 45}"
        font-family="Arial, sans-serif" font-size="11"
        fill="#4338ca" fill-opacity="0.9"
        letter-spacing="1">✦ Kehadiran Anda adalah kehormatan terbesar bagi kami</text>

  <!-- QR Code area - white background -->
  <rect x="552" y="82" width="220" height="256" rx="20"
        fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1"/>
  <rect x="562" y="96" width="200" height="200" rx="12"
        fill="#ffffff"/>

  <!-- QR Code image -->
  <g clip-path="url(#qrClip)">
    ${qrImg}
  </g>

  <!-- Scan label -->
  <text x="662" y="318"
        text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700"
        fill="#a5b4fc" letter-spacing="2">SCAN UNTUK KONFIRMASI</text>

  <!-- Bottom QR url hint -->
  <text x="662" y="334"
        text-anchor="middle" font-family="Arial, sans-serif" font-size="9"
        fill="#6366f1" fill-opacity="0.8">tamuu.id</text>
</svg>`;
}
