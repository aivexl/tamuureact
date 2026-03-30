# Implementation Plan: Refactor Blog & Legal to Next.js 15

Refactor Privacy, Terms, About, Support, and Blog pages to `apps/main` (Next.js 15) with 1:1 visual parity and Server Component optimization.

## Phase 1: Shared UI Components & Utilities
Re-implement core UI components in `apps/main/src/components` to match `apps/web`.

- [ ] Create `apps/main/src/components/ui/PremiumLoader.tsx` (1:1 from `apps/web`)
- [ ] Create `apps/main/src/components/ui/MultiCarousel.tsx` (1:1 from `apps/web`, marked `'use client'`)
- [ ] Create `apps/main/src/components/Shop/Breadcrumbs.tsx` (1:1 from `apps/web`)
- [ ] Create `apps/main/src/components/blog/BlogCard.tsx` (1:1 from `apps/web`)
- [ ] Create `apps/main/src/components/blog/BlogPostLayout.tsx` (1:1 from `apps/web`, port Helmet to Next.js Metadata)
- [ ] Create `apps/main/src/lib/api.ts` (Ensure server-side fetch compatibility)

## Phase 2: Static Legal & About Pages
Implement static pages in `apps/main/src/app`.

- [ ] Implement `apps/main/src/app/privacy/page.tsx`
- [ ] Implement `apps/main/src/app/terms/page.tsx`
- [ ] Implement `apps/main/src/app/about/page.tsx`
- [ ] Implement `apps/main/src/app/support/page.tsx` (UI from `ContactPage.tsx`)

## Phase 3: Blog System (SSR/ISR)
Implement the blog landing and detail pages with Server-Side data fetching.

- [ ] Implement `apps/main/src/app/blog/page.tsx` (Landing)
- [ ] Implement `apps/main/src/app/blog/[slug]/page.tsx` (Detail)
- [ ] Port "Chronos Engine" SEO logic to `generateMetadata` in blog pages.

## Phase 4: Verification & Routing Update
- [ ] Verify 1:1 visual parity across all new routes.
- [ ] Update `apps/main/next.config.ts` to remove rewrites for:
    - `/privacy`
    - `/terms`
    - `/about`
    - `/blog`
    - `/support` (if applicable)

## Verification Plan
1. **Visual Check:** Manually compare each page in `apps/main` vs `apps/web` (development environment).
2. **SEO Check:** Verify `<title>`, `<meta description>`, and JSON-LD scripts are identical.
3. **Performance Check:** Ensure server-side pre-rendering is working (view source check).
