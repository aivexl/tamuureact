# Tamuu Deployment Guide (Unified Enterprise)

Seluruh ekosistem Tamuu kini menggunakan arsitektur **Cloudflare Workers** dengan **OpenNext** sebagai core.

### 0. Upload ke GitHub (Source Control)
Gunakan langkah ini untuk mengamankan kode sebelum deploy:
```bash
# 1. Cek status perubahan
git status

# 2. Stage semua perubahan
git add .

# 3. Commit dengan pesan standar enterprise
git commit -m "feat: implement unified ssr auth architecture and cross-domain sync"

# 4. Push ke repository utama
git push origin main
```

### 1. Deploy API (Backend)
```bash
npm run deploy:api
```

### 2. Deploy Unified Main App (`apps/main`)
Halaman: Homepage, Shop, Dashboard, Vendor, Editor, **Auth Flow**, Onboarding, Undangan Digital Landing.
*Teknologi: Next.js 15 + OpenNext + Cloudflare Workers & Pages*

**⚠️ CRITICAL: Environment Variables**
Pastikan variabel berikut sudah di-set di Dashboard Cloudflare (atau `wrangler.toml`):
- `NEXT_PUBLIC_SUPABASE_URL`: URL Supabase Anda.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key Supabase Anda.
- `NEXT_PUBLIC_API_URL`: `https://api.tamuu.id`
- `NODE_ENV`: `production` (Wajib agar cookie `.tamuu.id` aktif).

```bash
# Masuk ke folder apps/main
cd apps/main

# Build menggunakan OpenNext untuk Cloudflare
npm run build:worker

# Deploy Logic (Worker)
npx wrangler deploy

# Deploy Assets (Legacy fix for ChunkLoadError)
# Deploy static assets ke Pages project agar tidak 404
npx wrangler pages deploy .open-next/assets --project-name tamuu
```
*Hasil: Deploy logic ke worker `tamuu-worker` dan assets ke Pages `tamuu`.*

**All Routes (Next.js Native):**
- `/` - Homepage
- `/undangan-digital` - Landing page produk undangan digital
- `/login` - Login page (Next.js, fast load)
- `/signup` - Signup page (Next.js, fast load)
- `/forgot-password` - Password reset page
- `/onboarding` - Onboarding flow untuk pembuatan undangan baru
- `/upgrade` - Payment/upgrade flow (Next.js, fast load)
- `/dashboard` - User dashboard
- `/shop/*` - Shop pages
- `/vendor/*` - Vendor portal
- `/editor/*` - Editor pages
- `/blog/*` - Blog pages

**Pricing Flow:**
- Tier selection di `/undangan-digital` → redirect ke `/login?redirect=...&tier=...`
- Setelah login → redirect ke `/upgrade?tier=...` untuk payment
- Free tier → redirect ke `/onboarding`

### 3. Deploy Legacy & Admin (`apps/web`)
Halaman: Admin Panel, Preview Undangan, Editor (legacy).
*Teknologi: Vite + Cloudflare Pages*
```bash
npm run build:web
npx wrangler pages deploy apps/web/dist --project-name tamuu-app
```

**Note:** `app.tamuu.id` sekarang menggunakan Next.js (tamuu-worker), bukan lagi Vite Pages.
Vite app hanya untuk legacy editor dan preview undangan.

### 4. Sinkronisasi Shared Logic
Pastikan `packages/shared` selalu up-to-date.
```bash
turbo run build --force
```

### 5. Final Checklist
1. ✅ `tamuu.id` -> Dilayani oleh **tamuu-main (Worker)** - Next.js 15.
2. ✅ `app.tamuu.id` -> Sekarang menggunakan **tamuu-main (Worker)** - Auth flow lebih cepat.
3. ✅ `tamuu.id/admin` -> Diproxy ke **tamuu-app (Pages)** untuk legacy admin.
4. ✅ SEO Meta Tags -> Di-handle secara dynamic oleh Next.js Server Components.
5. ✅ **Pricing Flow** -> Tier selection redirect ke `/login` → `/upgrade` (Next.js native).
6. ✅ **Onboarding** -> Fully migrated to Next.js, no more Vite/React Router dependency.
7. ✅ **Auth Pages** - Login/Signup/Forgot-Password menggunakan Next.js (load time <400ms).
8. ✅ **Cross-Domain Sync** - Session otomatis tersambung antara `tamuu.id` dan `app.tamuu.id` melalui root cookie.
9. ✅ **Environment Parity** - Supabase Keys di `apps/main` dan `apps/web` harus identik.

### Performance Improvements
- **Login page**: ~400ms TTFB (Next.js Worker) vs ~2-3s (Vite bundle 162KB+)
- **Upgrade page**: Instant load dengan auto-trigger payment
- **Onboarding**: Slug validation dengan API caching
- **No more push notification overhead** pada auth pages
