# Design: Smart Bi-directional Domain Enforcement (v4.6.0)

Ensuring absolute domain consistency between `tamuu.id` (Marketing/Public) and `app.tamuu.id` (Application Hub) by using explicit physical redirectors and cross-framework enforcers.

## 1. Problem Statement
The current middleware-based routing is occasionally bypassed by Edge caching or internal Next.js routing, leading to 404 errors when app routes (like `/upgrade`) are accessed via the public domain. Users expect a "Smart Direct" experience where they are instantly moved to the correct domain without seeing error pages.

## 2. Architecture: Multi-Layer Enforcement

### Layer 1: Physical Redirectors (Next.js - `apps/main`)
We will create explicit physical routes in Next.js for all paths that belong to the Application Hub. This eliminates the possibility of a 404 at the framework level.

**Target Routes in `apps/main`:**
- `/login`, `/signup`, `/forgot-password`, `/onboarding`
- `/dashboard`, `/upgrade`, `/billing`, `/profile`
- `/guests`, `/wishes`, `/editor`, `/vendor`, `/admin`

**Implementation:**
Each `page.tsx` will perform a server-side `redirect()` to `https://app.tamuu.id/[path]`.

### Layer 2: Client-Side Enforcer (Vite - `apps/web`)
The Vite application will monitor its hostname. If it detects it's running on the "Public Domain" for a path that doesn't belong there, or vice-versa, it will force a relocation.

**Public Paths on `tamuu.id` (Vite Proxied):**
- `/invitations`
- `/preview/*`
- `/v/*`, `/c/*`

### Layer 3: Unified Middleware (The Gatekeeper)
The middleware remains the high-speed first line of defense, handling 308 redirects and rewrites for assets.

## 3. Implementation Plan

### Phase 1: Next.js Physical Redirectors
Create the following structure in `apps/main/src/app`:
- `(auth)/login/page.tsx` -> redirect to app.tamuu.id
- `(auth)/signup/page.tsx` -> redirect to app.tamuu.id
- `(auth)/forgot-password/page.tsx` -> redirect to app.tamuu.id
- `onboarding/page.tsx` -> redirect to app.tamuu.id
- `dashboard/page.tsx` -> redirect to app.tamuu.id
- `upgrade/page.tsx` -> redirect to app.tamuu.id
- `billing/page.tsx` -> redirect to app.tamuu.id
- `profile/page.tsx` -> redirect to app.tamuu.id
- `guests/page.tsx` -> redirect to app.tamuu.id
- `wishes/page.tsx` -> redirect to app.tamuu.id
- `editor/page.tsx` -> redirect to app.tamuu.id (catch-all)
- `vendor/page.tsx` -> redirect to app.tamuu.id (catch-all)
- `admin/page.tsx` -> redirect to app.tamuu.id (catch-all)

### Phase 2: Vite App Harmonization
Update `apps/web/src/App.tsx`'s `DomainEnforcer` to perfectly match the domain policy in `ARCHITECTURE.md`.

### Phase 3: Middleware Refinement
Finalize `apps/main/src/middleware.ts` to handle asset proxying and initial edge redirects.

## 4. Verification Criteria
1. `tamuu.id/upgrade` -> Instantly moves to `app.tamuu.id/upgrade` (No 404).
2. `app.tamuu.id/` -> Instantly moves to `tamuu.id/`.
3. `app.tamuu.id/invitations` -> Loads the Template Store via proxy correctly.
4. All auth pages on `tamuu.id` redirect to `app.tamuu.id`.
