# Design: Smart Bi-directional Domain Enforcement (v4.6.0)

Ensuring absolute domain consistency between `tamuu.id` (Public/Marketing) and `app.tamuu.id` (Application Hub). This design implements a bi-directional "Smart Direct" system that prevents 404s and ensures users land on the correct domain for every route.

## 1. Routing Policy (The Ground Truth)

### App Domain (`app.tamuu.id`)
**Paths:**
- Auth: `/login`, `/signup`, `/forgot-password`, `/auth`
- App Core: `/onboarding`, `/dashboard`, `/editor/*`, `/profile`
- Management: `/billing`, `/upgrade`, `/guests`, `/wishes`
- Portals: `/vendor/*`, `/admin/*`

### Public Domain (`tamuu.id`)
**Paths:**
- Marketing: `/`, `/undangan-digital`, `/shop`, `/blog/*`, `/about`, `/support`
- Legal: `/terms`, `/privacy`
- Vite Proxied (Public): `/invitations`, `/preview/*`, `/v/*`, `/c/*`

## 2. Multi-Layer Enforcement Strategy

### Layer 1: Next.js Physical Redirectors (`apps/main`)
We eliminate 404s on `tamuu.id` by creating physical `page.tsx` files for all **App Domain** paths. These pages perform immediate server-side redirects.

### Layer 2: Vite Domain Enforcer (`apps/web`)
The Vite application (running on `app.tamuu.id`) will monitor the path. If a **Public Domain** path is accessed on the app domain, it will perform an immediate client-side redirect to `tamuu.id`.

### Layer 3: Unified Middleware (`apps/main`)
The middleware acts as the primary orchestrator at the Edge, handling:
- **308 Redirects**: For fast, SEO-friendly domain jumps.
- **Rewrites**: For serving Vite content on the correct domains without changing the URL where necessary.

## 3. Implementation Details

### Next.js Redirectors (Public -> App)
Folders will be created in `apps/main/src/app` for every app path. Each will contain a `page.tsx` that calls `redirect('https://app.tamuu.id/[path]')`.

### Vite Enforcer (App -> Public)
`apps/web/src/App.tsx` will be updated with a comprehensive `PUBLIC_PATHS` list.
Example logic:
```typescript
if (isAppHost && isPublicPath) {
    window.location.replace(`https://tamuu.id${pathname}${search}`);
}
```

## 4. Verification Plan
1. **Test Public to App**: `tamuu.id/upgrade` must instantly change to `app.tamuu.id/upgrade`.
2. **Test App to Public**: `app.tamuu.id/shop` must instantly change to `tamuu.id/shop`.
3. **Test Root Redirect**: `app.tamuu.id/` (no path) must instantly change to `tamuu.id/`.
4. **Test Proxy Integrity**: `tamuu.id/invitations` must correctly load the template store from the Vite app without a domain change.
