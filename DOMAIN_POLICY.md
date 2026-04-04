# Tamuu Unified Domain Policy v4.1

This document defines the strict mapping between paths and domains in the Tamuu ecosystem.

## 1. Public Domain: `tamuu.id`
Dedicated to SEO-rich public content and marketing.

| Path | Description | Framework |
| :--- | :--- | :--- |
| `/` | Homepage | Next.js |
| `/undangan-digital` | Product Landing Page | Next.js |
| `/shop/*` | Vendor Marketplace | Next.js/Vite |
| `/blog/*` | Articles & News | Next.js |
| `/invitations` | Template Browsing | Vite (Proxied) |
| `/preview/*` | Public Invitation Previews | Vite (Proxied) |
| `/v/*` | Invitation Shortlinks | Vite (Proxied) |
| `/c/*` | Category Listings | Vite (Proxied) |
| `/about`, `/support` | Company Information | Next.js |
| `/terms`, `/privacy` | Legal Documents | Next.js |

## 2. Application Domain: `app.tamuu.id`
Dedicated to user authentication and management tools.

| Path | Description | Framework |
| :--- | :--- | :--- |
| `/login`, `/signup` | Authentication | Next.js |
| `/forgot-password` | Auth Recovery | Next.js |
| `/auth/*` | Auth Callbacks/Actions | Next.js |
| `/onboarding` | New User Setup | Next.js |
| `/dashboard` | User Management Hub | Vite (Proxied) |
| `/editor/*` | Digital Invitation Builder | Vite (Proxied) |
| `/profile` | User Settings | Vite (Proxied) |
| `/billing`, `/upgrade` | Payments & Plans | Vite (Proxied) |
| `/guests`, `/wishes` | Event Management | Vite (Proxied) |
| `/admin/*` | Superadmin Dashboard | Vite (Proxied) |
| `/vendor/*` | Merchant/Vendor Portal | Vite (Proxied) |

## 3. Enforcement Rules
1. **Middleware Enforcement**: Any access to a path on the wrong domain MUST trigger a `308 Permanent Redirect` to the correct domain.
2. **Navigation Enforcement**: Use absolute URLs (`https://...`) for any link that crosses the domain boundary.
3. **Asset Bypassing**: `/_next/*`, `/assets/*`, and `/api/*` are excluded from domain redirection to allow cross-domain resource sharing and API access.
