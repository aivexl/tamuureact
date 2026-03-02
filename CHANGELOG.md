# Tamuu Changelog

## [2026-03-02] Fix: Gift Address Card Text Wrapping & UI Integrity
**Status**: 🟢 Deployed (Cloudflare Pages `tamuu-app`, `tamuu` & workers `tamuu-api`)
**Environment**: Production

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
