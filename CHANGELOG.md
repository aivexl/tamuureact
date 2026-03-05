# Tamuu Changelog

## [0.5.0] - 2026-03-05
**Status**: 🟢 Deployed
**Environment**: Production

### Guest Management & System Stability
- **Fix: Guest Creation 500 Error**: Applied missing D1 migrations (`0045_enhanced_guests_unified_identity.sql`) to the production database, resolving a critical failure caused by the missing `slug` column.
- **UI: Guest Management Layout Refinement**: Increased top padding (`pt-20`) and adjusted header spacing (`pt-10 pb-8`) on the Guest Management page to ensure the "Kembali" button is proportionally positioned and not cramped against the navbar.
- **Database Consistency**: Synchronized all pending migrations across local and remote D1 environments.

### Unified Identity & Real-time Welcoming
- **Unified Identity System**: Implementation of 6-character alphanumeric tokens unifying Personal Links, QR Codes, and Check-in logic.
- **Auto-Broadcast Engine**: Re-engineered the backend to automatically trigger the Welcome Display upon a successful guest scan.
- **Decoupled Identity Elements**:
    - **Name Board**: Permanent guest name display optimized for Digital Invitations.
    - **Welcome Board**: Triggered guest name display with dynamic **"Tamuu VIP"** label support for TV Displays.
- **High-Density Admin UI**: Overhauled the `AdminTemplatesPage` with a pro-standard grid system (up to 6 columns) and persistent action buttons.
- **Technical Excellence**: Added missing TypeScript layer icons (`welcome_board`, `gift_address`) and hardened the `AssetSelectionModal` with 27 premium display variants.

## [2026-03-05] Feature: Admin Direct Upload & Permission-Based Love Story Editing
**Status**: 🟢 Deployed
**Environment**: Production

### Core Implementation
- **Admin Media Autonomy**: Integrated Cloudflare R2 direct upload engine into the Admin Property Panel. Admins can now manually upload assets for `image`, `gif`, `sticker`, `profile_photo`, and `photo_frame` elements, bypassing manual URL pasting.
- **Permission-Driven Narrative**: Refactored `LoveStoryCard` to respect template-level permissions. End-users can only modify their timeline if `canEditContent` is explicitly enabled by the template designer.
- **Enterprise-Grade UI Locking**: Implemented a "Locked by Admin" state for User Editor cards. When permissions are restricted, interactive inputs are gracefully disabled with high-contrast visibility, maintaining UI integrity while enforcing business logic.
- **Registry Sync**: Updated `ElementRegistry` and `UserElementEditor` to ensure consistent permission propagation across all premium narrative elements.

## [2026-03-05] Feature: Premium Love Story Redesign (Apple Design Standards)
**Status**: 🟢 Deployed
**Environment**: Production

### UI/UX Overhaul
- **Total Redesign**: Completely refactored the "Love Story" (Kisah) element with 7 premium variants following Fortune 500 aesthetics.
- **Eternal & Prestige Variants**: Introduced high-end serif typography and cinematic curved paths with gradient strokes.
- **Ethereal Glassmorphism**: Implemented deep glass effects with subtle light leaks and spring-based micro-interactions.
- **Asset Selection Modal**: Integrated a full-fidelity selection UI for Kisah elements with visual-first presets, replacing legacy emoji-based icons.
- **Zero-Cropping Engine**: Optimized scaling logic to ensure timeline legibility across all mobile baseline dimensions.

## [2026-03-05] Feature: Premium Photo Frame System (Enterprise Design Suite)
**Status**: 🔵 Deploying
**Environment**: Production

### Core Features
- **Photo Frame Architecture**: Introduced a new `photo_frame` element type with 6 premium variants:
    - **Classic Polaroid**: Authentic instant-photo aesthetic with customizable padding and handwriting-ready caption area.
    - **Instagram Simulation**: High-fidelity social media post mockup with profile headers, dynamic like counts, and dark/light mode parity.
    - **Gallery Frame**: High-end minimalist border with deep floating shadows for fine-art pre-wedding displays.
    - **Film Strip**: Cinematic nostalgic strip design with realistic sprocket hole details.
    - **Washi Tape**: Creative scrapbook aesthetic featuring semi-transparent decorative tape overlays.
    - **Modern Arch**: Architecturally-inspired curved frames matching 2024-2026 wedding design trends.
- **Admin Configuration Suite**: Added comprehensive controls in the Property Panel for real-time adjustments of usernames, engagement metrics, padding, and theme modes.
- **Pure CSS Rendering**: All frames are built using advanced Tailwind/CSS techniques to ensure zero performance overhead and perfect resolution at any scale.

## [2026-03-04] Fix: Admin Editor Font Rendering & Layout Coverage
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Core Fixes
- **SmartFontInjector Integration**: Extended the automatic Google Font injection system to the Admin Editor and Display Editor layouts. Previously, fonts only rendered correctly in User Editor/Preview.
- **Unified Design Parity**: Ensures that all design elements in Seamless, Orbit, and Display modes use the exact intended typography, matching 1:1 with the production preview.

## [2026-03-04] Fix: High-Performance Typing & Cursor Persistence (Layer Configuration)
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Core Fixes
- **Selection Lock Architecture**: Introduced `isTypingRef` state locking in all text editors within the Layer Configuration panel. This prevents external state synchronizations from resetting the cursor position while a user is actively typing.
- **Citadel Debounced Engine**: Implemented a 100ms debounced update cycle for the global store. This allows for real-time preview updates without the performance overhead or race conditions that cause cursor jumping.
- **Atomic Blur Sync**: Added `onBlur` safety handlers to ensure the final typed content is always accurately persisted to the global store, regardless of debouncing cycles.
- **Coverage**: Applied to `TextCard`, `QuoteCard`, `ProfileCard`, and `DigitalGiftCard` components.

## [2026-03-04] Fix: User Editor "Jumping Cursor" Resolution
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Core Fixes
- **Atomic Selection Buffering**: Implemented a "Fortress" local state buffering strategy for all text-based inputs in the User Editor. This prevents the native browser selection (cursor position) from being reset to the end of the line during rapid global store synchronization.
- **Enhanced Card Components**: Applied the fix to critical editor components:
    - `TextCard.tsx`: Standard text elements.
    - `QuoteCard.tsx`: Quotes and verses.
    - `ProfileCard.tsx`: Groom/Bride name and parent fields.
    - `DigitalGiftCard.tsx`: Bank account details and gift descriptions.
- **State Synchronization**: Added `useEffect` guards to ensure local buffers stay in sync with external state changes (like Undo/Redo) while maintaining focus during manual entry.

## [2026-03-04] Fix: User Editor Modal Z-Index & Grid Panel Accessibility
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Core Fixes
- **Modal Layering Resolution**: Resolved a critical UI conflict where sub-modals (Image Crop, Music Drawer, Confirmation Dialogs) were appearing behind the main User Editor panel due to insufficient z-index values.
- **Unified Z-Index Architecture**: Implemented a global "Top-Layer" standard by elevating the following components to `z-[5000]` or higher:
    - `ConfirmationModal.tsx`
    - `ImageCropModal.tsx`
    - `MusicDrawer.tsx`
    - `ImportModal.tsx`
    - `ThumbnailSelectionModal.tsx`
    - `QRModal.tsx`
    - `AuthModal.tsx`
- **User Flow Restoration**: This fix ensures that all "Grid Panel" interactions (changing music, uploading gallery photos, configuring gift addresses) are now fully accessible and can be closed/confirmed without the interface appearing to hang.

## [2026-03-04] Enhancement: Text Element V2 (Perfect-Fit Algorithm)
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Architectural Updates
- **Perfect-Fit Algorithm**: Refactored `TextElement` to utilize a `useLayoutEffect` based measurement strategy instead of `ResizeObserver`. This imperatively syncs the Konva bounding box to the real DOM text dimensions.
- **Precision Alignment**: Accurately measures `scrollWidth` and `scrollHeight` of the text node directly within the React layout phase to prevent visual tearing and ensure the blue selection box strictly maps to the visible content boundaries.

## [2026-03-04] Fix: Ultra-Deep Text Bounding Box Auto-Sync & Zero-Gap Policy
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production / FAANG Enterprise Standard

### Core Fixes
- **Autonomous Dimension Synchronization**: Enhanced `TextElement` with a native `ResizeObserver` that reports real-time physical footprint changes directly back to the store's persistence layer (`layer.width/height`).
- **Zero-Gap Policy**: Implemented `Math.ceil` rounding and a 1px delta threshold to ensure the blue selection box perfectly "shrink-wraps" text content, eliminating visual mismatches during manual font-size or content updates in the Property Panel.
- **Editor-Only Optimization**: Synchronized resizing logic is strictly gated by the `isEditor` state, ensuring zero performance overhead in production/preview environments.
- **Full Monorepo Build**: Executed forced Turbo build and deployed across all Cloudflare projects (`tamuu` and `tamuu-app`).

## [2026-03-04] UI: Optimized Initial Workspace & Default Panel States
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Core Enhancements
- **Workspace Optimization**: Set the Sequence Timeline panel to be hidden (`isBottomPanelOpen: false`) by default when entering the Admin Editor. This provides a cleaner, more focused design environment for initial layout tasks.
- **Persistent Accessibility**: Maintained instant access to the timeline via the primary navigation toggle, ensuring no loss of functionality for power users.

## [2026-03-03] Fix: Real-time Bounding Box Sync on Manual Property Resizing
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Core Fixes
- **Mutation & Resize Observation**: Enabled `useResizeObserver={true}` and `useMutationObserver={true}` on all `Moveable` instances across the Admin Editor's Seamless Canvas (Main Canvas and Orbit Stages). 
- **Real-time Synchronization**: Resolved an issue where manually adjusting the `fontSize` or `lineHeight` via the Property Panel caused the text to resize but left the virtual selection bounding box behind. The blue selection box will now auto-update and tightly frame the text element in real-time as properties are modified.

## [2026-03-03] Fix: Text Scaling and Bounding Box in Admin Editor
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Core Fixes
- **Dynamic Text Scaling**: Upgraded the `SeamlessCanvas` resize handler to correctly scale the `fontSize` of text layers when the bounding box is resized. This brings Canva/Figma-like text scaling behavior to the Admin Editor.
- **Liquid Layout Snapping**: Modified `TextElement` to use `w-fit` and `h-fit` instead of `w-full` allowing the `ResizeObserver` to accurately capture the exact pixel dimensions of the text content. The selection bounding box now tightly hugs the text instead of expanding artificially.
- **Sub-pixel Stabilization**: Added rounding logic (`Math.round`) to the continuous text auto-sizing loop to prevent infinite layout thrashing and stabilize the canvas rendering engine.

## [2026-03-03] UI: Premium Social Media Copy Animation
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Functional Updates
- **AnimatedCopyIcon Integration**: Migrated the social media copy button to the specialized `AnimatedCopyIcon` component.
- **Micro-interactions**: Added high-fidelity feedback animations, including a spring-animated checklist state and smooth icon transitions.
- **Standardized Copy Logic**: Replaced manual clipboard handling with the centralized, robust copy engine used throughout the enterprise platform.

## [2026-03-03] UI: Social Media Copy-to-Clipboard Functionality
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Functional Updates
- **Click-to-Copy Integration**: Replaced the standard navigation arrow on social media cards with a functional **Copy button**.
- **User UX Improvement**: Guests can now instantly copy social media handles or WhatsApp numbers to their clipboard with a single tap.
- **Visual Feedback**: Implemented premium active-state scaling and hover effects for the Copy icon, maintaining the Apple Obsidian Glass aesthetic.

### UI: Apple-Standard Social Media Card Redesign
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Social Media Redesign (Apple Standard)
- **Obsidian Glass Aesthetic**: Redesigned `SocialMockupElement` with a premium glassmorphism look, featuring high-fidelity blurs, subtle borders, and refined shadows.
- **High-Fidelity SVG Logos**: Replaced generic icons with official high-fidelity SVG glyphs for **X (formerly Twitter)**, **Instagram**, **TikTok**, and **WhatsApp**.
- **Floating Icon Design**: Removed background circles from all social logos to achieve a clean, minimalist "floating" appearance consistent with modern Apple UI.
- **Enhanced Platform Selection**: Overhauled the selection interface in `AssetSelectionModal.tsx` from a simple grid to professional high-fidelity preview cards.
- **Platform Rebranding**: Fully updated all references of "Twitter" to "X" across the inspector panel (`SocialMockupCard.tsx`) and property settings (`PropertyPanel.tsx`).
- **Professional Navigation**: Standardized the use of `ChevronRight` for social links to provide a more elegant and premium feel.

### Deployment
- **API Worker Sync**: Re-deployed `tamuu-api` to ensure backend consistency.
- **Dual-Project Deployment**: Synchronized production assets to both `tamuu` and `tamuu-app` Cloudflare Pages projects.
- **Forced Production Build**: Executed `turbo run build --force` to guarantee fresh artifacts across the monorepo.

## [2026-03-02] Fix: Smart Permission Engine & Gift Address Unlocking
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Core Fixes
- **Smart Permission Engine**: Re-engineered `UserElementEditor.tsx` to handle permission resolution with high-fidelity fallbacks. Critical user-data layers (`gift_address`, `digital_gift`, `rsvp_wishes`, etc.) now correctly default to editable if no explicit permissions object exists, resolving the "Locked Data" issue for newly added elements.
- **Strict Intent Visibility**: Updated `TemplateEditArea.tsx` and `OrbitPanel.tsx` to hide elements strictly based on administrative intent. Elements are only hidden if permissions are explicitly defined and all toggles are set to false.
- **UI Integrity**: Hardened `BaseCardWrapper.tsx` to provide consistent "Locked by Admin" visual feedback for all interactive element types, including Gift and RSVP cards.

### UI/UX Enhancements
- **Smart Element Filtering**: Resolved an issue where `gift_address`, `digital_gift`, and `rsvp_wishes` elements were hidden from the User Editor's configuration list.
- **Config-Based Detection**: Implemented a "Smart" filter that automatically detects interactive layers based on their configuration objects, ensuring they appear in the editor even if permission objects are partially defined.

## [2026-03-02] Feature: Pro Designer View & Terminology Alignment
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production
...

### Admin & User Editor Alignment
- **Terminology Sync**: Standardized the label "Permissions & Visibility" to **"Layer Configuration & Permissions"** across `PropertyPanel.tsx` and `PropertyInspector.tsx` to match the end-user's mental model.
- **Pro Designer Branding**: Rebranded "Simulation Mode" to **"Pro Designer View"** throughout the application and documentation (`ARCHITECTURE.md`).
- **Enhanced Simulation Flow**:
    - Restored the **Pro Designer toggle** in the Admin Editor element header for template creators.
    - Refactored the Simulation interface with a branded indigo header and a functional **"Back to Admin"** button for seamless exit.
- **Cross-Editor Navigation**: Implemented a functional **"Pro Designer"** button in the User Editor's `TemplateEditArea.tsx`. Admin users can now jump directly from a live invitation editor back into its source **Template Builder**.
- **State Management**: Updated `canvasSlice.ts` to persist and track `templateId` for invitations, enabling robust cross-editor routing.

### Deployment
- **Forced Turbo Build**: Executed a full repository build with `--force` to ensure all assets are correctly invalidated and re-compiled.
- **Multi-Project Deployment**: Synchronized production deployment to both `tamuu` and `tamuu-app` Cloudflare Pages projects.
- **API Synchronization**: Re-deployed API workers to ensure complete system consistency across environments.

## [2026-03-02] Feature: Interactive UserEditor & Precision Gift Address Controls
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### UI/UX Enhancements
- **Interactive User Canvas**: Upgraded `UserKonvaPreview` from a static renderer to an interactive engine. Users can now select and resize elements directly on the canvas if granted permission by the admin.
- **Precision Bounding Box**: Implemented an automated aspect ratio guard for `GiftAddressCard` to ensure the blue selection box (transformer) perfectly aligns with its **1.15/1** ratio, fixing mismatches in the admin editor.
- **Permission Sync**: Integrated granular permission checks (`canEditPosition`, `canEditStyle`) into the User Editor's Moveable layer to maintain administrative governance.

## [2026-03-02] Fix: Gift Address Card Text Wrapping & UI Integrity
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production
...
### UI/UX Fixes
- **Robust Text Wrapping**: Implemented dynamic text wrapping for `GiftAddressCard` using `flex-1`, `min-w-0`, and `break-words` to prevent text from overlapping with icons or the copy button.
- **Visual Safety**: Added `gap-3` and `flex-shrink-0` to UI components (icons/buttons) to guarantee spacing even with long recipient names or complex addresses.
- **Responsiveness**: Adjusted padding and font sizes for better readability across various screen dimensions.

## [2026-03-02] UI: Gift Address Card Rollback & Aspect Ratio Integrity
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production
...
### UI/UX Updates
- **Rollback GiftAddressCard**: Reverted the aspect ratio of `GiftAddressCard` back to its original **1.15/1** format to maintain its unique visual identity.
- **Visual Decoupling**: Separated `GiftAddressElement` from the container logic used by `BankCard`. This ensures that the Gift Address Card is rendered in its original standalone format without forced synchronization with other card elements.
- **Consistency Restoration**: Restored the original internal padding, gaps, and border-radius (16px for BankCard) to match the established design language before the standardization attempt.

### Deployment
- **Forced Turbo Build**: Executed a full repository build with `--force` to ensure all assets are correctly invalidated and re-compiled.
- **Multi-Project Deployment**: Synchronized production deployment to both `tamuu` and `tamuu-app` Cloudflare Pages projects.
- **API Synchronization**: Re-deployed API workers to ensure complete system consistency across environments.

## [2026-02-28] Feature: Landing Page Vendor Section Redesign & Featured Products
**Status**: 🟢 In Progress
**Environment**: Production

### Landing Page Updates
- **Shop Section Overhaul**: Redesigned the vendor section (`ShopSection.tsx`) to be cleaner and more modern, removing "TAMUU SHOP ECOSYSTEM" text.
- **Enterprise Card Design**: Replaced old vendor cards with a high-end landscape banner and floating logo design. Removed dummy stats like "Verified" and star ratings.
- **Improved Navigation**: Added horizontal scroll arrows vertically centered on both vendor and product cards, whilst keeping the "Lihat Semua" button.
- **Dynamic Featured Products**: Added a new "Featured Products" horizontal carousel above the vendor section displaying exactly 10 products.
- **Admin Governance**: Integrated landing page products with the Admin Dashboard "Ads" tab using the new `FEATURED_PRODUCT_LANDING` placement. If no ads are configured by the admin, the system automatically falls back to displaying 10 random real products that shuffle on every refresh.

## [2026-02-23] Feature: Granular Social Media Controls & UI Polish
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

### Social Media & Contact Identity
- **Field Separation**: Decoupled the unified "Media Sosial & Website" input into four distinct, high-fidelity input fields for **Facebook**, **TikTok**, **Instagram**, and **Website**.
- **Database Scaling**: Executed D1 migrations to add `facebook`, `tiktok`, and `website` columns to the `shop_contacts` table.
- **API Data Binding**: Updated the Merchant Profile worker to support atomic persistence of new social media metadata.
- **Conditional Visibility**: Implemented logic in `StorefrontPage.tsx` to automatically hide social media icons on public profiles if the corresponding data is not provided by the owner.

### UI/UX Refinements
- **Professional Re-labeling**: 
  - Updated main header from *Identitas Toko* to **Profile Store**.
  - Renamed branding section from *Profil Visual* to **Edit Profile**.
  - Simplified slug input hint from *Slug* to **Link**.
- **Action Semantics**: Changed the global sticky footer button from *Sync Vault* to **Save** for better clarity and alignment with standard dashboard patterns.
- **Decluttering**: Removed the "Encrypted Communication Layer" badge from the Contact section for a cleaner, more focused interface.


## [2026-02-23] Feature: Merchant Portal Refinements & Analytics Integration
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`)
**Environment**: Production

### Refinements & Localization
- **Shop Identity (MerchantSettings)**: Replaced verbose English terminology with clean, professional Indonesian labels (e.g., *Brand Designation* to *Nama Toko*, *Registry Profile* to *Tautan Toko*). Unified all social media and website inputs into a single text field (*Media Sosial & Website*). Removed jarring hover zoom effects from the profile banner and logo.
- **Analytics Hub**: Overhauled the dark theme into a minimalist light theme (`#FFFFFF` and `#FBFBFB` backgrounds) to match the rest of the merchant portal. Removed overly complex DVM charts and replaced them with a straightforward "Kinerja Produk/Jasa" list that tracks individual item impressions. Simplified the "System Status" card into a minimal KPI block.
- **Ads & Growth Hub**: Stripped out hardcoded dummy metrics and correctly wired the `useMerchantAnalytics` hook to reflect real `Total Impressions` and `Contact Leads` data.

## [2026-02-23] Feature: Product Categories & Express Tools Routing Fix
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app` & workers `tamuu-api`)
**Environment**: Production

### Additions
- **Asset Registry (Inventory Ledger)**: Added the `kategori_produk` field to the Merchant Products creation and edit forms so store owners can categorize their offerings (e.g., Wedding Package, Grooming, Buffet). 
- **Database Architecture**: Added the `kategori_produk` column to the `shop_products` table in Cloudflare D1. The API Worker now reads, inserts, and updates this field seamlessly.

### Fixes
- **Dashboard Routing (`MerchantOverview.tsx`)**: Replaced the broken internal `setTab` prop with proper React Router `useNavigate` hook for the "Global Inventory", "Shop Config", "Advanced Hub", and "Boost Reach Now" buttons located in the Express Tools section.

## [2026-02-23] Deep Debugging: Onboarding Silent D1 Constraint Failure
**Commit**: `756c993`
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app` & `tamuu` and Workers `tamuu-api`)
**Environment**: Production

### Post-Mortem & Fix
- **Root Cause 4: Silent SQLite Foreign Key Violation**: Thorough backend and database debugging revealed that the `test2` store was never actually created in the Cloudflare D1 `tamuu-db`. 
  - **The Mismatch**: The frontend was sending text categories (e.g., `"Fotografi"`) as the `category_id`. The D1 `shop_merchants` table enforces a strict `FOREIGN KEY(category_id) REFERENCES shop_category(id)` where IDs are formatted like `"cat-004"`.
  - **The Silent Failure**: Cloudflare D1's SQL `run()` executed the query, hit the constraint violation, but **did not throw a runtime exception**. It silently returned `changes: 0`. The backend worker incorrectly assumed success and returned `HTTP 200 OK` with a newly generated UUID to the frontend.
  - **The Loop**: The frontend navigated to `/dashboard`, called `useMerchantProfile`, and received `isMerchant: false` because the data was never written.
- **Frontend Fix**: Implemented a `CATEGORY_UUID_MAP` in `MerchantOnboardingPage.tsx` to explicitly translate text categories into their D1 `cat-xxx` counterparts before sending the API payload. 
- **Backend Fix (Critical)**: Hardened `tamuu-api-worker.js` to strictly audit `insertResult.meta?.changes`. If `changes === 0`, it now explicitly throws an error preventing the silent bypass.

## [2026-02-23] Fix: Merchant Onboarding Redirect Bug

**Waktu**: 2026-02-23 17:29 WIB  
**Commit**: `cf9b623`  
**Deployed**: `api.tamuu.id`, `app.tamuu.id`, `tamuu.id`

### Masalah
Setelah menyelesaikan onboarding di `https://app.tamuu.id/store/onboarding`, user diredirect ke `/dashboard` bukan ke `/store/{slug}/dashboard`.

### Root Cause (3 Bug Bersamaan)
1. **React Hooks Violation** — `useParams()` dipanggil setelah conditional return di `MerchantPortalPage.tsx`, menyebabkan rendering tidak stabil.
2. **Stale Cache Race Condition** — React Query mengembalikan cache lama (`isMerchant: false`) saat full-page reload, memicu guard redirect ke `/dashboard`.
3. **Category ID Mismatch** — Frontend mengirim nama kategori sebagai `category_id`, tapi backend JOIN menggunakan UUID.

### File yang Diubah

| File | Perubahan |
|------|-----------|
| `apps/web/src/pages/Merchant/MerchantPortalPage.tsx` | Pindahkan `useParams()` ke top-level (sebelum conditional return) |
| `apps/web/src/hooks/queries/useShop.ts` | Tambah `staleTime: 0`, `gcTime: 0`, `refetchOnMount: 'always'`, `retry: 2` |
| `apps/web/src/pages/Merchant/MerchantOnboardingPage.tsx` | Gunakan slug dari API response untuk navigasi |
| `apps/api/tamuu-api-worker.js` | Fix JOIN `shop_category` agar match UUID dan nama kategori |

### Verifikasi
- ✅ Build frontend sukses (zero error, zero warning)
- ✅ Deploy API ke Cloudflare Workers
- ✅ Deploy frontend ke Cloudflare Pages (tamuu-app & tamuu)
- ✅ Push ke GitHub
