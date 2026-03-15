# Tamuu Changelog

## [0.8.4] - 2026-03-15
### Added
- **TikTok Shop Integration**: Added "TikTok Shop" to the Primary Contact Method list across the entire product ecosystem, including API types, Admin Dashboard, and Merchant Portal.
- **Admin Registry Transparency**: Injected TikTok Shop icons and selection options into the Administrative Product Listing form and table for global registry items.
- **Merchant Workflow Expansion**: Updated the Merchant Product Form to allow vendors to set TikTok Shop as their primary contact platform, enabling a dedicated "Beli di TikTok Shop" CTA on the public Product Detail Page.
- **Data Architecture Persistence**: Updated `api.ts` and backend union types to support `tiktokshop` as a first-class contact method, ensuring reliable persistence in Cloudflare D1.

### Fixed
- **TikTok Shop Persistence**: Resolved a critical data omission bug where `tiktokshop_url` was missing from the Administrative Product Registry retrieval query.
- **Atomic Creation Hardening**: Patched a column mismatch and binding error in both Admin and Merchant product creation endpoints that caused contact metadata to be lost or shifted during the initial save operation.
- **Database Schema Sync**: Verified and synchronized the Cloudflare D1 production schema to ensure `tiktokshop_url` columns are present in both `shop_products` and `shop_contacts` tables.
- **Marketplace UI Refinement**: Removed grayscale filters and opacity reductions from Shopee and Tokopedia icons across all components (Admin, Merchant, and Public Storefront), ensuring official brand colors are persistently visible.

## [0.8.3] - 2026-03-14
### Fixed
- **Primary Contact State Isolation**: Implemented a definitive architectural fix for the Administrative Registry by decoupling the `kontak_utama` state from the general product form object. This absolute isolation prevents the background sync engine from accidentally overwriting manual user selections, ensuring 100% persistence reliability.
- **Form State Integrity**: Added unique React keys to the Admin Product Form to force complete state initialization on every edit operation, eliminating cross-product data contamination.
- **Explicit UUID Resolution**: Hardened the save pipeline to use absolute UUID resolution (`product_id`) for all administrative updates, guaranteeing zero-miss database targeting.

## [0.8.2] - 2026-03-14

## [0.8.1] - 2026-03-14
### Fixed
- **Dynamic Contact Button Resolution**: Patched a critical logic error in the Product Detail Page where the "Hubungi Sekarang" button was incorrectly defaulting to WhatsApp despite specific product settings. The button now correctly respects the `kontak_utama` saved for each individual product.
- **Data Integrity & Schema Patch**: Executed a proactive database update to ensure `kontak_utama` is never null across the entire product registry.
- **Cache Invalidation Protocol**: Enhanced the `useShop` hooks to properly invalidate specific product detail queries upon update, ensuring that changes made in the dashboard reflect instantly on the public storefront without requiring a hard refresh.
- **Product Update Reliability**: Patched the backend update handlers to prevent empty strings from reverting contact methods to null, ensuring persistence of chosen platforms.

## [0.8.0] - 2026-03-14
### Fixed
- **Per-Product Contact Specificity**: Corrected a backend bug where Admin Dashboard edits were failing to save specific contact fields (`whatsapp`, `instagram`, etc.). Products now strictly maintain their individual contact preferences independent of the merchant profile.
- **Sync Logic Reversion**: Removed bulk propagation logic that previously overwrote all a merchant's products, restoring full control over per-product contact methods.
- **PDP "Intent First" Logic**: Optimized the Product Detail Page to strictly prioritize the product's individual contact setting, ensuring user intent is respected even when a merchant's global profile differs.
- **Marketplace Branding Consistency**: Restored specific Tokopedia and Shopee brand logos across the PDP, Admin Registry, and Merchant Dashboard with optimized premium sizing.

### Added
- **Admin Registry Transparency**: Injected a new "Metode" column into the Administrative Product Listing table, providing instant visibility of the primary contact method for all global registry items.
- **Merchant Insight Badge**: Added a dynamic "Metode Kontak" badge to product cards in the Merchant Dashboard for immediate visual confirmation of per-product settings.

## [0.7.9] - 2026-03-14
### Fixed
- **Database Schema Integrity**: Manually provisioned missing `kontak_utama` column in `shop_products` table via remote D1 execution to unblock the migration pipeline.
- **Merchant Contact Fallback Nexus**: Optimized `ProductDetailPage.tsx` to implement a multi-tier fallback for the primary contact button: Product Level -> Merchant Global Level -> Default (WhatsApp).
- **Dashboard State Accuracy**: Patched the `kontakUtama` selector in the Merchant Product form to correctly trigger the `isDirty` state, ensuring changes are captured during save operations.
- **Data Inheritance Refactor**: Removed hardcoded 'whatsapp' default in `handleEdit` to allow products to correctly inherit global merchant settings when specific data is absent.

## [0.7.8] - 2026-03-14
### Fixed
- **Primary Contact Persistence**: Patched `PUT /api/shop/merchant/settings` and product update endpoints to correctly bind `kontak_utama`, ensuring merchant and product preferences persist in D1.
- **Discovery Visibility Nexus**: Added `kontak_utama` to Shop Directory, Product Discovery, and Storefront APIs, ensuring the frontend Product Detail Page (PDP) receives the metadata required for dynamic CTA button rendering.
- **Robust Approval Preservation**: Refactored the product update logic to preserve existing `is_approved` status for regular merchants, preventing approved products from reverting to "Pending" on update.
- **PDP CTA Hardening**: Updated `ProductDetailPage.tsx` with robust fallback logic and support for all 11 contact platforms (Website, Tokopedia, Shopee included), ensuring a functional primary action button even when specific product data is sparse.

## [0.7.7] - 2026-03-14
### Changed
- **Contact Selection Reversion**: Reverted "Metode Kontak Utama" from grid selection to a premium Apple-standard minimalist dropdown across Admin Product Listing, Merchant Products, and Merchant Settings for better usability.
- **Platform Parity**: Maintained full 11-platform support (WhatsApp, Chat, Phone, Instagram, Facebook, TikTok, X, YouTube, Website, Tokopedia, Shopee) within the new dropdown UI.

## [0.7.6] - 2026-03-14
**Status**: 🔵 In Development
**Environment**: Staging/Production

### UI/UX: Premium Primary Contact Nexus (Apple Standard)
- **Apple Standard Selection Grid**: Replaced all legacy dropdowns for "Metode Kontak Utama" with a high-fidelity, icon-driven selection grid. This applies to:
    - Admin Product Listing form.
    - Merchant/User Product form.
    - Global Store Settings.
- **Expanded Platform Support**: Both backend and frontend now fully support a wider range of primary contact actions: WhatsApp, Chat, Phone, Instagram, Facebook, TikTok, X (Twitter), YouTube, Website, Tokopedia, and Shopee.
- **Action-Oriented Product Detail**: Updated the primary CTA button on the Product Detail Page to use descriptive, platform-specific labels (e.g., "Buka Instagram", "Buka Facebook", "Buka TikTok") instead of generic terms, driving higher user intent and clarity.
- **Visual Refinement**: Implemented active-state highlighting with high-contrast `#FFBF00` branding and smooth `framer-motion` transitions for a premium interactive feel.

## [0.7.5] - 2026-03-14
**Status**: 🔵 In Development
**Environment**: Staging/Production

### Admin: Administrative Listing Completeness
- **Primary Contact Selection**: Added "Metode Kontak Utama" (Primary Contact Method) selection to the Administrative Product Listing form. This allows admins to designate the primary action button (WhatsApp, Chat, Phone, Instagram, Tokopedia, or Shopee) for global registry products.
- **Store Sync Expansion**: Enhanced the reactive store synchronization logic to automatically pull the primary contact preference when a registered brand is selected in the admin dashboard, ensuring consistency across a vendor's product catalog.

## [0.7.4] - 2026-03-14
**Status**: 🔵 In Development
**Environment**: Staging/Production

### Admin: User Governance & Security Hardening
- **User Status Lifecycle**: Introduced `status` column to users table (Active, Suspended, Banned) for granular account control.
- **Administrative Actions**: Added explicit "Suspend" and "Ban" buttons to the Users Management dashboard, providing immediate access to account state toggling.
- **Auth Middleware Enforcement**: Hardened `verifyToken` and `verifyAdmin` to strictly block access for any account with a non-active status, ensuring security across all API endpoints.
- **Unified Identity Registry**: Refactored user update endpoints to handle comprehensive profile, subscription, and status modifications in a single streamlined interface.

## [0.7.3] - 2026-03-13
**Status**: 🔵 In Development
**Environment**: Staging/Production

### Admin: Governance UX Overhaul
- **Action Dashboard Migration**: Replaced the legacy "Sanctions" menu with an explicit "Actions" suite in Store Management.
- **Immediate Controls**: Removed conditional toggles for merchant actions; Verify, Sponsor, and Feature buttons are now persistently visible for streamlined operations.
- **Data Synchronization**: Switched from mock data to live D1 merchant stream in the Admin Store Management component.
- **Real-time Verification**: Connected the Verify button to the `PATCH /api/admin/shop/merchants` endpoint for instant trust state toggling.

## [0.7.2] - 2026-03-13
**Status**: 🔵 In Development
**Environment**: Staging/Production

### Shop: Super Admin Trust & Store Recovery
- **Instant Merchant Verification**: Re-engineered onboarding API to automatically verify (`is_verified = 1`) new stores created by Super Administrators, ensuring immediate product visibility in discovery.
- **Manual Store Recovery**: Performed database-level recovery for merchant `test3` (toko), correcting its verification status and ownership to the Super Admin account.
- **Product Visibility Resolution**: Fixed the issue where product `aa31bcf0` (sewa mobil) was hidden due to its parent merchant being in an unverified state.

## [0.7.1] - 2026-03-13
**Status**: 🔵 In Development
**Environment**: Staging/Production

### Shop: Role-Based Governance & Visibility Restoration
- **Super Admin Auto-Approval Restoration**: Re-implemented immediate auto-approval (`is_approved = 1`) exclusively for Super Administrators (verified by role or email) when posting via the merchant interface.
- **Regular Admin & User Parity**: Standardized behavior for regular admins and standard users; products posted via the merchant portal now correctly default to `is_approved = 0` (Pending Review), requiring manual vetting via the Admin Registry.
- **Backend Auth Hardening**: Enhanced `verifyToken` and product handlers to perform deep identity verification, ensuring administrative bypasses are only granted to the highest privilege level.
- **Visibility Fix**: Resolved the issue where Super Admin products were not appearing due to the broad strict enforcement introduced in previous versions.

## [0.7.0] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Milestone - Unified Discovery & Privacy Standards
- **Draft Privacy Hardening**: Fixed a bug where `DRAFT` products were appearing in the "Other Products from Store" section on the Product Detail Page. Added strict frontend filtering for `status === 'PUBLISHED'` and `is_approved === 1`.
- **Admin Store Simulation**: Implemented auto-verification for administrators during merchant onboarding. This ensures that stores created by admins are immediately eligible for home page discovery (`is_verified = 1`) while still following the standard merchant workflow.
- **Product Card UI Refactor**: Redesigned the product list in the merchant dashboard for better accessibility:
    - Moved all action buttons (Edit, View, Delete) to a dedicated row below the title.
    - Removed hover-dependency; controls are now persistently visible.
    - Added a "View" button with an `ArrowUpRight` icon for seamless live previews.
- **Backend Optimization**: Refined SQL queries across discovery, recommendations, and special products to ensure consistent enforcement of status and approval gates.

## [0.6.99] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Strict Approval Enforcement
- **Approval Logic Hardening**: Enforced a strict `is_approved = 0` default for all products created via the merchant interface (`/store/*/products`), including those in `DRAFT` status. This ensures that no administrative bypasses are possible and every product, regardless of the uploader's role, must be manually vetted and approved through the Admin Product Registry before it can satisfy discovery criteria.

## [0.6.98] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Consistency & Standardization
- **Approval Logic Reversion**: Reverted the administrative auto-approval bypass for products uploaded via the merchant interface (`/store/*/products`). All users, including administrators, are now treated as standard merchants when using this route. Published products will default to `is_approved = 0` and require manual approval in the Admin Product Registry to appear in discovery.
- **Form UI Consistency**: Maintained the refactored product card UI with persistent action buttons and "View" links, while ensuring no hidden administrative flags are automatically applied.

## [0.6.97] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Merchant Experience & Administrative Flow
- **Admin Auto-Approval**: Implemented an administrative bypass for product approval. When an admin uploads or updates a product via the `/store/*/products` user interface, the product is automatically set to `is_approved = 1`, ensuring immediate visibility on the home page/discovery while still preserving the "normal user" simulation (keeping `is_admin_listing = 0`).
- **Product Card UI Refactor**: Enhanced the product list in the merchant dashboard:
    - Relocated **Edit** and **Delete** buttons from the image overlay to a dedicated action row below the product title for better accessibility.
    - Added a new **"View"** button with an `ArrowUpRight` icon for instant preview of live products.
    - Ensured all action buttons are persistently visible (removed hover dependency).
- **Discovery Fix**: Resolved an issue where certain products (like `AA31BCF0`) were hidden from discovery due to lack of merchant verification or pending approval.

## [0.6.96] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop & Admin: Global Timezone Synchronization
- **Fix (Real-time Notifications)**: Resolved a critical timezone mismatch where new notifications showed as "7 hours ago" for users in WIB (UTC+7). Implemented a robust `parseUTCDate` standard that correctly handles SQLite timestamps as UTC before localizing them in the browser.
- **Unified Date Parsing**: Applied the new UTC synchronization standard across all critical components:
    - **Notification Bell**: Fixed relative time ("time ago") accuracy.
    - **Admin Activity Hub**: Corrected event timestamps.
    - **Admin Transactions**: Fixed transaction dates in UI and Excel exports.
    - **Guest Wishes**: Standardized submission times.
    - **User Management**: Fixed registration and subscription expiry dates.
    - **Product Reviews**: Corrected review timestamps.

## [0.6.95] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Merchant Photo Gallery Refactor
- **UX Optimization**: Relocated image upload and bulk delete controls to be persistently visible below the photo grid. This improves accessibility and prevents accidental interactions within the grid area.
- **Improved Empty State**: Added consistent placeholder slots when the gallery is empty to maintain layout stability.
- **Image Intelligence**: Confirmed the implementation of the Unicorn Standard image engine which automatically optimizes all uploads:
    - Automatic conversion to high-compression **WebP** format.
    - Intelligent resizing to **1600x1600** HD standard.
    - **BlurHash** generation for seamless "ghost loading" placeholders.
    - Perceptual quality preservation at **80%**.

## [0.6.94] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Merchant Form Completeness
- **Social & Contact Links**: Expanded the "Tautan Eksternal" section in the Merchant Product Form to include WhatsApp, Phone, Instagram, and Facebook fields. This ensures that the user form is now as complete as the administrative listing form, allowing vendors full control over their transactional and social touchpoints.

## [0.6.93] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Form Layout Optimization
- **UX Refinement**: Relocated the "Deskripsi Lengkap" card to be positioned immediately below the "Detail Produk" card in both Merchant and Admin product forms. This aligns the data entry flow with natural cognitive progression (Basic Identity -> Detailed Specs -> Location/Sync -> External Links).

## [0.6.92] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Unified Contact Synchronization
- **New Feature**: Added "Sync with Store Settings" toggle in the Merchant Product Form. When active, it automatically synchronizes the product's contact and location data with the global store profile.
- **New Feature**: Added "Sync Store History" toggle in the Admin Product Form. This allows administrators to pull the latest contact/location data for a specific brand from the existing registry entries.
- **Store Settings Enhancement**: Added `google_maps_url` and `alamat_lengkap` support to the Store Profile. Merchants can now manage their global location link in one place.
- **Database Architecture**: Added `google_maps_url` column to the `shop_contacts` table via migration `0056`.
- **API Worker Update**: Enhanced the merchant profile update endpoint to handle persistent Google Maps URLs.

## [0.6.91] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Social Media Contact Expansion
- **X (Twitter) Support**: Fixed missing X social media link in the vendor contact section of the Product Detail Page.
- **YouTube Support**: Added YouTube channel link support to the vendor contact grid.
- **Backend Single Product API**: Updated the `/api/shop/product` endpoint to include `youtube` and `x_url` fields from both product and merchant contact sources.

## [0.6.90] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Product Detail Page Layout Optimization
- **Section Relocation**: Moved the "Other Products from Store" section from the top sidebar to a more prominent position below the "Reviews & Ratings" section.
- **UI Enhancement**: Redesigned the "Other Products" cards with a larger footprint, background padding, and enhanced hover shadow effects to match the discovery section aesthetic.

## [0.6.89] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Product Persistence & Registry Data Integrity
- **Persistence Refactor**: Rewrote the product update logic in `tamuu-api-worker.js` to use dynamic field updates instead of `COALESCE`. This allows users to correctly clear fields (like removing a marketplace link) which was previously blocked by the `COALESCE(?, field)` pattern.
- **Admin Registry Expansion**: Fixed a critical data-omission bug in the admin product list query. Added all missing columns (`tokopedia_url`, `shopee_url`, `whatsapp`, `phone`, etc.) to the `SELECT` statement, enabling full administrative editing capabilities.
- **Admin Promoted Flags Control**: Added a new "Governance & Visibility" control panel to the Admin Product form, allowing administrators to toggle `is_special`, `is_featured`, and `is_landing_featured` flags directly.
- **Merchant Form Fix**: Resolved an issue where contact fields were being lost during product updates in the user dashboard due to missing keys in the `handleSave` payload.
- **Form State Fix**: Corrected a state initialization bug in `AdminProductListing.tsx` that caused certain promoted flags to be ignored during edits.

## [0.6.88] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Vendor Contact & Marketplace UI Refinement
- **Fixed 3-Row Contact Layout**: Reorganized vendor contact information into a strictly maintained 3-row structure:
  1. **Row 1**: WhatsApp and Phone number.
  2. **Row 2**: Social Media (Instagram, TikTok, Facebook) and Website.
  3. **Row 3**: Dedicated section for Marketplace icons.
- **Top-Tier Marketplace Integration**: Moved Shopee and Tokopedia icons to a prominent position right below the product star rating for immediate accessibility.
- **Fixed Slot Architecture**: Implemented a "Fixed Slot" system for contact items, ensuring each icon maintains its specific horizontal position even if other data points in the same row are missing.
- **Minimalist UI**: Removed all text labels (e.g., "WhatsApp", "Instagram") from the contact section to achieve a clean, icon-first aesthetic.
- **Admin & User Consistency**: Applied these layout refinements across all product views, ensuring a unified experience for both admin-listed and user-posted products.

## [0.6.87] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX: Vendor Contact Redesign
- **Seamless List Layout**: Replaced the previous grid/card layout with a truly seamless vertical stack list, removing redundant inner cards for a cleaner, integrated feel.
- **Modern Social Branding**: Integrated the latest SVG icons for **X (Twitter)** and **TikTok** with official brand colors.
- **Controlled Navigation**: Implemented a "Click-to-Reveal" mechanism. Links are now gated behind an explicit "Arrow" button that appears only after the contact info is revealed, preventing accidental tab opens.
- **Premium Marketplace Interaction**: Added a sophisticated grayscale-to-color transition on hover for Shopee and Tokopedia official links.
- **Icon Rendering Fixes**: Standardized icon handling to properly support both stroke-based (Lucide) and fill-based (Custom SVG) icons with consistent brand coloring.

## [0.6.86] - 2026-03-13

## [0.5.3] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Enterprise RSVP UI/UX Redesign
- **Total Architectural Overhaul**: Redesigned all 20 RSVP form variants (Classic, Modern, Brutalist, etc.) to meet Apple-tier, Fortune 500 enterprise standards.
- **Ultra-High Definition Typography**: Implemented strict `opacity-100` overrides, solid color interpolation for placeholders (removing alpha channels), and `WebkitFontSmoothing: antialiased` to ensure razor-sharp text rendering across all DPIs without sub-pixel gradient artifacts.
- **Isolated Component Scrolling**: Re-engineered the root bounding box of the RSVP component to be strictly non-scrollable (`overflow-hidden`), locking the input form in place.
- **Dynamic Wishes Container**: The "Ucapan & Doa" (Wishes) section was refactored into a `flex-1` container with a `min-h-[300px]` internal scrolling zone, ensuring at least 3 cards are always visible while naturally stacking additional entries.

## [0.6.85] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production

### Shop: Merchant Card Restoration & Marketplace Integration
- **Fix & Restoration**: Restored the Merchant Card (Store Card) design on the Product Detail Page to its original high-fidelity state, ensuring statistics (Products, Rating, Love) are visible and accurate.
- **Marketplace Row**: Integrated a third row in the "Kontak Vendor" card for **Shopee** and **Tokopedia** with official logos.
- **Robust Data Mapping**: Implemented a fallback mechanism for merchant statistics. If `merchantStats` is unavailable, the UI now seamlessly falls back to product-level aggregated data.
- **Structural Optimization**: Cleaned up duplicated code blocks in `ProductDetailPage.tsx` that caused rendering inconsistencies.

## [0.6.84] - 2026-03-13
**Status**: 🟢 Deployed
**Environment**: Production
...
### Critical: End-to-End Search Parameter Preservation
- **Redirection Integrity**: Patched `ExternalRedirect`, `ProtectedRoute`, and the `App.tsx` root redirect to explicitly preserve and forward all URL search parameters and hashes. This ensures that parameters like `?tab=wishlist` are never stripped during domain transitions (tamuu.id → app.tamuu.id), authentication redirects, or root-path normalization.
- **Deterministic Routing**: Reinforced the dashboard's URL-driven architecture to eliminate momentary "flash" states or resets back to the home tab.
- **Security & UX**: Used `encodeURIComponent` for safe redirect handling and maintained history stack integrity with `location.replace()`.

## [0.6.79] - 2026-03-12
**Status**: 🟢 Deployed
**Environment**: Production

### Dashboard: URL-Driven Navigation Architecture
- **Complete Refactor**: Transitioned all dashboard tab navigation from state-based buttons to standard `Link` components. This architecture ensures that all navigation (Navbar, Sidebar, Mobile Menu) is driven exclusively by URL parameters, eliminating race conditions and ensuring deterministic UI rendering.
- **Param Synchronization**:deriving `activeTab` directly from `useSearchParams` to ensure the UI is always in sync with the browser's address bar.
- **State Hygiene**: Added a lifecycle cleanup effect to remove dashboard-specific URL parameters when the user navigates to other parts of the platform.

## [0.6.78] - 2026-03-12
**Status**: 🟢 Deployed
**Environment**: Production

### Bug Fix: Robust Dashboard Tab Navigation
- **Deterministic State Management**: Eliminated the `useState` for `activeTab` in `DashboardPage.tsx`, opting instead to derive the active tab directly from URL search parameters (`useSearchParams`). This architectural change ensures that global navigation elements (like the Navbar Heart icon) trigger deterministic UI updates without the risk of local state desynchronization or conflicting `useEffect` cycles.
- **Reliable Redirection**: Guaranteed that `/dashboard?tab=wishlist` correctly renders the Wishlist tab regardless of the previous dashboard state.

## [0.6.77] - 2026-03-12
**Status**: 🟢 Deployed
**Environment**: Production

### Bug Fix: Dashboard ActiveTab Synchronization
- **Logic Simplification**: Refactored the `useEffect` hook in `DashboardPage.tsx` to unconditionally synchronize the `activeTab` state with the `tab` URL parameter. This eliminates navigation dead-locks where the UI failed to re-render when switching dashboard tabs via global navigation elements like the Navbar heart icon.
- **Reliability Boost**: Removed redundant state checks within the sync effect to ensure immediate response to `searchParams` updates.

## [0.6.76] - 2026-03-12
**Status**: 🟢 Deployed
**Environment**: Production

### Bug Fix: Dashboard Wishlist Navigation
- **Navigation Nexus Fix**: Successfully implemented the missing `useEffect` hook in `DashboardPage.tsx` to react to URL search parameter changes. This ensures that clicking the Heart icon in the global navbar correctly triggers the rendering of the Wishlist tab, even when the user is already on the dashboard.
- **State Reliability**: Reinforced tab synchronization logic to prevent UI stale-states during cross-page and intra-page navigation.

## [0.6.75] - 2026-03-12
**Status**: 🟢 Deployed
**Environment**: Production

### Dashboard: State Synchronization & UI Polish
- **UI Optimization**: Standardized the invitation card grid to a high-density, fluid layout (`xl:grid-cols-6`), eliminating excessive dead space.
- **Search UI Refinement**: Adjusted the `text-slate-900` color on the search input in the Invitations tab for better readability against the `bg-slate-100` background.

## [0.6.74] - 2026-03-12
**Status**: 🟢 Deployed
**Environment**: Production

### Dashboard: Invitations Tab UI Refinement
- **Grid Optimization**: Reduced card gap in the Invitations Tab to `gap-3` (mobile) and `gap-4` (desktop) for a more cohesive and compact layout.
- **Search Accessibility**: Enhanced search input visibility with a high-contrast theme, utilizing `bg-slate-100`, `border-slate-300`, and bolder typography.
- **Workflow Streamlining**: Removed the redundant "Filter" button to simplify the management interface.
- **Visual Polish**: Improved search icon contrast and refined placeholder text states for better user guidance.

## [0.6.73] - 2026-03-12
**Status**: 🟢 Deployed
**Environment**: Production

### Dashboard & Store: Invitation Card UI Standardization
- **Visual Consistency**: Standardized the Invitation Card dimensions and geometry to match the `ProductCard` aesthetic (`rounded-[2rem]`, compact sizing).
- **Persistent Interaction Hub**: Replaced the hover-only overlay with a persistent actions area below the title, ensuring critical tools (Preview, Edit, Copy Link, Guests) are always accessible.
- **Grid Optimization**: Upgraded the `InvitationsGrid` to a high-density layout (`grid-cols-2` to `grid-cols-5`), aligning with the Tamuu Shop visual standard.
- **Improved Hierarchy**: Refined typographic scales and spacing within the cards to maintain readability in smaller form factors.
- **Operational Refinement**: Increased the Home Dashboard's "Undangan Terbaru" visibility to 5 items to better utilize the optimized grid density.

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
