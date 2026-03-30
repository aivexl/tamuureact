# Design Spec: Refactoring Public Pages to Next.js 15

- **Topic:** Refactor Privacy Policy, Terms, About Us, Support, and Blog to Next.js 15.
- **Date:** 2026-03-30
- **Status:** Pending Review

## 1. Objective
Refactor specific public-facing pages from the Vite-based `apps/web` to the Next.js 15 `apps/main` project to leverage Server Components, improve SEO, and centralize the public domain (`tamuu.id`) experience.

**CRITICAL CONSTRAINT:** Maintain 1:1 visual and behavioral parity. Not a single pixel, animation, or effect should change.

## 2. Scope
The following pages will be moved:
- **Privacy Policy:** `/privacy`
- **Terms of Service:** `/terms`
- **About Us:** `/about`
- **Support Center:** `/support` (Forwarded to `/contact` UI)
- **Blog Landing:** `/blog`
- **Blog Detail:** `/blog/[slug]`

## 3. Architecture

### 3.1. Routing (Next.js App Router)
New routes in `apps/main/src/app`:
- `/privacy/page.tsx`
- `/terms/page.tsx`
- `/about/page.tsx`
- `/support/page.tsx`
- `/blog/page.tsx`
- `/blog/[slug]/page.tsx`

### 3.2. Data Fetching
- Use Next.js 15 **Server Components** for pages.
- Data for the Blog will be fetched on the server using `fetch` with caching.
- Shared API logic will be ported or referenced from `@tamuu/shared` or a local `lib/api.ts` in `apps/main`.

### 3.3. Component Strategy (1:1 Parity)
Components will be re-implemented in `apps/main/src/components` with identical logic and styling:
- **UI Components:** `PremiumLoader`, `MultiCarousel`, `Breadcrumbs`, `BlogCard`, `BlogPostLayout`.
- **Animations:** Use `framer-motion` (with `'use client'`) with the exact same variants and durations.
- **Icons:** Use `lucide-react` to match current usage.

## 4. Page Specifications

### 4.1. Legal Pages (Privacy, Terms)
- **Structure:** Simple static layouts with Lucide icons.
- **Parity:** Maintain exact `max-w-4xl`, rounded corners (`rounded-[2.5rem]`), and spacing.

### 4.2. About Us
- **Hero:** Interactive background with blur effects (`blur-[120px]`).
- **Animations:** Port `motion.div` entry animations exactly.

### 4.3. Blog
- **Landing:** 
    - Server-side fetching for initial posts and categories.
    - `MultiCarousel` (Client Component) for featured posts.
    - Category filtering (Client Component) to maintain state.
- **Detail:**
    - `generateMetadata` for dynamic SEO.
    - `generateStaticParams` for pre-rendering popular slugs.
    - `dangerouslySetInnerHTML` for the TipTap content.

## 5. SEO & Metadata
Next.js `metadata` API will replace `useSEO` hook:
- Port "Chronos Engine" logic (dynamic month/year in titles).
- Implement JSON-LD Schemas (`FAQPage`, `BlogPosting`, `BreadcrumbList`) as found in current components.

## 6. Cleanup
Once verified, the `rewrites` in `apps/main/next.config.ts` for these paths will be removed, allowing Next.js to handle the routes natively.

---

## Spec Self-Review
- **Placeholder scan:** None. All data sources (API_BASE) are known.
- **Internal consistency:** All pages follow the same "Server Page + Client UI" pattern.
- **Scope check:** Limited strictly to requested pages. Admin and Preview are NOT touched.
- **Ambiguity check:** Explicitly mentioned 1:1 parity and Next.js 15 patterns.
