# Tamuu Deployment Guide (Unified Enterprise)

Seluruh ekosistem Tamuu kini menggunakan arsitektur **Cloudflare Workers** dengan **OpenNext** sebagai core.

### 1. Deploy API (Backend)
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
*Hasil: Deploy ke worker `tamuu-main` yang menghandle traffic utama.*

### 3. Deploy Legacy & Admin (`apps/web`)
Halaman: Admin Panel, Preview Undangan.
*Teknologi: Vite + Cloudflare Pages*
```bash
npm run build:web
npx wrangler pages deploy apps/web/dist --project-name tamuu-app
```

### 4. Sinkronisasi Shared Logic
Pastikan `packages/shared` selalu up-to-date.
```bash
turbo run build --force
```

### 5. Final Checklist
1. `tamuu.id` -> Dilayani oleh **tamuu-main (Worker)**.
2. `tamuu.id/admin` -> Diproxy ke **tamuu-app (Pages)**.
3. SEO Meta Tags -> Di-handle secara dynamic oleh Next.js Server Components.
