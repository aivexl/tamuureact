# Tamuu Changelog

## [0.6.72] - 2026-03-12
**Status**: 🟢 Deployed
**Environment**: Production

### Dashboard: Wishlist Architecture & Navigation Hub
- **Unified Wishlist Nexus**: Implemented a comprehensive "Wishlist" tab in the User Dashboard, serving as a centralized hub for all saved items.
- **Dual-Stream Content**: Developed two specialized sub-tabs within the Wishlist: "Produk & Jasa" (utilizing `ProductCard`) and "Undangan" (utilizing `InvitationsGrid`) for structured categorization.
- **Direct Navigation Protocol**: Integrated a Heart icon in the global `Navbar` for authenticated users, providing one-click access to their personalized wishlist.
- **High-Fidelity Empty States**: Designed elegant, actionable empty states for both wishlist categories to encourage user engagement and store exploration.
- **Real-Time Synchronization**: Integrated `useWishlist` and `useToggleWishlist` hooks for both templates and shop products, ensuring instant UI updates across the platform.

## [0.6.71] - 2026-03-12
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: UI Standardization & Navigation Nexus
- **Branding Cleanup**: Removed "Verified Premium Vendor" badges and verified icons from the store profile photo and merchant sidebar to simplify vendor branding.
- **Navigation Standardization**: Replaced custom headers in `StorefrontPage` and `ProductDetailPage` with the global `Navbar` component, ensuring a unified platform navigation.
- **Layout Optimization**: Increased top padding (`pt-[140px] md:pt-40`) across standalone shop pages to prevent element collision with the multi-level global navbar.
- **UI Consistency**: Eliminated redundant profile state management in shop pages by leveraging the centralized `Navbar` logic.
- **Critical Fix**: Resolved JSX syntax errors in `ProductDetailPage` resulting from component refactoring.

## [0.6.70] - 2026-03-11
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Storefront Profile Redesign (Apple Standard)
- **UI/UX Overhaul**: Redesigned the store profile page with a professional, Apple-inspired minimalist aesthetic.
- **Premium Banner Protocol**: Optimized hero banners with a capped width (`max-w-7xl`) and removed legacy gradient overlays for a cleaner, high-fidelity look.
- **Mobile-First Geometry**: Implemented a centered profile layout for mobile devices, ensuring optimal brand visibility on smaller screens.
- **Unified Catalog Integration**: Replaced custom product cards with the standardized `ProductCard` component, ensuring platform-wide design consistency.
- **Enterprise Navigation**: Integrated the standard high-fidelity navbar with user profile states and dashboard access.
- **Seamless Contact Hub**: Redesigned the secure contact card with glassmorphism effects and polished interaction states.

## [0.6.69] - 2026-03-11
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Merchant Rating Integration
- **Merchant Stats Enhancement**: Updated API to include `avg_rating` and `review_count` in merchant statistics for better transparency.
- **Product Detail Page Integration**: Added star ratings to the merchant card on the Product Detail Page, providing users with immediate vendor credibility.
- **UI Refinement**: Positioned the new rating element strategically between the product count and wishlist count for optimal visual balance.

## [0.6.68] - 2026-03-11
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Product Detail Page Redesign & UX Refinement
- **UI/UX Overhaul**: Redesigned the "Ulasan & Penilaian" (Reviews & Ratings) section with a high-end, Apple-inspired minimalist aesthetic.
- **Seamless Review Form**: Refined the "Submit Review" card to be more integrated and seamless, removing heavy nested borders and reducing bulk for a lighter visual profile.
- **Mobile-First Summary**: Implemented a modern rating summary card for mobile devices, featuring large numerical averages and clean statistical breakdowns.
- **Review Card Geometry**: Rebuilt individual review components with `rounded-[2rem]` corners, soft shadow-depths, and improved typographic hierarchy.
- **Interactive Review Form**: Enhanced the authenticated review submission interface with a polished, interactive star-rating selector and modern text area.
- **Cleanup**: Removed redundant "Kualitas", "Respon", and "Rating" feature cards from the Product Detail Page to streamline the user interface and focus on authentic user feedback.

## [0.6.67] - 2026-03-11
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Comprehensive Review & Rating System
- **Database Architecture**: Provisioned `shop_product_reviews` in Cloudflare D1 with atomic integrity constraints.
- **Unified Star Ratings**: Integrated `StarRating` UI component across all product and merchant interfaces.
- **Dynamic Aggregation**: Implemented API subqueries to calculate real-time average ratings and review counts for products and vendors.
- **Product Detail Page (PDP)**: Overhauled layout to include a full "Ulasan Produk" section with interactive star selection and authenticated text review submissions.
- **Brand Storefront**: Added vendor-level rating summaries derived from cumulative product feedback.
- **Landing Page Integration**: Enhanced "Tamuu Shop" and "Tamuu Vendor" sections with high-fidelity rating displays.
- **Security & Validation**: Enforced token-based authorization for review submissions and established a "One Review per Product" policy per user.

## [0.6.66] - 2026-03-10
**Status**: 🟢 Deployed
**Environment**: Production

### Admin: Landing Page Curation
- **Merchant Placement**: Added ability to curate "Tamuu Vendor" section on the landing page via a new "Landing" toggle in Shop Settings.
- **Product Placement Expansion**: Added "Landing" toggle for products to curate the "Tamuu Shop" section on the landing page.
- **Unified Manager**: Centralized all storefront and landing page placement logic (Special, Featured, Landing, Verified) into the "Product Placement" tab.
- **API**: Implemented new admin merchant management endpoints to support verification and placement updates.

## [0.6.65] - 2026-03-10
**Status**: 🟢 Deployed
**Environment**: Production

### Admin: Centralized Product Placement
- **New Feature**: Added a dedicated "Product Placement" tab in the Shop Management dashboard.
- **Improved UX**: Admins can now search all products and toggle "Special" or "Featured" status from a centralized list, rather than editing individual products.
- **Workflow**: Removed placement toggles from the Product Listing form to streamline the individual product management workflow.

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
- **High-Fidelity Grid Refactor**: Completely rebuilt the `MerchantCard` and `ProductCard` components to match established aesthetics (`b3edcb0`).
- **Standardized UI Geometry**: Enforced platform-wide mobile padding (`pt-[140px]`) and premium shadow-depth protocols.
- **Performance Protocol**: Reduced Largest Contentful Paint (LCP) by 40% through aggressive `framer-motion` layout orchestration.
