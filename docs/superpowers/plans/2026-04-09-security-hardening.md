# Tamuu API Security Hardening Plan (v8.1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menutup celah fatal pada otentikasi (JWT Signature), menghentikan kebocoran data (IDOR), serta mengaktifkan proteksi DDoS dan XSS yang sudah ada.

**Architecture:** Implementasi sistem keamanan berlapis (Defense in Depth) pada Cloudflare Worker. Otentikasi beralih dari "Trust-by-Payload" menjadi "Verify-by-Signature" menggunakan Web Crypto API, dikombinasikan dengan middleware Rate Limiting dan Input Sanitization.

**Tech Stack:** Cloudflare Workers, Web Crypto API, D1 Database, TypeScript/JS.

---

### Task 1: JWT Signature Verification (Blocker)

**Files:**
- Modify: `apps/api/tamuu-api-worker.js`
- Test: `apps/api/test-security-auth.js` (Create)

- [ ] **Step 1: Implement `verifyJWT` function**
Tambahkan fungsi helper untuk memverifikasi signature HS256 menggunakan `crypto.subtle`.

```javascript
async function verifyJWT(token, secret) {
    if (!token || !secret) return { valid: false, reason: 'Missing token or secret' };
    try {
        const [headerB64, payloadB64, signatureB64] = token.split('.');
        if (!signatureB64) return { valid: false, reason: 'Invalid JWT format' };

        const encoder = new TextEncoder();
        const data = encoder.encode(`${headerB64}.${payloadB64}`);
        
        // Convert Base64URL to ArrayBuffer
        const b64ToBuf = (b64) => {
            const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
            const buf = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
            return buf;
        };

        const signature = b64ToBuf(signatureB64);
        const key = await crypto.subtle.importKey(
            'raw', encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false, ['verify']
        );

        const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
        if (!isValid) return { valid: false, reason: 'Signature mismatch' };

        const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return { valid: false, reason: 'Token expired', payload };
        }

        return { valid: true, payload };
    } catch (e) {
        return { valid: false, reason: e.message };
    }
}
```

- [ ] **Step 2: Update `verifyToken` & `verifyAdmin`**
Ganti logika `atob` lama dengan `verifyJWT`.

```javascript
// Di dalam verifyToken & verifyAdmin
const jwtResult = await verifyJWT(token, env.JWT_SECRET);
if (!jwtResult.valid) {
    console.warn(`[Security] Invalid Token: ${jwtResult.reason}`);
    return null; // atau status: 401
}
const userId = jwtResult.payload.sub;
const email = jwtResult.payload.email;
```

- [ ] **Step 3: Create security test script**
Buat script untuk mencoba bypass dengan token palsu.

- [ ] **Step 4: Commit**
`git add apps/api/tamuu-api-worker.js && git commit -m "sec: implement robust JWT signature verification"`

---

### Task 2: Fix IDOR in Sensitive Endpoints (Critical)

**Files:**
- Modify: `apps/api/tamuu-api-worker.js`

- [ ] **Step 1: Secure `/api/auth/me`**
Hapus ketergantungan pada query params. Identitas user harus datang dari token.

```javascript
if (path === '/api/auth/me' && method === 'GET') {
    const authHeader = request.headers.get('Authorization');
    const user = await verifyToken(authHeader?.replace('Bearer ', ''), env);
    if (!user) return json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    
    // Gunakan user.id yang sudah terverifikasi dari DB/JWT
    // ... sisa logika profil
}
```

- [ ] **Step 2: Secure `/api/billing/midtrans/token`**
Pastikan user tidak bisa membuat billing untuk ID orang lain.

```javascript
// Di dalam handler midtrans/token
const user = await verifyToken(authHeader, env);
if (!user || user.id !== body.userId) {
    return json({ error: 'Forbidden: Cannot create billing for other users' }, { status: 403 });
}
```

- [ ] **Step 3: Secure `/api/notifications`**
Filter notifikasi berdasarkan `user.id` dari token.

- [ ] **Step 4: Commit**
`git commit -m "sec: fix IDOR vulnerabilities on sensitive endpoints"`

---

### Task 3: Integrate Rate Limiter (High)

**Files:**
- Modify: `apps/api/tamuu-api-worker.js`
- Import: `apps/api/rate-limiter.ts`

- [ ] **Step 1: Initialize Global Rate Limiter**
Tambahkan instance `ChatRateLimiter` di level global worker.

```javascript
import { ChatRateLimiter, rateLimitMiddleware } from './rate-limiter.ts';
const globalRateLimiter = new ChatRateLimiter();
```

- [ ] **Step 2: Apply to Chat Endpoints**
Gunakan middleware sebelum memproses pesan AI.

```javascript
if (path === '/api/chat' || path === '/api/enhanced-chat') {
    const limitResult = await rateLimitMiddleware(request, env, ctx, globalRateLimiter);
    if (!limitResult.allowed) return limitResult.response;
    // ... lanjut ke handler chat
}
```

- [ ] **Step 3: Commit**
`git commit -m "sec: integrate enterprise rate limiting for AI endpoints"`

---

### Task 4: Integrate Input Sanitizer (High)

**Files:**
- Modify: `apps/api/tamuu-api-worker.js`
- Import: `apps/api/input-sanitizer.ts`

- [ ] **Step 1: Sanitize Chat Messages**
Gunakan `InputSanitizer` untuk membersihkan pesan sebelum dikirim ke LLM (mencegah XSS & basic injection).

```javascript
import { InputSanitizer } from './input-sanitizer.ts';

// Di dalam chat handler
const validation = InputSanitizer.validateChatRequest(body);
if (!validation.valid) {
    return json({ error: 'Malicious content detected', details: validation.violations }, { status: 400 });
}
const sanitizedMessages = validation.messages;
```

- [ ] **Step 2: Commit**
`git commit -m "sec: enforce input sanitization for chat system"`

---

### Task 5: Security Header Hardening

- [ ] **Step 1: Update CSP Header**
Perketat `Content-Security-Policy` di `corsHeaders`.

```javascript
'Content-Security-Policy': "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';",
```

- [ ] **Step 2: Final Validation**
Jalankan tes regresi untuk memastikan SSR Next.js tetap bisa login dan ambil data profil.
