# Tamuu Deployment Guide (Unified Enterprise)

Seluruh ekosistem Tamuu kini menggunakan arsitektur **Cloudflare Workers** dengan **OpenNext** sebagai core.

### 1. Deploy API (Backend)
Wajib dideploy pertama jika ada perubahan skema database.
```bash
npm run deploy:api
```

### 2. Deploy Unified Main App (`apps/main`)
Halaman: Homepage, Shop, Dashboard, Vendor, Editor.
*Teknologi: Next.js 15 + OpenNext + Cloudflare Workers*
```bash
# Masuk ke folder apps/main
cd apps/main

# Build menggunakan OpenNext untuk Cloudflare
npm run build:worker

# Deploy sebagai Cloudflare Worker
npx wrangler deploy
```
*Hasil: Melakukan In-place Upgrade pada worker `tamuu-worker` untuk menghandle domain `tamuu.id`.*

### 3. Deploy Legacy & Admin (`apps/web`)
Halaman: Admin Panel, Preview Undangan.
*Teknologi: Vite + Cloudflare Pages*
```bash
npm run build:web
npx wrangler pages deploy apps/web/dist --project-name tamuu-app
```

### 4. Sinkronisasi Shared Logic
Pastikan `packages/shared` selalu up-to-date di kedua aplikasi.
```bash
turbo run build --force
```

### 5. Final Checklist
1. `tamuu.id` -> Dilayani oleh **tamuu-worker (Next.js 15 Engine)**.
2. `tamuu.id/admin` -> Dilayani oleh **tamuu-app (Pages)**.
3. Anti-Flicker -> Pastikan grid produk tampil instan dari Server Components.
4. Update `CHANGELOG.md` dan push perubahan ke GitHub.
