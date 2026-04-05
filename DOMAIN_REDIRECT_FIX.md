# Domain Redirect Fix - TAMUU Routing System

## ✅ What Was Fixed

### Problem
When accessing `tamuu.id/dashboard` (or any app route via public domain), users got a **404 error** instead of being redirected to `app.tamuu.id/dashboard`.

### Root Cause
The middleware was using `new URL()` constructor incorrectly:
```typescript
// ❌ WRONG - Can cause URL parsing issues
const redirectUrl = new URL(`https://app.tamuu.id${pathname}${search}`, request.url);
```

The second parameter `request.url` as a base URL can cause unexpected behavior when constructing redirect URLs.

### Solution
Changed to direct string concatenation (which is safe since we control pathname and search):
```typescript
// ✅ CORRECT - Direct string construction
const redirectUrl = `https://app.tamuu.id${pathname}${search}`;
```

Also added:
- Enhanced logging for debugging
- Debug headers (`x-tamuu-redirect-reason`) to track redirect triggers
- Improved fallback handling in `domain-enforcer.ts`

## 📋 Files Modified

1. `/apps/main/src/middleware.ts` - Primary redirect logic
2. `/apps/main/src/lib/domain-enforcer.ts` - Server-side fallback enforcement

## 🔄 How The Routing Works Now

### Flow Diagram
```
User Request
    ↓
[Cloudflare Edge - middleware.ts]
    ↓
Check: Is path static/internal? → YES → Serve directly
    ↓ NO
Check: Domain + Path combination
    ↓
┌─────────────────────────────────────────┐
│ IF tamuu.id + /dashboard (app route)    │
│    ↓                                    │
│    308 REDIRECT → app.tamuu.id/dashboard│
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ IF app.tamuu.id + / (public route)      │
│    ↓                                    │
│    308 REDIRECT → tamuu.id/             │
└─────────────────────────────────────────┘
    ↓
[If redirect fails, domain-enforcer.ts catches it]
    ↓
[Final fallback: Universal Router enforces domain]
```

### Three-Layer Enforcement

| Layer | File | Mechanism | When It Triggers |
|-------|------|-----------|------------------|
| **1. Edge Middleware** | `middleware.ts` | `NextResponse.redirect(308)` | First line of defense, runs before any page rendering |
| **2. Server Component** | `domain-enforcer.ts` | `redirect()` from `next/navigation` | If middleware somehow doesn't trigger |
| **3. Client-Side** | `web/src/App.tsx` | `window.location.href` | JavaScript-based fallback in Vite app |

## 🧪 Testing Instructions

### Test Case 1: Public Domain → App Domain
```bash
# Should redirect to app.tamuu.id/dashboard
curl -I https://tamuu.id/dashboard

# Expected: HTTP 308 with Location: https://app.tamuu.id/dashboard
```

### Test Case 2: App Domain → Public Domain
```bash
# Should redirect to tamuu.id/
curl -I https://app.tamuu.id/

# Expected: HTTP 308 with Location: https://tamuu.id/
```

### Test Case 3: App Domain Stays on App Domain
```bash
# Should NOT redirect (correct domain)
curl -I https://app.tamuu.id/dashboard

# Expected: HTTP 200 (or proxied response)
```

### Test Case 4: Public Domain Stays on Public Domain
```bash
# Should NOT redirect (correct domain)
curl -I https://tamuu.id/

# Expected: HTTP 200
```

## 🚀 Deployment Steps

1. **Build and deploy the Next.js worker:**
   ```bash
   cd apps/main
   npm run build
   npm run deploy
   ```

2. **Verify deployment:**
   ```bash
   wrangler deploy --dry-run  # Check config
   wrangler tail              # Monitor logs in real-time
   ```

3. **Test redirects:**
   - Open browser and navigate to `https://tamuu.id/dashboard`
   - Should instantly redirect to `https://app.tamuu.id/dashboard`
   - Check browser dev tools Network tab for 308 status

## 🔍 Debugging Tips

If redirects still don't work after deployment:

1. **Check middleware is running:**
   - Look for `x-tamuu-policy` header in response
   - Check Cloudflare Worker logs for `[Middleware]` messages

2. **Verify domain detection:**
   - The `hostname` variable should correctly detect `tamuu.id` vs `app.tamuu.id`
   - Check `x-tamuu-host` header

3. **Common issues:**
   - **Cloudflare cache**: Purge cache if redirects aren't updating
   - **DNS propagation**: Wait for DNS changes to propagate
   - **Worker not deployed**: Ensure `wrangler deploy` succeeded
   - **Route patterns**: Verify wrangler.toml has correct domain patterns

## 📊 Expected Behavior Matrix

| Accessed URL | Should Redirect To | Status Code |
|--------------|-------------------|-------------|
| `tamuu.id/dashboard` | `app.tamuu.id/dashboard` | 308 |
| `tamuu.id/login` | `app.tamuu.id/login` | 308 |
| `tamuu.id/admin` | `app.tamuu.id/admin` | 308 |
| `app.tamuu.id/` | `tamuu.id/` | 308 |
| `app.tamuu.id/blog` | `tamuu.id/blog` | 308 |
| `app.tamuu.id/dashboard` | (no redirect) | 200 |
| `tamuu.id/` | (no redirect) | 200 |

## ⚠️ Important Notes

1. **308 vs 301/302**: We use 308 (Permanent Redirect) which preserves the HTTP method and is cacheable by browsers/CDNs.

2. **Development Mode**: Redirects are disabled on `localhost` and `127.0.0.1` for easier local testing.

3. **Session Preservation**: The middleware copies all cookies and session headers to the redirect response, so users stay logged in during redirects.

4. **Proxy Delegation**: App routes on `app.tamuu.id` are proxied to the Vite app (`tamuu-app.pages.dev`), not served by Next.js directly.

## 🆘 If Still Getting 404

1. Check Cloudflare Worker logs: `wrangler tail`
2. Verify the worker is deployed to all three domains
3. Check response headers for `x-tamuu-policy` and `x-tamuu-redirect-reason`
4. Ensure DNS records point to the Cloudflare Worker
5. Purge Cloudflare cache: `wrangler pages deployment tail`
