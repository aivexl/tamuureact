# Spec: Enterprise Unified Auth (Next.js SSR + Vite Hybrid)

**Date**: 2026-03-31  
**Status**: DRAFT  
**Author**: CTO (Gemini)

## 1. Problem Statement
The current system suffers from "Split Brain" authentication where two different tech stacks (Next.js SSR and Vite Client) both attempt to manage and refresh the Supabase session. This leads to:
1.  **Infinite Refresh Loops**: Both apps race to refresh the token, invalidating each other's credentials.
2.  **Cookie Incompatibility**: Next.js SSR chunks cookies (e.g., `sb-token.0`, `sb-token.1`), while the Vite app expects a single string.
3.  **Flickering UI**: The Vite app must wait for client-side JS to boot before knowing the auth status.

## 2. Goals
- **Centralized Authority**: Next.js (`tamuu.id`) is the only app allowed to perform login, signup, and token refresh.
- **Cross-Domain Sync**: Seamless session flow between `tamuu.id` and `app.tamuu.id`.
- **Zero-Pixel Change**: Maintain identical UI/UX for all auth pages during migration.
- **Enterprise Security**: Use PKCE flow and shared root-domain cookies (`.tamuu.id`).

## 3. Architecture: The Unified Identity Hub

### 3.1. Route Classification (Legacy Accurate)

| Domain | Route | Type | Note |
| :--- | :--- | :--- | :--- |
| `tamuu.id` | `/` | **Public** | Home / Shop Discovery |
| `tamuu.id` | `/undangan-digital` | **Public** | Landing Page |
| `tamuu.id` | `/invitations` | **Public** | Public Store / Gallery |
| `tamuu.id` | `/blog/*` | **Public** | Blog System |
| `tamuu.id` | `/login`, `/signup` | **Public** | Auth Entry Points |
| `tamuu.id` | `/preview/:slug` | **Public** | Invitation Previews |
| `app.tamuu.id`| `/onboarding` | **Private** | **Forced Auth** |
| `app.tamuu.id`| `/dashboard` | **Private** | User Dashboard |
| `app.tamuu.id`| `/editor/:id` | **Private** | Canvas Editor |
| `app.tamuu.id`| `/profile` | **Private** | User Settings |
| `app.tamuu.id`| `/admin/*` | **Private** | Admin Dashboard & Tools |
| `app.tamuu.id`| `/vendor/*` | **Private** | Vendor Portal |

### 3.2. Domain Handoff Logic
- **Passive SSR Check**: Next.js (`tamuu.id`) always checks for a session. If found, the Navbar shows "Dashboard" (linking to `app.tamuu.id`).
- **Hard Redirects**: Any attempt to access `/onboarding`, `/dashboard`, etc., on the public domain will result in a hard redirect to `app.tamuu.id`.
- **Auth Guard**: The Vite app (`app.tamuu.id`) will check for the `.tamuu.id` cookie on load. If missing, it redirects to `tamuu.id/login?return_to=...`.

## 4. Technical Details

### 4.1. Visual Fidelity (Zero-Pixel Policy)
- We will copy the exact Tailwind markup from `apps/web/src/pages/LoginPage.tsx` and `SignupPage.tsx` to the Next.js app.
- All assets (logos, illustrations) will be referenced from the public CDN or shared public folder to ensure identical rendering.

## 5. Security Analysis
- **PKCE**: Mitigates authorization code injection attacks.
- **Secure Cookies**: `SameSite=Lax`, `Secure=true`, `Domain=.tamuu.id`.
- **No Token Leakage**: Tokens are never stored in the URL or vulnerable `localStorage` keys.

## 6. Success Criteria
- [ ] No `400/429` errors in the console during navigation.
- [ ] User remains logged in when moving between `tamuu.id` and `app.tamuu.id`.
- [ ] Sign-out on one domain clears the session on both.
- [ ] Visual look and feel is 100% identical to the current design.
