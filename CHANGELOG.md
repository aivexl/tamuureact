# Tamuu Changelog

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
