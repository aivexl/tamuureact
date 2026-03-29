# Design Spec: Tamuu Homepage (ShopPage) Next.js Refactor

**Topic**: Total White Refactor of the Shop Homepage using Next.js 15, Pure Tailwind, and OpenNext + Cloudflare Workers.
**Status**: Draft
**Date**: 2026-03-29
**Author**: Gemini CLI (CTO Mode)

## 1. Vision & Strategy
Refactor the existing `ShopPage.tsx` from `@tamuu/web` into a standalone, enterprise-grade Next.js application (`apps/home`). The goal is to achieve **100/100 Lighthouse scores**, a **Total White** aesthetic (clean, light, minimalist), and a **Mobile First** experience.

### 1.1 "Total White" Aesthetic (FAANG/Fortune 500 Standard)
- **Backgrounds**: Pure white (`#FFFFFF`) throughout. No grey or off-white sections.
- **Borders**: Extremely subtle, using `slate-100/50` or invisible separators with strategic whitespace.
- **Typography**: High contrast headings (`slate-900`) and sophisticated muted text (`slate-500`).
- **Interactive**: Soft "Ink" shadows (`shadow-sm` customized) and subtle 101% scale transforms on hover.
- **Photography**: Large, high-quality images from vendors are the primary visual driver.

## 2. Technical Architecture

### 2.1 Framework & Core Stack
- **Framework**: Next.js 15 (App Router).
- **Styling**: Pure Tailwind CSS 3.4+ (No component libraries like shadcn/ui).
- **State Management**: React Server Components (RSC) for initial data, Zustand for minimal client-side state (Search/Filters).
- **Data Fetching**: Native `fetch` with Next.js caching/revalidation, fetching from `https://api.tamuu.id`.
- **Runtime**: Cloudflare Workers (Edge Runtime) via OpenNext.

### 2.2 Directory Structure (`apps/home`)
```text
apps/home/
├── src/
│   ├── app/ (App Router)
│   │   ├── layout.tsx
│   │   ├── page.tsx (Main Shop Entry)
│   │   ├── c/ (Category routes)
│   │   │   └── [slug]/
│   │   └── location/ (City routes)
│   │       └── [city]/
│   ├── components/
│   │   ├── layout/ (Navigation, Footer)
│   │   ├── shop/ (ProductCard, CategoryFilter, HeroCarousel)
│   │   └── ui/ (Custom Tailwind Primitives)
│   ├── lib/ (API client, SEO helpers, Utils)
│   └── hooks/ (Client-side interaction hooks)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## 3. Component Design (Pure Tailwind)

### 3.1 `HeroCarousel` (Hybrid)
- **Server**: Pre-renders the first 1-2 slides for LCP optimization.
- **Client**: Hydrates for smooth swipe/auto-play transitions using Framer Motion (already in monorepo).

### 3.2 `ProductCard` (Bespoke)
- **Design**: White-on-white card. Borderless with a very soft shadow that appears on hover.
- **Mobile**: Full-width or 2-column grid with touch-optimized targets (44px+).
- **Details**: Vendor logo, rating (Stars), price, and location.

### 3.3 `DynamicFilterBar` (Sticky)
- **Behavior**: Horizontal scroll on mobile, fixed on desktop.
- **Style**: Text-only or minimal icon + text, using active/inactive states through font weight and subtle color shifts.

## 4. SEO & Performance (Zero-Jank)
- **Server Components**: 90% of the initial HTML is generated on the server.
- **Dynamic Metadata**: Using `generateMetadata` to handle SEO permutations for thousands of category/city/intent combinations.
- **Image Optimization**: Using `next/image` with Cloudflare Image Resizing (if available) or standard optimizations.
- **Lazy Loading**: Using `content-visibility: auto` for sections below the fold.

## 5. Deployment Plan (OpenNext + Cloudflare)
- **Build**: `npm run build` (Next.js build).
- **Bundle**: Use `opennextjs-cloudflare` to adapt the Next.js build for Cloudflare Workers.
- **Deploy**: `wrangler deploy` to publish to Cloudflare.

## 6. Testing Strategy
- **Unit**: Vitest for utility functions and small UI primitives.
- **E2E**: Playwright (existing in monorepo) for critical paths: Search -> Category Filter -> Product Click.
- **Performance**: Automated Lighthouse CI checks on PRs.

---
*End of Design Spec*
