# Tamuu Changelog

## [0.6.64] - 2026-03-10
**Status**: 🟢 Deployed
**Environment**: Production

### Critical: API Domain Standardization & CORS
- **Domain Fix**: Standardized all API calls across the admin dashboard to use `api.tamuu.id` instead of hardcoded `tamuu.id` to resolve `404` and CORS preflight errors.
- **CORS Enhancement**: Updated API worker to explicitly support `tamuu-app` and `pages.dev` origins, ensuring seamless asset management from all deployment environments.
- **Image Optimization**: Verified and enforced enterprise-grade client-side optimization (WebP + BlurHash) for all admin carousel and banner uploads via `image-manager`.

## [0.6.63] - 2026-03-10
**Status**: 🟢 Deployed
**Environment**: Production

### Bug Fixes & Navigation
- **Admin Navigation**: Corrected the back button in the Blog Admin page to point to `/admin/dashboard` instead of `/admin`. This prevents incorrect redirection to the user dashboard and resolves `404` errors caused by the preview engine misinterpreting the `/admin` path as a blog slug.

## [0.6.62] - 2026-03-10
**Status**: 🟢 Deployed
**Environment**: Production

### Admin Navigation Improvements
- **Blog Engine**: Added a "Back to Dashboard" button in `AdminBlogListPage.tsx` to ensure consistent navigation back to the main admin control center.

## [0.6.61] - 2026-03-10
**Status**: 🟢 Deployed
**Environment**: Production

### Admin UX: Image Size Hints
- **Shop Management**: Added ideal (1400x600px) and max (2MB) size hints for carousel slides and ads/banners.
- **Blog Management**: Added ideal (1200x675px) and max (2MB) size hints for blog carousel slides.
- **Digital Invitations**: Added ideal (1200x675px) and max (2MB) size hints for invitation store carousel slides.

## [0.6.60] - 2026-03-10
**Status**: 🟢 Deployed
**Environment**: Production

### Manual Photo Upload Expansion (Blog & Invitations)
- **Blog Editorial**: Added manual image upload functionality to the Blog Carousel Manager in `AdminBlogListPage.tsx`.
- **Digital Invitations**: Integrated manual photo upload for the Invitation Store Carousel in `AdminTemplatesPage.tsx`.
- **Consistency & UX**: Standardized the upload interface across all admin carousels (Shop, Blog, and Invitations) with integrated loading states.

## [0.6.59] - 2026-03-10
**Status**: 🟢 Deployed
**Environment**: Production

### Manual Photo Upload in Shop Admin (Carousel & Ads)
- **AdminStoreManagement**: Added direct photo upload capability for carousel slides using the `storage.upload` API.
- **AdminShopSettings**: Integrated manual image upload for both Promo Carousel slides and Strategic Sponsor Banners.
- **Improved UX**: Added loading states and automatic state updates after successful uploads to streamline asset management in the admin dashboard.

## [0.6.58] - 2026-03-10
**Status**: 🟢 Deployed
**Environment**: Production

### Dynamic Carousel Management (Enterprise Control Panel v2.0)
- **Shop Governance System**: Implemented a fully functional Carousel Manager in `AdminShopSettings.tsx` to handle dynamic promo slides with integrated CRUD APIs.
- **Blog Editorial Engine**: Upgraded the mock UI in `AdminBlogListPage.tsx` to a real-time D1-backed Carousel Editor for updating hero highlights dynamically.
- **Invitations Showcase**: Replaced static placeholders in `AdminTemplatesPage.tsx` with a live interactive Carousel Manager for digital invitation storefronts.
- **Unified Backend Handlers**: Refactored the `tamuu-api-worker.js` endpoints to support standardized `{action, item}` payloads for a more cohesive, declarative API surface across all three storefront carousels.

## [0.6.57] - 2026-03-09
**Status**: 🟢 Deployed
**Environment**: Production

### MultiCarousel Architecture (Enterprise Visuals v1.0)
- **Unified Carousel Component**: Developed a highly reusable `MultiCarousel.tsx` to handle all slider interfaces across the platform (`/shop`, `/blog`, `/invitations`).
- **Responsive Geometry**: Implemented automatic breakpoint calculation to display exactly 3 items simultaneously on desktop and seamlessly collapse to a 1-item view on mobile devices.
- **The "Silent" Hover State**: Stripped out legacy zoom and scale animations on images to comply with minimalist, enterprise-grade design principles. Image interactions now exclusively trigger hover-pause functionality.
- **Navigation & Ergonomics**: Injected dynamic side-chevrons that only appear on hover, paired with an elegant dot-pagination system (active dot expands to Navy `#0A1128`) beneath the track.
- **Data Injection**: Sourced and injected 6 high-fidelity, text-free dummy images into the storefronts to provide a cleaner, photography-first user experience.
- **RTM Tested**: Maintained 100% pass rate in React Testing Library via Vitest.

## [0.6.56] - 2026-03-09
**Status**: 🟢 Deployed
**Environment**: Production

### Enterprise SEO Nexus & UI Redesign (Tamuu Super Plan v19.0)
- **Programmatic SEO Engine**: Deployed dynamic "Chronos Engine" for automatic month/year metadata permutations across `/shop`, `/blog`, and `/invitations`.
- **Intelligent Structured Data**: Injected `ItemList`, `FAQPage`, `BlogPosting`, and `ImageGallery` JSON-LD schemas to dominate AI search (SGE) and Google Rich Snippets.
- **Omni-Platform Indexing**: Launched dynamic `/api/sitemap/shop` API and integrated Bing `IndexNow` protocol for instant search engine discovery. Updated `robots.txt` to prioritize major AI crawlers (GPTBot, Claude-Web).
- **Blog UI Redesign (The Minimalist Cut)**: Overhauled `/blog` to an Apple-grade, brutalist-elegant aesthetic with "Silence & Spacing" methodology.
- **Storefront Carousel (Invitations)**: Removed archaic marketing text in favor of a silent, high-fidelity `framer-motion` carousel for a premium storefront experience.
- **Admin Control Center**: Upgraded `AdminBlogListPage` and `AdminTemplatesPage` with seamless tab systems for live carousel and safe-delete category management.

## [0.6.55] - 2026-03-09
**Status**: 🟢 Deployed
**Environment**: Production

### Admin Push Notification Enhancement (Tamuu Nexus v1.1)
- **Brand Consistency**: Migrated the notification preview logo to the official white Tamuu emblem (`logo-tamuu-vfinal-v1.webp`) for improved visibility on standard mobile notification backgrounds.
- **Real-Time Reach Intelligence**:
  - Implemented a backend-driven `Estimated Reach` engine using real device subscription counts from D1.
  - Replaced dummy placeholders with actual metrics for Pro, Ultimate, Elite, Merchants, Resellers, and Admins.
- **Expanded Audience Targeting**: Added a dedicated **"Admin Only"** broadcast channel for internal system announcements and critical maintenance alerts.
- **Asset Optimization Guidelines**:
  - Integrated explicit image size validation and helper tooltips.
  - Standardized notification images to **1024x512 (2:1 ratio)** with a strictly enforced **1MB limit** to ensure lightning-fast delivery and browser rendering compatibility.
- **Backend Infrastructure**: Added `GET /api/admin/push/stats` endpoint to the Tamuu API Worker for live subscription analytics.

## [0.6.54] - 2026-03-09
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX Refinement: Admin Push Notification Center
- **Enterprise Responsiveness**: Restructured the layout using a dynamic 12-column grid to ensure perfect scaling across mobile, tablet, and desktop viewports.
- **Ergonomics & Navigation**:
  - Implemented a dedicated "Back to Dashboard" button (`ArrowLeft`) with intuitive hover states.
  - Corrected top padding (`pt-12`) to prevent UI elements from overlapping with browser chrome.
- **High-Contrast Design**: Revamped the `Target Audience` dropdown with solid backgrounds and distinct text coloring, resolving visibility issues in dark mode.
- **Functional Interactivity**: 
  - The `Platform Delivery` toggle (Mobile, Desktop, All) is now fully wired to the backend broadcast API.
  - Integrated manual **Cloudflare R2 Image Upload** (`storage.upload`) directly into the notification composer, complete with real-time loading states and preview thumbnails.

## [0.6.53] - 2026-03-09
**Status**: 🟢 Deployed
**Environment**: Production

### Feature: Enterprise Push Notification System (Tamuu Nexus v1.0)
- **Enterprise Push Infrastructure**: Established a high-performance **Web Push (VAPID)** architecture using Cloudflare Workers and D1 Database.
- **Admin Notification Command Center**: Launched a professional campaign manager in the Admin Dashboard:
  - **Audience Targeting**: Support for broadcasting to specific tiers (Pro, Elite, Merchants) or all users.
  - **Real-time Mobile Preview**: Interactive mockup to visualize notifications before broadcasting.
  - **Deep-Link Support**: Integrated URL routing to drive conversions directly to shop products or promos.
- **User Engagement UX**:
  - **Dynamic Bell Icon**: Integrated a premium `BellRing` toggle in the notification dropdown for easy opt-in/opt-out.
  - **Background Service Worker**: Implemented `sw.js` for persistent notification delivery even when the application is closed.
- **Architecture & Security**:
  - **D1 Schema Expansion**: Added `push_subscriptions` table with multi-device support per user.
  - **VAPID Security**: Securely implemented VAPID key pairs with Private Keys stored in Cloudflare Secrets.
  - **RTM Verified**: 100% test coverage using Vitest for both frontend hooks and backend API endpoints.

## [0.6.52] - 2026-03-09
**Status**: 🟢 Deployed
**Environment**: Production

### Engineering: Comprehensive Testing & Security Finalization
- **Modern Testing Stack**: Migrated from basic testing attempts to a robust **Vitest + React Testing Library (RTL)** infrastructure in the web package.
- **Enterprise-Grade Validation**: Implemented and passed **25 critical test cases** covering:
  - **Security Ownership**: Verified cross-user data isolation.
  - **XSS Protection**: Validated Input Sanitizer efficacy against malicious scripts.
  - **Scalability Logic**: Confirmed Fingerprint Deduplication and Payload Pruning functionality.
  - **Business Flows**: Simulated Midtrans Sandbox payments and Merchant/Shop discovery.
- **Architecture Stability**: Established `IndexedDB` local persistence logic paired with a **Professional Exit Guard** to ensure zero data loss during high-concurrency edit sessions.
- **Security Audit Cleanup**: Performed final global purge of production console logs and information disclosure vulnerabilities.

## [0.6.51] - 2026-03-08
**Status**: 🟢 Deployed
**Environment**: Production

### Final Security Fortress (Phase 4 Hardening)
- **Enterprise Security Header Suite**: Injected CSP, X-Frame-Options, and more across all API responses.
- **Dynamic Origin Whitelisting**: Restricted API access to `tamuu.id` and `app.tamuu.id`.
- **SQL Guard - 100% Coverage**: Enforced global ownership checks on all destructive operations.

## [0.6.50] - 2026-03-08
... (rest of changelog)
