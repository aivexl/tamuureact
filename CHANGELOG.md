# Tamuu Changelog

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
