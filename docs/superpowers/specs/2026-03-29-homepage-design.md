# Design Spec: Tamuu Homepage (ShopPage) Fully Next.js Refactor

**Topic**: Fully Next.js (Server-First) Refactor of the Shop Homepage using Next.js 15, Pure Tailwind, and OpenNext + Cloudflare Workers.
**Status**: Draft (Updated for Efficiency)
**Date**: 2026-03-29
**Author**: Gemini CLI (CTO Mode)

## 1. Vision & Strategy
Refactor the existing `ShopPage.tsx` from `@tamuu/web` into a standalone, enterprise-grade Next.js application (`apps/home`). The goal is to achieve **100/100 Lighthouse scores**, a **Total White** aesthetic, and a **Server-First** architecture that minimizes client-side Javascript and optimizes server costs.

### 1.1 "Total White" Aesthetic (FAANG Standard)
- **Backgrounds**: Pure white (`#FFFFFF`) throughout. No grey or off-white sections.
- **Borders**: Ultra-subtle `slate-100/50` or invisible separators.
- **Typography**: High contrast headings (`slate-900`) and sophisticated muted text (`slate-500`).
- **Interactive**: Soft "Ink" shadows and 101% scale transforms on hover.

## 2. Technical Architecture: Server-First

### 2.1 React Server Components (RSC)
- **90% Zero-JS UI**: The homepage grid, navigation, and footer are rendered as HTML on the server.
- **No Hydration Cost**: Browser receives pre-rendered HTML/CSS, eliminating the "blank screen" or "jank" during JS execution.
- **Native Data Fetching**: API calls to `https://api.tamuu.id` happen on the Cloudflare Edge, not in the browser.

### 2.2 Caching Strategy (Efficiency & Cost Control)
To prevent "server bloat" and ensure maximum performance:
- **Incremental Static Regeneration (ISR)**: Key sections (Categories, Featured Ads) are cached at the Edge.
- **Stale-While-Revalidate (SWR)**: Serve cached HTML instantly while updating the cache in the background.
- **CDN-Level Caching**: Leverage Cloudflare's global network to serve the homepage as a static asset whenever possible.
- **Request Consolidation**: Multiple API calls (Carousel, Products, Ads) are executed in parallel on the server, resulting in a single "Ready-to-Paint" HTML response.

## 3. Component Design (Pure Tailwind)

### 3.1 `HeroCarousel` (Optimized)
- **LCP Optimization**: The first slide is pre-rendered with `priority` loading for instant visual feedback.
- **Client Hydration**: Only the "Swipe" and "Auto-play" logic uses minimal Client JS.

### 3.2 `ProductCard` (Server-Side)
- **Design**: White-on-white card. Borderless with a soft shadow on hover.
- **Performance**: Rendered as a pure HTML template. No client-side state required for individual cards.

### 3.3 `Search & Filters` (URL-Based)
- **No `useState`**: Filtering categories and searching uses URL Search Parameters.
- **Benefits**: Perfect SEO for filtered results, "back button" works natively, and results can be cached at the Edge per category/query.

## 4. Deployment Plan (OpenNext + Cloudflare)
- **Runtime**: Cloudflare Workers (Edge Runtime) via OpenNext.
- **Performance**: Global TTFB (Time to First Byte) < 100ms.
- **Cost**: Extremely low execution cost compared to traditional Node.js servers.

---
*End of Updated Design Spec*

