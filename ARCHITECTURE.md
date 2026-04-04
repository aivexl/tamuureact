# Tamuu - Arsitektur Sistem

Platform undangan digital dengan arsitektur multi-domain dan monorepo.
Lihat juga [SKILL.md](./SKILL.md) untuk panduan pengembangan AI Gemini.

---

## 🌐 Domain Structure & Policy (v4.1)

Tamuu menerapkan kebijakan pemisahan domain yang ketat untuk mengoptimalkan SEO dan performa aplikasi.

| Domain | Fungsi Utama | Framework Utama |
|--------|--------|------------|
| `tamuu.id` | **Public & Marketing**: Landing page, Blog, Shop, Preview. | Next.js (`apps/main`) |
| `app.tamuu.id` | **Application Hub**: Auth, Dashboard, Editor, Management. | Vite (`apps/web`) |
| `api.tamuu.id` | **Backend API**: Centralized services & database. | Cloudflare Workers |

---

## 🗺️ Smart Synergy Sitemap

Setiap rute telah ditentukan framework dan domainnya. Jika diakses di domain yang salah, sistem akan melakukan **308 Permanent Redirect**.

### 🎨 Next.js Pages (`apps/main`)
Fokus pada SEO, Marketing, dan Gerbang Masuk.

| Rute | Fungsi | Domain |
| :--- | :--- | :--- |
| `/` | Homepage (Wedding Marketplace) | `tamuu.id` |
| `/undangan-digital` | Landing Page Produk | `tamuu.id` |
| `/blog` & `/blog/*` | Daftar & Isi Artikel | `tamuu.id` |
| `/support`, `/about` | Informasi Perusahaan | `tamuu.id` |
| `/terms`, `/privacy` | Dokumen Legal | `tamuu.id` |
| `/login`, `/signup` | Halaman Otentikasi | `app.tamuu.id` |
| `/forgot-password` | Pemulihan Akun | `app.tamuu.id` |
| `/onboarding` | Setup Awal User Baru | `app.tamuu.id` |

### 🚀 Vite Pages (`apps/web`)
Fokus pada Aplikasi Interaktif (SPA) & Manajemen.

| Rute | Fungsi | Domain |
| :--- | :--- | :--- |
| `/dashboard` | User Management Hub | `app.tamuu.id` |
| `/editor/*` | Editor Undangan Digital | `app.tamuu.id` |
| `/billing`, `/upgrade` | Transaksi & Langganan | `app.tamuu.id` |
| `/profile` | Pengaturan Akun | `app.tamuu.id` |
| `/guests`, `/wishes` | Manajemen Event | `app.tamuu.id` |
| `/vendor/*` | Vendor Portal (Ads & Produk) | `app.tamuu.id` |
| `/admin/*` | Superadmin Dashboard | `app.tamuu.id` |
| `/invitations` | Browser Template | `tamuu.id` |
| `/preview/*` | Live Preview Undangan | `tamuu.id` |
| `/v/*`, `/c/*` | Shortlinks & Kategori | `tamuu.id` |

---

## 📁 Monorepo Structure

```
tamuureact/
├── apps/
│   ├── main/                   # Next.js (Marketing & Public Core)
│   ├── web/                    # Vite (Dashboard & Management Hub)
│   └── api/                    # Workers (Unified API & CDN)
├── packages/
│   └── shared/                 # Logic & Components yang dipakai bersama
└── DOMAIN_POLICY.md            # Dokumentasi aturan routing terbaru
```

---

## ☁️ Cloudflare Deployments

| Project Name | Custom Domain | Fungsi |
|--------------|---------------|--------|
| `tamuu` | `tamuu.id` | Next.js Landing & Public Proxy |
| `tamuu-app` | `app.tamuu.id` | Vite Dashboard Backend |
| `tamuu-api-prod` | `api.tamuu.id` | Unified Backend D1/R2 |

---

## 🛠️ Tech Stack & Integration

### Smart Synergy Mechanism (v4.1)
- **Deterministic Routing**: Semua link di Navbar/Footer dicek menggunakan `getAbsoluteUrl()`. Jika tujuan berbeda domain, sistem memaksa penggunaan tag `<a>` (Full Reload) untuk mencegah SPA deadlock.
- **Middleware Enforcement**: Middleware Next.js di `tamuu.id` bertindak sebagai orkestrator. Ia melakukan *Rewrite* untuk konten Vite di domain yang sama dan *Redirect* untuk rute yang wajib pindah domain.
- **Vite Assets Proxy**: Semua aset di `/assets/` secara otomatis di-proxy ke `tamuu-app.pages.dev` untuk menjamin UI tetap ter-render sempurna di domain manapun.

---

## 🚀 Deployment & Scripts

### 📡 Backend Deployment
```bash
npm run deploy:api
```

### 🎨 Frontend Deployment
1. **Deploy Next.js (tamuu.id & app.tamuu.id router):**
   ```bash
   npm run deploy:main
   ```
2. **Deploy Vite (Dashboard Backend):**
   ```bash
   npm run deploy:web:app
   ```

---

## 💰 Monetization & Billing

### Subscription Tiers
| Tier | Price | Quota | Features |
|------|-------|-------|----------|
| **FREE** | Rp 0 | 1 | 30-Day Trial, Basic Templates |
| **PRO** | Rp 99k/yr | 1 | Music, Digital Gift |
| **ULTIMATE** | Rp 149k/yr | 2 | Check-in System, Analytics |
| **ELITE** | Rp 199k/yr | 3 | All Access, Priority Service |

---

## 🦄 Unicorn Level Stability
- **Smart Slug Resolver**: Auto-suffix untuk menghindari konflik URL.
- **Liquid Position Engine**: Layout dinamis yang menyesuaikan tinggi konten secara real-time.
- **AI Support Core v8.0**: LLM Google Gemini dengan Function Calling untuk diagnostik akun otomatis.
- **Identity Resolver**: Sinkronisasi session antara Next.js dan Vite via LocalStorage & Cookies.

---

## 🔐 Testing Accounts
👤 **User**: `user@tamuu.id` / `Testing123!`
🔑 **Admin**: `admin@tamuu.id` / `Admin123!`
