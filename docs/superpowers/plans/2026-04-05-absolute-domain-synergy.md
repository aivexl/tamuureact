# Plan: Absolute Server-Side Domain Synergy (v4.6.0)

Implementing a complete, symmetrical, and instant server-side redirection system. This plan ensures that every route has a physical presence in the Next.js gateway (`apps/main`) to eliminate 404s and enforce domain policies at the framework level.

## Mapping

**Public Paths (Target: tamuu.id):**
- `/`, `/undangan-digital`, `/blog`, `/shop`, `/support`, `/about`, `/terms`, `/privacy`, `/invitations`, `/preview`, `/v/`, `/c/`

**App Paths (Target: app.tamuu.id):**
- `/login`, `/signup`, `/forgot-password`, `/auth`, `/onboarding`, `/dashboard`, `/editor`, `/profile`, `/billing`, `/upgrade`, `/guests`, `/wishes`, `/vendor`, `/admin`

## Changes

### 1. Create Universal Domain Enforcer
**File:** `apps/main/src/lib/domain-enforcer.ts`
*   Create a utility function `enforceDomain(type: 'public' | 'app')` that uses `headers()` to check the host and `redirect()` to move the user if necessary.

### 2. Update Public Pages (Eject from app.tamuu.id)
**Files:** `apps/main/src/app/**/page.tsx`
*   Incorporate `enforceDomain('public')` into all marketing and informational pages.

### 3. Create App Redirectors (Eject from tamuu.id)
**Files:** `apps/main/src/app/[app-route]/page.tsx`
*   Create physical pages for every app route that call `enforceDomain('app')`. This replaces the 404 with an instant redirect.

### 4. Middleware Optimization
**File:** `apps/main/src/middleware.ts`
*   Simplify middleware to focus on proxying Vite content when on `app.tamuu.id` and serving assets. Remove domain redirects as they are now handled more robustly at the page level.

## Verification

1.  **Direct Redirect (Public -> App)**: Visit `tamuu.id/upgrade`. Must instantly move to `app.tamuu.id/upgrade`.
2.  **Direct Redirect (App -> Public)**: Visit `app.tamuu.id/shop`. Must instantly move to `tamuu.id/shop`.
3.  **Root Consistency**: Visit `app.tamuu.id/`. Must instantly move to `tamuu.id/`.
4.  **No 404**: Every mapped route must either render content or redirect, never 404.
